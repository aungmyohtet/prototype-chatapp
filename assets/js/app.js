var UserList = React.createClass({
  handleClicked: function(e) {
    console.log("Have implemented");
    console.log(e.currentTarget.id);
    PubSub.publish( 'hello', e.currentTarget.id);
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
        <div className="user-display" id={user.userName} onClick={self.handleClicked}>
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
        var newMessagesByUsers = self.state.messagesByUsers.slice(0);
        for (var i = 0; i < newMessagesByUsers.length; i++) {
          if (newMessagesByUsers[i].id == data) {
            newMessagesByUsers[i].className = 'current-thread';
            console.log("current-thread");
          } else {
            newMessagesByUsers[i].className = 'not-current-thread';
            console.log("not-current-thread");
          }
        }
        newMessagesByUsers[1].messages[0].userName = 'aungmyohtet'
        self.setState({
          messagesByUsers: newMessagesByUsers
        });

        self.forceUpdate();
      });
    },
    getInitialState: function() {
      return {
        messagesByUsers : [
          {
            id: 'aung',
            className:'not-current-thread',
            messages: [
              {
                userName: 'aung',
                time: '2:00',
                messageContent: 'hi'
              },
              {
                userName: 'erdos',
                time: '3:00',
                messageContent: 'hello'
              }
            ]
          },
          {
            id: 'myo',
            className:'current-thread',
            messages: [
              {
                userName: 'hardy',
                time: '2:00',
                messageContent: 'hi'
              },
              {
                userName: 'ramanujan',
                time: '3:00',
                messageContent: 'hello'
              }
            ]
          }
        ]
      }
    },
    render: function() {
      var messagesByUsers = this.state.messagesByUsers.map(function(messageByUsers,index){
        return (
          <MessageList messageByUsers={messageByUsers}/>
        );
      });
      return (
        <div>
        {messagesByUsers}
        </div>
      );
    }
  }
  );


  var MessageList = React.createClass({
    componentWillMount: function() {
      console.log("componentWillMount function in MessageList");
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
        messages: this.props.messageByUsers.messages
      };
    },

    render: function() {
      return (
        <div className="area-per-thread" className={this.props.messageByUsers.className}>
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
        <span className="user-name">{this.props.message.userName}</span>
        <span className="time">{this.props.message.time}</span>
        <div className="message">{this.props.message.messageContent}</div>
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
          userName: 'aungmyohtet',
          time: '3:00',
          messageContent: e.currentTarget.value
        };
        this.props.addMessage(message);
        e.currentTarget.value = "";
        console.log("handled key press event.")
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
