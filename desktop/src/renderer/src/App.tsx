import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider
} from 'react-router-dom'
import Welcome from './windows/Welcome'
import Login from './windows/Login'
import ErrorPage from './windows/ErrorPage'

// admin
import AdminLayout from './admin/windows/AdminLayout'
import AdminDashboard from './admin/windows/AdminDashboard'

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route>
        <Route path="" element={<Welcome />} />
        <Route path="login" element={<Login />} />

        {/* admin routes */}
        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
        </Route>

        {/* Error page */}
        <Route path="*" element={<ErrorPage />} />
      </Route>
    )
  )

  return <RouterProvider router={router} />
}

export default App
