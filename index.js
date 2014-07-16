var request = require('superagent');
var q = require('q');

var origArgs = process.argv;

// for module exports
var Pitchfork = {
  Search: require('./search'),
  Review: require('./review')
};

function parse_args(args){
  var artistFlagIdx = args.indexOf("-a")
  var albumTitleIdx = args.indexOf("-t")
  if ( artistFlagIdx != -1 ) {
    var artist = args[artistFlagIdx+1]
  }
  if ( albumTitleIdx != -1 ) {
    var album = args[albumTitleIdx+1]
  }
  return {
    artist: artist,
    album: album
  }
}

var parsedArgs = parse_args(origArgs);

var artist = parsedArgs.artist;
var album = parsedArgs.album;

// if there are args (i.e. running in commandline mode)
if (artist && album) {
  s = new Pitchfork.Search(artist, album);
  s.promise.then(function(){
    // console.log(JSON.stringify(s.results[0]));
    var rev = s.results[0];
    rev.promise.then(function(){
      console.log(JSON.stringify(rev.attributes))
    })
  })
}

module.exports = Pitchfork;