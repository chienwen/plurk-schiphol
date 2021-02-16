const weather = require('./lib/weather');
const windSpeedTrans = require('./lib/windSpeedTrans');
const ptt = require('./lib/ptt');
const covid = require('./lib/covid');
const dedupPost = require('./lib/dedupPost');
//const util = require('util');

let plurk = require('./lib/plurk');
if (process.argv.length === 4 && process.argv[3] === 'debug') {
    plurk = {
        callAPI: (url, param, cb) => {
            cb(null, {
                plurk_id: 'DEBUG',
                qualifier_translated: param.qualifier,
                content: param.content
            });
        }
    };
}

function postPlurk(content, qualifier) {
    return new Promise((resolve, reject) => {
            plurk.callAPI('/APP/Timeline/plurkAdd', {
            content,
            qualifier: qualifier || 'says',
            lang: 'tr_ch',
        }, (err, data) => {
            if (err) {
                console.log('ERROR', err);
                reject(err);
            } else {
                console.log('======== OK', data.plurk_id, data.qualifier_translated, data.content);
                resolve(data);
            }
        });
    });
}

function getWeatherContents(weather) {
    const todayWeather = weather.daily[0];
    const todayWeatherDescription = todayWeather.weather.map((w) => {
        return w.description;
    }).join('、');

    const getLocalTime = function (timestamp) {
        const dataObj = new Date((timestamp + weather.timezone_offset) * 1000);
        const minute = dataObj.getUTCMinutes();
        return dataObj.getUTCHours() + ':' + (minute < 10 ? '0' + minute : minute);
    };

    const getWindDirectionName = function (deg) {
        const mapping = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
        let base = 22.5;
        for (let i = 0 ; i < 9; i++) {
            if (deg < base) {
                return mapping[i % mapping.length];
            }
            base += 45;
        }
    };

    const sunsetTime = getLocalTime(todayWeather.sunset);
    const sunriseTime = getLocalTime(todayWeather.sunrise);
    const currentWeather = weather.current;

    const contents = [];

    const displayInt = {
        todayMax: todayWeather.temp.max,
        todayMin: todayWeather.temp.min,
        feelDay: todayWeather.feels_like.day,
        feelNight: todayWeather.feels_like.night,
        currentTemp: currentWeather.temp,
        currentFeel: currentWeather.feels_like,
    };

    Object.keys(displayInt).forEach((key) => {
        displayInt[key] = Math.round(displayInt[key]);
    });

    const wind = windSpeedTrans(todayWeather.wind_speed);
    const typhoon = wind.typhoon ? '(' + wind.typhoon.name + '颱風)' : '';
    const windDir = getWindDirectionName(todayWeather.wind_deg) + '風';

    let weatherStr = `阿姆斯特丹今天天氣${todayWeatherDescription}
高溫 ${displayInt.todayMax}°C 低溫 ${displayInt.todayMin}°C 濕度 ${todayWeather.humidity}%
體感溫度白天 ${displayInt.feelDay}°C 晚上 ${displayInt.feelNight}°C
${wind.name}風${wind.rank}級 ${windDir} ${todayWeather.wind_speed} 公尺/秒 ${typhoon}
日出時間 ${sunriseTime} 日落時間 ${sunsetTime}
現在氣溫 ${displayInt.currentTemp}°C 體感溫度 ${displayInt.currentFeel}°C
`;

    const localHour = (new Date((new Date).getTime() + weather.timezone_offset * 1000)).getUTCHours();
    let helloText = '早安';
    if (localHour >= 12 && localHour < 18) {
        helloText = '午安';
    } else if (localHour >= 18 || localHour < 4) {
        helloText = '晚安';
    }
    helloText += '！';
    contents.push(helloText + weatherStr.trim());

    if (weather.alerts && weather.alerts.length > 0) {
        let wa = weather.alerts[weather.alerts.length > 1 ? 1 : 0];
        let warning = `天氣警報 [${wa.event}]
${wa.description}`;
        contents.push(warning.slice(0, 360));
    }

    return contents;
}

function plurkWeather() {
    weather.getWeatherAmsterdam((weatherData) => {
        //console.log(util.inspect(weatherData, {showHidden: false, depth: null}))
        const contents = getWeatherContents(weatherData);
        postPlurk(contents[0]);
        if (contents.length > 1) {
            postPlurk(contents[1]);
        }
    });
}

function plurkPTT() {
    ptt.getHotArticles(10, (data) => {
        dedupPost.init();
        function getPTTQualifier(type, title) {
            if (type === '問卦') {
                if (title.match(/？|\?/)) {
                    return 'asks';
                } else {
                    return 'wonders';
                }
            } else {
                return 'shares';
            }
        }
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (!dedupPost.wasPosted(item.title)) {
                postPlurk('https://www.ptt.cc' + item.url + ' (' + item.title + ')', getPTTQualifier(item.type, item.title));
                dedupPost.add(item.title);
                break;
            }
        }
        dedupPost.finish();
    });
}

const taskRouter = {
    all: function() {
        Object.keys(this).filter(task => task !== 'all').forEach((task) => {
            console.log('Invoke task', task);
            taskRouter[task]();
        });
    },
    weather: function() {
        plurkWeather();
    },
    ptt: function() {
        plurkPTT();
    },
    covid: function() {
        covid('netherlands').then((covidData) => {
            postPlurk('荷蘭昨天新增中國肺炎 ' + covidData.NewConfirmed + ' 例', 'has');
        }).catch((err) => {
            console.log('Unable to fetch covid info', err);
        });
    },
};

if (process.argv.length < 3 || (!taskRouter[process.argv[2]])) {
    console.error('Usage:', process.argv[0], process.argv[1], Object.keys(taskRouter).join('|'), '[debug]');
    return -1;
}

taskRouter[process.argv[2]]();
