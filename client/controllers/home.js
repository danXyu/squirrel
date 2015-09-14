/**
 * Module dependencies.
 */
var Promise = require('promise');
var secrets = require('../../config/secrets');
var twilio = require('twilio');
var capitalOneAPI = require('../../server/apis/capitalone');


/**
 * GET /
 * -----
 * Renders the index page to the user.
 */
exports.getIndex = function(req, res) {
  res.render('home/index', {
    title: 'Home'
  });
};


/**
 * GET /api/twilio
 * ---------------
 * Gets Capital One API response and then returns Twilio Message.
 */
exports.getTwilioResponse = function (req, res) {

  // Call promised parse function on server, generate valid TwimlResponse.
  capitalOneAPI.getCapitalOneResponse(req.query.Body).then(function (data) {
    var resp = new twilio.TwimlResponse();

    if (data != undefined) {
      resp.message(data);
    } else {
      resp.message("Sorry, I don't know how to respond to that.");
    }

    // Set response headers and send to url endpoint.
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(resp.toString());
  });
}


/**
 * GET /api/frontend
 * -----------------
 * Returns the response from Capital One API backend to UX.
 */
exports.getFrontendResponse = function (req, res) {

  // Get the Capital One API response from server using the query from frontend messaging.
  capitalOneAPI.getCapitalOneResponse(req.query.query).then(function (data) {
    if (data != undefined) res.end(data.toString());
    else res.end("Sorry, I don't know how to respond to that.");
  });
}