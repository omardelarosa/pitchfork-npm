var p = require('../index')
var s = new p.Search("wilco")

s.promise.then(function(results){
  results.forEach(function(result){
    result.promise.then(function(review){
      console.log("review", review.truncated())
    })
  })
})