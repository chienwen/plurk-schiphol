const fetch = require('node-fetch');
const RSSParser = require('rss-parser');
const rssParser = new RSSParser();

module.exports = function (countrySlug) {
    if (countrySlug === 'taiwan') {
        return new Promise((resolve, reject) => {
            fetch('https://www.cdc.gov.tw/RSS/RssXml/Hh094B49-DRwe2RR4eFfrQ?type=1')
                .then(res => res.text())
                .then(body => {
                    body = body.replace(/a10:updated/g, 'pubDate');
                    rssParser.parseString(body).then((rssData) => {
                        const res = {};
                        rssData.items.forEach((article) => {
                            if (res.NewConfirmed) {
                                return;
                            }
                            const today = (new Date).toISOString().split('T')[0];
                            if (article.pubDate.indexOf(today) !== -1) {
                                let matched;
                                // 指揮中心公布新增321例本土、2例境外移入個案，另有400例校正回歸上週各日個案
                                // 新增295例COVID-19確診，286例本土、9例境外移入
                                if (matched = article.title.match(/^新增(\d+)例COVID-19確診(.*?(\d+)例本土.*?(\d+)例境外移入)?/)) {
                                    res.NewConfirmed = matched[1];
                                    res.TWNewConfirmedLocal = matched[3];
                                    res.TWNewConfirmedExternal = matched[4];
                                }
                                else if (article.title.match(/新.+例/)) {
                                    res.FallbackRawTitle = article.title;
                                }
                            }
                        });
                        if (res.NewConfirmed || res.FallbackRawTitle) {
                            resolve(res);
                        } else {
                            reject({msg: 'parse error', rssData});
                        }
                    }).catch(reject);
                })
                .catch(reject);
        });
    }
    return new Promise((resolve, reject) => {
        fetch('https://api.covid19api.com/summary')
            .then(res => res.json())
            .then((data) => {
                const cdata = data.Countries;
                let nlData;
                for (let i = 0; i < cdata.length; i++) {
                    if (cdata[i].Slug === countrySlug) {
                        nlData = cdata[i];
                        break;
                    }
                }
                resolve(nlData);
            }).catch(err => {
                reject(err);
            });
    });
};
