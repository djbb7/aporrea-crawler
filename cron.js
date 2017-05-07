var rp = require('request-promise')

var server = 'http://localhost:8081'

var crawlUrl = server + '/crawler/crawl'

rp(crawlUrl)
    .then(function(response){
        var articles = JSON.parse(response)

        foldl(articles.filter(isNotCrawled), function(item){
            rp(item.crawlUrl)
                .then(function(article){
                    console.log('fetched article')
                    console.log(">>"+article.title)
                })
                .catch(function(err){
                    console.log('failed to fetch')
                })
        })
    })
    .catch(function(err){
        console.log(err)
        console.log('was not able to crawl')
    })

function foldl(list, func){
    return new Promise(function(resolve, reject){
        foldl_internal(list, 0, func, resolve, reject)
    })
}

function foldl_internal(list, index, func, resolve, reject){
    if(index == list.length){
        resolve()
        return
    }
    setTimeout(function(){
        func(list[index])
        foldl_internal(list, index+1, func, resolve, reject)
    }, 1000)
}

function isNotCrawled(article){
    return !article.crawled;
}