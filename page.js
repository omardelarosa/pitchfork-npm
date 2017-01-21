var p = require('./index')
var Review = require('./review')
var request = require('superagent')
var q = require('q')
var async = require('async')
var cheerio = require('cheerio')
var EventEmitter = require('events').EventEmitter;
var util = require('util')

// global constants
var VERSION = require('./package').version
  , USER_AGENT = 'omardelarosa/pitchfork-npm-v'+VERSION
  , BASE_URL = "http://pitchfork.com/reviews/albums/"
  , CONNECTION_ERR = new Error("Failed to connect to Pitchfork!");


/**
  * Fetches a single page of Album Reviews
  *
  */

function Page (number) {
  this.responseStatus = null;
  this.number = number;
  this.results = [];
  this.promise = this.init();

}

// extends EventEmitter
util.inherits(Page, EventEmitter);

Page.prototype.init = function(){
  var dfd = q.defer()
    , self = this

  request.get(BASE_URL + (this.number ? ('?page=' + this.number ) : ''))
    // .set('User-Agent', USER_AGENT)
    .end(function(res){
      self.responseStatus = res.statusCode
       if (self.responseStatus != 200) {
        self.emit('ready')
        return dfd.fulfill([])
      } else {
        var $ = cheerio.load(res.text);
        var links = $('.review .album-link')
        var artists = $('.review .album-artist .artist-list')
        var albums = $('.review .album-artist .title')
        var reviewQueries = [];

        var i = 0;
        while (i < links.length) {
          reviewQueries.push({
            url: links[i].attribs['href'],
            artist: $(artists[i]).text(),
            album: $(albums[i]).text(),
          })
          i++
        }

        var jobs = [];
        reviewQueries.forEach(function(query){

          jobs.push(function(done){
            var r = new Review({
              name: query.artist+" - "+query.album,
              url: query.url,
              page: true
            })

            r.promise.then(function(rev){
              self.results.push(rev)
              done(null, rev)
            })
          })

        })

        async.parallel(jobs, function(err, results){
          if (err) {
            self.emit("error");
            dfd.reject(err);
          }
          self.emit("ready")
          dfd.fulfill(results)
        })
      }
    })

  return dfd.promise;

};

module.exports = Page;
