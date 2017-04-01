'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const amazonAlexa = require('./amazon-alexa.js');
const googleAssistant = require('./google-assistant.js')

let app = express();
app.set('port', (process.env.PORT || 8080));
app.use(bodyParser.json({
  type: 'application/json',
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));

amazonAlexa(app);
googleAssistant(app);

let server = app.listen(app.get('port'), function () {
  console.log('App listening on port %s', server.address().port);
  console.log('Press Ctrl+C to quit.');
});