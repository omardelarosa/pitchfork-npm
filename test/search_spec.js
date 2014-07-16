var Search = require('../search')
var Review = require('../review')
var chai = require('chai')
var chaiAsPromised = require("chai-as-promised");

chai.should()

chai.use(chaiAsPromised)

describe("Searching for a review", function(){

  describe("when the artist and album are given", function(){

    var review;

    it("should return a fulfilled promise", function(done){
      var search = Search("mogwai", "come on")
      search.should.eventually.be.fulfilled.then(function(res){
        review = res;
        done();
      })
    });

    it("should return a {Review} object", function(done){
      review.should.be.instanceOf(Review)
      done();
    })

  })

  describe("when only the artist is given", function(){

    var review;

    it("should return a fulfilled promise", function(done){
      var search = Search("mogwai")
      search.should.eventually.be.fulfilled.then(function(res){
        review = res;
        done();
      })
    });

    it("should return an {Array} of {Review} objects", function(done){
      review.should.be.instanceOf(Array);
      review[0].should.be.instanceOf(Review);
      done();
    })

  })

  describe("when a non-existant artist is given", function(){

    var review;

    it("should return a fulfilled promise", function(done){
      var search = Search("modddiasdfasdf")
      search.should.eventually.be.fulfilled.then(function(res){
        review = res;
        done();
      })
    });

    it("should return an empty {Array}", function(done){
      review.should.be.instanceOf(Array)
      review.length.should.equal(0);
      done();
    })

  })

});

