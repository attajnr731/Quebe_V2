import { useState } from 'react'
import { servedQueue } from '../../data/mockData'

const Served = () => {
  const [specialistFilter, setSpecialistFilter] = useState('All')
  const [pointFilter, setPointFilter] = useState('All')

  // Extract unique specialists and points
  const specialists = ['All', ...new Set(servedQueue.map((item) => item.specialist))]
  const points = ['All', ...new Set(servedQueue.map((item) => item.point))]

  // Filtered list
  const filteredQueue = servedQueue.filter((item) => {
    return (
      (specialistFilter === 'All' || item.specialist === specialistFilter) &&
      (pointFilter === 'All' || item.point === pointFilter)
    )
  })

  return (
    <div className="flex-1 bg-white shadow-lg rounded-xl p-6 md:p-8">
      <style>{`
        .custom-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 3px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Served</h2>
        <p className="font-medium bg-green-100 py-2 px-4 rounded-md text-green-600">
          EST: <span>15 mins</span>
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={specialistFilter}
          onChange={(e) => setSpecialistFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          {specialists.map((specialist) => (
            <option key={specialist} value={specialist}>
              {specialist}
            </option>
          ))}
        </select>

        <select
          value={pointFilter}
          onChange={(e) => setPointFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
        >
          {points.map((point) => (
            <option key={point} value={point}>
              {point}
            </option>
          ))}
        </select>
      </div>

      {/* Queue Cards with Scroll */}
      <div className="flex flex-col gap-4 max-h-96 overflow-y-auto custom-scroll">
        {filteredQueue.map((item) => (
          <div
            key={item.id}
            className="relative p-4 rounded-lg shadow border bg-gray-50 border-gray-200"
          >
            {/* Queue Code - top left */}
            <span className="block text-lg font-semibold text-gray-800 mb-1">{item.code}</span>

            {/* Info Section */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              {/* Left Column */}
              <div className="text-sm text-gray-600 flex flex-col">
                <p>
                  <span className="font-medium">Specialist:</span> {item.specialist}
                </p>
                <p>
                  <span className="font-medium">Point:</span> {item.point}
                </p>
              </div>

              {/* Right Column */}
              <div className="text-sm text-gray-600 flex flex-col">
                <p>
                  <span className="font-medium">Waiting Time:</span> {item.waitingTime}
                </p>
                <p>
                  <span className="font-medium">Serving Time:</span> {item.servingTime}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredQueue.length === 0 && <p className="text-gray-500 italic">No queues found.</p>}
      </div>
    </div>
  )
}

export default Served
