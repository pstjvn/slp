/**
 * @fileoverview Provides the main entry point for the static server.
 *
 * The server is configurable in the sense that you can define custom
 * proxy functions for local serving of your files and remote proxying based
 * on a url matching.
 *
 * @author regardingscot@gmail.com (PeterStJ)
 */

var fs = require('fs');
var http = require('http');
var minimist = require('minimist');
var nodestatic = require('node-static');
var request = require('request');
var util = require('util');


/**
 * The root directory to start serving from.
 * @type {!string}
 */
var WEB_ROOT = '../';


/**
 * The port to start the server on.
 *
 * We expect it to be defined in the enviroment as a variable. This assures
 * support in hosted environments like cloud9.
 *
 * @type {number|string}
 */
var WEB_PORT = process.env.PORT;


/**
 * The IP/host to listen on.
 *
 * By default we use the environment variable IP to be compatible with cloud
 * based test environments.
 *
 * @type {string}
 */
var WEB_HOST = process.env.IP;


/**
 * @type {!Object<string, *>}
 */
var args = minimist(process.argv.slice(2));


/**
 * The URL of the file to use as config.
 * @type {string}
 */
var configFile = (args['config']) ? args['config'] : 'config/example.json';

var webroot = (args['root']) ? args['root'] : WEB_ROOT;
var port = (args['port']) ? (parseInt(args['port'], 10)) : WEB_PORT;
var host = (args['host']) ? args['host'] : WEB_HOST;

var config = fs.readFileSync(configFile, 'utf8');
var json = JSON.parse(config);
var file = new nodestatic.Server(webroot, {
  cache: 600,
  headers: {'X-Powered-By': 'node-static'}
});

var handler = function(req, res) {
  var url = req.url;
  var substituted = false;
  for (var key in json) {
    match = json[key]['contains'];
    if (url.indexOf(match) != -1) {
      if (json[key]['replace']) {
        url.replace(json[key]['replace'][0], json[key]['replace'][1]);
      }
      if (json[key]['prepend']) {
        url = json[key]['prepend'] + url;
      }
      if (json[key]['append']) {
        url = url + json[key]['append'];
      }
      req.pipe(request(url)).pipe(res);
      substituted = true;
      break;
    }
  }
  if (!substituted) {
    req.addListener('end', function() {
      file.serve(req, res, function(err, result) {
        if (err) {
          console.error('Error serving %s - %s', req.url, err.message);
          if (err.status === 404 || err.status === 500) {
            res.end();
          } else {
            res.writeHead(err.status, err.headers);
            res.end();
          }
        }
      });
    });
    // 0.11
    req.resume();
  }
};

// The atual server implmentation.
http.createServer(handler).listen(port, host);

if (port != process.env.PORT || host != process.env.IP) {
  console.log('Listening on ' + host + ':' + port);
}
