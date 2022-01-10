import React from 'react';

class Login extends React.Component<{}, {}>{

  url = 'wss://chess.oggyp.com'
  ws = new WebSocket(this.url)

  handleData = (messageData: string) => {
    this.setState({
      response: messageData
    })
  };



  render() {
    return <div>
      <h1>Web Socket Response</h1>
      <h2>Asdf</h2>
    </div>
  }
}

export default Login