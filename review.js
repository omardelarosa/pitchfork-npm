var Search = require('./search')
  , request = require('superagent')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , q = require('q')
  , cheerio = require('cheerio');

// global constants
var VERSION = require('./package').version;
var BASE_URL = 'http://pitchfork.com';

/**
  * A Review instance
  * @constructor
  * @params attributes {Object} - an object of attributes. 
  *  (note: 'url' and 'name' are required )
  */

function Review(attributes){
  if (!attributes || !attributes.url || !attributes.name) {
    throw new Error("Review cannot be found without a 'url' and 'name'!");
  }
  var self = this;
  this.attributes = attributes;
  this.url = attributes.url;
  this.name = attributes.name;
  this.matched_artist = this.name.split(' - ')[0];
  this.matched_album = this.name.split(' - ')[1];
  this.attributes.artist = this.matched_artist;
  this.attributes.album = this.matched_album;
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

  /**
    * Parses the HTML received after fetch and sets attributes
    * 
    */

  function parseHtml(){
    self.attributes.fullTitle = self.$("title").text();
  }

  request.get(this.fullUrl)
  .end(function(res){
    self.html = res.text;
    self.$ = cheerio.load(self.html);
    // set attributes from html
    parseHtml();
    // TODO parse other attributes;
    if (self.attributes.fullTitle == "Page Not Found") {
      dfd.reject("Page Not Found!");
    } else {
      return dfd.resolve(self)
    }
  })
  return dfd.promise;
}

// Review.prototype.toString = function(){
//   return this.attributes;
// }

module.exports = Review;