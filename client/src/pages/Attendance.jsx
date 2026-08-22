import { useState, useEffect } from 'react';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || true; // Force true for demoing admin view

  useEffect(() => {
    fetchAttendance();
  }, [search]);

  const fetchAttendance = async () => {
    try {
      // Mock data matching the wireframe
      setAttendance([
        { emp: '[Employee]', checkIn: '09:00', checkOut: '19:00', workHours: '09:00', extraHours: '01:00' },
        { emp: '[Employee]', checkIn: '10:00', checkOut: '19:00', workHours: '09:00', extraHours: '01:00' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 mx-4">
      <div className="border border-gray-600 bg-[#111111] p-4 flex flex-col gap-4">
        
        {/* Header Actions */}
        <div className="flex">
          <div className="border border-gray-600 bg-[#151515] px-4 py-1.5 flex items-center justify-center">
            <span className="font-['Indie_Flower',sans-serif] text-sm text-gray-300">Attendances</span>
          </div>
          <div className="flex-1 border border-gray-600 border-l-0">
             <input
                type="text"
                placeholder="Searchbar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-full bg-transparent text-center text-sm font-['Indie_Flower',sans-serif] text-gray-300 focus:outline-none"
             />
          </div>
        </div>

        {/* Date Navigator */}
        <div className="flex border border-gray-600 bg-[#151515] w-max">
           <button className="px-3 py-1 border-r border-gray-600 font-['Indie_Flower',sans-serif] text-gray-300 hover:text-white">&lt;-</button>
           <button className="px-3 py-1 border-r border-gray-600 font-['Indie_Flower',sans-serif] text-gray-300 hover:text-white">-&gt;</button>
           <div className="px-6 py-1 border-r border-gray-600 flex items-center justify-between min-w-[120px]">
              <span className="font-['Indie_Flower',sans-serif] text-sm text-gray-300">Date</span>
              <span className="text-xs text-gray-400">v</span>
           </div>
           <button className="px-6 py-1 font-['Indie_Flower',sans-serif] text-sm text-gray-300 hover:text-white">Day</button>
        </div>

        {/* Current Date Display */}
        <div className="text-center py-2">
           <span className="font-['Indie_Flower',sans-serif] text-sm text-white underline">22, October 2023</span>
        </div>

        {/* Table */}
        <div className="border border-gray-600 w-full overflow-hidden">
          <table className="w-full text-left text-sm font-['Indie_Flower',sans-serif]">
            <thead className="border-b border-gray-600 text-gray-300 bg-[#151515]">
              <tr>
                <th className="px-4 py-2 border-r border-gray-600 font-normal w-1/5">Emp</th>
                <th className="px-4 py-2 border-r border-gray-600 font-normal w-1/5">Check In</th>
                <th className="px-4 py-2 border-r border-gray-600 font-normal w-1/5">Check Out</th>
                <th className="px-4 py-2 border-r border-gray-600 font-normal w-1/5">Work Hours</th>
                <th className="px-4 py-2 font-normal w-1/5">Extra hours</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {attendance.map((record, i) => (
                <tr key={i} className="border-b border-gray-600 last:border-0 hover:bg-[#1a1a1a]">
                  <td className="px-4 py-3 border-r border-gray-600 text-white">{record.emp}</td>
                  <td className="px-4 py-3 border-r border-gray-600">{record.checkIn}</td>
                  <td className="px-4 py-3 border-r border-gray-600">{record.checkOut}</td>
                  <td className="px-4 py-3 border-r border-gray-600">{record.workHours}</td>
                  <td className="px-4 py-3">{record.extraHours}</td>
                </tr>
              ))}
              {/* Empty rows to match the wireframe's full height table look */}
              {[...Array(5)].map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-gray-600 last:border-0 h-10">
                  <td className="border-r border-gray-600"></td>
                  <td className="border-r border-gray-600"></td>
                  <td className="border-r border-gray-600"></td>
                  <td className="border-r border-gray-600"></td>
                  <td></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}

export default Attendance;
