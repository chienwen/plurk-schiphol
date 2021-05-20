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
                                if (matched = article.title.match(/^新增(\d+)例COVID-19確診(.*?(\d+)例本土.*?(\d+)例境外移入)?/)) {
                                    res.NewConfirmed = matched[1];
                                    res.TWNewConfirmedLocal = matched[3];
                                    res.TWNewConfirmedExternal = matched[4];
                                }
                            }
                        });
                        if (res.NewConfirmed) {
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
