import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Clock, ChevronRight, ChevronLeft, User, LogOut,
  Plane, Calendar, Plus, Check, X, CalendarDays, Bell,
  BarChart3, FileSpreadsheet, Download, Users
} from 'lucide-react';

const API = 'http://localhost:5000/api';
const AVATAR_COLORS = ['#714B67', '#017E84', '#e67e22', '#3498db', '#9b59b6', '#1abc9c', '#e74c3c'];

function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}
function getInitials(name) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase() || '??';
}
function formatTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}
function formatHours(h) {
  if (!h && h !== 0) return '—';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
function getTodayString() { return new Date().toISOString().split('T')[0]; }

const PUBLIC_HOLIDAYS = {
  '2026-01-26': 'Republic Day',
  '2026-03-25': 'Holi',
  '2026-04-14': 'Ambedkar Jayanti',
  '2026-05-01': 'May Day',
  '2026-08-15': 'Independence Day',
  '2026-10-02': 'Gandhi Jayanti',
  '2026-11-08': 'Diwali',
  '2026-12-25': 'Christmas',
};

function calculateAllocationDays(startDate, endDate) {
  if (!startDate || !endDate) return '00.00';
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '00.00';
  const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  return String(diffDays).padStart(2, '0') + '.00';
}

function AvatarCircle({ name, index, size = 40, avatarUrl }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className="rounded-full object-cover shrink-0"
        style={{ width: size, height: size, boxShadow: `0 2px 8px ${color}40` }}
      />
    );
  }
  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{
        width: size, height: size, backgroundColor: color,
        fontSize: size * 0.35, boxShadow: `0 2px 8px ${color}40`
      }}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }) {
  if (status === 'present') return <div className="w-2.5 h-2.5 rounded-full bg-green-400 shrink-0" title="Present" />;
  if (status === 'leave') return <Plane size={14} className="text-blue-400 shrink-0" />;
  return <div className="w-2.5 h-2.5 rounded-full bg-yellow-400 shrink-0" title="Absent" />;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   MAIN DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function Dashboard() {
  const navigate = useNavigate();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState('Employees');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Employee data
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [todayLeaves, setTodayLeaves] = useState([]);
  const [loadingEmps, setLoadingEmps] = useState(true);

  // Attendance state
  const [checkedIn, setCheckedIn] = useState(false);
  const [myAttendanceToday, setMyAttendanceToday] = useState(null);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [attendanceMonth, setAttendanceMonth] = useState(new Date());
  const [attendanceDateFilter, setAttendanceDateFilter] = useState(getTodayString());
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [attendanceView, setAttendanceView] = useState('daily'); // 'daily' | 'weekly'
  const [weeklyLogs, setWeeklyLogs] = useState([]);
  const [loadingWeekly, setLoadingWeekly] = useState(false);

  // Time Off state
  const [timeOffView, setTimeOffView] = useState('calendar');
  const [calendarYear, setCalendarYear] = useState(2026);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leaveType: 'PAID', startDate: '', endDate: '', remarks: '' });
  const [leaveAttachment, setLeaveAttachment] = useState(null);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leaveSubmitting, setLeaveSubmitting] = useState(false);

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);

  // Reports state (Admin)
  const [reportStartDate, setReportStartDate] = useState(getTodayString());
  const [reportEndDate, setReportEndDate] = useState(getTodayString());
  const [reportEmployeeId, setReportEmployeeId] = useState('all');
  const [reportData, setReportData] = useState([]);
  const [loadingReport, setLoadingReport] = useState(false);

  // Live clock
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const tick = () => setTimeStr(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* ─── Data Fetching ─── */
  const fetchEmployees = useCallback(async () => {
    try {
      const res = await fetch(`${API}/employees`, { headers: authHeaders() });
      if (res.ok) setEmployees(await res.json());
    } catch { /* silent */ } finally { setLoadingEmps(false); }
  }, []);

  const fetchTodayStatus = useCallback(async () => {
    try {
      const today = getTodayString();
      // my own attendance
      const res = await fetch(`${API}/attendance/today`, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        if (data.checkIn && !data.checkOut) setCheckedIn(true);
        else setCheckedIn(false);
        setMyAttendanceToday(data.checkIn ? data : null);
      }
      // all attendance today (for status badges)
      const attRes = await fetch(`${API}/attendance?date=${today}`, { headers: authHeaders() });
      if (attRes.ok) setTodayAttendance(await attRes.json());
      // all leaves (for status badges)
      const lvRes = await fetch(`${API}/leaves`, { headers: authHeaders() });
      if (lvRes.ok) {
        const all = await lvRes.json();
        const todayLeavesList = all.filter(l =>
          l.status === 'APPROVED' && l.startDate <= today && l.endDate >= today
        );
        setTodayLeaves(todayLeavesList);
      }
    } catch { /* silent */ }
  }, []);

  const fetchAttendanceLogs = useCallback(async () => {
    setLoadingAttendance(true);
    try {
      const params = isAdmin ? `?date=${attendanceDateFilter}` : '';
      const res = await fetch(`${API}/attendance${params}`, { headers: authHeaders() });
      if (res.ok) setAttendanceLogs(await res.json());
    } catch { /* silent */ } finally { setLoadingAttendance(false); }
  }, [isAdmin, attendanceDateFilter]);

  const fetchLeaves = useCallback(async () => {
    setLoadingLeaves(true);
    try {
      const res = await fetch(`${API}/leaves`, { headers: authHeaders() });
      if (res.ok) setLeaveRequests(await res.json());
    } catch { /* silent */ } finally { setLoadingLeaves(false); }
  }, []);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API}/notifications`, { headers: authHeaders() });
      if (res.ok) setNotifications(await res.json());
    } catch { /* silent */ }
  }, []);

  // Fetch weekly attendance
  const fetchWeeklyAttendance = useCallback(async () => {
    setLoadingWeekly(true);
    try {
      const res = await fetch(`${API}/attendance/weekly`, { headers: authHeaders() });
      if (res.ok) setWeeklyLogs(await res.json());
    } catch { /* silent */ } finally { setLoadingWeekly(false); }
  }, []);

  // Fetch report data
  const fetchReport = useCallback(async () => {
    setLoadingReport(true);
    try {
      const params = `?startDate=${reportStartDate}&endDate=${reportEndDate}&employeeId=${reportEmployeeId}`;
      const res = await fetch(`${API}/attendance/report${params}`, { headers: authHeaders() });
      if (res.ok) setReportData(await res.json());
    } catch { /* silent */ } finally { setLoadingReport(false); }
  }, [reportStartDate, reportEndDate, reportEmployeeId]);

  useEffect(() => { fetchEmployees(); fetchTodayStatus(); fetchNotifications(); }, [fetchEmployees, fetchTodayStatus, fetchNotifications]);
  useEffect(() => { if (activeTab === 'Attendance') { fetchAttendanceLogs(); if (attendanceView === 'weekly') fetchWeeklyAttendance(); } }, [activeTab, fetchAttendanceLogs, attendanceView, fetchWeeklyAttendance]);
  useEffect(() => { if (activeTab === 'Time Off') fetchLeaves(); }, [activeTab, fetchLeaves]);

  /* ─── Employee Status Helper ─── */
  function getEmployeeStatus(empId) {
    const hasAttendance = todayAttendance.find(a => a.employeeId === empId && a.status !== 'LEAVE');
    if (hasAttendance) return 'present';
    const onLeave = todayLeaves.find(l => l.employeeId === empId);
    if (onLeave) return 'leave';
    return 'absent';
  }

  /* ─── Check In / Out ─── */
  const handleToggleAttendance = async () => {
    try {
      const res = await fetch(`${API}/attendance/toggle`, { method: 'POST', headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setCheckedIn(data.action === 'CHECK_IN');
        setMyAttendanceToday(data.record);
        fetchTodayStatus();
        if (activeTab === 'Attendance') fetchAttendanceLogs();
      }
    } catch { /* silent */ }
  };

  /* ─── Leave Request Handlers ─── */
  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setLeaveSubmitting(true);
    try {
      const res = await fetch(`${API}/leaves/apply`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify(leaveForm)
      });
      if (res.ok) {
        setShowLeaveModal(false);
        setLeaveForm({ leaveType: 'PAID', startDate: '', endDate: '', remarks: '' });
        fetchLeaves();
      }
    } catch { /* silent */ } finally { setLeaveSubmitting(false); }
  };

  const handleLeaveApproval = async (id, status) => {
    try {
      await fetch(`${API}/leaves/${id}/approval`, {
        method: 'PUT', headers: authHeaders(),
        body: JSON.stringify({ status })
      });
      fetchLeaves();
      fetchTodayStatus();
    } catch { /* silent */ }
  };

  /* ─── Logout ─── */
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  /* ─── Attendance Helpers ─── */
  const myLogs = attendanceLogs.filter(a => a.employeeId === currentUser?.id);
  const selectedMonthLogs = isAdmin
    ? attendanceLogs
    : myLogs.filter(a => {
      const d = new Date(a.date);
      return d.getMonth() === attendanceMonth.getMonth() && d.getFullYear() === attendanceMonth.getFullYear();
    });

  const myPresentDays = myLogs.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
  const myLeaveDays = myLogs.filter(a => a.status === 'LEAVE').length;
  const myTotalWorkingDays = myLogs.length;

  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ─── Leave Balances ─── */
  const myLeaves = leaveRequests.filter(l => l.employeeId === currentUser?.id);
  const paidUsed = myLeaves.filter(l => l.leaveType === 'PAID' && l.status === 'APPROVED').reduce((sum, l) => {
    const s = new Date(l.startDate); const e = new Date(l.endDate);
    return sum + Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);
  const sickUsed = myLeaves.filter(l => l.leaveType === 'SICK' && l.status === 'APPROVED').reduce((sum, l) => {
    const s = new Date(l.startDate); const e = new Date(l.endDate);
    return sum + Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  }, 0);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Analytics calculations
  const presentToday = todayAttendance.filter(a => a.status === 'PRESENT' || a.status === 'HALF_DAY').length;
  const absentToday = employees.length - presentToday - todayLeaves.length;
  const pendingLeaves = leaveRequests.filter(l => l.status === 'PENDING').length;

  // CSV Export helper
  const exportCSV = () => {
    if (!reportData.length) return;
    const header = 'Employee,Employee ID,Date,Check In,Check Out,Hours,Status\n';
    const rows = reportData.map(r =>
      `"${r.employee?.name || ''}","${r.employee?.employeeId || ''}","${r.date}","${formatTime(r.checkIn)}","${formatTime(r.checkOut)}","${formatHours(r.totalHours)}","${r.status}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `attendance_report_${reportStartDate}_${reportEndDate}.csv`;
    a.click();
  };

  // Mark notification as read
  const markRead = async (nid) => {
    try {
      await fetch(`${API}/notifications/${nid}/read`, { method: 'PUT', headers: authHeaders() });
      setNotifications(prev => prev.map(n => n.id === nid ? { ...n, read: true } : n));
    } catch { /* silent */ }
  };

  const tabs = isAdmin ? ['Employees', 'Attendance', 'Time Off', 'Analytics', 'Reports'] : ['Employees', 'Attendance', 'Time Off'];

  return (
    <div className="min-h-screen font-outfit flex flex-col" style={{ background: 'linear-gradient(180deg, #714B67 0%, #5c3d54 20%, #F7F7F7 50%)' }}>
      <div className="w-full max-w-2xl lg:max-w-3xl mx-auto flex flex-col flex-1">
        {/* ─── Top Bar ─── */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/favicon.svg" alt="Dayflow" className="w-9 h-9 object-contain" />
            <div>
              <h1 className="text-white font-bold text-[15px] leading-tight">Dayflow</h1>
              <p className="text-white/60 text-[10px] font-medium">HRMS</p>
            </div>
          </div>
          {/* Notification Bell + Avatar */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowNotifPanel(!showNotifPanel)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center cursor-pointer relative"
            >
              <Bell size={18} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center cursor-pointer"
            >
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="" className="w-7 h-7 rounded-full object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white text-[11px] font-bold">
                  {getInitials(currentUser?.name || 'U')}
                </div>
              )}
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div
                  className="absolute right-0 top-11 w-48 bg-white rounded-xl py-2 z-50"
                  style={{ boxShadow: '0 10px 40px rgba(113,75,103,0.18)', border: '1px solid #f0eeef' }}
                >
                  <button
                    onClick={() => { setShowDropdown(false); navigate('/profile'); }}
                    className="w-full px-4 py-2.5 text-left text-sm text-odoo-text hover:bg-odoo-bg flex items-center gap-2.5 transition-colors"
                  >
                    <User size={16} className="text-odoo-gray" /> My Profile
                  </button>
                  <div className="border-t border-odoo-border mx-3 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                  >
                    <LogOut size={16} /> Log Out
                  </button>
                </div>
              </>
            )}
            </div>
          </div>

          {/* Notification Panel */}
          {showNotifPanel && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifPanel(false)} />
              <div
                className="absolute right-5 top-16 w-72 max-h-80 overflow-y-auto bg-white rounded-xl py-2 z-50"
                style={{ boxShadow: '0 10px 40px rgba(113,75,103,0.18)', border: '1px solid #f0eeef' }}
              >
                <div className="px-4 py-2 border-b border-odoo-border flex items-center justify-between">
                  <h4 className="text-xs font-bold text-odoo-text">Notifications</h4>
                  <span className="text-[10px] text-odoo-gray">{unreadCount} unread</span>
                </div>
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-odoo-gray py-6">No notifications yet</p>
                ) : (
                  notifications.slice(0, 15).map(n => (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`px-4 py-2.5 border-b border-odoo-border/50 cursor-pointer hover:bg-odoo-bg transition-colors ${!n.read ? 'bg-purple-50/40' : ''}`}
                    >
                      <p className="text-[11px] text-odoo-text leading-snug">{n.message}</p>
                      <p className="text-[9px] text-odoo-gray mt-0.5">{new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {/* ─── Tabs ─── */}
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

        {/* ─── Main Content Area ─── */}
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
                placeholder={activeTab === 'Employees' ? 'Search Employees' : activeTab === 'Attendance' ? 'Search Attendance' : 'Search Time Off'}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-white text-sm text-odoo-text placeholder-odoo-gray/60 font-outfit"
                style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.08)', border: '1px solid #f0eeef' }}
              />
            </div>
          </div>

        {/* ━━━ EMPLOYEES TAB ━━━ */}
        {activeTab === 'Employees' && (
          <div className="space-y-3">
            {loadingEmps ? (
              <div className="bg-white rounded-xl px-4 py-8 text-center text-odoo-gray text-sm" style={{ boxShadow: '0 2px 10px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}>
                Loading employees...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {filteredEmployees.map((emp, idx) => (
                  <div
                    key={emp.id}
                    onClick={() => navigate(`/profile/${emp.id}`)}
                    className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition-all"
                    style={{ boxShadow: '0 2px 10px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
                  >
                    <AvatarCircle name={emp.name} index={idx} size={38} avatarUrl={emp.avatarUrl} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-odoo-text truncate">{emp.name}</p>
                      <p className="text-[11px] text-odoo-gray">{emp.position} · {emp.department}</p>
                    </div>
                    <StatusBadge status={getEmployeeStatus(emp.id)} />
                    <ChevronRight size={16} className="text-odoo-gray/40" />
                  </div>
                ))}
                {filteredEmployees.length === 0 && (
                  <div className="bg-white rounded-xl px-4 py-8 text-center text-odoo-gray text-sm" style={{ boxShadow: '0 2px 10px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}>
                    No employees found
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ━━━ ATTENDANCE TAB ━━━ */}
        {activeTab === 'Attendance' && (
          <div className="space-y-4">
            {/* Clock Widget */}
            <div
              className="bg-white rounded-2xl p-6 text-center"
              style={{ boxShadow: '0 8px 30px rgba(1,126,132,0.10)', border: '1px solid #e6f5f5' }}
            >
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock size={20} className="text-odoo-teal" />
                <span className="text-3xl font-bold text-odoo-text tracking-tight">{timeStr}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <div className={`w-2 h-2 rounded-full ${checkedIn ? 'bg-green-400' : 'bg-odoo-gray/40'}`} />
                <span className="text-xs text-odoo-gray font-medium">
                  {checkedIn ? 'Checked In' : myAttendanceToday?.checkOut ? 'Checked Out for today' : 'Not Checked In'}
                </span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleToggleAttendance}
                  disabled={checkedIn || (myAttendanceToday?.checkOut)}
                  className="clay-button-teal flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  Check In
                </button>
                <button
                  onClick={handleToggleAttendance}
                  disabled={!checkedIn}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold border border-odoo-border text-odoo-text hover:bg-odoo-bg/60 transition-colors disabled:opacity-50"
                >
                  Check Out
                </button>
              </div>
            </div>

            {/* ── Employee Attendance View: Metric Cards ── */}
            {!isAdmin && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Days Present', value: myPresentDays, color: '#017E84' },
                  { label: 'Leave Days', value: myLeaveDays, color: '#e67e22' },
                  { label: 'Total Working', value: myTotalWorkingDays, color: '#714B67' },
                ].map((m, i) => (
                  <div key={i} className="bg-white rounded-xl px-3 py-3 text-center" style={{ boxShadow: '0 2px 10px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}>
                    <p className="text-2xl font-bold" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[10px] text-odoo-gray font-medium mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* ── Date Navigation (Admin) ── */}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const d = new Date(attendanceDateFilter);
                    d.setDate(d.getDate() - 1);
                    setAttendanceDateFilter(d.toISOString().split('T')[0]);
                  }}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-odoo-gray hover:text-odoo-text border border-odoo-border"
                >
                  <ChevronLeft size={16} />
                </button>
                <input
                  type="date"
                  value={attendanceDateFilter}
                  onChange={(e) => setAttendanceDateFilter(e.target.value)}
                  className="clay-input px-3 py-2 text-sm flex-1"
                />
                <button
                  onClick={() => {
                    const d = new Date(attendanceDateFilter);
                    d.setDate(d.getDate() + 1);
                    setAttendanceDateFilter(d.toISOString().split('T')[0]);
                  }}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-odoo-gray hover:text-odoo-text border border-odoo-border"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── Month Navigation (Employee) ── */}
            {!isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const d = new Date(attendanceMonth);
                    d.setMonth(d.getMonth() - 1);
                    setAttendanceMonth(d);
                  }}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-odoo-gray hover:text-odoo-text border border-odoo-border"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex-1 text-center text-sm font-semibold text-odoo-text">
                  {attendanceMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </div>
                <button
                  onClick={() => {
                    const d = new Date(attendanceMonth);
                    d.setMonth(d.getMonth() + 1);
                    setAttendanceMonth(d);
                  }}
                  className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-odoo-gray hover:text-odoo-text border border-odoo-border"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* ── Attendance Table ── */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
            >
              <div className="px-4 py-3 border-b border-odoo-border" style={{ background: 'linear-gradient(135deg, #714B67, #5c3d54)' }}>
                <h3 className="text-white font-semibold text-sm">
                  {isAdmin
                    ? `Attendance — ${new Date(attendanceDateFilter).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    : `Attendance Log`
                  }
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-odoo-border bg-odoo-bg/50">
                      {isAdmin && <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Employee</th>}
                      {!isAdmin && <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Date</th>}
                      <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Check In</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Check Out</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Work Hours</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Extra Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAttendance ? (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-odoo-gray">Loading...</td></tr>
                    ) : selectedMonthLogs.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-6 text-center text-odoo-gray">No records found</td></tr>
                    ) : (
                      selectedMonthLogs.map((a) => {
                        const extraHrs = a.totalHours > 9 ? a.totalHours - 9 : 0;
                        return (
                          <tr key={a.id} className="border-b border-odoo-border/50 hover:bg-odoo-bg/30 transition-colors">
                            {isAdmin && (
                              <td className="px-4 py-2.5 text-odoo-text font-medium">{a.employee?.name || '—'}</td>
                            )}
                            {!isAdmin && (
                              <td className="px-4 py-2.5 text-odoo-text">{a.date}</td>
                            )}
                            <td className="px-4 py-2.5 text-odoo-text">{formatTime(a.checkIn)}</td>
                            <td className="px-4 py-2.5 text-odoo-text">{formatTime(a.checkOut)}</td>
                            <td className="px-4 py-2.5 text-odoo-text font-medium">{formatHours(a.totalHours)}</td>
                            <td className="px-4 py-2.5 text-odoo-teal font-medium">{formatHours(extraHrs)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ━━━ TIME OFF TAB ━━━ */}
        {activeTab === 'Time Off' && (
          <div className="space-y-4">
            {/* Sub-bar / View Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex bg-white rounded-xl p-1 shadow-sm border border-[#f0eeef]">
                <button
                  onClick={() => setTimeOffView('calendar')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    timeOffView === 'calendar'
                      ? 'bg-odoo-purple text-white shadow-sm'
                      : 'text-odoo-gray hover:text-odoo-text'
                  }`}
                >
                  <CalendarDays size={14} className="inline mr-1.5 -mt-0.5" /> Calendar View
                </button>
                <button
                  onClick={() => setTimeOffView('list')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    timeOffView === 'list'
                      ? 'bg-odoo-purple text-white shadow-sm'
                      : 'text-odoo-gray hover:text-odoo-text'
                  }`}
                >
                  List View
                </button>
              </div>

              {/* + NEW button */}
              <button
                onClick={() => setShowLeaveModal(true)}
                className="clay-button-purple px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus size={15} /> NEW
              </button>
            </div>

            {/* Leave Balance Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div
                className="bg-white rounded-xl p-4 text-center"
                style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
              >
                <p className="text-2xl font-bold text-odoo-teal">{Math.max(0, 24 - paidUsed)}</p>
                <p className="text-[11px] text-odoo-gray font-medium mt-0.5">Paid Time Off</p>
                <p className="text-[10px] text-odoo-gray/60">Days Available</p>
              </div>
              <div
                className="bg-white rounded-xl p-4 text-center"
                style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
              >
                <p className="text-2xl font-bold text-odoo-purple">{Math.max(0, 7 - sickUsed)}</p>
                <p className="text-[11px] text-odoo-gray font-medium mt-0.5">Sick Time Off</p>
                <p className="text-[10px] text-odoo-gray/60">Days Available</p>
              </div>
            </div>

            {/* ─── CALENDAR VIEW ─── */}
            {timeOffView === 'calendar' && (
              <div
                className="bg-white rounded-2xl p-5"
                style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
              >
                {/* Year Header & Controls */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-odoo-border">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCalendarYear(y => y - 1)}
                      className="w-7 h-7 rounded-lg bg-odoo-bg flex items-center justify-center text-odoo-gray hover:text-odoo-text transition-colors"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <h3 className="text-base font-bold text-odoo-text">{calendarYear} Year Overview</h3>
                    <button
                      onClick={() => setCalendarYear(y => y + 1)}
                      className="w-7 h-7 rounded-lg bg-odoo-bg flex items-center justify-center text-odoo-gray hover:text-odoo-text transition-colors"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[11px]">
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-odoo-teal inline-block" />
                      <span className="text-odoo-gray">Leave (Approved)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 inline-block" />
                      <span className="text-odoo-gray">In Progress</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
                      <span className="text-odoo-gray">Public Holiday</span>
                    </div>
                  </div>
                </div>

                {/* 12 Months Mini-Calendar Matrix */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((monthIdx) => {
                    const monthName = new Date(calendarYear, monthIdx, 1).toLocaleString('en-US', { month: 'short' });
                    const daysInMonth = new Date(calendarYear, monthIdx + 1, 0).getDate();
                    const firstDayOfWeek = new Date(calendarYear, monthIdx, 1).getDay();

                    return (
                      <div key={monthIdx} className="bg-odoo-bg/40 rounded-xl p-2.5 border border-odoo-border/40">
                        <p className="text-xs font-bold text-odoo-text text-center mb-1.5">{monthName} {calendarYear}</p>
                        <div className="grid grid-cols-7 gap-0.5 text-[9px] text-center text-odoo-gray mb-1">
                          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                        <div className="grid grid-cols-7 gap-0.5 text-[10px]">
                          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-5" />
                          ))}
                          {Array.from({ length: daysInMonth }).map((_, i) => {
                            const dayNum = i + 1;
                            const dateStr = `${calendarYear}-${String(monthIdx + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                            
                            // Check for leave or holiday
                            const matchingLeave = myLeaves.find(l => dateStr >= l.startDate && dateStr <= l.endDate);
                            const isHoliday = PUBLIC_HOLIDAYS[dateStr];

                            let cellStyle = 'text-odoo-text hover:bg-white';
                            let title = '';

                            if (matchingLeave) {
                              if (matchingLeave.status === 'APPROVED') {
                                cellStyle = 'bg-odoo-teal text-white font-bold rounded-full';
                                title = `${matchingLeave.leaveType} Leave (Approved)`;
                              } else if (matchingLeave.status === 'PENDING') {
                                cellStyle = 'bg-yellow-400 text-white font-bold rounded-full';
                                title = `${matchingLeave.leaveType} Leave (Pending)`;
                              }
                            } else if (isHoliday) {
                              cellStyle = 'bg-red-400 text-white font-bold rounded-full';
                              title = `Public Holiday: ${isHoliday}`;
                            }

                            return (
                              <div
                                key={dayNum}
                                title={title || dateStr}
                                className={`h-5 flex items-center justify-center transition-colors cursor-pointer text-[10px] ${cellStyle}`}
                              >
                                {dayNum}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Public Holidays List */}
                <div className="mt-4 pt-3 border-t border-odoo-border">
                  <h4 className="text-xs font-semibold text-odoo-text mb-2">Public Holidays ({calendarYear})</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(PUBLIC_HOLIDAYS).map(([date, title]) => (
                      <div key={date} className="flex items-center gap-2 text-[11px] text-odoo-gray">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                        <span className="font-medium text-odoo-text">{date.split('-').slice(1).join('/')}:</span>
                        <span className="truncate">{title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TIME OFF REQUEST MODAL ─── */}
            {showLeaveModal && (
              <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4" onClick={() => setShowLeaveModal(false)}>
                <div
                  className="bg-white rounded-2xl w-full max-w-[460px] p-6"
                  style={{ boxShadow: '0 20px 60px rgba(113,75,103,0.2)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-odoo-border">
                    <h3 className="text-base font-bold text-odoo-text">Time off Type Request</h3>
                    <button onClick={() => setShowLeaveModal(false)} className="text-odoo-gray hover:text-odoo-text">
                      <X size={18} />
                    </button>
                  </div>

                  <form onSubmit={handleLeaveSubmit} className="space-y-4 text-sm">
                    {/* Employee Field */}
                    <div className="flex items-center justify-between py-1 border-b border-odoo-border/60">
                      <span className="font-medium text-odoo-gray">Employee:</span>
                      <span className="font-semibold text-odoo-text">{currentUser?.name || 'Current User'}</span>
                    </div>

                    {/* Time off Type */}
                    <div className="flex items-center justify-between py-1 border-b border-odoo-border/60">
                      <span className="font-medium text-odoo-gray">Time off Type:</span>
                      <select
                        value={leaveForm.leaveType}
                        onChange={(e) => setLeaveForm(p => ({ ...p, leaveType: e.target.value }))}
                        className="clay-input px-3 py-1.5 text-xs text-odoo-text font-medium"
                      >
                        <option value="PAID">Paid Time off</option>
                        <option value="SICK">Sick Leave</option>
                        <option value="UNPAID">Unpaid Leaves</option>
                      </select>
                    </div>

                    {/* Validity Period */}
                    <div>
                      <span className="block font-medium text-odoo-gray mb-1.5">Validity Period:</span>
                      <div className="grid grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] text-odoo-gray block mb-0.5">Start Date</label>
                          <input
                            type="date"
                            value={leaveForm.startDate}
                            onChange={(e) => setLeaveForm(p => ({ ...p, startDate: e.target.value }))}
                            className="clay-input w-full px-3 py-2 text-xs"
                            required
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-odoo-gray block mb-0.5">End Date</label>
                          <input
                            type="date"
                            value={leaveForm.endDate}
                            onChange={(e) => setLeaveForm(p => ({ ...p, endDate: e.target.value }))}
                            className="clay-input w-full px-3 py-2 text-xs"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Allocation Days Display */}
                    <div className="flex items-center justify-between py-2 px-3 bg-odoo-bg rounded-xl">
                      <span className="font-medium text-odoo-gray">Allocation:</span>
                      <span className="font-bold text-odoo-purple">
                        {calculateAllocationDays(leaveForm.startDate, leaveForm.endDate)} Days
                      </span>
                    </div>

                    {/* Attachment (for sick leave certificate) */}
                    <div>
                      <span className="block font-medium text-odoo-gray mb-1">Attachment:</span>
                      <label className="border border-dashed border-odoo-border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer hover:border-odoo-purple/50 bg-odoo-bg/40 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#714B67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <span className="text-xs text-odoo-gray">
                          {leaveAttachment ? leaveAttachment.name : '(For sick leave certificate)'}
                        </span>
                        <input
                          type="file"
                          accept=".pdf,image/*"
                          onChange={(e) => setLeaveAttachment(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Remarks */}
                    <div>
                      <span className="block font-medium text-odoo-gray mb-1">Remarks:</span>
                      <textarea
                        value={leaveForm.remarks}
                        onChange={(e) => setLeaveForm(p => ({ ...p, remarks: e.target.value }))}
                        className="clay-input w-full px-3 py-2 text-xs resize-none"
                        rows={2}
                        placeholder="Reason for time off..."
                      />
                    </div>

                    {/* Submit & Discard Action Buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={leaveSubmitting}
                        className="clay-button-purple flex-1 py-2.5 rounded-xl text-xs font-semibold disabled:opacity-60"
                      >
                        {leaveSubmitting ? 'Submitting...' : 'Submit'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLeaveModal(false);
                          setLeaveAttachment(null);
                        }}
                        className="flex-1 py-2.5 rounded-xl text-xs font-semibold border border-odoo-border text-odoo-text hover:bg-odoo-bg transition-colors"
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* ─── LIST VIEW (Leave Requests Table) ─── */}
            {timeOffView === 'list' && (
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
              >
                <div className="px-4 py-3 border-b border-odoo-border" style={{ background: 'linear-gradient(135deg, #714B67, #5c3d54)' }}>
                  <h3 className="text-white font-semibold text-sm">Leave Requests</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-odoo-border bg-odoo-bg/50">
                        {isAdmin && <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Employee</th>}
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Start</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">End</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Type</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Status</th>
                        {isAdmin && <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {loadingLeaves ? (
                        <tr><td colSpan={6} className="px-4 py-6 text-center text-odoo-gray">Loading...</td></tr>
                      ) : leaveRequests.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-6 text-center text-odoo-gray">No leave requests</td></tr>
                      ) : (
                        leaveRequests.map((l) => (
                          <tr key={l.id} className="border-b border-odoo-border/50 hover:bg-odoo-bg/30 transition-colors">
                            {isAdmin && <td className="px-4 py-2.5 text-odoo-text font-medium">{l.employee?.name || '—'}</td>}
                            <td className="px-4 py-2.5 text-odoo-text">{l.startDate}</td>
                            <td className="px-4 py-2.5 text-odoo-text">{l.endDate}</td>
                            <td className="px-4 py-2.5">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                l.leaveType === 'PAID' ? 'bg-odoo-teal-light text-odoo-teal' :
                                l.leaveType === 'SICK' ? 'bg-red-50 text-red-500' :
                                'bg-yellow-50 text-yellow-600'
                              }`}>
                                {l.leaveType === 'PAID' ? 'Paid time off' : l.leaveType === 'SICK' ? 'Sick Leave' : 'Unpaid Leaves'}
                              </span>
                            </td>
                            <td className="px-4 py-2.5">
                              <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                l.status === 'APPROVED' ? 'bg-green-50 text-green-600' :
                                l.status === 'REJECTED' ? 'bg-red-50 text-red-500' :
                                'bg-yellow-50 text-yellow-600'
                              }`}>
                                {l.status}
                              </span>
                            </td>
                            {isAdmin && (
                              <td className="px-4 py-2.5">
                                {l.status === 'PENDING' && (
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleLeaveApproval(l.id, 'APPROVED')}
                                      className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all"
                                      title="Approve"
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button
                                      onClick={() => handleLeaveApproval(l.id, 'REJECTED')}
                                      className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all"
                                      title="Reject"
                                    >
                                      <X size={14} />
                                    </button>
                                  </div>
                                )}
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ━━━ ANALYTICS TAB (Admin Only) ━━━ */}
        {activeTab === 'Analytics' && isAdmin && (
          <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total Employees', value: employees.length, icon: Users, color: '#714B67', bg: '#f3eef2' },
                { label: 'Present Today', value: presentToday, icon: Check, color: '#017E84', bg: '#e6f5f5' },
                { label: 'Absent Today', value: Math.max(0, absentToday), icon: X, color: '#e74c3c', bg: '#fde8e8' },
                { label: 'On Leave Today', value: todayLeaves.length, icon: Plane, color: '#3498db', bg: '#e8f4fd' },
                { label: 'Pending Leaves', value: pendingLeaves, icon: Clock, color: '#f39c12', bg: '#fef9e7' },
                { label: 'Attendance Rate', value: employees.length > 0 ? Math.round((presentToday / employees.length) * 100) + '%' : '0%', icon: BarChart3, color: '#714B67', bg: '#f3eef2' },
              ].map((card, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl px-4 py-3.5 flex items-center gap-3"
                  style={{ boxShadow: '0 2px 10px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: card.bg }}
                  >
                    <card.icon size={18} style={{ color: card.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] text-odoo-gray font-medium">{card.label}</p>
                    <p className="text-lg font-bold text-odoo-text">{card.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity Feed */}
            <div
              className="bg-white rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
            >
              <div className="px-4 py-3 border-b border-odoo-border" style={{ background: 'linear-gradient(135deg, #714B67, #5c3d54)' }}>
                <h3 className="text-white font-semibold text-sm">Recent Activity</h3>
              </div>
              <div className="divide-y divide-odoo-border/50 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-center text-xs text-odoo-gray py-6">No recent activity</p>
                ) : (
                  notifications.slice(0, 10).map(n => (
                    <div key={n.id} className="px-4 py-2.5 hover:bg-odoo-bg/30 transition-colors">
                      <p className="text-[11px] text-odoo-text">{n.message}</p>
                      <p className="text-[9px] text-odoo-gray mt-0.5">
                        {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ━━━ REPORTS TAB (Admin Only) ━━━ */}
        {activeTab === 'Reports' && isAdmin && (
          <div className="space-y-4">
            {/* Report Filters */}
            <div
              className="bg-white rounded-2xl p-4"
              style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
            >
              <h3 className="text-sm font-bold text-odoo-text mb-3">Attendance Report Builder</h3>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-semibold text-odoo-gray mb-1">Employee</label>
                  <select
                    value={reportEmployeeId}
                    onChange={(e) => setReportEmployeeId(e.target.value)}
                    className="clay-input w-full px-2 py-1.5 text-xs"
                  >
                    <option value="all">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-odoo-gray mb-1">Start Date</label>
                  <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="clay-input w-full px-2 py-1.5 text-xs" />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-odoo-gray mb-1">End Date</label>
                  <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="clay-input w-full px-2 py-1.5 text-xs" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={fetchReport}
                  disabled={loadingReport}
                  className="clay-button-purple px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 disabled:opacity-60"
                >
                  <FileSpreadsheet size={14} /> {loadingReport ? 'Loading...' : 'Generate Report'}
                </button>
                {reportData.length > 0 && (
                  <button
                    onClick={exportCSV}
                    className="px-4 py-2 rounded-xl text-xs font-semibold border border-odoo-border text-odoo-teal hover:bg-odoo-teal-light flex items-center gap-1.5 transition-colors"
                  >
                    <Download size={14} /> Export CSV
                  </button>
                )}
              </div>
            </div>

            {/* Report Results Table */}
            {reportData.length > 0 && (
              <div
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: '0 4px 16px rgba(113,75,103,0.06)', border: '1px solid #f0eeef' }}
              >
                <div className="px-4 py-3 border-b border-odoo-border" style={{ background: 'linear-gradient(135deg, #714B67, #5c3d54)' }}>
                  <h3 className="text-white font-semibold text-sm">Report Results ({reportData.length} records)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-odoo-border bg-odoo-bg/50">
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Employee</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Date</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Check In</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Check Out</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Hours</th>
                        <th className="text-left px-4 py-2.5 font-semibold text-odoo-text text-xs">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.map((r) => (
                        <tr key={r.id} className="border-b border-odoo-border/50 hover:bg-odoo-bg/30 transition-colors">
                          <td className="px-4 py-2.5 text-odoo-text font-medium">{r.employee?.name || '—'}</td>
                          <td className="px-4 py-2.5 text-odoo-text">{r.date}</td>
                          <td className="px-4 py-2.5 text-odoo-text">{formatTime(r.checkIn)}</td>
                          <td className="px-4 py-2.5 text-odoo-text">{formatTime(r.checkOut)}</td>
                          <td className="px-4 py-2.5 text-odoo-text font-medium">{formatHours(r.totalHours)}</td>
                          <td className="px-4 py-2.5">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                              r.status === 'PRESENT' ? 'bg-green-50 text-green-600' :
                              r.status === 'HALF_DAY' ? 'bg-yellow-50 text-yellow-600' :
                              r.status === 'LEAVE' ? 'bg-blue-50 text-blue-500' :
                              'bg-red-50 text-red-500'
                            }`}>
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  </div>
  );
}

export default Dashboard;
