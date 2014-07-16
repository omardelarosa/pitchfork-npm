var request = require('superagent');
var q = require('q');
var Review = require('./review.js');


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
  */

function Search(artist, album){
  

  // future attributes of album
  var attributes = {};
  // replace spaces with %20
  var query = [artist,"%20",album].join("").replace(/\s+/,"%20");
  // create a deferred obj
  var dfd = q.defer();

  request.get("http://pitchfork.com/search/ac/?query="+query)
    .end(function(res) {
      if (res.statusCode != 200) {
        dfd.reject("Failed to connect to Pitchfork!");
      } else {
        var reviews = get_review_objects(res.body)
        // if there are no matches...
        if (reviews.length === 0) {
          // ...return no results
          dfd.resolve([])
        // if there are some matches and an album was entered
        } else if (reviews.length > 0 && album) {
          // return a single review object with that album
          dfd.resolve(new Review(reviews[0]))
          // if there are multiple matches and no album was entered
        } else {
          var results = [];
          reviews.forEach(function(review){
            results.push(new Review(review));
          });
          // return an array of albums
          dfd.resolve(results);
        }   
      }
    })
  return dfd.promise;
}

module.exports = Search;