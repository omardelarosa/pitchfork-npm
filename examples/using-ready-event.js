var p = require('../index')
var s = new p.Search("wilco")

s.on("ready", function(results){
  results.forEach(function(review, idx){
    // Use review object here
    console.log("review #%d: ",idx, review.fullTitle)
  })
})
