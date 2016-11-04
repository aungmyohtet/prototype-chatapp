var UserList = React.createClass({
  handleClicked: function() {
    console.log("Have not implemented yet");
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
    var userNodes = this.state.users.map(function (user, index) {
      return (
        <div className="user-display" id={user.name}>
          <span className="user-name-list-element">
            {user.name}
          </span>
          <span className={user.status}>
          &nbsp;
          </span>
        </div>
      )});
      return (
        <div className="userList" onClick={this.handleClicked}>
        {userNodes}
        </div>
      );
    }
  });
  ReactDOM.render(<UserList/>, document.getElementById('user-list-container'));


  var MessageList = React.createClass({
    componentWillMount: function() {
      console.log("componentWillMount function in MessageList");
    },

    getInitialState: function() {
      return {
        message: "not implemented yet"
      }
    },

    render: function() {
      //To implement here
      return <div className="message-list">Div New</div>
    }
  });
