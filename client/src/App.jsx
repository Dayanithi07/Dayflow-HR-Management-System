import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Profile from './pages/Profile';
import Attendance from './pages/Attendance';
import TimeOff from './pages/TimeOff';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <BrowserRouter>
      <Routes>
<<<<<<< HEAD
        <Route path="/" element={<Login />} />
        <Route path="/create-password" element={<CreatePassword />} />
        <Route path="/create-employee" element={<CreateEmployee />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  )
=======
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<RequireAuth />}>
          <Route path="/" element={<Navigate to="/employees" replace />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:employeeId" element={<Profile />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<TimeOff />} />
          <Route path="/payroll" element={<div className="p-8 text-center">Payroll feature coming soon</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
>>>>>>> e6474b0 (feat: implement authentication flow, protected routes, and core HR management pages with updated theme styling)
}

export default App;
