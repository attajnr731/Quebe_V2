import { useState } from 'react'
import { motion } from 'framer-motion'
import { waitingQueue } from '../../data/mockData'
const Waiting = () => {
  const [specialistFilter, setSpecialistFilter] = useState('All')
  const [pointFilter, setPointFilter] = useState('All')

  // Extract unique specialists and points
  const specialists = ['All', ...new Set(waitingQueue.map((item) => item.specialist))]
  const points = ['All', ...new Set(waitingQueue.map((item) => item.point))]

  // Filtered list
  const filteredQueue = waitingQueue.filter((item) => {
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
        <h2 className="text-2xl font-bold text-gray-800">Waiting</h2>
        <p className="font-medium bg-green-100 py-2 px-4 rounded-md text-green-600">
          EWT: <span>23 mins</span>
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        {/* Specialist Filter */}
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

        {/* Point Filter */}
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
      <div className="flex flex-col gap-4 h-[80vh] overflow-y-auto custom-scroll">
        {filteredQueue.map((item) => (
          <div
            key={item.id}
            className={`relative p-4 rounded-lg shadow border flex flex-col sm:flex-row sm:items-center sm:justify-between ${
              item.status === 'serving'
                ? 'bg-blue-50 border-blue-400'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            {/* Green dot for serving */}
            {item.status === 'serving' && (
              <motion.span
                className="absolute top-2 right-2 w-3 h-3 rounded-full bg-green-500"
                animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}

            {/* Left side */}
            <div className="flex-1 mb-2 sm:mb-0">
              <span className="text-lg font-semibold text-gray-800">{item.code}</span>
              <p className="text-sm text-gray-600">
                Specialist: <span className="font-medium">{item.specialist}</span>
              </p>
            </div>

            {/* Right side */}
            <div className="text-sm text-gray-600 flex flex-col gap-1">
              {item.status === 'serving' ? (
                <p className="text-sm text-gray-600">
                  Total Time:
                  <span className="font-medium">
                    {' '}
                    {item.waitingTime} + {item.servingTime} mins
                  </span>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Waiting Time:<span className="font-medium"> {item.waitingTime} mins</span>
                </p>
              )}
              <p className="text-sm text-gray-600">
                Point: <span className="font-medium">{item.point}</span>
              </p>
            </div>
          </div>
        ))}

        {filteredQueue.length === 0 && <p className="text-gray-500 italic">No queues found.</p>}
      </div>
    </div>
  )
}

export default Waiting
