import { useState } from 'react'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [message, setMessage] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://127.0.0.1:9292/api/login', {
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
        setMessage(data.message || 'Login failed')
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
      <h1>Login</h1>
      {token ? (
        <div>
          <p>Welcome!</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <br />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <button type="submit">Login</button>
        </form>
      )}
      {message && <p>{message}</p>}
    </>
  )
}

export default Login