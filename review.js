var Search = require('./search')
  , request = require('superagent')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , q = require('q')
  , cheerio = require('cheerio');

// global constants
var VERSION = require('./package').version;
var BASE_URL = 'http://pitchfork.com';
var INVALID_REVIEW_ERROR = new Error("Review cannot be found without a 'url' and 'name'!");
var PAGE_NOT_FOUND_ERROR = new Error("Page Not Found!")
/**
  * A Review instance
  * @constructor
  * @params attributes {Object} - an object of attributes. 
  *  (note: 'url' and 'name' are required )
  */

function Review(attributes){
  if (!attributes || typeof attributes.url == "undefined" || typeof attributes.name == "undefined") {
    throw INVALID_REVIEW_ERROR;
  }
  var self = this;
  this.attributes = attributes;
  this.url = attributes.url;
  this.name = attributes.name.trim();
  this.matched_artist = this.name.split(' - ')[0];
  this.matched_album = this.name.split(' - ')[1];
  this.attributes.artist = this.matched_artist.trim();
  this.attributes.album = this.matched_album.trim();
  this.fullUrl = [BASE_URL, this.url].join("");
  // fetches on initialization and saves to .promise
  this.promise = this.fetch()
}

/**
  * Grabs the HTML of the review from Pitchfork
  *
  * @public
  * @type {Promise}
  */

Review.prototype.fetch = function(){
  var dfd = q.defer()
    , self = this;

  function pretty_print_editorial(rawHtml){
    return rawHtml
            .html()
            .toString()
            .replace(/\<\/p\>/,"\n\n")
            .replace(/\<p\>/,"")
            .replace(/\<br\>/, "\n")
            .replace(/\<br\>\<br\>/, "\n");
  }

  /**
    * Parses the HTML received after fetch and sets attributes
    * 
    */

  function parseHtml(){

    self.attributes.title = self.fullTitle.trim();
    self.attributes.score = self.$(".score").text().trim();
    // TODO: replace breaks
    self.attributes.editorial = {
      html: self.$(".editorial").html(),
      text: self.$(".editorial").text()
    }
    self.attributes.cover = self.$(".artwork img").attr("src");
    var label_year_author = self.$(".info h3").text().split(";");
    var year_author = label_year_author[1].split(/\s+By\s+/);
    self.attributes.label = label_year_author[0].trim();
    self.attributes.year = year_author[0].trim();
    self.attributes.author = year_author[1];
  }

  request.get(this.fullUrl)
  .end(function(res){
    self.html = res.text;
    self.$ = cheerio.load(self.html);
    // set attributes from html
    self.fullTitle = self.$("title").text().trim();
    
    // TODO parse other attributes;
    if (self.fullTitle.search("Page Not Found") != -1) {
      return dfd.reject(PAGE_NOT_FOUND_ERROR);
    } else {
      parseHtml();
      return dfd.resolve(self)
    }
  })
  return dfd.promise;
}

// Review.prototype.toString = function(){
//   return this.attributes;
// }

module.exports = Review;