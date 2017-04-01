'use strict';

const ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
const Pearl = require('./pearl.js');

module.exports = (app) => {
    let pearl = new Pearl('Amazon Alexa', 'http://www.amazon.com/');
    
    app.post('/google-assistant', function (request, response) {
        let assistant = new ActionsSdkAssistant({
            request: request,
            response: response
        });

        function mainIntent(assistant) {
            pearl.firstMessage().then(function (message) {
                assistant.ask(assistant.buildInputPrompt(true, '<speak>' + message.replace('Hi.', 'Hi. <break time="1"/>') + '</speak>', 
                    ['If you\'re still there, how can I help?', 'What is the problem?']));
            });
        }
        
        function rawInput (assistant) {
            let rawText = assistant.getRawInput();
            pearl.nextMessage(request.body.conversation.conversation_id, rawText).then(function (message) {
                assistant.ask(assistant.buildInputPrompt(true, '<speak>' + message + '</speak>',[]));
            });
        }

        let actionMap = new Map();
        actionMap.set(assistant.StandardIntents.MAIN, mainIntent);
        actionMap.set(assistant.StandardIntents.TEXT, rawInput);

        assistant.handleRequest(actionMap);
    });
}