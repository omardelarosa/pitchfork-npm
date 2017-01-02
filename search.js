var request = require('superagent')
  , _ = require('lodash')
  , q = require('q')
  , Review = require('./review.js')
  , util = require('util')
  , async = require('async')
  , EventEmitter = require('events').EventEmitter
  , cheerio = require('cheerio');

// global constants
var VERSION = require('./package').version
  , USER_AGENT = 'omardelarosa/pitchfork-npm-v'+VERSION
  , BASE_URL = "http://pitchfork.com/search/?query="
  , CONNECTION_ERR = new Error("Failed to connect to Pitchfork!");


// extracts the first review inside of 
function get_review_objects(responseBody){
  var review_objects = [];
  _.forEach(responseBody, function(obj){
    var obj 
    var label = obj["label"];
    if (label == "Reviews") {
      obj["objects"].forEach(function(review){
        review_objects.push(review);
      })
    }
  })
  return review_objects;
}

// normalize search response
function normalize_search_response(htmlString) {
  var $ = cheerio.load(htmlString);
  var links = $('#result-albumreviews .album-link')
  var artists = $('#result-artists .artist-name')
  var albums = $('#result-albumreviews')
    
  var titles = $('#result-albumreviews .title')
    .map(function(idx, a) {
      return _.get(a, 'children[0].data', null);
    })
    .filter(function (idx, a) { return !!a });

  if (_.isEmpty(titles)) {
    return [];
  }

  var links = $('#result-albumreviews .album-link')
    .map(function(idx, a) {
      return a.attribs['href'];
    });
  var artist = $('#result-artists .artist-name')
    .map(function(idx, a) {
      return a.children[0].data;
    })[0];
 
  return titles.map(function (idx, a) {
    return {
      name: artist + ' - ' + titles[idx],
      url: links[idx]
    }
  });
}

/**
  * Conducts a new search
  *
  * @constructor extends {EventEmitter}
  *
  * @param {String} artist - a musical artist likely to be reviewed on Pitchfork
  * @param {String} album - an album by the given artist
  * @param {Function} cb - a callback that fires when search is complete
  * returns {Promise}
  */

function Search(artist, album, cb){
  
  // future attributes of album
  var attributes = {};

  // a container for search results
  this.results = [];
  // replace spaces with %20
  
  this.query = {
    artist: artist,
    album: album,
    cb: cb
  };

  // run search;
  this.promise = this.init();

}

// extends EventEmitter
util.inherits(Search, EventEmitter);

/**
  * Runs a search and emits a "ready" event.
  * @public
  * @type {Promise}
  */

Search.prototype.init = function(){
  var self = this
    , query = [self.query.artist,"%20",self.query.album].join("").replace(/\s+/,"%20")
  // create a deferred obj
    , dfd = q.defer();

  request.get(BASE_URL+query)
    // .set('User-Agent', USER_AGENT)
    .end(function(res) {
      if (res.statusCode != 200) {
        self.emit("error", CONNECTION_ERR)
        cb(CONNECTION_ERR)
        return dfd.reject(CONNECTION_ERR);
      } else {
        var reviews = normalize_search_response(res.text);
        // var reviews = get_review_objects(res.body)
        // var reviews = [];
        // if there are no matches...
        if (reviews.length === 0) {
          // ...return no results
          self.results = [];
          self.emit("ready", self.results);
          if (self.query.cb) { self.query.cb(results); }
          return dfd.resolve(self.results); 
        // if there are some matches and an album was entered
        } else if (reviews.length > 0 && self.query.album) {
          // return a single review object with that album
          var r = new Review(reviews[0]);
          // create reference to search in review.
          r.search = self;
          self.results = [r];
          self.emit("ready", self.results);
          if (self.query.cb) { self.query.cb(results); }
          return dfd.resolve(self.results); 
          // if there are multiple matches and no album was entered
        } else {
          // return an array of albums
          self.results = [];
          var tasks = []
          _.each(reviews, function(review){
            var rev = review
            tasks.push(function(done){
              var r = new Review(rev)
              r.search = self;
              r.promise.then(function(revObj){
                self.results.push(r)
                done(null, revObj);
              })
            })
          });
          async.parallel(tasks, function(){
            self.emit("ready", self.results);
            if (self.query.cb) { self.query.cb(results); }
            return dfd.resolve(self.results); 
          })
        }  
        
      }
    })
  return dfd.promise;

}

module.exports = Search;
