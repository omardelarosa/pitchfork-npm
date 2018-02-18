var Search = require('../search');
var Review = require('../review');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");

chai.should();
chai.use(chaiAsPromised);

describe("Review", function(){

  this.timeout(10000);

  describe("when a valid url and name are given", function(){

    var review = new Review({
      url: "/reviews/albums/19466-mogwai-come-on-die-young-deluxe-edition/",
      name: 'Mogwai - Come On Die Young '
    })

    it("should #fetch the review", function(done){
      review.promise.should.eventually.be.fulfilled.and.notify(done);
    })

    it("the review's title should be for the correct album", function(done){
      review.attributes.title.should.include('Mogwai: Come On Die Young');
      done();
    })

    describe("the following attributes should be correct", function() {
      it("the cover", function(done) {
        review.attributes.cover.should.not.eq('');
        done(); 
      })
      
      it("the label", function(done) {
        review.attributes.label.should.eq('Chemikal Underground');
        done(); 
      })

      it("the year", function(done) {
        review.attributes.year.should.eq("1999");
        done(); 
      })

      it("the score", function(done) {
        review.attributes.score.should.eq(8.3);
        done(); 
      })

      it("the author", function(done) {
        review.attributes.author.should.eq("Stuart Berman");
        done(); 
      })

      it("the date", function(done) {
        review.attributes.date.should.eq("June 18 2014");
        done(); 
      })

      it("the abstract", function(done) {
        review.attributes.editorial.abstract.should.eq("Mogwai's second album, released in 1999, is getting a reissue with a bounty of bonus material that includes demos and the Travels in Constants EP. On Come On Die Young, Mogwai went about becoming the most sullen, brooding post-rock band they could possibly be.");
        done(); 
      })
    })
  })

  describe("and when an invalid name or url are given", function(done){

    var review;

    xit("should throw an when fetching for bad url/names", function(done){
      review = new Review({
        url: "/reviews/fffffff-fffffff/",
        name: 'Fakey - McFake'
      })
      review.promise
        .should.eventually.be.rejectedWith(Error)
        .and.notify(done);
    })

    it("should throw an when creating for missing url/names", function(done){
     (function(){return new Review() }).should.throw(Error);
      done();
    })

  })

});
