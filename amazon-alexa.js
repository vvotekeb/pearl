'use strict';

const alexaVerifier = require('alexa-verifier');
const Pearl = require('./pearl.js');

module.exports = (app) => {
    let pearl = new Pearl('Amazon Alexa', 'http://www.amazon.com/');

    app.post('/amazon-alexa', requestVerifier, function (request, response) {
        //console.log(request);
        if (request.body.request.type === 'LaunchRequest') {
            pearl.firstMessage().then(function (message) {
                response.json({
                    "version": "1.0",
                    "response": {
                        "shouldEndSession": false,
                        "outputSpeech": {
                            "type": 'SSML',
                            "ssml": '<speak>' + message.replace('Hi.', 'Hi. <break time="1s"/>') + '</speak>'
                        }
                    }
                });
            });
        } else {
            let rawText = request.body.request.intent.slots.Text.value;
            pearl.nextMessage(request.body.session.sessionId, rawText).then(function (message) {
                response.json({
                    "version": "1.0",
                    "response": {
                        "shouldEndSession": false,
                        "outputSpeech": {
                            "type": 'SSML',
                            "ssml": '<speak>' + message + '</speak>'
                        }
                    }
                });
            });
        }
    });

    function requestVerifier(req, res, next) {
        alexaVerifier(
            req.headers.signaturecertchainurl,
            req.headers.signature,
            req.rawBody,
            function verificationCallback(err) {
                if (err) {
                    res.status(401).json({
                        message: 'Verification Failure',
                        error: err
                    });
                } else {
                    next();
                }
            }
        );
    }
}