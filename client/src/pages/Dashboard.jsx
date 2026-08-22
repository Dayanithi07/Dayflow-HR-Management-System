import { useState } from 'react';
import { Search, Clock, Settings, ChevronRight } from 'lucide-react';

const EMPLOYEE_DATA = [
  { id: 1, name: 'Sarah Jenkins', role: 'Software Engineer', avatar: null, checkedIn: true },
  { id: 2, name: 'Luria Jukenson', role: 'Software Engineer', avatar: null, checkedIn: false },
  { id: 3, name: 'Sarah Jandrs', role: 'Software Engineer', avatar: null, checkedIn: false },
  { id: 4, name: 'Ellian Molnesi', role: 'Software Engineer', avatar: null, checkedIn: true },
  { id: 5, name: 'Sarath Matlin', role: 'Software Engineer', avatar: null, checkedIn: false },
  { id: 6, name: 'Lulia Pumer', role: 'Software Engineer', avatar: null, checkedIn: true },
  { id: 7, name: 'Mavela Jordes', role: 'Software Engineer', avatar: null, checkedIn: false },
];

const ATTENDANCE_DATA = [
  { id: 1, name: 'Sarah Jenkins', role: 'Software Engineer', avatar: null },
  { id: 2, name: 'Luria Jukenson', role: 'Software Engineer', avatar: null },
  { id: 3, name: 'Sarah Jandrs', role: 'Software Engineer', avatar: null },
  { id: 4, name: 'Ellian Molnesi', role: 'Software Engineer', avatar: null },
];

const AVATAR_COLORS = ['#714B67', '#017E84', '#e67e22', '#3498db', '#9b59b6', '#1abc9c', '#e74c3c'];

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

function AvatarCircle({ name, index, size = 40 }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: color,
        fontSize: size * 0.35,
        boxShadow: `0 2px 8px ${color}40`
      }}
    >
      {getInitials(name)}
    </div>
  );
}

function Dashboard() {
  const [activeTab, setActiveTab] = useState('Employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedIn, setCheckedIn] = useState(false);

  const tabs = ['Employees', 'Attendance', 'Time Off'];

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const filteredEmployees = EMPLOYEE_DATA.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen font-outfit flex flex-col" style={{ background: 'linear-gradient(180deg, #714B67 0%, #5c3d54 25%, #F7F7F7 55%)' }}>
      {/* Top Bar */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="Dayflow" className="w-9 h-9 object-contain" />
          <div>
            <h1 className="text-white font-bold text-[15px] leading-tight">Dayflow</h1>
            <p className="text-white/60 text-[10px] font-medium">HRMS</p>
          </div>
        </div>
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white text-[11px] font-bold">
            AD
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex bg-white/15 backdrop-blur-sm rounded-xl p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-white text-odoo-text shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 px-4 pb-20">
        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-odoo-gray" />
            <input
              id="employee-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Employees"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-sm text-odoo-text placeholder-odoo-gray/60 font-outfit"
              style={{
                boxShadow: '0 4px 16px rgba(113,75,103,0.08)',
                border: '1px solid #f0eeef'
              }}
            />
          </div>
        </div>

        {activeTab === 'Employees' && (
          <div className="space-y-3">
            {/* Employee List — Left Column */}
            <div className="grid grid-cols-1 gap-2.5">
              {filteredEmployees.map((emp, idx) => (
                <div
                  key={emp.id}
                  className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
                  style={{
                    boxShadow: '0 2px 10px rgba(113,75,103,0.06)',
                    border: '1px solid #f0eeef'
                  }}
                >
                  <AvatarCircle name={emp.name} index={idx} size={38} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-odoo-text truncate">{emp.name}</p>
                    <p className="text-[11px] text-odoo-gray">{emp.role}</p>
                  </div>
                  <ChevronRight size={16} className="text-odoo-gray/40" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="space-y-4">
            {/* Clock Widget */}
            <div
              className="bg-white rounded-2xl p-6 text-center"
              style={{
                boxShadow: '0 8px 30px rgba(1,126,132,0.10)',
                border: '1px solid #e6f5f5'
              }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={20} className="text-odoo-teal" />
                <span className="text-3xl font-bold text-odoo-text tracking-tight">{timeStr}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <div className={`w-2 h-2 rounded-full ${checkedIn ? 'bg-green-400' : 'bg-odoo-gray/40'}`} />
                <span className="text-xs text-odoo-gray font-medium">
                  {checkedIn ? 'Checked In' : 'Not Checked In'}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setCheckedIn(true)}
                  disabled={checkedIn}
                  className="clay-button-teal flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  Check In
                </button>
                <button
                  onClick={() => setCheckedIn(false)}
                  disabled={!checkedIn}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-odoo-border text-odoo-text hover:bg-odoo-bg/60 transition-colors disabled:opacity-50"
                >
                  Check Out
                </button>
              </div>
            </div>

            {/* Attendance List */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-odoo-text px-1">Today's Attendance</h3>
              {ATTENDANCE_DATA.map((emp, idx) => (
                <div
                  key={emp.id}
                  className="bg-white rounded-xl px-4 py-3 flex items-center gap-3"
                  style={{
                    boxShadow: '0 2px 10px rgba(113,75,103,0.06)',
                    border: '1px solid #f0eeef'
                  }}
                >
                  <AvatarCircle name={emp.name} index={idx} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-odoo-text truncate">{emp.name}</p>
                    <p className="text-[11px] text-odoo-gray">{emp.role}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Time Off' && (
          <div className="space-y-4">
            <div
              className="bg-white rounded-2xl p-6 text-center"
              style={{
                boxShadow: '0 8px 30px rgba(113,75,103,0.08)',
                border: '1px solid #f0eeef'
              }}
            >
              <h3 className="text-lg font-semibold text-odoo-text mb-2">Time Off Requests</h3>
              <p className="text-sm text-odoo-gray">No pending requests</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-odoo-border py-3 px-6"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center justify-center max-w-[440px] mx-auto">
          <button className="flex items-center gap-1.5 text-odoo-gray hover:text-odoo-text transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
