const plurk = require('./lib/plurk');
const weather = require('./lib/weather');
const util = require('util');

function getContents(weather) {
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
    contents.push(helloText + weatherStr);

    if (weather.alerts && weather.alerts.length > 0) {
        let wa = weather.alerts[weather.alerts.length > 1 ? 1 : 0];
        contents.push(`天氣警報 [${wa.event}]
${wa.description}`);
    }

    return contents;
}

weather.getWeatherAmsterdam((weatherData) => {
    //console.log(util.inspect(weatherData, {showHidden: false, depth: null}))
    const contents = getContents(weatherData);
    //console.log(content); return;
    plurk.callAPI('/APP/Timeline/plurkAdd', {
        content: contents[0],
        qualifier: 'says',
        lang: 'tr_ch',
    }, (err, data) => {
        if (err) {
            console.log('Error0', err);
        } else {
            console.log('OK0', data.plurk_id, data.content);
        }
        if (contents.length > 1) {
            plurk.callAPI('/APP/Timeline/plurkAdd', {
                content: contents[1],
                qualifier: 'says',
                lang: 'tr_ch',
            }, (err, data) => {
                if (err) {
                    console.log('Error1', err);
                } else {
                    console.log('OK1', data.plurk_id, data.content);
                }
            });
        }
    });
});

