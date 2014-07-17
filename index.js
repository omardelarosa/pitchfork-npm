var request = require('superagent')
  , q = require('q')
  , async = require('async')
  , origArgs = process.argv
  , _ = require('lodash')
  , Pitchfork = {
      Search: require('./search'),
      Review: require('./review')
    };

// global constants
var USAGE = "usage: pitchfork [-hTvV] [--text] -a ARTIST_NAME -t ALBUM_TITLE";
var VERSION = require("./package").version;

function parse_args(args){

  function has_flags(flags, opts){
    return _.some(flags, function(flag){ 
        return args.indexOf(flag) != -1
      });
  }

  var artistIdx = args.indexOf("-a");
  var titleIdx = args.indexOf("-t");

  if ( artistIdx != -1 ) {
    var artist = args[artistIdx+1]
  }
  if ( titleIdx != -1 ) {
    var album = args[artistIdx+1]
  }

  return {
    artist: artist,
    album: album,
    json: has_flags(["-j","--json"]),
    verbose: has_flags(["-v", "--verbose"]),
    version: has_flags(["-V", "--version"]),
    truncated: has_flags(["-T","--truncated"]),
    justText: has_flags(["-tx", "--text"])
  }
}

// variables;
var opts = parse_args(origArgs);
var artist = opts.artist || null;
var album = opts.album || null;
var json = opts.json || false;
var verbose = opts.verbose || false;
var version = opts.version || false;
var truncated = opts.truncated || false;
var justText = opts.justText;

// if there are args (i.e. running in commandline mode)

// if in "help mode"
if (origArgs.indexOf("-h") != -1 || origArgs.length == 4) {
  // display usage
  console.log(USAGE)

// if there's an artist and/or album
} else if (version) {
  console.log(VERSION)
} else if (artist || album) {
   search = new Pitchfork.Search(artist, album);
    search.promise.then(function(){
      // console.log(JSON.stringify(s.results[0]));
      var review = search.results[0];
      review.promise.then(function(){
        if (json || verbose) {
          console.log(JSON.stringify(review.verbose()));
        } else if (truncated) {
          console.log(JSON.stringify(review.truncated()));
        } else if (justText) {
          console.log(review.text_pretty_print());
        } else {
          console.log(JSON.stringify(review.attributes));
        }
      })
    })
}

module.exports = Pitchfork;
module.exports.USAGE = USAGE;
module.exports.VERSION = VERSION;