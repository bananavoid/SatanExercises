let rest = require('sync-request');
let pagesUrl = 'https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=49.8412929|24.0316195&gslimit=50&format=json';
let pagesResponse = JSON.parse(rest('GET', pagesUrl).getBody());
let pages = pagesResponse.query.geosearch;
let pageIds = pages.map(page => page.pageid);
let pageIdsParam = '&pageids=' + pageIds.join('|');
let imagesUrl = 'https://en.wikipedia.org/w/api.php?action=query&prop=images&' + pageIdsParam + '&imlimit=100&format=json';
let imagesResponse = JSON.parse(rest('GET', imagesUrl).getBody());
let imagesPages = imagesResponse.query.pages;
let titles = [];

for (let pageId in imagesPages) {
    let images = imagesPages[pageId].images || [];
    images.forEach(image => titles.push(image.title.replace('File:', '').replace(/\.[^/.]+$/, '')));
}

let calculateSimilarity = (str, arr) => {
    let words = str.split(' ');
    let similarityIndex = 0;

    arr.forEach(stringToCompare => {
        words.forEach(word => {
            if(stringToCompare.includes(word)) {
                similarityIndex++
            }
        });
    })

    return similarityIndex;
};

console.time('sort');
titles.sort((aStr, bStr) =>  {
    let aIndex = calculateSimilarity(aStr, titles);
    let bIndex = calculateSimilarity(bStr, titles);

    return bIndex - aIndex;
});
console.timeEnd('sort');

let result = titles.slice(0, 10);

console.log(result);
