'use strict';

/* eslint no-unused-vars: 0 */
exports.command = 'config <command>';
exports.desc = 'Configuration tasks';
exports.builder = function (yargs) {
  return yargs.commandDir('config_cmds');
};
exports.handler = function (argv) {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNtZHMvY29uZmlnLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7QUFDQSxRQUFRLE9BQVIsR0FBa0Isa0JBQWxCO0FBQ0EsUUFBUSxJQUFSLEdBQWUscUJBQWY7QUFDQSxRQUFRLE9BQVIsR0FBa0IsVUFBQyxLQUFEO0FBQUEsU0FBVyxNQUFNLFVBQU4sQ0FBaUIsYUFBakIsQ0FBWDtBQUFBLENBQWxCO0FBQ0EsUUFBUSxPQUFSLEdBQWtCLFVBQUMsSUFBRCxFQUFVLENBQUUsQ0FBOUIiLCJmaWxlIjoiY21kcy9jb25maWcuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQgbm8tdW51c2VkLXZhcnM6IDAgKi9cbmV4cG9ydHMuY29tbWFuZCA9ICdjb25maWcgPGNvbW1hbmQ+J1xuZXhwb3J0cy5kZXNjID0gJ0NvbmZpZ3VyYXRpb24gdGFza3MnXG5leHBvcnRzLmJ1aWxkZXIgPSAoeWFyZ3MpID0+IHlhcmdzLmNvbW1hbmREaXIoJ2NvbmZpZ19jbWRzJylcbmV4cG9ydHMuaGFuZGxlciA9IChhcmd2KSA9PiB7fVxuIl19