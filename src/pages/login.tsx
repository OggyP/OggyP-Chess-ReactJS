import React from 'react';
import '../css/login-register.scss'
import { checkForToken } from '../helpers/getToken';
import { apiURL } from '../settings'
import GoogleIcon from '../tsxAssets/GoogleIcon';

interface LoginProps {
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
            const ref = queryParams.get('ref')
            if (ref && ref.startsWith('/'))
                document.location.href = ref
            else
                document.location.href = '/home';
            return
        }
    }


    handleInputChange(event: any) {
        const name: 'username' | 'password' = event.target.name;
        const value: string = event.target.value
        var partialState: any = {};
        partialState[name] = value;
        this.setState(partialState);
    }

    async handleSubmit(event: any) {
        event.preventDefault()
        if (!this.state.username || !this.state.password)
            this.setState({
                loginError: "Please Enter your Username and Password"
            })
        else {
            this.setState({
                loginError: null
            })

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
                    const data = await response.json()
                    localStorage.setItem("token", data.token + "|" + data.user.userId)
                    console.log('Settings cookie')
                    const queryParams = new URLSearchParams(window.location.search);
                    const ref = queryParams.get('ref')
                    if (ref && ref.startsWith('/') && (ref[1] && ref[1] !== '/'))
                        document.location.href = ref
                    else
                        document.location.href = '/home';
                } else {
                    this.setState({ loginError: await response.text() })

                }
            } catch {
                this.setState({ loginError: "Error Connecting To OggyP Chess Servers" })
            }
        }
    }

    render() {
        let passwordError: null | React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> = null
        if (this.state.loginError) passwordError = <h2 className='account-error'>{this.state.loginError}</h2>
        return <form id='account-form' onSubmit={this.handleSubmit.bind(this)}>
            <h1>Login</h1>
            {passwordError}
            <label htmlFor="username-input">
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
                <input
                    type='password'
                    id='password-input'
                    placeholder='Password'
                    name='password'
                    onChange={this.handleInputChange.bind(this)}
                />
            </label>
            <label htmlFor='login-submit'>
                <button>
                    Login
                    <span className="spacer" style={{ display: 'inline-block', width: '5px' }}></span>
                    <GoogleIcon name='login' />
                </button>
                <input id='login-submit' type="submit" hidden value='Submit' />
            </label>
            <p>Don't Have an Account?</p>
            <a href='/register' className='button-type'>
                Register Now!
            </a>
        </form>
    }
}

export default Login