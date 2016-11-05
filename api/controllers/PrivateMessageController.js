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
		 senderId: req.session.userId
	 };
		PrivateMessage.create(privateMessage).exec(function(err, privateMessage) {
      if (err) {
				console.log("error");
			} else if (privateMessage) {
				console.log("Private message created");
				var senderId = req.session.userId;
				var recepientId = recepient;
        var senderSocket = SocketService.socketsByTeam.teamId.userId;
				var recepientSocket = SocketService.socketsByTeam.teamId.recepientId;
				sails.sockets.broadcast(senderSocket, 'privateMessage', messageToSent);
				sails.sockets.broadcast(recepientSocket, 'privateMessage', messageToSent);
			}
		});
	}
};
