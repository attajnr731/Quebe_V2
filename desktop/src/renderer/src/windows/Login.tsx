import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import bg1 from '../assets/images/globe.png'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    if (email === 'test@admin.com') {
      setError('')
      navigate('/admin')
    } else if (email === 'test@spec.com') {
      setError('')
      navigate('/spec')
    } else {
      setError('❌ Invalid credentials. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center relative overflow-hidden">
      {/* Background World Map */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${bg1})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white bg-opacity-95 rounded-2xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Login to <span className="logo text-blue-600">QUEBE</span>
        </h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`w-full p-3 border ${
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`w-full p-3 border ${
                error ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Login
          </button>
        </form>

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm mt-3 text-center">{error}</p>}

        <p className="text-center text-gray-600 text-sm mt-6">
          <a href="/" className="text-blue-600 hover:underline">
            Go back
          </a>
        </p>
      </div>
    </div>
  )
}

export default Login
