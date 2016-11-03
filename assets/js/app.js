var UserList = React.createClass({
  addUser: function(){
    console.log("is Array");
    console.log(Array.isArray(this.state.users));
    this.setState({
      users: this.state.users.concat([{name: 'user3'}])
    });
  },
  componentWillMount: function() {
    console.log("This was called");
    io.socket.get('/team/socket/join', function (resData) {
       console.log(resData);
    });

    io.socket.on('newUser', function(data) {
      console.log(data.userSocketId);
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
        <div className="userList" onClick={this.addUser}>
        {userNodes}
        </div>
      );
    }
  });
  ReactDOM.render(<UserList/>, document.getElementById('user-list-container'));
