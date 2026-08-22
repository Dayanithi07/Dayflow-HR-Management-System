import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CreatePassword from './pages/CreatePassword';
import CreateEmployee from './pages/CreateEmployee';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import TimeOff from './pages/TimeOff';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create-password" element={<CreatePassword />} />
        <Route path="/create-employee" element={<CreateEmployee />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Dashboard />} />
        <Route path="/attendance" element={<Dashboard />} />
        <Route path="/time-off" element={<Dashboard />} />
        <Route path="/leave" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/profile/:employeeId" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
