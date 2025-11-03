import { NavLink } from 'react-router-dom'
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md px-6 py-3 flex items-center justify-between">
      {/* Left: Logo */}
      <div className="logo text-2xl font-extrabold text-blue-600">QUEBE</div>

      {/* Center: NavLinks */}
      <div className="hidden md:flex gap-8 font-medium">
        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            `transition ${
              isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
            }`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/insights"
          className={({ isActive }) =>
            `transition ${
              isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
            }`
          }
        >
          Insight
        </NavLink>
        <NavLink
          to="/admin/settings"
          className={({ isActive }) =>
            `transition ${
              isActive ? 'text-blue-600 font-semibold' : 'text-gray-700 hover:text-blue-600'
            }`
          }
        >
          Settings
        </NavLink>
      </div>

      {/* Right: Icons */}
      <div className="flex items-center gap-6">
        <NavLink
          to="/admin/notifications"
          className={({ isActive }) =>
            `transition ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
          }
        >
          <NotificationsNoneIcon fontSize="medium" />
        </NavLink>
        <NavLink
          to="/admin/profile"
          className={({ isActive }) =>
            `transition ${isActive ? 'text-blue-600' : 'text-gray-600 hover:text-blue-600'}`
          }
        >
          <AccountCircleIcon fontSize="large" />
        </NavLink>
      </div>
    </nav>
  )
}

export default Navbar
