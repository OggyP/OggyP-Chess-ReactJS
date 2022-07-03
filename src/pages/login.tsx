import React from 'react';
import '../css/login-register.scss'
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

            let response = await fetch(this.props.url + "account/login", {
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
                setCookie("token", data.token + "|" + data.user.userId, 7)
                const queryParams = new URLSearchParams(window.location.search);
                const ref = queryParams.get('ref')
                if (ref && ref.startsWith('/') && (ref[1] && ref[1] !== '/'))
                    document.location.href = ref
                else
                    document.location.href = '/home';
            } else
                this.setState({ loginError: await response.text() })

        }
    }

    render() {
        let passwordError: null | React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> = null
        if (this.state.loginError) passwordError = <h2 className='account-error'>{this.state.loginError}</h2>
        return <form id='account-form' onSubmit={this.handleSubmit.bind(this)}>
            {/* <img src="/assets/images/favicon-login-bg.png" alt="" className="bg-img" /> */}
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
                    <span className="material-icons-round">login</span>
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