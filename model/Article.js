var mongoose = require('mongoose')

var Schema = new mongoose.Schema({
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
})

var Article = mongoose.model('Article', Schema)

module.exports = Article