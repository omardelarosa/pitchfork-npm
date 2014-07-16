var s = require('./search');
var request = require('superagent');
var q = require('q');
var cheerio = require('cheerio');

// globals
var version = require('./package').version;

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
  var self;
  this.attributes = attributes;
  this.url = attributes.url;
  this.name = attributes.name;
  this.matched_artist = this.name.split(' - ')[0];
  this.matched_album = this.name.split(' - ')[1];
  this.fullUrl = ['http://pitchfork.com', this.url].join("");
  // if artist and album are passed in as attributes
  
}

/**
  * Grabs the HTML of the review from Pitchfork
  *
  * @param cb {Function} - a callback function that fires when fetch is complete
  *
  */

Review.prototype.fetch = function(cb){
  var dfd = q.defer();
  var self = this;

  /**
    * Parses the HTML received after fetch and sets attributes
    * 
    */

  function parseHtml(){

  }

  request.get(this.fullUrl)
  .end(function(res){
    self.html = res.text;
    self.$ = cheerio.load(self.html);
    // set attributes from html
    self.title = self.$("title").text();
    // TODO parse other attributes;
    if (self.title == "Page Not Found") {
      dfd.reject("Page Not Found!");
    } else {
      if (cb){ return cb(self); }
      return dfd.resolve(self)
    }
  })
  return dfd.promise;
}

// Review.prototype.toString = function(){
//   return this.attributes;
// }

module.exports = Review;