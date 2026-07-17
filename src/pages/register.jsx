import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import "../assets/stylesheets/Register.css"

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [message, setMessage] = useState('')

  const handleRegister = async (e) => {
    e.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage("Passwords don't match")
      return
    }
    const API_BASE = import.meta.env.API_BASE_URL || 'http://localhost:9292' 
    try {
      const response = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        setToken(data.token)
        setMessage('Registration Successful')
        navigate('/')
      } else {
        setMessage(data.message || 'Registration failed')
      }
    } catch (error) {
      console.error('Error during Registration:', error)
      setMessage('An error occurred during Registration')
    }
  }

  return (
    <>
      <div className='register'>
        {token ? (
          <>
            <h1>Welcome! You are currently signed in</h1>
          </>
        ) : (
          <>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                id="password"
                name="password"
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <input
                type="password"
                id="confirm-password"
                name="confirm-password"
                placeholder='Confirm Password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="submit">Register</button>
            </form>
          </>
        )}
        {message && <p>{message}</p>}
      </div>
    </>
  )
}
export default Register;