const RSSParser = require('rss-parser');
const rssParser = new RSSParser();

const newsFeeds = [
    'https://news.ltn.com.tw/rss/world.xml',
    'https://www.bbc.com/zhongwen/trad/world/index.xml',
    'https://feeds.feedburner.com/ettoday/global',
    //'https://global.udn.com/rss/news/1020/8662', // 轉角國際 24h
    //'https://global.udn.com/rss/news/1020/120865', //  轉角國際 重磅廣播
    'https://newtalk.tw/rss/category/1',
    'https://public.twreporter.org/rss/twreporter-rss.xml',
    //'http://www.rti.org.tw/rss/',
    'https://feeds.feedburner.com/TheNewsLens',
];

module.exports = {
    getNews: function(callback, keywordRegEx) {
        const fetchedPromises = [];
        newsFeeds.forEach(url => {
            fetchedPromises.push(rssParser.parseURL(url));
        });
        Promise.all(fetchedPromises).then((sources) => {
            const results = [];
            sources.forEach((source) => {
                const newsItems = source.items.map((res) => {
                    return {
                        title: res.title,
                        desc: res.content,
                        url: res.link,
                        time: new Date(res.isoDate)
                    };
                }).forEach((data) => {
                    results.push(data)
                });
            });
            callback(results)
        });
    }
};
