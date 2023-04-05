import React from 'react';
import '../css/login-register.scss'
import { checkForToken } from '../helpers/getToken';
import { apiURL, wsURL } from '../settings'

interface LoginProps {
}

interface LoginState {
  username: string
  password: string
  passwordCheck: string
  registerError: null | string
}

const registerError = new Map<string, string>([
  ['invalidToken', 'Invalid Session']
])

class Register extends React.Component<LoginProps, LoginState>{

  ws = new WebSocket(wsURL)
  token = checkForToken()

  constructor(props: LoginProps) {
    super(props)

    const queryParams = new URLSearchParams(window.location.search);
    const loginError = queryParams.get('error');
    console.log(loginError)

    let error: null | string = null

    if (loginError && registerError.has(loginError)) {
      error = (registerError.get(loginError) || null)
    }

    this.state = {
      registerError: error,
      username: '',
      password: '',
      passwordCheck: ''
    }

    if (this.token) {
      const ref = queryParams.get('ref')
      if (ref)
        document.location.href = ref
      else
        document.location.href = '/home';
      return
    }
  }


  handleInputChange(event: any) {
    const name: 'username' | 'password' | 'passwordCheck' = event.target.name;
    const value: string = event.target.value
    var partialState: any = {};
    partialState[name] = value;
    this.setState(partialState);
  }

  async handleSubmit(event: any) {
    event.preventDefault()
    if (!this.state.username || !this.state.password || !this.state.passwordCheck)
        this.setState({
            registerError: "Please Enter your Username and Password"
        })
    else if (this.state.password !== this.state.passwordCheck)
        this.setState({
            registerError: "Passwords do not match"
        })
    else {
        this.setState({
            registerError: null
        })

        try {
            let response = await fetch(apiURL + "account/register", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    username: this.state.username,
                    password: this.state.password
                })
            })

            if (response.ok) {
                try {
                    let response = await fetch(apiURL + "account/login", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json;charset=utf-8'
                        },
                        body: JSON.stringify({
                            username: this.state.username,
                            password: this.state.password
                        })
                    })
    
                    if (response.ok) {
                        console.log('REGISTER DONE')
                        const data = await response.json()
                        localStorage.setItem("token", data.token + "|" + data.user.userId)
                        const queryParams = new URLSearchParams(window.location.search);
                        const ref = queryParams.get('ref')
                        if (ref && ref.startsWith('/') && (ref[1] && ref[1] !== '/'))
                            document.location.href = ref
                        else
                            document.location.href = '/home';
                    } else {
                        this.setState({ registerError: await response.text() })
    
                    }
                } catch {
                    this.setState({ registerError: "Error Connecting To OggyP Chess Servers" })
                }
            } else {
                this.setState({ registerError: await response.text() })

            }
        } catch {
            this.setState({ registerError: "Error Connecting To OggyP Chess Servers" })
        }
    }
}

  render() {
    let passwordError: null | React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> = null
    if (this.state.registerError) passwordError = <h2 className='account-error'>{this.state.registerError}</h2>
    return <form id='account-form' onSubmit={this.handleSubmit.bind(this)}>
      <h1>Register</h1>
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
      {/* <br /> */}
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
      <label htmlFor='password-check-input'>
        Password:
        <input
          type='password'
          id='password-check-input'
          placeholder='Password Validation'
          name='passwordCheck'
          onChange={this.handleInputChange.bind(this)}
        />
      </label>
      <label htmlFor='register-submit'>
        <button>
          Register
          <span className="spacer" style={{ display: 'inline-block', width: '5px' }}></span>
          <span className="material-icons-round">add_circle</span>
        </button>
        <input id='register-submit' type="submit" hidden value='Submit' />
      </label>
      <p>Already Have an Account?</p>
      <a href='/login' className='button-type'>
        Login Now!
      </a>
    </form>
  }
}

export default Register