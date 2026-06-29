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
            </form>
          </>
        )}
        {message && <p>{message}</p>}
      </div>
    </>
  )
}

export default Login