// from https://sites.google.com/site/taiwanqixiangzhishiwang/home/feng-li-fen-ji-ding-yi-jie-shao
// cat data.tsv | awk -F '\t' '{print "{ rank: "$1", name:\""$2"\", desc: \""$3"\", speed: "$4" },"}'

const DATASET = [
    { rank: 0, name:"無", desc: "毫無風的感覺，炊煙筆直向上。", speed: 0 },
    { rank: 1, name:"軟", desc: "炊煙斜升，可看出風向。", speed: 0.3 },
    { rank: 2, name:"輕", desc: "有風吹在臉上的感覺，樹葉搖動。", speed: 1.6 },
    { rank: 3, name:"微", desc: "樹葉與小樹枝被吹動。", speed: 3.4 },
    { rank: 4, name:"和", desc: "旗幟飄動不止，紙張飛揚，且有風沙。", speed: 5.5 },
    { rank: 5, name:"清", desc: "池塘的水面波浪起伏。", speed: 8.0 },
    { rank: 6, name:"強", desc: "張傘困難，大樹枝搖動，電線被吹的呼呼作響。", speed: 10.8 },
    { rank: 7, name:"疾", desc: "樹全身搖動，逆風行走困難。", speed: 13.9 },
    { rank: 8, name:"大", desc: "寸步難行，樹枝被折斷。", speed: 17.2, typhoon: 1 },
    { rank: 9, name:"烈", desc: "煙囪被吹倒，屋頂瓦片被吹翻。", speed: 20.8, typhoon: 1 },
    { rank: 10, name:"狂", desc: "樹木被連根拔起，房屋會遭受嚴重災害。", speed: 24.5, typhoon: 1 },
    { rank: 11, name:"暴", desc: "風力更強，許多建築物被吹壞。", speed: 28.5, typhoon: 1 },
    { rank: 12, name:"颶", desc: "災害更大", speed: 32.7, typhoon: 2 },
    { rank: 13, name:"颶", desc: "", speed: 37.0, typhoon: 2 },
    { rank: 14, name:"颶", desc: "", speed: 41.5, typhoon: 2 },
    { rank: 15, name:"颶", desc: "", speed: 46.2, typhoon: 2 },
    { rank: 16, name:"颶", desc: "", speed: 51.0, typhoon: 3 },
    { rank: 17, name:"颶", desc: "", speed: 56.1, typhoon: 3 },
];

const TYPHOON_NAME = {
    1: '輕度',
    2: '中度',
    3: '強烈',
};

module.exports = function (speedMs) {
    let data;
    for (let i = 0 ; i < DATASET.length; i++) {
        if (speedMs > DATASET[i].speed) {
            data = DATASET[i];
        } else {
            break;
        }
    }
    data = Object.assign({}, data);
    if (data.typhoon) {
        data.typhoon = {
            rank: data.typhoon,
            name: TYPHOON_NAME[data.typhoon],
        };
    }
    return data;
};
