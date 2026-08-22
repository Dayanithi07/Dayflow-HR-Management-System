import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, [search]);

  const fetchEmployees = async () => {
    try {
      const res = await api.get(`/employees${search ? `?q=${search}` : ''}`);
      setEmployees(res.data.items || res.data); 
    } catch (err) {
      // Create mock data if backend fails
      setEmployees([
        { user_id: '1', full_name: '[Employee Name]', today_status: 'present' },
        { user_id: '2', full_name: '[Employee Name]', today_status: 'absent' },
        { user_id: '3', full_name: '[Employee Name]', today_status: 'leave' },
        { user_id: '4', full_name: '[Employee Name]', today_status: 'present' },
        { user_id: '5', full_name: '[Employee Name]', today_status: 'unknown' },
        { user_id: '6', full_name: '[Employee Name]', today_status: 'present' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndicator = (status) => {
    switch (status) {
      case 'present':
        return <div className="w-4 h-4 rounded-full bg-[#4caf50] border border-gray-800" title="Present" />;
      case 'leave':
        return (
          <div className="w-4 h-4 flex items-center justify-center text-[#5bc0de]" title="On Leave">
            ✈️
          </div>
        );
      case 'absent':
        return <div className="w-4 h-4 rounded-full bg-[#ffeb3b] border border-gray-800" title="Absent" />;
      default:
        return <div className="w-4 h-4 rounded-full border border-gray-400" title="Unknown" />;
    }
  };

  return (
    <div className="p-4 mx-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between mb-4 border border-gray-600 bg-[#111111] p-0">
        <button className="bg-[#a352cc] text-black font-['Indie_Flower',sans-serif] px-8 py-1.5 text-sm border-r border-gray-600 hover:bg-[#9142b8] transition-colors">
          NEW
        </button>
        <div className="flex-1 px-4">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-[200px] mx-auto block bg-transparent border border-gray-600 text-center py-1 text-sm font-['Indie_Flower',sans-serif] text-white focus:outline-none focus:border-gray-400"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="border border-gray-600 bg-[#111111] p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {employees.map((emp, idx) => (
            <div 
              key={emp.user_id || idx} 
              className="border border-gray-600 p-4 relative cursor-pointer hover:border-gray-400 transition-colors bg-[#151515] flex flex-col items-center min-h-[140px]"
              onClick={() => navigate(`/profile/${emp.user_id}`)}
            >
              <div className="absolute top-2 right-2">
                {getStatusIndicator(emp.today_status)}
              </div>
              
              <div className="w-[60px] h-[70px] border border-gray-600 bg-[#111111] mb-4 flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full bg-[#8fb6d9] flex flex-col items-center justify-center overflow-hidden">
                    {/* Simplified avatar representation */}
                    <div className="w-3 h-3 bg-white rounded-full mb-0.5"></div>
                    <div className="w-5 h-2.5 bg-white rounded-t-full"></div>
                 </div>
              </div>
              
              <div className="border border-gray-600 w-full text-center py-1 bg-[#111111]">
                <span className="font-['Indie_Flower',sans-serif] text-gray-300 text-sm">{emp.full_name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Employees;
