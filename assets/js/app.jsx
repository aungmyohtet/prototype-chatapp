var currentChattingUserName = "aung";
var currentChattingUserId = "1";
var UserList = React.createClass({
  handleClicked: function(e) {
    console.log("Have implemented");
    console.log(e.currentTarget.id);
    PubSub.publish( 'hello', e.currentTarget.id);
    currentChattingUserId = e.currentTarget.id;
  },

  updateUserList: function(user) {
    var users = this.state.users.slice(0);
    users.push(user);
    this.setState({
      users: users
    });
  },

  updateOfflineUserStatus: function(userName) {
    var users = this.state.users.slice(0);
    for (var i = 0; i < users.length; i++) {
      console.log("Status is now");
      console.log(users[i].status);
      if (users[i].userName == userName) {
        users[i].status = "user-status-offline";
      }
    }
    this.setState({
      users: users
    });

  },

  updateOnlineUserStatus: function(userName){
    console.log("is Array");
    console.log(Array.isArray(this.state.users));
    var users = this.state.users.slice(0);
    for (var i = 0; i < users.length; i++) {
      console.log("Status is now");
      console.log(users[i].status);
      if (users[i].userName == userName) {
        users[i].status = "user-status-online";
      }
    }
    this.setState({
      users: users
    });

    // Let's check if the browser supports notifications
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notification");
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === "granted") {
      // If it's okay let's create a notification
      var notification = new Notification(userName+ " is online now.");
    }

    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
      Notification.requestPermission(function (permission) {
        // If the user accepts, let's create a notification
        if (permission === "granted") {
          var notification = new Notification(userName+ " is online now.");
        }
      });
    }

  },

  componentWillMount: function() {
    console.log("This was called >> new");
    io.socket.get('/team/socket/join', function (resData) {
      console.log(resData);
    });

    var self = this;
    io.socket.on('newUser', function(data) {
      console.log("new user arrived");
      //console.log(data.userName);
      self.updateOnlineUserStatus(data.userName);
    });

    io.socket.on('newRegisteredUser', function(user) {
      console.log("a new user registered");
      self.updateUserList(user);
    });

    io.socket.on('userOffline', function(data) {
      console.log("user goes offline.");
      self.updateOfflineUserStatus(data.userName);
    });
  },

  getInitialState: function(){
    return {
      users: teamUsers
    }
  },
  render: function(){
    var url = this.props.url;
    var self = this;
    var userNodes = this.state.users.map(function (user, index) {
      return (
        <div className="user-display" key={user.id} id={user.id} onClick={self.handleClicked}>
        <span className="user-name-list-element">
        {user.name}
        </span>
        <span className={user.status}>
        &nbsp;
        </span>
        </div>
      )});
      return (
        <div className="userList">
        {userNodes}
        </div>
      );
    }
  });

  ReactDOM.render(<UserList/>, document.getElementById('user-list-container'));

  var MessageListContainer = React.createClass({
    componentWillMount: function() {
      var self = this;
      var token = PubSub.subscribe( 'hello', function(msg, data) {
        console.log(data);
        var newUsers = self.state.users.slice(0);
        for (var i = 0; i < newUsers.length; i++) {
          if (newUsers[i].id == data) {
            newUsers[i].className = 'current-thread';
            console.log("current-thread");
          } else {
            newUsers[i].className = 'not-current-thread';
            console.log("not-current-thread");
          }
        }
        self.setState({
          users: newUsers
        });

        self.forceUpdate();
      });


    },
    getInitialState: function() {
      return {
        users: teamUsers
      }
    },
    render: function() {
      var userDivs = this.state.users.map(function(user,index){
        return (
          <MessageList user={user}/>
        );
      });
      return (
        <div>
        {userDivs}
        </div>
      );
    }
  }
  );


  var MessageList = React.createClass({
    componentWillMount: function() {
      console.log("componentWillMount function in MessageList");
      var self = this;
      io.socket.get('/message/private/'+this.props.user.id, function(resData) {
        console.log(JSON.stringify(resData));
        self.setState({
          messages: resData
        });
      });

      io.socket.on('testing', function(data) {
        console.log('testing message');
        console.log(data);
      });
      //
      io.socket.on('privateMessage', function(data) {
        console.log("private message from server");
        console.log(self.props.user.id);
        console.log(data.from.id);
        console.log(data.to.id);
        console.log("logging");
        if (self.props.user.id != data.from.id && self.props.user.id != data.to.id) {
          return;
        }
        console.log("private message arrived!");
        var newMessages = self.state.messages.slice(0);
        newMessages.push(data);
        self.setState({
          messages: newMessages
        });

        self.forceUpdate();
      });
    },

    addMessage: function(message) {
      var messages = this.state.messages.slice(0);
      messages.push(message);
      this.setState({
        messages: messages
      });
    },

    getInitialState: function() {
      return {
        messages: []
      };
    },

    render: function() {
      return (
        <div className="area-per-thread" className={this.props.user.className}>
        <div className="message-list-container">
        <div className="message-list">
        {
          this.state.messages.map(function(message) {
            return <MessageRegion message={message}/>
          })
        }
        </div>
        </div>
        <MessageBoxContainer addMessage={this.addMessage}/>
        </div>
      );
    }
  });

  var MessageRegion = React.createClass({
    render: function() {
      return (
        <div>
        <div className="message-container">
        <span className="user-name">{this.props.message.from.name}</span>
        <div className="message">{this.props.message.message}</div>
        </div>
        <div className="message-divider"></div>
        </div>
      );
    }
  });

  var MessageBoxContainer = React.createClass({
    handleKeyPressed: function(e) {
      console.log("handleKeyPressed");
      console.log(e.currentTarget.value);
      var code = (e.keyCode ? e.keyCode : e.which);
      if(code == 13){
        e.preventDefault();
        var message = {
          to: currentChattingUserId,
          userName: 'aungmyohtet',
          time: '3:00',
          messageContent: e.currentTarget.value
        };
        //this.props.addMessage(message);
        e.currentTarget.value = "";
        console.log("handled key press event.")
        io.socket.post('/message/private', message);
      }
    },
    getInitialState: function() {
      return {
        inputText: ""
      }
    },
    render: function() {
      return (
        <div className="message-box-container">
        <form className="message-form">
        <textarea className="message-input" onKeyPress={this.handleKeyPressed}>
        {this.state.inputText}
        </textarea>
        </form>
        </div>
      );
    }
  });


  ReactDOM.render(<MessageListContainer/>, document.getElementById('right-container'));
