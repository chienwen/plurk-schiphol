const weather = require('./lib/weather');
const ptt = require('./lib/ptt');
const dedupPost = require('./lib/dedupPost');
//const util = require('util');

let plurk = require('./lib/plurk');
if (process.argv.length === 4 && process.argv[3] === 'debug') {
    plurk = {
        callAPI: (url, param, cb) => {
            cb(null, {
                plurk_id: 'DEBUG',
                qualifier_translated: '',
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
    const sunsetDateObj = new Date((todayWeather.sunset + weather.timezone_offset) * 1000);
    const sunsetTimeMinute = sunsetDateObj.getUTCMinutes();
    const sunsetTime = sunsetDateObj.getUTCHours() + ':' + (sunsetTimeMinute < 10 ? '0' + sunsetTimeMinute : sunsetTimeMinute);
    const currentWeather = weather.current;

    const contents = [];

    let weatherStr = `阿姆斯特丹今天天氣${todayWeatherDescription}
最高溫 ${todayWeather.temp.max}°C，最低溫 ${todayWeather.temp.min}°C
體感溫度白天 ${todayWeather.feels_like.day}°C，晚上 ${todayWeather.feels_like.night}°C
風速 ${todayWeather.wind_speed}m/s，日落時間 ${sunsetTime}
現在氣溫 ${currentWeather.temp}°C，體感溫度 ${currentWeather.feels_like}°C
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
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (!dedupPost.wasPosted(item.title)) {
                postPlurk('https://www.ptt.cc' + item.url + ' (' + item.title + ')', item.type === '問卦' ? 'wonders' : 'shares');
                dedupPost.add(item.title);
                break;
            }
        }
        dedupPost.finish();
    });
}

const taskRounter = {
    all: function() {
        Object.keys(this).filter(task => task !== 'all').forEach((task) => {
            console.log('Invoke task', task);
            taskRounter[task]();
        });
    },
    weather: function() {
        plurkWeather();
    },
    ptt: function() {
        plurkPTT();
    },
};

if (process.argv.length < 3 || (!taskRounter[process.argv[2]])) {
    console.error('Usage:', process.argv[0], process.argv[1], 'all|weather|ptt', '[debug]');
    return -1;
}

taskRounter[process.argv[2]]();
