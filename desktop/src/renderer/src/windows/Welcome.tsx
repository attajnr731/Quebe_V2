import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import image1 from '../assets/images/call.png'

const Welcome = () => {
  const [productId, setProductId] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleStart = () => {
    if (productId.trim()) {
      setError('')
      navigate('/login')
    } else {
      setError('❌ Please enter a Product ID.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center relative overflow-hidden">
      {/* Main Card */}
      <div className="relative z-10 flex flex-col md:flex-row items-center bg-white bg-opacity-95 rounded-2xl shadow-2xl p-10 max-w-4xl w-full mx-4">
        {/* Left Content */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-extrabold text-gray-800 mb-6">
            Welcome to <span className="logo text-blue-600">QUEBE</span>
          </h1>
          <p className="text-gray-600 text-lg mb-6">
            Manage your time efficiently with our virtual queue system. Enter your product ID to get
            started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter Product ID"
                className={`w-full p-3 border ${
                  error ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm`}
              />
            </div>
            <button
              onClick={handleStart}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Get Started
            </button>
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>

        {/* Right Image */}
        <div className="flex-1 mt-10 md:mt-0 flex justify-center">
          <img
            src={image1}
            alt="Queue Assistance"
            className="w-72 md:w-96 object-contain drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}

export default Welcome
