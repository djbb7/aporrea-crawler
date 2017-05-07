var express = require('express');

var mongoose = require('mongoose')

var crawler = require('./crawler.js')

var reader = require('./reader.js')

var app = express();

var port = 8081;

var db_user = process.env.DBUSER

var db_pass = process.env.DBPASS

var mongoServer = 'mongodb://'+db_user+':'+db_pass+'@ds163698.mlab.com:63698/articles'

mongoose.connect(mongoServer)

app.use('/crawler', crawler)

app.use('/api', reader)

app.listen(port);

console.log('Magic happens on port' + port);

exports = module.exports = app;