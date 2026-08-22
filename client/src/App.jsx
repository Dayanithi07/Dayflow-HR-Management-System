import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import CreatePassword from './pages/CreatePassword'
import CreateEmployee from './pages/CreateEmployee'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/create-password" element={<CreatePassword />} />
        <Route path="/create-employee" element={<CreateEmployee />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
