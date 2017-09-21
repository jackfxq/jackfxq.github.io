/**
 * Created by jack on 17/9/21.
 */
var http = require('http');
var serveStatic = require('serve-static');
var finalhandler = require('finalhandler');
var serve = serveStatic(__dirname);
var server = http.createServer(
    function onRequest (req, res) {
        serve(req, res, finalhandler(req, res))
    }
);
server.listen(8000);