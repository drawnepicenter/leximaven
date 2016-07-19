'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var themes = require('../../themes');

var chalk = require('chalk');
var fs = require('fs');
var noon = require('noon');

var CFILE = process.env.HOME + '/.leximaven.noon';

exports.command = 'init';
exports.desc = 'Initialize config file';
exports.builder = {
  force: {
    alias: 'f',
    desc: 'Force overwriting configuration file',
    default: false,
    type: 'boolean'
  }
};
exports.handler = function (argv) {
  var obj = noon.load('default.config.noon');
  obj.dmuse.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
  obj.onelook.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
  obj.rbrain.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
  obj.wordnik.date.stamp = (0, _stringify2.default)(new Date()).replace(/"/mig, '');
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
    if (argv.f) {
      var _config = noon.load(CFILE);
      obj.dmuse.date.stamp = _config.dmuse.date.stamp;
      obj.onelook.date.stamp = _config.onelook.date.stamp;
      obj.rbrain.date.stamp = _config.rbrain.date.stamp;
      obj.wordnik.date.stamp = _config.wordnik.date.stamp;
      noon.save(CFILE, obj);
      console.log('Overwrote ' + chalk.white.bold(CFILE) + '.');
    } else {
      console.log('Using configuration at ' + chalk.white.bold(CFILE) + '.');
    }
  } else if (!fileExists) {
    noon.save(CFILE, obj);
    console.log('Created ' + chalk.white.bold(CFILE) + '.');
  }
  var config = noon.load(CFILE);
  var theme = themes.loadTheme(config.theme);
  if (argv.v) {
    themes.labelDown('Configuration', theme, null);
    console.log('Your current configuration is:');
    console.log(noon.stringify(config, {
      indent: 2,
      align: true,
      maxalign: 32,
      sort: true,
      colors: true
    }));
    console.log('');
  }
};
//# sourceMappingURL=data:application/json;base64,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QUFWLENBQWY7QUFDQSxNQUFNLFFBQVEsT0FBTyxTQUFQLENBQWlCLE9BQU8sS0FBeEIsQ0FBZDtBQUNBLE1BQUksS0FBSyxDQUFULEVBQVk7QUFDVixXQUFPLFNBQVAsQ0FBaUIsZUFBakIsRUFBa0MsS0FBbEMsRUFBeUMsSUFBekM7QUFDQSxZQUFRLEdBQVIsQ0FBWSxnQ0FBWjtBQUNBLFlBQVEsR0FBUixDQUFZLEtBQUssU0FBTCxDQUFlLE1BQWYsRUFBdUI7QUFDakMsY0FBUSxDQUR5QjtBQUVqQyxhQUFPLElBRjBCO0FBR2pDLGdCQUFVLEVBSHVCO0FBSWpDLFlBQU0sSUFKMkI7QUFLakMsY0FBUTtBQUx5QixLQUF2QixDQUFaO0FBT0EsWUFBUSxHQUFSLENBQVksRUFBWjtBQUNEO0FBQ0YsQ0E3Q0QiLCJmaWxlIjoiY21kcy9jb25maWdfY21kcy9pbml0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgdGhlbWVzID0gcmVxdWlyZSgnLi4vLi4vdGhlbWVzJylcblxuY29uc3QgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG5jb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbmNvbnN0IG5vb24gPSByZXF1aXJlKCdub29uJylcblxuY29uc3QgQ0ZJTEUgPSBgJHtwcm9jZXNzLmVudi5IT01FfS8ubGV4aW1hdmVuLm5vb25gXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdpbml0J1xuZXhwb3J0cy5kZXNjID0gJ0luaXRpYWxpemUgY29uZmlnIGZpbGUnXG5leHBvcnRzLmJ1aWxkZXIgPSB7XG4gIGZvcmNlOiB7XG4gICAgYWxpYXM6ICdmJyxcbiAgICBkZXNjOiAnRm9yY2Ugb3ZlcndyaXRpbmcgY29uZmlndXJhdGlvbiBmaWxlJyxcbiAgICBkZWZhdWx0OiBmYWxzZSxcbiAgICB0eXBlOiAnYm9vbGVhbicsXG4gIH0sXG59XG5leHBvcnRzLmhhbmRsZXIgPSAoYXJndikgPT4ge1xuICBjb25zdCBvYmogPSBub29uLmxvYWQoJ2RlZmF1bHQuY29uZmlnLm5vb24nKVxuICBvYmouZG11c2UuZGF0ZS5zdGFtcCA9IEpTT04uc3RyaW5naWZ5KG5ldyBEYXRlKCkpLnJlcGxhY2UoL1wiL21pZywgJycpXG4gIG9iai5vbmVsb29rLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICBvYmoucmJyYWluLmRhdGUuc3RhbXAgPSBKU09OLnN0cmluZ2lmeShuZXcgRGF0ZSgpKS5yZXBsYWNlKC9cIi9taWcsICcnKVxuICBvYmoud29yZG5pay5kYXRlLnN0YW1wID0gSlNPTi5zdHJpbmdpZnkobmV3IERhdGUoKSkucmVwbGFjZSgvXCIvbWlnLCAnJylcbiAgbGV0IGZpbGVFeGlzdHMgPSBudWxsXG4gIHRyeSB7XG4gICAgZnMuc3RhdFN5bmMoQ0ZJTEUpXG4gICAgZmlsZUV4aXN0cyA9IHRydWVcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChlLmNvZGUgPT09ICdFTk9FTlQnKSB7XG4gICAgICBmaWxlRXhpc3RzID0gZmFsc2VcbiAgICB9XG4gIH1cbiAgaWYgKGZpbGVFeGlzdHMpIHtcbiAgICBpZiAoYXJndi5mKSB7XG4gICAgICBjb25zdCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gICAgICBvYmouZG11c2UuZGF0ZS5zdGFtcCA9IGNvbmZpZy5kbXVzZS5kYXRlLnN0YW1wXG4gICAgICBvYmoub25lbG9vay5kYXRlLnN0YW1wID0gY29uZmlnLm9uZWxvb2suZGF0ZS5zdGFtcFxuICAgICAgb2JqLnJicmFpbi5kYXRlLnN0YW1wID0gY29uZmlnLnJicmFpbi5kYXRlLnN0YW1wXG4gICAgICBvYmoud29yZG5pay5kYXRlLnN0YW1wID0gY29uZmlnLndvcmRuaWsuZGF0ZS5zdGFtcFxuICAgICAgbm9vbi5zYXZlKENGSUxFLCBvYmopXG4gICAgICBjb25zb2xlLmxvZyhgT3Zlcndyb3RlICR7Y2hhbGsud2hpdGUuYm9sZChDRklMRSl9LmApXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKGBVc2luZyBjb25maWd1cmF0aW9uIGF0ICR7Y2hhbGsud2hpdGUuYm9sZChDRklMRSl9LmApXG4gICAgfVxuICB9IGVsc2UgaWYgKCFmaWxlRXhpc3RzKSB7XG4gICAgbm9vbi5zYXZlKENGSUxFLCBvYmopXG4gICAgY29uc29sZS5sb2coYENyZWF0ZWQgJHtjaGFsay53aGl0ZS5ib2xkKENGSUxFKX0uYClcbiAgfVxuICBjb25zdCBjb25maWcgPSBub29uLmxvYWQoQ0ZJTEUpXG4gIGNvbnN0IHRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShjb25maWcudGhlbWUpXG4gIGlmIChhcmd2LnYpIHtcbiAgICB0aGVtZXMubGFiZWxEb3duKCdDb25maWd1cmF0aW9uJywgdGhlbWUsIG51bGwpXG4gICAgY29uc29sZS5sb2coJ1lvdXIgY3VycmVudCBjb25maWd1cmF0aW9uIGlzOicpXG4gICAgY29uc29sZS5sb2cobm9vbi5zdHJpbmdpZnkoY29uZmlnLCB7XG4gICAgICBpbmRlbnQ6IDIsXG4gICAgICBhbGlnbjogdHJ1ZSxcbiAgICAgIG1heGFsaWduOiAzMixcbiAgICAgIHNvcnQ6IHRydWUsXG4gICAgICBjb2xvcnM6IHRydWUsXG4gICAgfSkpXG4gICAgY29uc29sZS5sb2coJycpXG4gIH1cbn1cbiJdfQ==