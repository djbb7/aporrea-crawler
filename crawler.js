var express = require('express')
var mongoose = require('mongoose')
var request = require('request');
var rp = require('request-promise')
var cheerio = require('cheerio')

var Article = require('./model/Article.js')

var router = express.Router()

// Use native promises
mongoose.Promise = global.Promise

var server = 'http://localhost:8081/crawler'


function getDate(){
	var d = new Date()

	var day = d.getDate()

	var month = d.getMonth()+1

	var year = d.getFullYear()

	day = day < 10 ? '0'+day : day

	month = month < 10 ? '0'+month : month

	return year + '/' + month + '/' + day
}

router.get('/crawl', function(req, res, next){

	var date = getDate()

	req.url = req.url + '/' + date

	next()
})
router.get('/crawl/:year/:month/:day', function(req, res){

	var url = server + '/archive/' + req.params.year + '/' + req.params.month + '/' + req.params.day

	rp(url)
		.then(function(response){
			var articles = JSON.parse(response)
			var newArticles = []
			var promises = []
			for(var i=0; i<articles.length; i++){
				var article = new Article(articles[i])

				var query = {id: articles[i].id}

				var promise = Article
					.findOneAndUpdate(query, articles[i], {new:1, upsert:1, setDefaultsOnInsert:1})

				promise.then(function(doc){
						newArticles[newArticles.length] = doc
					})
					.catch(function(err){
					})

				promises[promises.length] = promise
			}

			Promise.all(promises).then(function(){
				res.setHeader('Content-Type', 'application/json')
				res.send(JSON.stringify(newArticles))
			}).catch(function(){
				res.sendStatus(500)
			})
	})
})

router.get('/article', function(req,res){

	var url = 'https://www.aporrea.org/' + req.query.url;

	request(url, function(error, response, html){
		if(!error){

			var $ = cheerio.load(html);

			var id = req.query.url.slice(req.query.url.indexOf('/')+1, req.query.url.indexOf('.html'))
			var author = $('[itemprop="author"]').text();
			var title = $('[itemprop="name"]').text();
			var datePublished = $('[itemprop="datePublished"]').text();
			var readCount = $('h3 span.badge.badge-info').text();
			var content = $('div[itemprop="articleBody"]').html();

			var article = {
				'id' : id,
				'title' : title,
				'datePublished' : datePublished,
				'readCount' : readCount,
				'content' : content,
				'crawled' : true
			}

			Article.findOneAndUpdate({id : article.id}, article, {new: 1, upsert: 1})
				.then(function(doc){
					res.setHeader('Content-Type', 'application/json');
					res.send(JSON.stringify(doc));
				})
				.catch(function(){
					res.sendStatus(500)
				})
			
		}
	})
})

router.get('/archive/:year/:month/:day', function(req, res){

	var archive = 'https://www.aporrea.org/archivo/';

	var date = req.params.day + '-' + req.params.month + '-' + req.params.year;

	var url = archive + date;

	request(url, function(error, response, html){
		if(!error){
		    var $ = cheerio.load(html);
	
			var articles = [];

			$('ul.autores3 li').each(function(i, el){
				var author = $(this).find('.speaker-small h4').text();
				var url = $(this).find('a').attr('href');
				var category = url.slice(0, url.indexOf('/'))
				var id = url.slice(url.indexOf('/')+1, url.indexOf('.html'));
				var title = $(this).find('.speaker-small h3').text();
				var avatar = $(this).find('img').attr('data-cfsrc'); 

				articles[i] = {
					'author' : author,
					'url'	: url,
					'category' 	: category,
					'title'	: title,
					'avatar' : avatar,
					'id' : id,
					'crawlUrl' : '/article?url='+url
				}
			})

			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(articles));
		} 
    });
});

module.exports = router