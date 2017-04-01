'use strict';

const request = require('request-promise');

function Pearl(assistantName, assistantLocation) {
	this.virtualAssistantUrl = process.env.VIRTUAL_ASSISTANT_URL;
	this.categorizerUrl = process.env.CATEGORIZER_URL;
	this.botName = 'Pearl_28_6_bot';
	this.generalCategoryId = 'e81d93770fc54eff844de09739e331e5';
	this.partnerId = 'b33305aa2f8441cebfd8bab8b3f3a3da';
	this.chats = {};
	this.assistant = {
		name: assistantName,
		locationUrl: assistantLocation
	};


	this.sendMessage = function(message, chatId) {
		return request({
			url: this.virtualAssistantUrl,
			method: 'POST',
			json: {
				jsonrpc: "2.0",
				method: "sendMessage",
				params: {
					Text: message,
					Role: "Customer",
					ChatId: chatId,
					Attributes: {
						Count: 1,
						Attributes: [{
							Key: "botName",
							Value: this.botName
						}]
					}
				}
			}
		});
	};

	this.getChat = function(chatId) {
		return request({
			url: this.virtualAssistantUrl,
			method: 'POST',
			json: {
				jsonrpc: "2.0",
				method: "getChat",
				params: {
					ChatId: chatId
				}
			}
		})
	};

	this.createChat = function(categoryId) {
		return request({
			url: this.virtualAssistantUrl,
			method: 'POST',
			json: {
				jsonrpc: "2.0",
				method: "createChat",
				params: {
					LocationUrl: this.assistant.locationUrl,
					InitialCategoryId: categoryId || this.generalCategoryId,
					Type: "FunnelQuestion",
					Visitor: {
						VisitorGuid: "a343b324-23b9-4724-b44e-875be1319d08",
						PartnerId: this.partnerId
					},
					BotName: this.botName
				}
			}
		});
	};

	this.getAssistantProfile = function(categoryId) {
		return request({
			url: this.virtualAssistantUrl,
			method: 'POST',
			json: {
				jsonrpc: "2.0",
				method: "getAssistantProfile",
				params: {
					LocationUrl: this.assistant.locationUrl,
					CategoryId: categoryId ||this.generalCategoryId,
					ChatType: "FunnelQuestion",
					BotName: this.botName
				}
			}
		});
	};

	this.predictCategory = function(message) {
		return request({
			url: this.categorizerUrl,
			method: 'POST',
			json: {
				text: message
			}
		});
	};

};

Pearl.prototype.firstMessage = function(){
	return this.getAssistantProfile().then(function (res) {
      return res.result.Greeting.replace('Welcome!', 'Hi.');
    });
};

Pearl.prototype.nextMessage = function(conversationId, message){
	let self = this;
	if (!self.chats[conversationId]) {
      return self.predictCategory(message).then(function (res) {
		  console.log(res);
        let categoryId = res.confidence < 0.7 ? self.generalCategoryId : res.category;
        return self.createChat(categoryId).then(function (res) {
          self.chats[conversationId] = res.result.Id;
          return self.sendMessage(message, self.chats[conversationId]).then(function (res) {
            return res.result.Text;
          });
        });
      });
    } else {
      return self.sendMessage(message, self.chats[conversationId]).then(function (res) {
        if (res.result.Attributes.Attributes[0].Key == 'action' && res.result.Attributes.Attributes[0].Value == 'payment') {
          delete self.chats[conversationId];
		  return res.result.Text.replace('I\'m sending you', 'Here is a link') + '\n' + res.result.PaymentUrl;
        }
		return res.result.Text;
      });
    }
};

module.exports = Pearl;