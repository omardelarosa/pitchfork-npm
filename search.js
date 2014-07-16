var request = require('superagent')
  , q = require('q')
  , Review = require('./review.js')
  , util = require('util')
  , EventEmitter = require('events').EventEmitter;

// global constants
var VERSION = require('./package').version
  , USER_AGENT = 'omardelarosa/pitchfork-npm-v'+VERSION
  , BASE_URL = "http://pitchfork.com/search/ac/?query="
  , CONNECTION_ERR = new Error("Failed to connect to Pitchfork!");


// extracts the first review inside of 
function get_review_objects(responseBody){
  var review_objects = [];
  responseBody.forEach(function(obj){
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

/**
  * Conducts a new search
  *
  * @constructor extends {EventEmitter}
  *
  * @param {string} artist - a musical artist likely to be reviewed on Pitchfork
  * @param {string} album - an album by the given artist
  *
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
    .set('User-Agent', USER_AGENT)
    .end(function(res) {
      if (res.statusCode != 200) {
        self.emit("error", CONNECTION_ERR)
        cb(CONNECTION_ERR)
        return dfd.reject(CONNECTION_ERR);
      } else {
        var reviews = get_review_objects(res.body)
        // if there are no matches...
        if (reviews.length === 0) {
          // ...return no results
          self.results = [];
        // if there are some matches and an album was entered
        } else if (reviews.length > 0 && self.query.album) {
          // return a single review object with that album
          self.results = [new Review(reviews[0])];
          // if there are multiple matches and no album was entered
        } else {
          // return an array of albums
          self.results = [];
          reviews.forEach(function(review){
            self.results.push(new Review(review));
          });
        }  
        // emit ready event
        self.emit("ready", self.results);
        if (self.query.cb) { self.query.cb(results); }
        return dfd.resolve(self.results); 
      }
    })
  return dfd.promise;

}

module.exports = Search;