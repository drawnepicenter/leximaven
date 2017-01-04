'use strict';

/* eslint max-len: 0 */
var themes = require('../src/themes');
var tools = require('../src/tools');

var _ = require('lodash');
var chalk = require('chalk');
var child = require('child_process');
var expect = require('chai').expect;
var fs = require('fs-extra');
var noon = require('noon');
var sinon = require('sinon');
var version = require('../package.json').version;
var xml2js = require('xml2js');

var CFILE = process.env.HOME + '/.leximaven.noon';
var TFILE = process.cwd() + '/test/test.config.noon';
var spy = sinon.spy(console, 'log');

describe('tools', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    fs.copySync(CFILE, 'test/output/saved.config.noon');
    done();
  });
  beforeEach(function (done) {
    spy.reset();
    done();
  });
  after(function (done) {
    fs.copySync('test/output/saved.config.noon', CFILE);
    fs.removeSync('test/output');
    done();
  });
  describe('check boolean', function () {
    it('coerces true', function (done) {
      expect(tools.checkBoolean('true')).to.be.true;
      done();
    });
    it('coerces false', function (done) {
      expect(tools.checkBoolean('false')).to.be.false;
      done();
    });
  });
  describe('check outfile', function () {
    it('json exists', function (done) {
      var obj = { foo: 'bar' };
      var obj2 = { bar: 'foo' };
      tools.outFile('test/output/test.json', false, obj);
      expect(spy.calledWith(tools.outFile('test/output/test.json', false, obj2))).to.match(/[a-z\/,\-\. ]*/mig);
      var actual = fs.readJsonSync('test/output/test.json');
      expect(actual).to.deep.equal(obj);
      fs.removeSync('test/output/test.json');
      done();
    });
    it("json doesn't exist", function (done) {
      var obj = { foo: 'bar' };
      expect(spy.calledWith(tools.outFile('test/output/test.json', false, obj))).to.match(/[a-z\/,\-\. ]*/mig);
      fs.removeSync('test/output/test.json');
      done();
    });
    it('xml exists', function (done) {
      var obj = { foo: 'bar' };
      tools.outFile('test/output/test.xml', false, obj);
      tools.outFile('test/output/test.xml', false, obj);
      done();
    });
    it('enforces supported formats', function (done) {
      var obj = { foo: 'bar' };
      try {
        tools.outFile('test/output/test.foo', false, obj);
      } catch (error) {
        console.log(error);
        done();
      }
    });
  });
  describe('check config', function () {
    it('config exists', function (done) {
      fs.copySync('test/output/saved.config.noon', CFILE);
      expect(tools.checkConfig(CFILE)).to.be.true;
      done();
    });
    it("config doesn't exist", function (done) {
      fs.removeSync(CFILE);
      try {
        tools.checkConfig(CFILE);
      } catch (error) {
        console.log(error);
        done();
      }
    });
  });
  describe('array to string', function () {
    var array = ['enclosed string'];
    var string = 'normal string';
    it('extracts string from array', function (done) {
      expect(tools.arrToStr(array)).to.equals('enclosed string');
      done();
    });
    it('returns string when not enclosed', function (done) {
      expect(tools.arrToStr(string)).to.equals('normal string');
      done();
    });
  });
  describe('rate-limiting', function () {
    it('resets datamuse limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.dmuse.date.stamp = new Date().toJSON().replace(/2016/, '2015');
      config.dmuse.date.remain = 99998;
      var checkStamp = tools.limitDmuse(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.dmuse.date.remain).to.match(/\d+/mig);
      expect(c.dmuse.date.stamp).to.match(/201\d[\-\d]*T[0-9:\.\-Z]*/mig);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('decrements datamuse limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.dmuse.date.stamp = new Date().toJSON();
      config.dmuse.date.remain = 100000;
      var checkStamp = tools.limitDmuse(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.dmuse.date.remain).to.equals(99999);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('reaches datamuse limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.dmuse.date.stamp = new Date().toJSON();
      config.dmuse.date.remain = 0;
      var checkStamp = tools.limitDmuse(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.dmuse.date.remain).to.equals(0);
      expect(proceed).to.equals(false);
      expect(reset).to.equals(false);
      done();
    });
    it('resets onelook limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.onelook.date.stamp = new Date().toJSON().replace(/2016/, '2015');
      config.onelook.date.remain = 9998;
      var checkStamp = tools.limitOnelook(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.onelook.date.remain).to.match(/\d+/mig);
      expect(c.onelook.date.stamp).to.match(/201\d[\-\d]*T[0-9:\.\-Z]*/mig);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('decrements onelook limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.onelook.date.stamp = new Date().toJSON();
      config.onelook.date.remain = 10000;
      var checkStamp = tools.limitOnelook(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.onelook.date.remain).to.equals(9999);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('reaches onelook limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.onelook.date.stamp = new Date().toJSON();
      config.onelook.date.remain = 0;
      var checkStamp = tools.limitOnelook(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.onelook.date.remain).to.equals(0);
      expect(proceed).to.equals(false);
      expect(reset).to.equals(false);
      done();
    });
    it('resets rhymebrain limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.rbrain.date.stamp = new Date().toJSON().replace(/2017/, '2016');
      config.rbrain.date.remain = 348;
      var checkStamp = tools.limitRbrain(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.rbrain.date.remain).to.match(/\d+/mig);
      expect(c.rbrain.date.stamp).to.match(/201\d[\-\d]*T[0-9:\.\-Z]*/mig);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(true);
      done();
    });
    it('decrements rhymebrain limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.rbrain.date.stamp = new Date().toJSON();
      config.rbrain.date.remain = 350;
      var checkStamp = tools.limitRbrain(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.rbrain.date.remain).to.equals(349);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('reaches rhymebrain limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.rbrain.date.stamp = new Date().toJSON();
      config.rbrain.date.remain = 0;
      var checkStamp = tools.limitRbrain(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.rbrain.date.remain).to.equals(0);
      expect(proceed).to.equals(false);
      expect(reset).to.equals(false);
      done();
    });
    it('resets wordnik limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.wordnik.date.stamp = new Date().toJSON().replace(/2016/, '2015');
      config.wordnik.date.remain = 14998;
      var checkStamp = tools.limitWordnik(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.wordnik.date.remain).to.match(/\d+/mig);
      expect(c.wordnik.date.stamp).to.match(/201\d[\-\d]*T[0-9:\.\-Z]*/mig);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('decrements wordnik limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.wordnik.date.stamp = new Date().toJSON();
      config.wordnik.date.remain = 15000;
      var checkStamp = tools.limitWordnik(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.wordnik.date.remain).to.equals(14999);
      expect(proceed).to.equals(true);
      expect(reset).to.equals(false);
      done();
    });
    it('reaches wordnik limit', function (done) {
      fs.copySync('test/test.config.noon', CFILE);
      var config = noon.load(CFILE);
      config.wordnik.date.stamp = new Date().toJSON();
      config.wordnik.date.remain = 0;
      var checkStamp = tools.limitWordnik(config);
      var c = checkStamp[0];
      var proceed = checkStamp[1];
      var reset = checkStamp[2];
      expect(c.wordnik.date.remain).to.equals(0);
      expect(proceed).to.equals(false);
      expect(reset).to.equals(false);
      done();
    });
  });
});

describe('themes', function () {
  beforeEach(function () {
    spy.reset();
  });
  after(function () {
    return spy.restore();
  });
  describe('get themes', function () {
    it('returns an array of theme names', function (done) {
      var list = themes.getThemes().sort();
      var obj = ['colonel', 'markup', 'square'];
      expect(list).to.deep.equal(obj);
      done();
    });
  });
  describe('load theme', function () {
    it('returns a theme', function (done) {
      var theme = themes.loadTheme('square');
      var obj = {
        prefix: {
          str: '[',
          style: 'bold.green'
        },
        text: {
          style: 'bold.white'
        },
        content: {
          style: 'white'
        },
        suffix: {
          str: ']',
          style: 'bold.green'
        },
        connector: {
          str: '→',
          style: 'bold.cyan'
        }
      };
      expect(theme).to.deep.equal(obj);
      done();
    });
  });
  describe('labels', function () {
    var theme = themes.loadTheme('square');
    var text = 'label';
    it('labels right', function (done) {
      var content = 'right';
      expect(spy.calledWith(themes.label(theme, 'right', text, content))).to.be.true;
      done();
    });
    it('labels down', function (done) {
      var content = 'down';
      expect(spy.calledWith(themes.label(theme, 'down', text, content))).to.be.true;
      done();
    });
    it('labels without content', function (done) {
      expect(spy.calledWith(themes.label(theme, 'right', text))).to.be.true;
      done();
    });
    it('enforces right or down', function (done) {
      try {
        themes.label(theme, 'err', 'label');
      } catch (error) {
        console.log(error);
        done();
      }
    });
  });
});

describe('config commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    fs.copySync(CFILE, 'test/output/saved.config.noon');
    done();
  });
  after(function (done) {
    fs.copySync('test/output/saved.config.noon', CFILE);
    fs.removeSync('test/output');
    done();
  });
  describe('get', function () {
    it('shows value of option onelook.links', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js config get onelook.links > test/output/config-get.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-get.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Option onelook.links is (true|false)\./mig);
        done(err);
      });
    });
  });
  describe('init', function () {
    before(function (done) {
      fs.removeSync(CFILE);
      done();
    });
    it('creates the config file', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js config init > test/output/config-init.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-init.out', 'utf8');
        var config = noon.load(CFILE);
        var obj = {
          anagram: {
            case: 1,
            lang: 'english',
            limit: 10,
            linenum: false,
            list: false,
            maxletter: 50,
            maxword: 10,
            minletter: 1,
            repeat: false
          },
          dmuse: {
            date: {
              interval: 'day',
              limit: 100000,
              remain: 100000,
              stamp: ''
            },
            max: 5
          },
          merge: true,
          onelook: {
            date: {
              interval: 'day',
              limit: 10000,
              remain: 10000,
              stamp: ''
            },
            links: false
          },
          rbrain: {
            combine: {
              lang: 'en',
              max: 5
            },
            date: {
              interval: 'hour',
              limit: 350,
              remain: 350,
              stamp: ''
            },
            info: {
              lang: 'en'
            },
            rhyme: {
              lang: 'en',
              max: 50
            }
          },
          theme: 'square',
          urban: {
            limit: 5
          },
          usage: true,
          verbose: false,
          wordmap: {
            limit: 1
          },
          wordnik: {
            date: {
              interval: 'hour',
              limit: 15000,
              remain: 15000,
              stamp: ''
            },
            define: {
              canon: false,
              defdict: 'all',
              limit: 5,
              part: ''
            },
            example: {
              canon: false,
              limit: 5,
              skip: 0
            },
            hyphen: {
              canon: false,
              dict: 'all',
              limit: 5
            },
            origin: {
              canon: false
            },
            phrase: {
              canon: false,
              limit: 5,
              weight: 13
            },
            pronounce: {
              canon: false,
              dict: '',
              limit: 5,
              type: ''
            },
            relate: {
              canon: false,
              limit: 10,
              type: ''
            }
          }
        };
        config.dmuse.date.stamp = '';
        config.dmuse.date.remain = 100000;
        config.onelook.date.stamp = '';
        config.onelook.date.remain = 10000;
        config.rbrain.date.stamp = '';
        config.rbrain.date.remain = 350;
        config.wordnik.date.stamp = '';
        config.wordnik.date.remain = 15000;
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Created [a-z\/\.]*/mig);
        expect(config).to.deep.equal(obj);
        done(err);
      });
    });
    it('force overwrites existing and prints config', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js config init -f -v > test/output/config-init.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-init.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \/\.\[\]:\-\s|]*/mig);
        done(err);
      });
    });
  });
  describe('set', function () {
    it('sets value of option onelook.links to false', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js config set onelook.links false > test/output/config-set.out', function (err) {
        var stdout = fs.readFileSync('test/output/config-set.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Set option onelook.links to (true|false)\./mig);
        done(err);
      });
    });
  });
});

describe('dmuse commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = new Date().toJSON();
    obj.onelook.date.stamp = new Date().toJSON();
    obj.rbrain.date.stamp = new Date().toJSON();
    obj.wordnik.date.stamp = new Date().toJSON();
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('get', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js dmuse get -s -o ' + process.cwd() + '/test/output/dmuse.json ml=ubiquity > test/output/dmuse-get.out', function (err) {
        var stdout = fs.readFileSync('test/output/dmuse-get.out', 'utf8');
        var obj = {
          type: 'datamuse',
          source: 'http://datamuse.com/api',
          url: 'http://api.datamuse.com/words?max=5&&ml=ubiquity&dmuse&get',
          match0: 'ubiquitousness',
          tags1: 'noun',
          match1: 'omnipresence',
          match2: 'pervasiveness',
          tags0: 'noun',
          match3: 'prevalence'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/dmuse.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→\s,]*\/dmuse.json./mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('info', function () {
    it('shows metrics', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js dmuse info > test/output/dmuse-info.out', function (err) {
        var stdout = fs.readFileSync('test/output/dmuse-info.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\d+\/\d+[a-z0-9 ,\.\s\(\):\/%]*/);
        done(err);
      });
    });
  });
});

describe('rbrain commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = new Date().toJSON();
    obj.onelook.date.stamp = new Date().toJSON();
    obj.rbrain.date.stamp = new Date().toJSON();
    obj.wordnik.date.stamp = new Date().toJSON();
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('combine', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js rbrain combine -s -m1 -o ' + process.cwd() + '/test/output/combine.json value > test/output/combine.out', function (err) {
        var stdout = fs.readFileSync('test/output/combine.out', 'utf8');
        var obj = {
          type: 'portmanteau',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getPortmanteaus&word=value&lang=en&maxResults=1&',
          set0: 'value,unique',
          portmanteau0: 'valunique'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/combine.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9,→ -\/\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('info', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js rbrain info -s -o ' + process.cwd() + '/test/output/info.json fuck > test/output/info.out', function (err) {
        var stdout = fs.readFileSync('test/output/info.out', 'utf8');
        var obj = {
          type: 'word info',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getWordInfo&word=fuck&lang=en',
          arpabet: 'F AH1 K',
          ipa: 'ˈfʌk',
          syllables: '1',
          offensive: true,
          dict: true,
          trusted: true
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/info.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[\[\]a-z0-9 -→ˈʌ\/\.,]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('rhyme', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js rbrain rhyme -s -m1 -o ' + process.cwd() + '/test/output/rhyme.json too > test/output/rhyme.out', function (err) {
        var stdout = fs.readFileSync('test/output/rhyme.out', 'utf8');
        var obj = {
          type: 'rhyme',
          source: 'http://rhymebrain.com',
          url: 'http://rhymebrain.com/talk?function=getRhymes&word=too&lang=en&maxResults=1&',
          rhyme0: 'to'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/rhyme.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Rhymes\]→[a-z*, ]*\sWrote data to [a-z\/\.]*\s\d*\/\d*[a-z0-9 ,\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
});

describe('wordnik commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = new Date().toJSON();
    obj.onelook.date.stamp = new Date().toJSON();
    obj.rbrain.date.stamp = new Date().toJSON();
    obj.wordnik.date.stamp = new Date().toJSON();
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
    }
    noon.save(CFILE, obj);
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('define', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js wordnik define -s -l1 -o ' + process.cwd() + '/test/output/define.json ubiquity > test/output/define.out', function (err) {
        var stdout = fs.readFileSync('test/output/define.out', 'utf8');
        var obj = {
          type: 'definition',
          source: 'http://www.wordnik.com',
          text0: 'Existence or apparent existence everywhere at the same time; omnipresence: "the repetitiveness, the selfsameness, and the ubiquity of modern mass culture”  ( Theodor Adorno ). ',
          deftype0: 'noun',
          source0: 'ahd-legacy'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/define.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]→ ;:",\-\(\)\.\/”]*Wrote data to [a-z\/\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('example', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js wordnik example -s -l1 -o ' + process.cwd() + '/test/output/example.json ubiquity > test/output/example.out', function (err) {
        var stdout = fs.readFileSync('test/output/example.out', 'utf8');
        var obj = {
          type: 'example',
          source: 'http://www.wordnik.com',
          example0: 'Both are characterized by their ubiquity and their antiquity: No known human culture lacks them, and musical instruments are among the oldest human artifacts, dating to the Late Pleistocene about 50,000 years ago.'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/example.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\] →:,\.]*\sWrote data to [a-z\/\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('hyphen', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js wordnik hyphen -s -o ' + process.cwd() + '/test/output/hyphen.json ubiquity > test/output/hyphen.out', function (err) {
        var stdout = fs.readFileSync('test/output/hyphen.out', 'utf8');
        var obj = {
          type: 'hyphenation',
          source: 'http://www.wordnik.com',
          syllable0: 'u',
          stress1: 'biq',
          syllable2: 'ui',
          syllable3: 'ty'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/hyphen.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/\[Hyphenation\]→[a-z\-]*\sWrote data to [a-z\/\.]*\s\d*\/\d*[a-z0-9 ,\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('origin', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js wordnik origin -s -o ' + process.cwd() + '/test/output/origin.json ubiquity > test/output/origin.out', function (err) {
        var stdout = fs.readFileSync('test/output/origin.out', 'utf8');
        var obj = {
          type: 'etymology',
          source: 'http://www.wordnik.com',
          etymology: '[L.  everywhere, fr.  where, perhaps for ,  (cf.  anywhere), and if so akin to E. : cf. F. .]',
          origin: 'ubique, ubi, cubi, quobi, alicubi, who, ubiquit√©'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/origin.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\]→\.,\(\):√©]*Wrote data to [a-z\/\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('phrase', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js wordnik phrase -s -l1 -o ' + process.cwd() + '/test/output/phrase.json ubiquitous > test/output/phrase.out', function (err) {
        var stdout = fs.readFileSync('test/output/phrase.out', 'utf8');
        var obj = {
          type: 'phrase',
          source: 'http://www.wordnik.com',
          agram0: 'ubiquitous',
          bgram0: 'amoeba'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/phrase.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z\[\]\-\s]*Wrote data to [a-z\/\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('pronounce', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js wordnik pronounce -s -o ' + process.cwd() + '/test/output/pronounce.json ubiquity > test/output/pronounce.out', function (err) {
        var stdout = fs.readFileSync('test/output/pronounce.out', 'utf8');
        var obj = {
          type: 'pronunciation',
          source: 'http://www.wordnik.com',
          word: 'ubiquity',
          pronunciation0: '(yo͞o-bĭkˈwĭ-tē)',
          type0: 'ahd-legacy',
          pronunciation1: 'Y UW0 B IH1 K W IH0 T IY0',
          type1: 'arpabet'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/pronounce.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]\(\) \-→ĭēˈ\so͞]*\sWrote data to [a-z\/\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('relate', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js wordnik relate -s -l1 -o ' + process.cwd() + '/test/output/relate.json ubiquity > test/output/relate.out', function (err) {
        var stdout = fs.readFileSync('test/output/relate.out', 'utf8');
        var obj = {
          type: 'related words',
          source: 'http://www.wordnik.com',
          word: 'ubiquity',
          type0: 'antonym',
          words0: 'uniquity',
          type1: 'hypernym',
          words1: 'presence',
          type2: 'cross-reference',
          words2: 'ubiquity of the king',
          type3: 'synonym',
          words3: 'omnipresence',
          type4: 'rhyme',
          words4: 'iniquity',
          type5: 'same-context',
          words5: 'omnipresence'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/relate.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z \[\],\-→]*\sWrote data to [a-z\/\.]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
});

describe('root commands', function () {
  before(function (done) {
    fs.mkdirpSync('test/output');
    var obj = noon.load(TFILE);
    obj.dmuse.date.stamp = new Date().toJSON();
    obj.onelook.date.stamp = new Date().toJSON();
    obj.rbrain.date.stamp = new Date().toJSON();
    obj.wordnik.date.stamp = new Date().toJSON();
    var fileExists = null;
    try {
      fs.statSync(CFILE);
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      var config = noon.load(CFILE);
      obj.dmuse.date.stamp = config.dmuse.date.stamp;
      obj.dmuse.date.remain = config.dmuse.date.remain;
      obj.onelook.date.stamp = config.onelook.date.stamp;
      obj.onelook.date.remain = config.onelook.date.remain;
      obj.rbrain.date.stamp = config.rbrain.date.stamp;
      obj.rbrain.date.remain = config.rbrain.date.remain;
      obj.wordnik.date.stamp = config.wordnik.date.stamp;
      obj.wordnik.date.remain = config.wordnik.date.remain;
      fs.copySync(CFILE, 'test/output/saved.config.noon');
      noon.save(CFILE, obj);
    } else {
      noon.save(CFILE, obj);
    }
    done();
  });
  after(function (done) {
    var fileExists = null;
    try {
      fs.statSync('test/output/saved.config.noon');
      fileExists = true;
    } catch (e) {
      if (e.code === 'ENOENT') {
        fileExists = false;
      }
    }
    if (fileExists) {
      fs.removeSync(CFILE);
      fs.copySync('test/output/saved.config.noon', CFILE);
    } else {
      fs.removeSync(CFILE);
    }
    fs.removeSync('test/output');
    done();
  });
  describe('acronym', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js acronym -o ' + process.cwd() + '/test/output/acronym.json DDC > test/output/acronym.out', function (err) {
        var stdout = fs.readFileSync('test/output/acronym.out', 'utf8');
        var json = fs.readJsonSync(process.cwd() + '/test/output/acronym.json');
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Found \d* acronyms for [a-z]*:\s[a-z0-9\s-:\/\.|(|)]*Wrote data to [a-z\/]*.json./mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
    it('forces writing json', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js acronym -f -o ' + process.cwd() + '/test/output/acronym.json DDC > test/output/acronym.out', function (err) {
        var stdout = fs.readFileSync('test/output/acronym.out', 'utf8');
        var json = fs.readJsonSync(process.cwd() + '/test/output/acronym.json');
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Found \d* acronyms for [a-z]*:\s[a-z0-9\s-:\/\.|(|)]*Overwrote [a-z\/\.]* with data./mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
    it('writes xml', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js acronym -o ' + process.cwd() + '/test/output/acronym.xml DDC', function (err) {
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        var xml = fs.readFileSync(process.cwd() + '/test/output/acronym.xml', 'utf8');
        var parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
          var fixed = result.root;
          fixed.type = fixed.type[0];
          fixed.source = fixed.source[0];
          fixed.url = fixed.url[0];
          fixed.expansion0 = fixed.expansion0[0];
          fixed.expansion1 = fixed.expansion1[0];
          fixed.expansion2 = fixed.expansion2[0];
          fixed.expansion3 = fixed.expansion3[0];
          fixed.expansion4 = fixed.expansion4[0];
          fixed.url0 = fixed.url0[0];
          fixed.comment0 = fixed.comment0[0];
          fixed.comment4 = fixed.comment4[0];
          fixed.DDC0 = fixed.DDC0[0];
          fixed.DDC1 = fixed.DDC1[0];
          fixed.DDC2 = fixed.DDC2[0];
          fixed.DDC3 = fixed.DDC3[0];
          fixed.DDC4 = fixed.DDC4[0];
          expect(fixed).to.deep.equal(obj);
          done(err);
        });
      });
    });
    it('forces writing xml', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js acronym -f -o ' + process.cwd() + '/test/output/acronym.xml DDC', function (err) {
        var obj = {
          type: 'acronym',
          source: 'http://acronyms.silmaril.ie',
          url: 'http://acronyms.silmaril.ie/cgi-bin/xaa?DDC',
          expansion0: 'Dewey Decimal Classification',
          comment0: 'library and knowledge classification system',
          url0: 'http://www.oclc.org/dewey/',
          DDC0: '040',
          expansion1: 'Digital Data Converter',
          DDC1: '040',
          expansion2: 'Digital Down Converter',
          DDC2: '000',
          expansion3: 'Direct Department Calling',
          DDC3: '040',
          expansion4: 'Dodge City Municipal airport (code)',
          comment4: 'United States',
          DDC4: '387'
        };
        var xml = fs.readFileSync(process.cwd() + '/test/output/acronym.xml', 'utf8');
        var parser = new xml2js.Parser();
        parser.parseString(xml, function (err, result) {
          var fixed = result.root;
          fixed.type = fixed.type[0];
          fixed.source = fixed.source[0];
          fixed.url = fixed.url[0];
          fixed.expansion0 = fixed.expansion0[0];
          fixed.expansion1 = fixed.expansion1[0];
          fixed.expansion2 = fixed.expansion2[0];
          fixed.expansion3 = fixed.expansion3[0];
          fixed.expansion4 = fixed.expansion4[0];
          fixed.url0 = fixed.url0[0];
          fixed.comment0 = fixed.comment0[0];
          fixed.comment4 = fixed.comment4[0];
          fixed.DDC0 = fixed.DDC0[0];
          fixed.DDC1 = fixed.DDC1[0];
          fixed.DDC2 = fixed.DDC2[0];
          fixed.DDC3 = fixed.DDC3[0];
          fixed.DDC4 = fixed.DDC4[0];
          expect(fixed).to.deep.equal(obj);
          done(err);
        });
      });
    });
  });
  describe('anagram', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js anagram -s -o ' + process.cwd() + '/test/output/anagram.json ubiquity > test/output/anagram.out', function (err) {
        var stdout = fs.readFileSync('test/output/anagram.out', 'utf8');
        var json = fs.readJsonSync(process.cwd() + '/test/output/anagram.json');
        var obj = {
          type: 'anagram',
          source: 'http://wordsmith.org/',
          url: 'http://wordsmith.org/anagram/anagram.cgi?anagram=ubiquity&language=english&t=10&d=10&include=&exclude=&n=1&m=50&a=n&l=n&q=n&k=1&src=adv',
          found: '2',
          show: 'all',
          alist: ['Ubiquity', 'Buy I Quit']
        };
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[Anagrams\]\sAnagrams for: [a-z]*\s\d* found. Displaying all:\s[a-z\/\.\s]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
    it('handles too long input', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js anagram johnjacobjingleheimerschmidtthatsmynametoo > test/output/anagram.out', function (err) {
        var stdout = fs.readFileSync('test/output/anagram.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/Input[a-z0-9 \(\)\.']*\s[a-z \.]*/mig);
        done(err);
      });
    });
    it('handles no found anagrams', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js anagram bcdfghjklmnp > test/output/anagram.out', function (err) {
        var stdout = fs.readFileSync('test/output/anagram.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/No anagrams found\./mig);
        done(err);
      });
    });
  });
  describe('comp', function () {
    it('outputs shell completion script', function (done) {
      child.exec('node ' + __dirname + '/../bin/leximaven.js comp > test/output/comp.out', function (err) {
        var stdout = fs.readFileSync('test/output/comp.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[#\-a-z0-9\.\s:\/>~_\(\)\{\}\[\]="$@,;]*/mig);
        done(err);
      });
    });
  });
  describe('help', function () {
    it('shows usage', function (done) {
      child.exec('node ' + __dirname + '/../bin/leximaven.js --help > test/output/help.out', function (err) {
        var stdout = fs.readFileSync('test/output/help.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[_ \/\(\)\-\\'`|,\s]*\s*Usage:\s[a-z \/\.<>\[\]]*\s*Commands:\s[ a-z<>\s]*:\s[ \-a-z,\[\]\s]*\[boolean\]\s*/mig);
        done(err);
      });
    });
  });
  describe('ls', function () {
    it('demonstrates installed themes', function (done) {
      child.exec('node ' + __dirname + '/../bin/leximaven.js ls > test/output/ls.out', function (err) {
        var stdout = fs.readFileSync('test/output/ls.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z :|,.<>\-\[\]→]*/mig);
        done(err);
      });
    });
  });
  describe('map', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js map -s ubiquity > test/output/map.out', function (err) {
        var stdout = fs.readFileSync('test/output/map.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\],→ ;:'\?"\(\)-…\/\.√©ĭēˈɪ”]*/mig);
        done(err);
      });
    });
  });
  describe('onelook', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js onelook -s -o ' + process.cwd() + '/test/output/onelook.json ubiquity > test/output/onelook.out', function (err) {
        var stdout = fs.readFileSync('test/output/onelook.out', 'utf8');
        var obj = {
          type: 'onelook',
          source: 'http://www.onelook.com',
          url: 'http://onelook.com/?xml=1&w=ubiquity',
          definition: 'noun: the state of being everywhere at once (or seeming to be everywhere at once)',
          phrase: 'ubiquity records',
          sim: 'omnipresence,ubiquitousness'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/onelook.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]:\(\)→ \/\.,]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
    it('provides resource links', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js onelook -l ubiquity > test/output/onelook.out', function (err) {
        var stdout = fs.readFileSync('test/output/onelook.out', 'utf8');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9\[\]:\(\)→ \/\.,]*\s\[Resources\]\s[a-z0-9 \s\[\]→:\/\._#\?=\-',&%\(\)\+]*/mig);
        done(err);
      });
    });
  });
  describe('urban', function () {
    it('shows output', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js urban -s -l1 -o ' + process.cwd() + '/test/output/urban.json flip the bird > test/output/urban.out', function (err) {
        var stdout = fs.readFileSync('test/output/urban.out', 'utf8');
        var obj = {
          type: 'urban',
          source: 'http://www.urbandictionary.com',
          url: 'http://api.urbandictionary.com/v0/define?term=flip+the+bird',
          definition0: '1. The act of rotating an avian creature through more than 90 degrees.\r\n\r\n2. The act of extending the central digit of the hand with the intent to cause offense.'
        };
        var json = fs.readJsonSync(process.cwd() + '/test/output/urban.json');
        expect(stdout.replace(/(\r\n|\n|\r)\s?/gm, '\n')).to.match(/[a-z0-9 \[\]→\.\/\s]*/mig);
        expect(json).to.deep.equal(obj);
        done(err);
      });
    });
  });
  describe('version', function () {
    it('prints the version number', function (done) {
      child.exec('node ' + process.cwd() + '/bin/leximaven.js --version', function (err, stdout) {
        expect(stdout).to.contain(version);
        done(err);
      });
    });
  });
});
