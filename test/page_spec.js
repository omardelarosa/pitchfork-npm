var Search = require('../search')
var Review = require('../review')
var Page = require('../page')
var chai = require('chai')
var chaiAsPromised = require("chai-as-promised");

chai.should()
chai.use(chaiAsPromised)


describe("Page", function(){

  this.timeout(10000);

  

  it("should return an instance of {Page}", function(done){
    var page = new Page(1)
    page.should.be.instanceOf(Page);
    done();
  })

  describe("and when the artist and album are given", function(){

    var page = new Page(1)

    it(".promise should return and eventually fulfill a promise", function(done){
      page.promise.should.eventually.be.fulfilled.and.notify(done)
    });

    it(".results should return an {Array} with a multiple {Review} objects", function(done){
      // console.log("results", search.results[0].constructor)
      page.results[0].should.be.instanceOf(Review)
      page.results.length.should.gt(5);
      done();
    })

  })

});

