var express = require('express');
var request = require('request');
var cheerio = require('cheerio');

var app = express();

var port = 8081;

var host = 'http://localhost';

app.get('/article', function(req,res){

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
				'content' : content
			}

			res.setHeader('Content-Type', 'application/json');
			res.send(JSON.stringify(article));
		}
	})
})

app.get('/archive/:year/:month/:day', function(req, res){

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

var server = 'http://localhost:8081'

var mongoose = require('mongoose');

var db_user = process.env.DBUSER;

var db_pass = process.env.DBPASS;

var mongoServer = 'mongodb://'+db_user+':'+db_pass+'@ds163698.mlab.com:63698/articles';

mongoose.connect(mongoServer)

function getDate(){
	var d = new Date()

	var day = d.getDate()

	var month = d.getMonth()+1

	var year = d.getFullYear()

	day = day < 10 ? '0'+day : day

	month = month < 10 ? '0'+month : month

	return year + '/' + month + '/' + day
}



var articleSchema = new mongoose.Schema({
	author: {type: String, index: true},
	category: String,
	title: String,
	avatar: String,
	url: String,
	id: {type: String, unique: true, index: true},
	content: String,
	datePublished: Date,
	readCount: Number,
	crawlUrl: String
});

var Article = mongoose.model('Article', articleSchema)

app.get('/crawl', function(req, res){

	var url = host + ':' + port + '/archive/' + getDate() 

	request(url, function(error, response){
		if(!error){

			var articles = JSON.parse(response.body)

			for(var i=0; i<articles.length; i++){
				var article = new Article(articles[i])

				var query = {id: articles[i].id}

				article.save(function(err, item){
					if(!err){
						var url = server + item.crawlUrl

						request(url, function(error, response){
							if(!error){
								article = JSON.parse(response.body);
								Article.findOneAndUpdate({id : article.id}, new Article(article), function(){

								});
							}
						})
					}
				})
			}

			res.setHeader('Content-Type', 'application/json')
			res.send(response.body)
		}
	})
})

app.listen(port);

console.log('Magic happens on port 8081');

exports = module.exports = app;