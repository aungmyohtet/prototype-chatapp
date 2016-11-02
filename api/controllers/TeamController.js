/**
 * TeamController
 *
 * @description :: Server-side logic for managing Teams
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {

	index: function(req, res) {
		var teamName = req.param('teamName');
		Team.findOne({name: teamName}).exec(function(err, team) {
      if (err) {
				return res.serverError(err);
			}

			else if (team && !req.session.user) {
				console.log("Team exists and not loggedin")
				return res.view('teamLogin', {'teamName': teamName});
			}

			else if (team && req.session.user) {
				//return enter();
			}

			else {
				console.log('homepage')
				res.view('homepage');
			}
		});

	},


	login: function(req, res) {
    var userName = req.param('userName');
		var password = req.param('password');
		var teamId = null;
		async.series(
			[
				function(callback) {
          TeamUserAuth.findOne({userName: userName, password: password}).exec(function(err, userAuth) {
            if (err) {
							callback(err);
						} else if (userAuth) {
							teamId = userAuth.teamId;
							req.session.teamId = teamId;
							req.session.userName = userName;
							callback();
						} else {
							callback({message: 'no user'})
						}
					});
				},
				function(callback) {
					TeamUser.find({teamId : teamId}).exec(function(err, teamUsers) {
            if (err) {
							callback(err);
						} else if (teamUsers) {
							for (var i = 0; i < teamUsers.length; i++) {
								console.log(teamUsers[i].userName);
							}

							var userNames = teamUsers.map(function(teamUser) {
                return teamUser.name;
							});
							console.log(JSON.stringify(userNames));
							return res.view('teamHome', {layout:null, teamUsers : teamUsers});
						} else {
							callback({message : 'no users'});
						}
					});
				}
			],
			function(err) {
        res.serverError(err);
			}
		)
	},

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
	},

	registerGet: function(req, res) {
		var teamName = req.param('teamName');

		Team.findOne({name : teamName}).exec(function(err, team) {
			if (err) {
				return res.serverError;
			} else if (team) {
				return res.view('teamRegister', {teamName : teamName});
			} else {
				return res.view('homepage');
			}
		});

	},

	registerPost: function(req, res) {
    var teamName = req.param('teamName');
		var userData = {
      userName: req.param('userName'),
			name: req.param('name'),
			email: req.param('email'),
			status: 'active',
			role: 'member'
		};
		var userAuthData = {
      password: req.param('password')
		};
		async.series([
			function findTeam(callback) {
        Team.findOne({name: teamName}).exec(function(err, team) {
          if (err) {
						callback(err);
					} else if (team) {
						userData.team = team.id;
						callback();
					} else {
            callback({message : 'no team'});
					}
				});
			},
			function validateUser(callback) {
				User.findOne({userName: userData.userName, team: userData.team}).exec(function(err, user){
          if (err) {
						callback(err);
					} else if (user) {
						callback({message: 'user exists'});
					} else {
						callback();
					}
				});
			},
			function saveTeamUser(callback) {
				User.create(userData).exec(function(err, user) {
          if (err) {
						callback(err);
					} else {
						userAuthData.user = user.id;
						callback();
					}
				});
			},
			function saveTeamUserAuth(callback) {
			 UserAuth.create(userAuthData).exec(function(err, teamUserAuth) {
				 if (err) {
					 callback(err);
				 } else {
					 callback();
				 }
			 });
			}

		],
		function done(err) {
      if (err) {
				return res.serverError(err);
			} else {
				res.redirect('/');
			}
		});
	}


};
