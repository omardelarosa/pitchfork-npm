var execFile = require('child_process').execFile
var child;
var path = require('path');
var chai = require('chai');
var assert = require('chai').assert;
var expect = require('chai').expect;
var sinon  = require("sinon");
var Pitchfork = require("../index");

// GLOBAL CONSTANTS
var cli_filepath = path.resolve(__dirname+"/../bin/pitchfork");
var artist_name = "mogwai";
var album_title = "come on";
var valid_args = ["-a", artist_name, "-t", album_title];
var verbose_args = ["-a", artist_name, "-t", album_title, "-v"];
var review;
var search;

chai.use(require('chai-as-promised'))

describe("CLI (Command Line Tool)", function(){

  before(function(done){
    search = new Pitchfork.Search(artist_name, album_title);
    search.promise.then(function(){
      search.results[0].promise.then(function(rev){
        review = rev;
        done();
      })
    })
  })

  describe("when searching for a valid artist and album", function(){

    it("should return truncated and valid json by default", function(done){
      var proc = execFile(cli_filepath, valid_args, function(err, stdout, stderr){
        expect(stdout).to.equal(JSON.stringify(review.truncated())+"\n")
        done();
      })
    })

    it("should return full and valid json when -v flag is passed", function(done){
      var proc = execFile(cli_filepath, verbose_args, function(err, stdout, stderr){
        expect(stdout).to.equal(JSON.stringify(review.attributes)+"\n")
        done();
      })
    })

  })

  describe("when searching for no artist and no album", function(){

    it("should return usage when no flags are passed", function(done){
      var proc = execFile(cli_filepath, [], function(err, stdout, stderr){
        expect(stdout).to.equal(Pitchfork.USAGE+"\n")
        done();
      })
    })

    it("should return the right version when -V flag is passed", function(done){
      var proc = execFile(cli_filepath, ["-V"], function(err, stdout, stderr){
        expect(stdout).to.equal(Pitchfork.VERSION+"\n")
        done();
      })
    })

  })

  

})