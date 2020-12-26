import React, { useState, useContext } from 'react'
import { Context } from '../context/token'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

import InputField from '../components/InputField'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTwitter } from '@fortawesome/free-brands-svg-icons'

import '../styles/login.css'
import '../styles/general.css'

function Login() {
    const { API, setToken, convertMessage } = useContext(Context)
    const [input, setInput] = useState({
        email: '',
        password: ''
    })
    const [errorMessage, setErrorMessage] = useState('')

    async function handleLogin(e) {
        e.preventDefault()
        try {
            const response = await fetch(`${API}/user/login`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input)
            })
            const data = await response.json()

            if (response.ok)
                setToken(data)
            else
                setErrorMessage(convertMessage[data] || data)

        } catch (e) {
            console.log(e)
        }
    }

    return (
        <form className='login'>
            <Helmet>
                <title>Login on Twitter</title>
            </Helmet>
            <FontAwesomeIcon className='login__icon' icon={faTwitter} />
            <h3 className='login__title'>Log in to Twitter</h3>

            <InputField
                name='email'
                input={input}
                setInput={setInput}
            />
            <InputField
                name='password'
                input={input}
                setInput={setInput}
            />

            <button
                className='login__button blueButton'
                onClick={handleLogin}
            >
                Log in
            </button>
            <Link className='login__signUp' to='/sign-up'>Sign up for Twitter</Link>

            <p className='login__errorMessage'>{errorMessage}</p>
        </form>
    )
}

export default Login