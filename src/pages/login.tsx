import React from 'react';
import { sendToWs } from '../helpers/wsHelper'
import '../css/login.scss'
import { checkForToken, setCookie } from '../helpers/getToken';

interface LoginProps {
  url: string
}

interface LoginState {
  username: string
  password: string
  loginError: null | string
}

const loginErrors = new Map<string, string>([
  ['invalidToken', 'Invalid Session']
])

class Login extends React.Component<LoginProps, LoginState>{

  ws = new WebSocket(this.props.url)
  token = checkForToken()

  constructor(props: LoginProps) {
    super(props)

    const queryParams = new URLSearchParams(window.location.search);
    const loginError = queryParams.get('error');
    console.log(loginError)



    let error: null | string = null

    if (loginError && loginErrors.has(loginError)) {
      error = (loginErrors.get(loginError) || null)
    }

    this.state = {
      loginError: error,
      username: '',
      password: ''
    }

    if (this.token) {
      document.location.href = '/home';
      return
    }

    this.ws.onmessage = (message) => {
      const event = JSON.parse(message.data)
      if (event.type === 'login') {
        if (event.data.status === 'success') {
          if (event.data.token)
            setCookie("token", event.data.token + "|" + event.data.userId, 7)
          document.location.href = '/home';
        } else {
          this.setState({
            loginError: event.data.error
          })
        }
      }
      console.log(event)
    }

    this.ws.onclose = function () {
    }

    this.ws.onerror = function () {
    }

    this.ws.onopen = () => { }
  }


  handleInputChange(event: any) {
    const name: 'username' | 'password' = event.target.name;
    const value: string = event.target.value
    var partialState: any = {};
    partialState[name] = value;
    this.setState(partialState);
  }

  handleSubmit(event: any) {
    event.preventDefault()
    if (!this.state.username || !this.state.password)
      this.setState({
        loginError: "Please Enter your Username and Password"
      })
    else {
      this.setState({
        loginError: null
      })
      sendToWs(this.ws, 'login', [
        ['username', this.state.username],
        ['password', this.state.password]
      ])
    }
  }

  render() {
    let passwordError: null | React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> = null
    if (this.state.loginError) passwordError = <h1 className='login-error'>{this.state.loginError}</h1>
    return <form onSubmit={this.handleSubmit.bind(this)}>
      {passwordError}
      <label htmlFor="username-input">
        Username:
        <input
          type='text'
          id='username-input'
          placeholder='Username'
          name='username'
          onChange={this.handleInputChange.bind(this)}
        />
      </label>
      <br />
      <label htmlFor='password-input'>
        Password:
        <input
          type='password'
          id='password-input'
          placeholder='Password'
          name='password'
          onChange={this.handleInputChange.bind(this)}
        />
      </label>
      <input type="submit" hidden value='Submit' />
    </form>
  }
}

export default Login