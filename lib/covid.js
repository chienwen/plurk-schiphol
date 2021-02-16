const fetch = require('node-fetch');

module.exports = function (countrySlug) {
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
