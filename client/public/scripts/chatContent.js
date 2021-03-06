// test

Pusher.log = function(message) {
  if (window.console && window.console.log) {
    window.console.log(message);
  }
};

var pusher = new Pusher('d3ff643b6b3d608b70fb', {
  encrypted: true
});

var channel = pusher.subscribe(currentUrl);

// puts together the chatbox and name page

var Chatension = React.createClass({
  nameHandler: function(name) {
    this.setState({name: name});
  },
  showChatBoxHandler: function() {
    this.setState({displayChatBox: {display: 'block'}});
  },
  arrowClickHandler: function() {
    if (this.state.chatensionArrowClass === "chatensionArrow dir-one") {
      $('#chat').css('left', '-288px');
      $('.chatensionArrowBox').css('left', '-10px');
      this.setState({chatensionArrowClass: "chatensionArrow dir-two"});
    } else {
      this.setState({chatensionArrowClass: "chatensionArrow dir-one"});
      $('#chat').css('left', '0');
      $('.chatensionArrowBox').css('left', '278px');
    }
  },
  getInitialState: function() {
    return {displayChatBox: {display: 'none'}, name: '', chatensionArrowClass: "chatensionArrow dir-one"};
  },
  render: function() {
    return (
      <div className="chatension">
        <div className="chatensionArrowBox" onClick={this.arrowClickHandler}>
          <div className={this.state.chatensionArrowClass}></div>
        </div>
        <div className="bg">
          <h1 className="chatensionLogo">Chatension</h1>
          <NamePage url={this.props.url} showChatBoxHandler={this.showChatBoxHandler} nameHandler={this.nameHandler}/>
          <ChatBox url={this.props.url} displayChatBox={this.state.displayChatBox} name={this.state.name}/>
        </div>
      </div>
    );
  }
});

var sideArrow = React.createClass({
  render: function() {
    <div className="arrow-box">
      <div className="arrow dir-one"></div>
    </div>
  }
});
// Username page

var NamePage = React.createClass({ // creates a new react component
  handleNameSubmit: function(name) {
    this.props.nameHandler(name.name)
    this.props.showChatBoxHandler()
    this.setState({displayNamePage: {display: 'none'}});
  },
  getInitialState: function() {
    return {displayNamePage: {display: 'block'}};
  },
  render: function() {
    return (
      <div style={this.state.displayNamePage} className="chatensionNameBox">
        <NameForm onNameSubmit={this.handleNameSubmit} />
      </div>
    );
  }
});

var NameForm = React.createClass({
  getInitialState: function() {
    return {name: ''};
  },
  handleNameChange: function(e) {
    this.setState({name: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var name = this.state.name.trim();
    if (!name && name.trim() === "") {
      return;
    }
    this.props.onNameSubmit({name: name});
    this.setState({name: ''});
  },
  render: function() {
    return (
      <form className="chatensionNameForm" onSubmit={this.handleSubmit}>
        <input
          type="text"
          className="chatensionNameInput"
          placeholder="Enter a name"
          value={this.state.name}
          onChange={this.handleNameChange}
        />
        <input className="chatensionNameSubmitBtn" type="submit" value="Enter room" />
      </form>
    );
  }
});

// Chat box page

var Message = React.createClass({
  render: function() {
    return (
      <div className="chatensionMessage">
        <span className="chatensionMessageName">{this.props.name}: </span>
        <span>{this.props.children}</span>
      </div>
    );
  }
});

var ChatBox = React.createClass({
  // GET to create room or retrieve messages for room
  loadMessagesFromServer: function() {
    $.ajax({ 
      url: this.props.url+"/room", // set at bottom
      dataType: 'json',
      cache: false, // no cache because data changes
      data: {currentUrl: currentUrl},
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleMessageSubmit: function(message) {
    console.log(currentUrl)
    // add to message object for post request
    message.timeStamp = Date.now();
    message.name = this.props.name;
    message.url = currentUrl;

    // POST message to server
    $.ajax({
      url: this.props.url+"/message",
      dataType: 'json',
      type: 'POST',
      data: message,
      success: function(data) {
        // posted yay
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: message});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadMessagesFromServer();
    channel.bind('messageRecieved', function(data) {
      var message = {}
      message.timeStamp = data.timeStamp;
      message.name = data.name;
      message.url = currentUrl;
      message.messageContent = data.messageContent;

      console.log(this.state.data) // here

      var newMessages = this.state.data._messages.concat([message])

      this.setState({data: {_messages: newMessages}});

      // scroll to the bottom
      var chatensionSelector = document.getElementsByClassName("chatension")[0]
      var height = chatensionSelector.scrollHeight
      chatensionSelector.scrollTop = height;

    }.bind(this));
  },
  render: function() { // messageList print names
    return (
      <div style={this.props.displayChatBox} className="chatensionChatBox">
        <MessageList data={this.state.data} />
        <MessageForm onMessageSubmit={this.handleMessageSubmit} />
      </div>
    );
  }
});

var MessageList = React.createClass({ // messageNodes print names
  render: function() {
    if (this.props.data.length === 0) {
      // tell there are no messages here
    } else if (this.props.data._messages) {
      var messageNodes = this.props.data._messages.map(function(message) {
        return (
          <Message name={message.name} key={message._id}>
            {message.messageContent}
          </Message>
        );
      });
    }
    return (
      <div className="chatensionMessageList">
        {messageNodes}
      </div>
    );
  }
});

var MessageForm = React.createClass({
  getInitialState: function() {
    return {text: ''};
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var text = this.state.text.trim();
    if (!text) {
      return;
    }
    this.props.onMessageSubmit({text: text});
    this.setState({text: ''});
  },
  render: function() {
    return (
      <div className="chatensionMessageFormDiv">
        <form className="chatensionMessageForm" onSubmit={this.handleSubmit}>
          <input
            type="text"
            className="chatensionMessageInput"
            placeholder="Say something..."
            value={this.state.text}
            onChange={this.handleTextChange}
          />
          <input type="submit" className="chatensionMessageSubmitBtn" value="+" />
        </form>
      </div>
    );
  }
});

React.render(
  <Chatension url="https://chatension.herokuapp.com/api" />,
  document.getElementById('chat')
);