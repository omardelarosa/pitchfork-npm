var p = require('../index')
var s = new p.Search("wilco")
var Q = require('q');

s.promise.then(function(results){
  results.forEach(function(review){
    // Use review object here...
    console.log(review.fullTitle);
  })
})
