'use strict';

/* eslint no-unused-vars: 0 */
var themes = require('../themes');

var _ = require('lodash');

var sample = 'Morbi ornare pulvinar metus, non faucibus arcu ultricies non.';

exports.command = 'ls';
exports.desc = 'Get a list of installed themes';
exports.builder = {};
exports.handler = function (argv) {
  var list = themes.getThemes();
  _.each(list, function (value) {
    var name = value;
    var currentTheme = themes.loadTheme(name);
    themes.labelDown(name, currentTheme, sample);
  });
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTtBQUNBLElBQU0sU0FBUyxRQUFRLFdBQVIsQ0FBZjs7QUFFQSxJQUFNLElBQUksUUFBUSxRQUFSLENBQVY7O0FBRUEsSUFBTSxTQUFTLCtEQUFmOztBQUVBLFFBQVEsT0FBUixHQUFrQixJQUFsQjtBQUNBLFFBQVEsSUFBUixHQUFlLGdDQUFmO0FBQ0EsUUFBUSxPQUFSLEdBQWtCLEVBQWxCO0FBQ0EsUUFBUSxPQUFSLEdBQWtCLFVBQUMsSUFBRCxFQUFVO0FBQzFCLE1BQU0sT0FBTyxPQUFPLFNBQVAsRUFBYjtBQUNBLElBQUUsSUFBRixDQUFPLElBQVAsRUFBYSxVQUFDLEtBQUQsRUFBVztBQUN0QixRQUFNLE9BQU8sS0FBYjtBQUNBLFFBQU0sZUFBZSxPQUFPLFNBQVAsQ0FBaUIsSUFBakIsQ0FBckI7QUFDQSxXQUFPLFNBQVAsQ0FBaUIsSUFBakIsRUFBdUIsWUFBdkIsRUFBcUMsTUFBckM7QUFDRCxHQUpEO0FBS0QsQ0FQRCIsImZpbGUiOiJjbWRzL2xzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50IG5vLXVudXNlZC12YXJzOiAwICovXG5jb25zdCB0aGVtZXMgPSByZXF1aXJlKCcuLi90aGVtZXMnKVxuXG5jb25zdCBfID0gcmVxdWlyZSgnbG9kYXNoJylcblxuY29uc3Qgc2FtcGxlID0gJ01vcmJpIG9ybmFyZSBwdWx2aW5hciBtZXR1cywgbm9uIGZhdWNpYnVzIGFyY3UgdWx0cmljaWVzIG5vbi4nXG5cbmV4cG9ydHMuY29tbWFuZCA9ICdscydcbmV4cG9ydHMuZGVzYyA9ICdHZXQgYSBsaXN0IG9mIGluc3RhbGxlZCB0aGVtZXMnXG5leHBvcnRzLmJ1aWxkZXIgPSB7fVxuZXhwb3J0cy5oYW5kbGVyID0gKGFyZ3YpID0+IHtcbiAgY29uc3QgbGlzdCA9IHRoZW1lcy5nZXRUaGVtZXMoKVxuICBfLmVhY2gobGlzdCwgKHZhbHVlKSA9PiB7XG4gICAgY29uc3QgbmFtZSA9IHZhbHVlXG4gICAgY29uc3QgY3VycmVudFRoZW1lID0gdGhlbWVzLmxvYWRUaGVtZShuYW1lKVxuICAgIHRoZW1lcy5sYWJlbERvd24obmFtZSwgY3VycmVudFRoZW1lLCBzYW1wbGUpXG4gIH0pXG59XG4iXX0=