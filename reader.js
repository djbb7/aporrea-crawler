var express = require('express')
var mongoose = require('mongoose')

var Article = require('./model/Article.js')

var router = express.Router()

// Use native promises
mongoose.Promise = global.Promise

router.get('/article/:id', function(req, res){
    Article
        .findOne({ id: req.params.id }, '-_id')
        .then(function(article){
            if(!article){
                res.sendStatus(404)
                return
            }
            res.setHeader('Content-Type', 'application/json')
			res.send(JSON.stringify(article))
        })
})

router.get('/author/:author', function(req, res){
    Article
        .find({ author: req.params.author}, '-_id')
        .then(function(articles){
            if(articles.length == 0){
                res.sendStatus(404)
                return
            }
            res.setHeader('Content-Type', 'application/json')
			res.send(JSON.stringify(articles))
        })
        .catch(function(err){
            console.log(err)
            res.sendStatus(500)
        })
})

router.get('/articles/:year/:month/:day', function(req, res){
    //var end = new Date(req.params.year, req.params.month, req.params.day, 23, 59, 59)
    var end = new Date(req.params.day + '-' + req.params.month + '-' + req.params.year + ' 23:59:59 -04:00')
    //var start = new Date(req.params.year, req.params.month, req.params.day, 0, 0, 0)
    var start = new Date(req.params.day + '-' + req.params.month + '-' + req.params.year + ' 00:00:00 -04:00')

    Article
        .find({ datePublished: {"$gte": start, "$lt": end}, crawled: true }, '-_id')
        .then(function(articles){
            res.setHeader('Content-Type', 'application/json')
			res.send(JSON.stringify(articles))
        })
        .catch(function(err){
            console.log(err)
            res.sendStatus(500)
        })
})

router.get('/timeline', function(req, res){
    var limit = req.query.limit ? parseInt(req.query.limit) : 10
    var after = req.query.after

    var query = {crawled:true}

    if(after){
        var date = new Date(after)
        query.datePublished = {"$lt":date}
    }

    Article
        .find(query, '-_id')
        .limit(limit)
        .sort('-datePublished')
        .then(function(articles){
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(articles))
        })
        .catch(function(err){
            console.log(err)
            res.sendStatus(500)
        })
})
module.exports = router