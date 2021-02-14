const { fetchJson } = require('fetch-json');
//const OPEN_WEATHER_MAP_API_URL = 'http://api.openweathermap.org/data/2.5/weather';
const OPEN_WEATHER_MAP_API_URL = 'https://api.openweathermap.org/data/2.5/onecall';
const OPEN_WEATHER_MAP_API_KEY = process.env.npm_config_OPEN_WEATHER_MAP_API_KEY;

module.exports = {
    getWeatherAmsterdam: function (cb) {
        this.getWeather(52.374, 4.8897, cb);
    },
    getWeather: function (lat, lon, cb) {
        fetchJson.get(OPEN_WEATHER_MAP_API_URL, {
            appid: OPEN_WEATHER_MAP_API_KEY, 
            lang: 'zh_tw',
            units: 'metric',
            lat,
            lon,
        }).then(cb);
    }
}
