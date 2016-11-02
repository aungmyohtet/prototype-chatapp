/**
 * TeamController
 *
 * @description :: Server-side logic for managing Teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	create: function(req, res) {
		var teamData = {
			name: req.param('teamName'),
			description: req.param('description'),
			status: 'confirmed',
			users: [],
			channels: [],
			privateMessages: []
		};

		var userData = {
			userName: req.param('userName'),
			name: req.param('name'),
			email: req.param('email'),
			role: 'owner',
			status: 'active'
		};

		var userAuthData = {
			password: req.param('password')
		};

		var channelData = {
			name : 'general',
			description: 'General',
			messages: []
		};

		async.series([
     function createTeam(callback){
       console.log("Creating team");
			 Team.create(teamData).exec(function(err, team) {
				 if (err) {
					 return callback(err);
				 } else {
					 userData.team = team.id;
					 channelData.team = team.id;
					 callback();
				 }
			 });
		 },

		 function createUser(callback) {
			 User.create(userData).exec(function(err, user) {
         if (err) {
 					return callback(err);
 				} else {
					userAuthData.user = user.id;
					callback();
				}
 			});
		 },

		 function createUserAuth(callback) {
			 UserAuth.create(userAuthData).exec(function(err, userAuth) {
 				if (err) {
 					return callback(err);
 				} else {
					callback();
				}
 			});
		},

		function createGeneralChannel(callback) {
      Channel.create(channelData).exec(function(err, channel){
        if (err) {
					return callback(err);
				} else {
					callback();
				}
			});
		}
		],
	  function(err){
		  if (err) {
				return res.serverError(err)
			}
			else {
        return res.view('teamCreationSuccess', {teamName: teamData.name});
			}
		});
	}
};
