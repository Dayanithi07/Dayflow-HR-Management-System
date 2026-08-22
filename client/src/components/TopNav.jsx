import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import api from '../lib/api';

function TopNav() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getTabClass = (path) => {
    const isActive = location.pathname.startsWith(path);
    if (isActive) {
      return `px-4 py-1.5 text-sm font-['Indie_Flower',sans-serif] bg-[#1e4a6d] text-white border-r border-gray-600`;
    }
    return `px-4 py-1.5 text-sm font-['Indie_Flower',sans-serif] text-gray-300 hover:text-white border-r border-gray-600 transition-colors`;
  };

  return (
    <div className="h-10 border border-gray-600 bg-[#111111] flex items-center justify-between mx-4 mt-4">
      <div className="flex items-center h-full">
        {/* Logo */}
        <div className="px-4 border-r border-gray-600 h-full flex items-center justify-center cursor-pointer" onClick={() => navigate('/')}>
          <span className="font-['Indie_Flower',sans-serif] text-sm text-gray-300 tracking-tight">Company Logo</span>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center h-full">
          <NavLink to="/employees" className={() => getTabClass('/employees')}>
            Employees
          </NavLink>
          <NavLink to="/attendance" className={() => getTabClass('/attendance')}>
            Attendance
          </NavLink>
          <NavLink to="/leave" className={() => getTabClass('/leave')}>
            Time Off
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center h-full">
        {/* User Dropdown */}
        <div className="relative h-full flex items-center px-4 border-l border-gray-600" ref={dropdownRef}>
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-6 h-6 rounded-full bg-[#f4877e] flex items-center justify-center text-white focus:outline-none"
          >
            {user?.profile?.profile_picture_url ? (
               <img src={user.profile.profile_picture_url} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : null}
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 border border-gray-600 bg-[#151515] text-white z-50">
              <button 
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                className="w-full text-left px-4 py-2 text-sm font-['Indie_Flower',sans-serif] hover:bg-gray-800 border-b border-gray-600"
              >
                My Profile
              </button>
              
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm font-['Indie_Flower',sans-serif] hover:bg-gray-800"
              >
                Log Out
              </button>
            </div>
          )}
          
          {/* Check In / Out Menu (as shown in wireframe next to dropdown) */}
          {dropdownOpen && (
             <div className="absolute right-0 top-[110px] w-32 border border-gray-600 bg-[#151515] text-white z-50">
               <button 
                  onClick={() => setIsCheckedIn(true)}
                  className="w-full text-left px-4 py-2 text-sm font-['Indie_Flower',sans-serif] hover:bg-gray-800 border-b border-gray-600 flex justify-between"
                >
                  Check IN {`->`}
                </button>
                <div className="px-4 py-2 text-xs font-['Indie_Flower',sans-serif] text-gray-500 border-b border-gray-600">
                  {isCheckedIn ? 'Since 09:00AM' : 'Not Checked In'}
                </div>
                <button 
                  onClick={() => setIsCheckedIn(false)}
                  className="w-full text-left px-4 py-2 text-sm font-['Indie_Flower',sans-serif] hover:bg-gray-800 flex justify-between"
                >
                  Check Out {`->`}
                </button>
             </div>
          )}
        </div>
        
        {/* Small Navy Accent Block */}
        <div className="w-8 h-full bg-[#1e4a6d] border-l border-gray-600"></div>
      </div>
    </div>
  );
}

export default TopNav;
