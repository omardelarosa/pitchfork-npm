var request = require('superagent');
var q = require('q');
var Review = require('./review.js');

// globals
var version = require('./package').version;

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

Search.prototype.init = function(){
  var self = this;
  var query = [self.query.artist,"%20",self.query.album].join("").replace(/\s+/,"%20");
  // create a deferred obj
  var dfd = q.defer();

  request.get("http://pitchfork.com/search/ac/?query="+query)
    .set('User-Agent', 'omardelarosa/pitchfork-npm-v'+version)
    .end(function(res) {
      if (res.statusCode != 200) {
        dfd.reject("Failed to connect to Pitchfork!");
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
        if (self.query.cb) { self.query.cb(results); }
        return dfd.resolve(self.results); 
      }
    })
  return dfd.promise;

}

module.exports = Search;