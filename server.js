var express = require('express');

var crawler = require('./crawler.js');

var reader = require('./reader.js')

var app = express();

var port = 8081;

app.use('/crawler', crawler)

app.use('/api', reader)

app.listen(port);

console.log('Magic happens on port' + port);

exports = module.exports = app;