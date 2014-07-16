var request = require('superagent');
var q = require('q');

var Pitchfork = {
  Search: require('./search'),
  Review: require('./review')
};

module.exports = Pitchfork;