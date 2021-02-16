const fetch = require('node-fetch');
const HTMLParser = require('node-html-parser');
const RATING_ABOVE = 20;

module.exports = {
    getHotArticles: function (num, cb) {
        const NUM_PAGES = Math.floor(4 * num / 20);
        const fetchPromises = [];
        for (let i = 0 ; i < NUM_PAGES; i++) {
            fetchPromises.push(
                fetch('https://www.ptt.cc/bbs/Gossiping/search?page=' + (i + 1) + '&q=recommend%3A' + RATING_ABOVE, {
                    headers: {
                        'cookie': 'over18=1' 
                    }
                })
                .then(res => res.text())
            );
        }

        Promise.all(fetchPromises).then((pagesData) => {
            const allData = [];
            pagesData.forEach((body) => {
                const root = HTMLParser.parse(body);
                root.querySelectorAll('.r-ent .title a').map((ele) => {
                    return {
                        traw: ele.text,
                        url: ele.getAttribute('href')
                    };
                }).forEach((item) => {
                    allData.push(item);
                });
            });
            const uniqueTitle = {};
            const parsedData = allData.map((item) => {
                const token = item.traw.match(/^(Re: )?\[([^\]\[]+)\] (.+)/);
                if (token) {
                    item.type = token[2].trim();
                    item.title = token[3].trim();
                    item.isr = !!token[1];
                }
                return item;
            }).filter((item) => {
                if ((!uniqueTitle[item.title]) && item.type && item.title) {
                    if (item.type.match(/公告/) || item.title.match(/女|寶|錢|取|疫|套|刮|車|性|覺|母|火|妹|奶|生|本|疫|孩|子|洨|精|房|爽|愛|老|年|援/)) {
                        return false;
                    } else {
                        uniqueTitle[item.title] = true;
                        return true;
                    }
                } else {
                    return false;
                }
            });
            // shuffle
            for (let i = 0; i < parsedData.length; i++) {
                let j = Math.floor(Math.random() * parsedData.length);
                if (i !== j) {
                    let temp = parsedData[i];
                    parsedData[i] = parsedData[j];
                    parsedData[j] = temp;
                }
            }
            cb(parsedData.slice(0, num));
        });
    }
};

