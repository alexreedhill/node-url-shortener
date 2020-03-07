var url = require('url');

module.exports = function (opts) {
  var self = {};

  self.opts = opts || {};
  self.opts.url = self.opts.url || process.env.HOST || 'http://127.0.0.1:3000';
  self.opts.port = self.opts.port || process.env.PORT || 3000;
  self.opts.redisUrl = self.opts.redisUrl || process.env.REDIS_URL || 'localhost';


  self.checkDate = function(begin, end){
    valid = true;

    if(+begin - +(new Date()) < 0){
      valid = false;
    }

    if((+end - +begin) < 0){
      valid = false
    };

    return valid;
  }

  self.checkUrl = function (s, domain) {
    var regexp = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
      , valid = true;

    // Url correct
    if (regexp.test(s) !== true) {
      valid = false;
    }

    // Url equal application url
    if (valid === true && domain === true) {
      if (url.parse(self.opts.url).hostname === url.parse(s).hostname) {
        valid = false
      }
    }

    return valid;
  };

  self.getModel = function (callback) {
    var RedisModel = require('./redis-model')
      , config = {
          url: self.opts.url
        };

    callback(null, new RedisModel(config));
  };

  self.shorten = function (long_url, startDate, endDate, cNew, callback) {
    if (this.checkUrl(long_url, true)) {
      this.getModel(function (err, model) {
        if (err) {
          callback(500);
        } else {
          dateObj = startDate ? {'start_date': new Date(startDate), 'end_date' : new Date(endDate)} : {}
          model.set(long_url, dateObj, cNew, callback);
        }
      });
    } else {
      callback(400);
    }
  };

  self.expand = function (short_url, callback, click) {
    if (this.checkUrl(short_url)) {
      short_url = short_url.split('/').pop();
    }

    if (short_url && /^[\w=]+$/.test(short_url)) {
      this.getModel(function (err, model) {
        if (err) {
          callback(500);
        } else {
          model.get(short_url, callback, click);
        }
      });
    } else {
      callback(400);
    }
  };

  return self;
};
