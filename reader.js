var express = require('express')
var mongoose = require('mongoose')

var Article = require('./model/Article.js')

var router = express.Router()

// Use native promises
mongoose.Promise = global.Promise

router.get('/article/:id', function(req, res){
    Article
        .findOne({ id: req.params.id })
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
        .find({ author: req.params.author})
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
    var end = new Date(req.params.year, req.params.month, req.params.day, 23, 59, 59)
    var start = new Date(req.params.year, req.params.month, req.params.day, 0, 0, 0)

    Article
        .find({ datePublished: {"$gte": start, "$lt": end}  })
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

module.exports = router