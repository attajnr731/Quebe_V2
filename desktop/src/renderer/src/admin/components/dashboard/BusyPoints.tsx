import React from 'react'
import { waitingQueue } from '../../data/mockData'

const BusyPoints: React.FC = () => {
  // Find serving and idle points
  const servingPoints = waitingQueue
    .filter((item) => item.status === 'serving')
    .map((item) => item.point)

  // Extract all points from data
  const allPoints = [...new Set(waitingQueue.map((item) => item.point))]

  // Idle points = all points not in serving
  const idlePoints = allPoints.filter((point) => !servingPoints.includes(point))

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800">Point Status</h2>

      {/* Serving Points */}
      <div>
        <h3 className="text-lg font-semibold text-green-600 mb-2">Busy Points</h3>
        {servingPoints.length > 0 ? (
          <ul className="space-y-2">
            {servingPoints.map((point, idx) => (
              <li
                key={idx}
                className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700"
              >
                {point} is <span className="font-semibold">serving</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No points are serving right now.</p>
        )}
      </div>

      {/* Idle Points */}
      <div>
        <h3 className="text-lg font-semibold text-blue-600 mb-2">Idle Points</h3>
        {idlePoints.length > 0 ? (
          <ul className="space-y-2">
            {idlePoints.map((point, idx) => (
              <li
                key={idx}
                className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-blue-700"
              >
                {point} is <span className="font-semibold">idle</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 italic">No idle points available.</p>
        )}
      </div>
    </div>
  )
}

export default BusyPoints
