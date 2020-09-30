import React from 'react';
import cookie from 'js-cookie';
import axios from 'axios';

import './css/login.css';

//Note: using bcrypt resulted in the error: 'Can't resolve 'aws-sdk' in '[my path]\client\node_modules\node-pre-gyp\lib'
export default class Login extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            submited: false,
            error: false,
            username: null,
            password: null
        }
    }

    onChange = e => {
        this.setState({[e.target.name]: e.target.value});
    }

    onSubmit = e => {
        e.preventDefault();
        if (this.state.submited)
            return;

        this.setState({submited: true});

        const { username, password } = this.state;

        axios.post(`/api/login/${username}-${password}`)
        .then(res => res.data)
        .then(data => {
            if (data.status === 'fail'){
                this.setState({submited: false, error: true});
            }
            else {
                cookie.set('username', username);
                cookie.set('password', password);

                //Save the returned token in the headers
                axios.interceptors.request.use(
                    config => {
                        config.headers.authorization = `Bearer ${data.token}`;
                        return config;
                    },
                    error => {
                        return Promise.reject(error);
                    }
                );

                this.props.history.push('/newpost');
            }
        });
    }

    render(){
        return (
            <div className="post">
                { this.state.error && <div className="error-message">Sorry, Username and / or Password are incorrect</div> }
                <form id="login-form" name="login-form" onSubmit={ this.onSubmit }>
                    <p>Username: 'admin', Password: '1234'</p>

                    <div className="input-element">
                        <label htmlFor="username">Username</label>
                        <input type="text" name="username" required onChange={ this.onChange } />
                    </div>

                    <div className="input-element">
                        <label htmlFor="password">Password</label>
                        <input type="password" name="password" required onChange={ this.onChange } />
                    </div>

                    <div className="button-wrapper">
                        <button type="submit">LOGIN</button>
                    </div>
                </form>
            </div>
        );
    }
}