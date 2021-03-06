const fetch = require('node-fetch');
const config = require('./config');
const CHIENWEN_SECRETARY_API_AUTH = config('CHIENWEN_SECRETARY_API_AUTH');
const FILTER_REG = '母|師|父|毛主席|女|馬克思|孩|子';

module.exports = function (cb) {
    fetch('http://' + CHIENWEN_SECRETARY_API_AUTH + '@secretary.chienwen.net/api/good_sentence?c=1&f=' + encodeURIComponent(FILTER_REG))
        .then(res => res.json())
        .then((data) => {
            cb(data[0]);
        }).catch(err => {
            console.log(err);
            cb(null);
        });
};
