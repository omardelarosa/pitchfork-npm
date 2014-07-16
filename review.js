

function Review(attributes){
  this.attributes = attributes;
}

Review.prototype.toString = function(){
  return this.attributes;
}

module.exports = Review;