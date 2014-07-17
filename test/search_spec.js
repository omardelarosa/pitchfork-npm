var Search = require('../search')
var Review = require('../review')
var chai = require('chai')
var chaiAsPromised = require("chai-as-promised");

chai.should()
chai.use(chaiAsPromised)


describe("Search", function(){

  var search = new Search("mogwai", "come on")

  it("should return an instance of {Search}", function(done){
    search.should.be.instanceOf(Search);
    done();
  })

  describe("and when the artist and album are given", function(){

    var search = new Search("mogwai", "come on")

    it(" .init should return a fulfilled promise", function(done){
      search.promise.should.eventually.be.fulfilled.and.notify(done)
    });

    it("should return an {Array} with a single {Review} object", function(done){
      // console.log("results", search.results[0].constructor)
      search.results[0].should.be.instanceOf(Review)
      search.results.length.should.eq(1);
      done();
    })

  })

  describe("and when only the artist is given", function(){

    var search = new Search("mogwai")

    it("should return a fulfilled promise", function(done){
      search.promise.should.eventually.be.fulfilled.and.notify(done)
    });

    it(".results should return an {Array} of {Review} objects", function(done){
      search.results.should.be.instanceOf(Array);
      search.results.length.should.be.above(1);
      done();
    })

  })

  describe("when a non-existant artist is given", function(){

    var search = new Search("modddiasdfasdf")

    it("should return a fulfilled promise", function(done){
      search.promise.should.eventually.be.fulfilled.and.notify(done)
    });

    it("should return an empty {Array}", function(done){
      search.results.length.should.eq(0);
      done();
    })

  })

});

