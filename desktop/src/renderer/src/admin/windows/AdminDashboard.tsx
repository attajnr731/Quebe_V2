import React from 'react'
import Waiting from '../components/dashboard/Waiting'
import BusyPoints from '../components/dashboard/BusyPoints'
import Served from '../components/dashboard/Served'

const AdminDashboard: React.FC = () => {
  return (
    <div className="min-h-screen p-4 md:p-6">
      {/* Header */}

      {/* Queue Components */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Waiting />
        <BusyPoints />
        <Served />
      </div>
    </div>
  )
}

export default AdminDashboard
