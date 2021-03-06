/**
 * PrivateMessageController
 *
 * @description :: Server-side logic for managing privatemessages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	postMessage: function(req, res) {
		var teamId = req.session.teamId;
		var userId = req.session.userId;
		var sender = req.session.userName;
		var recepient = req.param('to');
		var messageContent = req.param('messageContent');

		var privateMessage = {
			message: messageContent,
			from: req.session.userId,
			to: recepient,
			team: req.session.teamId
		};

   var messageToSent = {
		 message: messageContent,
		 time: '3:00',
		 senderName: sender,
		 senderId: req.session.userId,
		 recepientId: req.param('to')
	 };
		PrivateMessage.create(privateMessage).exec(function(err, privateMessage) {
      if (err) {
				console.log("error");
			} else if (privateMessage) {

        PrivateMessage.findOne(privateMessage).populate('from').populate('to').exec(function(err, newPrivateMessage){
          if (err) {
						return serverError(err);
					}

					console.log("Private message created");
					var senderId = req.session.userId;
					var recepientId = req.param('to');
					console.log("sender is " + userId);
					console.log("recepient is " + recepientId);
					var recepientSocket;
					var socketMapByTeam = SocketService.socketsByTeam.get(teamId);
					socketMapByTeam.forEach(function(value, key, map) {
						console.log(key+"======>"+value);
						if (key == recepientId) {
							recepientSocket = value;
							return;
						}
					});
					var senderSocket = socketMapByTeam.get(senderId);
					console.log(senderSocket);
					console.log(recepientSocket);
					sails.sockets.broadcast(senderSocket, 'privateMessage', newPrivateMessage);
					sails.sockets.broadcast(recepientSocket, 'privateMessage', newPrivateMessage);
					console.log("Sending private messages");
				});

			}
		});
	},

	getMessage: function(req, res) {
		var peerId = req.param('byThisUser');
		var currentUserId = req.session.userId;
		var criteria = {or: [{from: peerId, to: currentUserId},{from: currentUserId, to: peerId}]};
		PrivateMessage.find(criteria).populate('from').populate('to').exec(function(err, data) {
      if (err) {
				res.serverError(err);
			} else {
				res.json(data);
			}
		});
	}
};
