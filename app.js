/**
 * Module Dependencies.
 */
var express = require('express');
var twilio = require('twilio');
var bodyParser = require('body-parser');
var multer = require('multer');
var path = require('path');
var connectAssets = require('connect-assets');
var Promise = require('promise');


/**
 * Controllers (Route Handlers).
 */
var homeController = require('./client/controllers/home');


/**
 * Start Express Server.
 */
var app = express();


/**
 * Express Configuration.
 */
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, '/client/views'));
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/client/public'));
app.use(connectAssets({
  paths: [path.join(__dirname, 'client/public/css'), path.join(__dirname, 'client/public/js')]
}));


/**
 * Primary App Routes.
 */
app.get('/', homeController.getIndex);


/**
 * API Routes.
 */
app.get('/api/twilio', homeController.getTwilioResponse);
app.post('/api/frontend', homeController.getFrontendResponse);


/**
 * Start Express Server.
 */
app.listen(app.get('port'), function () {
  console.log('Express server now listening on port %d in %s mode.', app.get('port'), app.get('env'));
});