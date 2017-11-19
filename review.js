var Search = require('./search')
  , request = require('superagent')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter
  , q = require('q')
  , cheerio = require('cheerio')
  , jsdiff = require('diff')
  , _ = require('lodash');

// global constants
var VERSION = require('./package').version;
var BASE_URL = 'http://pitchfork.com';
var INVALID_REVIEW_ERROR = new Error("Review cannot be found without a 'url' and 'name'!");
var PAGE_NOT_FOUND_ERROR = new Error("Page Not Found!")

function clean_year(yearText) {
  var re = /(\d+)/;
  var result = re.exec(yearText);
  if (result) {
    return result[0];
  } else {
    return '';
  }
}

/**
  * helper function that finds the best matching string
  *
  * @params {String}, { Array of {String} }
  *
  */

function get_best_match(str, str_list){

  // initialize variables
  var bestMatchAmount = Infinity
    , ties = []
    , currentBestMatch;

  str_list.forEach(function(item){
    // takes last best match
    var currentItemDiff = jsdiff.diffChars(str, item);
    if ( currentItemDiff.length <= bestMatchAmount ) {
      // if there's a match tie
      if (currentItemDiff.length == bestMatchAmount) {
        // save ties in array
        ties.push(item);
         // TODO: deal with ties more intelligently than 'last tie wins'
      }
      bestMatchAmount = currentItemDiff.length;
      currentBestMatch = item;
    }
  })
  return currentBestMatch;
}

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
  this.attributes.album = this.matched_album ? this.matched_album.trim() : "";
  this.fullUrl = [BASE_URL, this.url].join("");
  // fetches on initialization and saves to .promise
  this.promise = this.fetch()
  this.page = attributes.page || false;
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
    * of a single-album review.
    *
    */

  function parseHtml(opts){
    if (opts) {
      var multi = opts.multi || false;
    }

    // set multi-album attributes
    if (multi && !self.page) {
      var titles = [];
      var queryTitle = self.search.query.album;
      self.$('.review-meta h2').each(function(idx, el){
        titles.push(el.children[0].data)
      })
      var bestTitleMatch = get_best_match(queryTitle, titles);
      var indexOfMatch = titles.indexOf(bestTitleMatch);



      // set attributes
      self.attributes.title = bestTitleMatch.trim();

      self.attributes.multi = true;

      var label_year = self.$('.review-meta h3')
                        .eq(indexOfMatch)
                        .text()
                        .split(";");

      self.attributes.label = self.$('.review-detail .label-list li')
                                .children[0]
                                .text();
      self.attributes.year = label_year[1]
                                .trim();

      self.attributes.score = parseFloat(
                                  self.$('.review-meta')
                                    .find('.score')
                                    .eq(indexOfMatch)
                                    .text());

      self.attributes.cover = self.$('.review-meta')
                                .find('.artwork img')
                                .eq(indexOfMatch)
                                .attr('src');

      self.attributes.author = self.$('.review-meta h4')
                                .eq(indexOfMatch)
                                .find('address')
                                .text();

      self.attributes.date = self.$('.review-meta h4')
                                .eq(indexOfMatch)
                                .find('.pub-date')
                                .text();

    } else if (multi && self.page) {
      var titles = [];
      self.$('.review-meta h2').each(function(idx, el){
        titles.push(el.children[0].data)
      })

      // set attributes
      self.attributes.titles = titles

      self.attributes.multi = true;

      self.attributes.labels = [];
      self.attributes.years = [];
      self.attributes.scores = [];
      self.attributes.covers = [];

      /**
        *
        *  For consistency, multi-albums with generate the same
        *  attributes as single albums by setting the first album
        *  in the collection's values for their label, year, cover.
        *  The exception is 'score' which is a mathematical average
        *  of the entire collection's scores.
        *
        */

      titles.forEach(function(title, idx){

        var label_year = self.$('.review-meta h3')
                        .eq(idx)
                        .text()
                        .split(";");

        self.attributes.labels.push(
                                      label_year[0]
                                        .trim()
                                    );
        self.attributes.label = self.attributes.labels[0];

        self.attributes.years.push(
                                    label_year[1]
                                      .trim()
                                    );
        self.attributes.year = self.attributes.years[0];

        self.attributes.scores.push(
                                      parseFloat(
                                        self.$('.review-meta')
                                          .find('.score')
                                          .eq(idx)
                                          .text()
                                      )
                                    );

        // multi-album score is an average of all scores
        self.attributes.score = (function(scores){
          var sum = 0;
          scores.forEach(function(score){
            sum += score;
          })
          return (sum/scores.length)
        })(self.attributes.scores)

        self.attributes.covers.push(
                                    self.$('.review-meta')
                                    .find('.artwork img')
                                    .eq(idx)
                                    .attr('src')
                                  );

        self.attributes.cover = self.attributes.covers[0]

        self.attributes.author = self.$('.review-meta h4')
                                .eq(idx)
                                .find('address')
                                .text();

        self.attributes.date = self.$('.review-meta h4')
                                .eq(idx)
                                .find('.pub-date')
                                .text();

      })


    } else {
      // set single-album attributes
      self.attributes.title = self.fullTitle.trim();

      var label = self.$('.labels-and-years .label-list li').text();
      var yearText = self.$('.labels-and-years .year').text();

      self.attributes.label = label.trim();

      self.attributes.year = clean_year(yearText);

      self.attributes.score = parseFloat(self.$(".score").text().trim());

      self.attributes.cover = self.$(".album-art img").attr("src");

      self.attributes.author = self.$(".authors-detail .display-name").text()

      self.attributes.date = self.$(".pub-date").text();

    }

    // TODO: replace breaks
    self.attributes.editorial = {
      html: self.$(".review-text").html(),
      text: self.$(".review-text").text(),
      abstract: self.$(".abstract").text().trim()
    }
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
      if (self.$('.review-multi').length != 0) {
        parseHtml({multi: true});
      } else {
        parseHtml();
      }
      return dfd.resolve(self)
    }
  })
  return dfd.promise;
}

Review.prototype.truncated = function(){
  var to = {}
  _.each(this.attributes, function(val, key){
    if ( val.constructor === Object ) {
      return to['text'] = val.text.slice(0, 300)+"...";
    } else {
      return to[key] = val;
    }
  })
  return to;
}

Review.prototype.verbose = function(){
  var vo = {}
  var cache = []
  var self = this;
  for (key in self) {
    if ( typeof self[key] === 'object' && self[key] !== null ) {
      if ( cache.indexOf(self[key]) !== -1) {
        return;
      } else {
        cache.push(self[key]);
        return vo[key] = self[key];
      }
    }
  }
  cache = null;
  return vo;
}

Review.prototype.text_pretty_print = function(){
  var text = [];
  text.push("TITLE: "+this.fullTitle)
  text.push("ARTIST: "+this.attributes.artist)
  text.push("ALBUM: "+this.attributes.title)
  text.push("SCORE: "+this.attributes.score.toString())
  text.push("YEAR: "+this.attributes.year)
  text.push("LABEL: "+this.attributes.label)
  text.push("AUTHOR: "+this.attributes.author)
  text.push("DATE: "+this.attributes.date)
  text.push(this.attributes.editorial.text.replace("\n","\n\n"))
  return text.join("\n\n\n")
}

// Review.prototype.toString = function(){
//   return this.attributes;
// }

module.exports = Review;
