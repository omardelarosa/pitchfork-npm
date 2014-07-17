var Search = require('../search');
var Review = require('../review');
var chai = require('chai');
var chaiAsPromised = require("chai-as-promised");

chai.should();
chai.use(chaiAsPromised);

describe("Review", function(){

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

  })

  describe("and when an invalid name or url are given", function(done){

    var review;

    it("should throw an when fetching for bad url/names", function(done){
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

  describe("and when review is a MultiReview", function(){

    // var review = new Review({
    //   url: "/reviews/albums/12938-pablo-honey-collectors-edition-the-bends-collectors-edition-ok-computer-collectors-edition/",
    //   name: "Radiohead: Pablo Honey: Collector's Edition / The Bends: Collector's Edition / OK Computer: Collector's Edition | Album Reviews | Pitchfork"
    // })

  })

});