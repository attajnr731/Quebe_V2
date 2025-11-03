import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  const [isTimeValid, setIsTimeValid] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [apiTime, setApiTime] = useState<Date | null>(null)

  useEffect(() => {
    const fetchTime = async () => {
      try {
        const response = await fetch('http://worldtimeapi.org/api/timezone/Africa/Accra')
        if (response.ok) {
          const data = await response.json()
          const fetchedTime = new Date(data.datetime)
          setApiTime(fetchedTime)
        }
      } catch (error) {
        console.error('Error fetching time:', error)
        setApiTime(null) // No fallback to system time, just note the failure
      } finally {
        setIsLoading(false) // Ensure loading stops even on error
      }
    }

    fetchTime()

    // Update time check every minute
    const interval = setInterval(fetchTime, 60000)

    return () => clearInterval(interval)
  }, [])

  // Validate system time against API time
  useEffect(() => {
    if (apiTime) {
      const systemDate = new Date()
      const diffInMinutes = Math.abs((apiTime.getTime() - systemDate.getTime()) / (1000 * 60))
      setIsTimeValid(diffInMinutes <= 30)
    } else {
      setIsTimeValid(true) // Assume valid if API data is unavailable
    }
  }, [apiTime])

  const formatTime = (date: Date): string => {
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const systemDate = new Date()
  const formattedTime = formatTime(systemDate)
  const expectedTime = apiTime ? formatTime(apiTime) : '--'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (isTimeValid === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center backdrop-blur-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">System Time Error</h2>
            <p className="text-gray-600 mb-6">
              Your system clock is not synchronized with Accra time. Please update your system time
              to continue.
            </p>
            <div className="space-y-2 text-sm text-gray-500 mb-6">
              <p>
                <span className="font-medium">System Time:</span> {formattedTime}
              </p>
              <p>
                <span className="font-medium">Expected Time:</span> {expectedTime}
              </p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Date/Time Display */}
      <Navbar />
      {formattedTime && (
        <div className="absolute top-[10%] right-[10px] text-right">
          {/* <p className="text-sm text-gray-600 mb-1">Accra, Ghana</p> */}
          <p className="text-lg font-semibold text-gray-800">{formattedTime}</p>
        </div>
      )}

      <div className="max-w-8xl mx-10 my-2 ">
        <Outlet />
      </div>
    </div>
  )
}

export default AdminLayout
