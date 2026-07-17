import { useState } from 'react'
import '../assets/stylesheets/Login.css'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')
    const API_BASE = import.meta.env.API_BASE_URL || 'http://localhost:9292'
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
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
        setMessage('Login successful')
      } else {
        setMessage(data.error || data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Error during login:', error)
      setMessage('An error occurred during login')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setMessage('Logged out successfully')
  }

  return (
    <>
      <div className='login'>
        {token ? (
          <>
            <button className="logout" onClick={handleLogout}>Logout</button>
            <h1>Welcome!</h1>
          </>
        ) : (
          <>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
              <input
                type="email"
                id="email"
                name="email"
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <br />
              <input
                type="password"
                id="password"
                name="password"
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <br />
              <button type="submit">Login</button>
              <a className="forgot-password" href="forgot-password">Forgot Password</a>
              <a className="register-link" href="register">Register</a>
            </form>
          </>
        )}
        {message && <p>{message}</p>}
      </div>
    </>
  )
}

export default Login