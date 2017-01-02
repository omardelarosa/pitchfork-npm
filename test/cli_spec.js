var execFile = require('child_process').execFile
  , path = require('path')
  , chai = require('chai')
  , prettyjson = require('prettyjson')
  , expect = chai.expect
  , Pitchfork = require("../index");

// globals
var cli_filepath = path.resolve(__dirname+"/../bin/pitchfork");
var artist_name = "mogwai";
var album_title = "come on";
var valid_args = ["-a", artist_name, "-t", album_title];
var valid_args_no_flags = [artist_name, album_title];
var verbose_args = ["-a", artist_name, "-t", album_title, "-v"];
var review;
var search;

chai.use(require('chai-as-promised'))

describe("CLI (Command Line Tool)", function(){

  this.timeout(10000);

  before(function(done){
    search = new Pitchfork.Search(artist_name, album_title);
    search.promise.then(function(){
      search.results[0].promise.then(function(rev){
        review = rev;
        done();
      })
    })
  })

  describe("when searching for a valid artist and album without -a and -t flags", function(){

    xit("should return all attributes and pretty json by default", function(done){
      var proc = execFile(cli_filepath, valid_args_no_flags, function(err, stdout, stderr){
        expect(stdout).to.equal(prettyjson.render(review.attributes)+"\n")
        done();
      })
    })

    xit("should return all attributes and valid, ugly json with --json flag", function(done){
      var newArgs = valid_args_no_flags
      newArgs.push("--json")
      var proc = execFile(cli_filepath, newArgs , function(err, stdout, stderr){
        expect(stdout).to.equal(JSON.stringify(review.attributes)+"\n")
        done();
      })
    })

    xit("should return entire review object and valid json when -v flag is passed", function(done){
      var newArgs = valid_args_no_flags
      newArgs.push("-v --json")
      var proc = execFile(cli_filepath, newArgs, function(err, stdout, stderr){
        expect(stdout).to.equal(JSON.stringify(review.verbose())+"\n")
        done();
      })
    })

  })

  xdescribe("when searching for a valid artist and album", function(){
    
    it("should return all attributes and pretty json by default", function(done){
      var proc = execFile(cli_filepath, valid_args, function(err, stdout, stderr){        
        expect(stdout).to.equal(prettyjson.render(review.attributes)+"\n")
        done();
      })
    })

    it("should return all attributes and valid, ugly json with --json flag", function(done){
      var newArgs = valid_args
      newArgs.push("--json")
      var proc = execFile(cli_filepath, newArgs , function(err, stdout, stderr){
        expect(stdout).to.equal(JSON.stringify(review.attributes)+"\n")
        done();
      })
    })

    it("should return entire review object and valid json when -v flag is passed", function(done){
      var proc = execFile(cli_filepath, verbose_args, function(err, stdout, stderr){
        expect(stdout).to.equal(prettyjson.render(review.verbose())+"\n")
        done();
      })
    })

  })

  describe("and when searching for no artist and no album", function(){

    xit("should return usage when no flags are passed", function(done){
      var proc = execFile(cli_filepath, [], function(err, stdout, stderr){
        expect(stdout).to.equal("usage: pitchfork [-hjTvVp] [-tx, --text] -a ARTIST_NAME -t ALBUM_TITLE\n")
        done();
      })
    })

    it("should return the right version when -V flag is passed", function(done){
      var proc = execFile(cli_filepath, ["-V"], function(err, stdout, stderr){
        expect(stdout).to.equal(require("../package").version+"\n")
        done();
      })
    })

  })

  describe("and when searching for non-existant artist and albums", function(){

    it("should respond with a message", function(done){
      var message = "Your search returned no results!  Please try a differnt query.";
      var proc = execFile(cli_filepath, ["-a", "ffjfkdkdd"], function(err, stdout, stderr){
        expect(stdout).to.equal(message+"\n")
        done();
      })
    })

  })

  

})
