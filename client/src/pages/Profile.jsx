import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, MapPin, Users,
  Copy, Plus, Trash2, Settings, Home, Eye, EyeOff, ArrowRight,
  CalendarDays, CreditCard, Shield, FileText, Lock
} from 'lucide-react';

const API = 'http://localhost:5000/api';
function getToken() { return localStorage.getItem('token'); }
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
}
function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = getUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const isSelf = !id || id === currentUser?.id;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const tabs = isSelf
    ? ['Resume', 'Private Info', ...(isAdmin ? ['Salary Info'] : []), 'Security']
    : ['Resume', 'Private Info', ...(isAdmin ? ['Salary Info'] : [])];

  const [activeTab, setActiveTab] = useState(isAdmin ? 'Salary Info' : 'Private Info');

  /* ─── Fetch Profile ─── */
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const endpoint = isSelf ? `${API}/auth/me` : `${API}/employees/${id}`;
        const res = await fetch(endpoint, { headers: authHeaders() });
        if (res.ok) setProfile(await res.json());
      } catch { /* silent */ } finally { setLoading(false); }
    };
    fetchProfile();
  }, [id, isSelf]);

  /* ─── Salary Auto-Calculation Engine ─── */
  const monthWage = profile?.baseSalary || 50000;
  const salary = useMemo(() => {
    const basic = monthWage * 0.50;
    const hra = basic * 0.50;
    const standardAllowance = monthWage * 0.0833;
    const performanceBonus = monthWage * 0.0583;
    const lta = monthWage * 0.0583;
    const totalComponents = basic + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = Math.max(0, monthWage - totalComponents);

    const pfEmployee = basic * 0.12;
    const pfEmployer = basic * 0.12;
    const professionalTax = 200;

    const grossSalary = monthWage;
    const totalDeductions = pfEmployee + professionalTax;
    const netSalary = grossSalary - totalDeductions;

    return {
      monthWage,
      yearlyWage: monthWage * 12,
      components: [
        { name: 'Basic Salary', percent: '50%', desc: 'Monthly Basic', amount: basic },
        { name: 'House Rent Allowance', percent: '25%', desc: '50% of Basic', amount: hra },
        { name: 'Standard Allowance', percent: '8.33%', desc: 'Monthly Std.', amount: standardAllowance },
        { name: 'Performance Bonus', percent: '5.83%', desc: 'Monthly Bonus', amount: performanceBonus },
        { name: 'Leave Travel Allowance', percent: '5.83%', desc: 'LTA', amount: lta },
        { name: 'Fixed Allowance', percent: ((fixedAllowance / monthWage) * 100).toFixed(2) + '%', desc: 'Remainder', amount: fixedAllowance },
      ],
      deductions: {
        'Provident Fund (PF) Contribution': [
          { name: 'Employee PF (12% of Basic)', amount: pfEmployee },
          { name: 'Employer PF (12% of Basic)', amount: pfEmployer },
        ],
        'Tax Deductions': [
          { name: 'Professional Tax', amount: professionalTax },
        ],
      },
      netSalary,
      totalDeductions,
    };
  }, [monthWage]);

  /* ─── Change Password State (Security Tab) ─── */
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwError('Passwords do not match'); return; }
    if (pwForm.newPassword.length < 8) { setPwError('Password must be at least 8 characters'); return; }
    setPwLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-password`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword })
      });
      const data = await res.json();
      if (!res.ok) { setPwError(data.message || 'Failed'); return; }
      setPwSuccess('Password updated successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch { setPwError('Unable to connect to server'); } finally { setPwLoading(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-odoo-bg font-outfit flex items-center justify-center">
        <p className="text-odoo-gray text-sm">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-odoo-bg font-outfit flex items-center justify-center">
        <p className="text-odoo-gray text-sm">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-odoo-bg font-outfit pb-24">
      {/* Header */}
      <div className="bg-white border-b border-odoo-border px-5 py-4">
        <div className="max-w-[600px] mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-8 h-8 rounded-lg bg-odoo-bg flex items-center justify-center text-odoo-gray hover:text-odoo-text transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-lg font-bold text-odoo-text">{isSelf ? 'My Profile' : profile.name}</h1>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-4 pt-5 space-y-4">
        {/* Profile Card */}
        <div
          className="bg-white rounded-2xl p-5"
          style={{
            boxShadow: '0 10px 40px -10px rgba(113,75,103,0.10), 0 4px 12px -4px rgba(113,75,103,0.05)',
            border: '1px solid #f0eeef'
          }}
        >
          <div className="flex items-start gap-4">
            {/* Avatar */}
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-16 h-16 rounded-full object-cover shrink-0" style={{ boxShadow: '0 4px 12px rgba(113,75,103,0.2)' }} />
            ) : (
              <div
                className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white text-xl font-bold shrink-0"
                style={{ boxShadow: '0 4px 12px rgba(113,75,103,0.2)' }}
              >
                {profile.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-odoo-text">{profile.name}</h2>
              <div className="space-y-0.5 mt-1">
                <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                  <FileText size={12} /> Position: <span className="font-medium text-odoo-text">{profile.position || '—'}</span>
                </p>
                <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                  <Mail size={12} /> Email: <span className="font-medium text-odoo-text">{profile.email}</span>
                </p>
                <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                  <Phone size={12} /> Mobile: <span className="font-medium text-odoo-text">{profile.phone || '—'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Info Chips */}
          <div className="grid grid-cols-4 gap-2.5 mt-5">
            {[
              { icon: Building2, label: 'Company:', value: 'Dayflow HRMS' },
              { icon: Users, label: 'Department:', value: profile.department || '—' },
              { icon: Users, label: 'Manager:', value: '—' },
              { icon: MapPin, label: 'Location:', value: profile.address?.split(',').pop()?.trim() || '—' },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl px-3 py-2.5 text-center"
                style={{ border: '1px solid #e2e8f0', background: '#fafafa' }}
              >
                <p className="text-[10px] text-odoo-gray leading-tight">{item.label}</p>
                <p className="text-[12px] font-semibold text-odoo-text mt-0.5 leading-tight truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-odoo-border bg-white rounded-t-xl overflow-hidden">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                activeTab === tab
                  ? 'text-odoo-text'
                  : 'text-odoo-gray hover:text-odoo-text'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-1/4 right-1/4 h-[2.5px] bg-odoo-purple rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* ━━━ RESUME TAB ━━━ */}
        {activeTab === 'Resume' && (
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 8px 30px rgba(113,75,103,0.08)', border: '1px solid #f0eeef' }}
          >
            <h3 className="text-lg font-semibold text-odoo-text mb-4">Resume</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-odoo-text mb-2">About</h4>
                <p className="text-xs text-odoo-gray leading-relaxed">
                  {profile.name} works as {profile.position || 'a team member'} in the {profile.department || 'company'} department.
                </p>
              </div>
              <div className="border-t border-odoo-border pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-odoo-text">Skills</h4>
                  {isSelf && (
                    <button className="text-odoo-teal text-xs font-semibold flex items-center gap-0.5 hover:text-odoo-teal-hover transition-colors">
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-odoo-gray mt-2">No skills added yet</p>
              </div>
              <div className="border-t border-odoo-border pt-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-odoo-text">Certifications</h4>
                  {isSelf && (
                    <button className="text-odoo-teal text-xs font-semibold flex items-center gap-0.5 hover:text-odoo-teal-hover transition-colors">
                      <Plus size={14} /> Add
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-odoo-gray mt-2">No certifications added yet</p>
              </div>
            </div>
          </div>
        )}

        {/* ━━━ PRIVATE INFO TAB ━━━ */}
        {activeTab === 'Private Info' && (
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 8px 30px rgba(113,75,103,0.08)', border: '1px solid #f0eeef' }}
          >
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {/* Personal Info Column */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-odoo-text border-b border-odoo-border pb-2">Personal Information</h4>
                {[
                  { label: 'Date of Birth', value: '—' },
                  { label: 'Residing Address', value: profile.address || '—' },
                  { label: 'Nationality', value: '—' },
                  { label: 'Personal Email', value: profile.email || '—' },
                  { label: 'Gender', value: '—' },
                  { label: 'Marital Status', value: '—' },
                  { label: 'Date of Joining', value: profile.joinDate ? new Date(profile.joinDate).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—' },
                ].map((field, i) => (
                  <div key={i}>
                    <p className="text-[11px] text-odoo-gray font-medium">{field.label}</p>
                    <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{field.value}</p>
                  </div>
                ))}
              </div>

              {/* Bank & Work Details Column */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-odoo-text border-b border-odoo-border pb-2">Bank & Work Details</h4>
                {[
                  { label: 'Account Number', value: '—' },
                  { label: 'Bank Name', value: '—' },
                  { label: 'IFSC Code', value: '—' },
                  { label: 'PAN No', value: '—' },
                  { label: 'UAN No', value: '—' },
                  { label: 'Emp Code', value: profile.employeeId || '—' },
                ].map((field, i) => (
                  <div key={i}>
                    <p className="text-[11px] text-odoo-gray font-medium">{field.label}</p>
                    <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{field.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ━━━ SALARY INFO TAB (Admin Only) ━━━ */}
        {activeTab === 'Salary Info' && isAdmin && (
          <div className="space-y-4">
            {/* Salary Overview Card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: '0 8px 30px rgba(113,75,103,0.08)', border: '1px solid #f0eeef' }}
            >
              <div className="px-5 py-3" style={{ background: 'linear-gradient(135deg, #714B67, #5c3d54)' }}>
                <h3 className="text-white font-semibold text-sm">Salary Info</h3>
              </div>
              <div className="bg-white p-4">
                <div
                  className="grid grid-cols-4 gap-3 rounded-xl p-3"
                  style={{ background: '#faf8f9', border: '1px solid #f0eeef' }}
                >
                  {[
                    { label: 'Month Wage:', value: `₹${salary.monthWage.toLocaleString('en-IN')}` },
                    { label: 'Yearly Wage:', value: `₹${salary.yearlyWage.toLocaleString('en-IN')}` },
                    { label: 'Working Days:', value: '22' },
                    { label: 'Break Time:', value: '1 hr' },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <p className="text-[10px] text-odoo-gray">{item.label}</p>
                      <p className="text-sm font-bold text-odoo-text mt-0.5">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Salary Components + Deductions */}
            <div className="grid grid-cols-2 gap-4">
              {/* Salary Components */}
              <div
                className="bg-white rounded-2xl p-4"
                style={{ boxShadow: '0 8px 30px rgba(113,75,103,0.08)', border: '1px solid #f0eeef' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm text-odoo-text">Salary Components</h4>
                  <button className="w-7 h-7 rounded-lg bg-odoo-teal-light flex items-center justify-center text-odoo-teal hover:bg-odoo-teal hover:text-white transition-all">
                    <Copy size={14} />
                  </button>
                </div>
                <div className="space-y-3.5">
                  {salary.components.map((comp, i) => (
                    <div key={i}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-odoo-text">{comp.name}</p>
                          <p className="text-[10px] text-odoo-gray">({comp.percent}) - {comp.desc}</p>
                        </div>
                        <p className="text-sm font-bold text-odoo-text">₹{Math.round(comp.amount).toLocaleString('en-IN')}</p>
                      </div>
                      {i < salary.components.length - 1 && (
                        <div className="border-b border-odoo-border/50 mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div
                className="bg-white rounded-2xl p-4"
                style={{ boxShadow: '0 8px 30px rgba(113,75,103,0.08)', border: '1px solid #f0eeef' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm text-odoo-text">Deductions</h4>
                  <button className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.entries(salary.deductions).map(([category, items], ci) => (
                    <div key={ci}>
                      <div
                        className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg mb-2"
                        style={{
                          background: ci === 0 ? '#e6f5f5' : '#fef3cd',
                          color: ci === 0 ? '#017E84' : '#856404'
                        }}
                      >
                        {category}
                      </div>
                      {items.map((item, ii) => (
                        <div key={ii} className="flex items-center justify-between py-1.5 px-1">
                          <p className="text-xs text-odoo-text">{item.name}</p>
                          <p className="text-xs font-semibold text-odoo-text">₹{Math.round(item.amount).toLocaleString('en-IN')}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                {/* Net Salary Summary */}
                <div className="border-t border-odoo-border mt-4 pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-odoo-text">Net Salary</p>
                    <p className="text-sm font-bold text-odoo-teal">₹{Math.round(salary.netSalary).toLocaleString('en-IN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ━━━ SECURITY TAB ━━━ */}
        {activeTab === 'Security' && isSelf && (
          <div
            className="bg-white rounded-2xl p-6"
            style={{ boxShadow: '0 8px 30px rgba(113,75,103,0.08)', border: '1px solid #f0eeef' }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Lock size={18} className="text-odoo-purple" />
              <h3 className="text-lg font-semibold text-odoo-text">Change Password</h3>
            </div>

            {pwError && (
              <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">{pwError}</div>
            )}
            {pwSuccess && (
              <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm text-center">{pwSuccess}</div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-odoo-text mb-1.5">Current Password</label>
                <div className="relative">
                  <input
                    type={showPw.current ? 'text' : 'password'}
                    value={pwForm.currentPassword}
                    onChange={(e) => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="clay-input w-full pl-4 pr-11 py-3 text-sm text-odoo-text placeholder-odoo-gray/60"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, current: !p.current }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-text transition-colors">
                    {showPw.current ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-odoo-text mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPw.new ? 'text' : 'password'}
                    value={pwForm.newPassword}
                    onChange={(e) => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                    className="clay-input w-full pl-4 pr-11 py-3 text-sm text-odoo-text placeholder-odoo-gray/60"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, new: !p.new }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-text transition-colors">
                    {showPw.new ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-odoo-text mb-1.5">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showPw.confirm ? 'text' : 'password'}
                    value={pwForm.confirmPassword}
                    onChange={(e) => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Re-enter new password"
                    className="clay-input w-full pl-4 pr-11 py-3 text-sm text-odoo-text placeholder-odoo-gray/60"
                    required
                  />
                  <button type="button" onClick={() => setShowPw(p => ({ ...p, confirm: !p.confirm }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-text transition-colors">
                    {showPw.confirm ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={pwLoading}
                className="clay-button-purple w-full py-3.5 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {pwLoading ? 'Updating...' : (
                  <>
                    Update Password
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-odoo-border py-2.5 px-6"
        style={{ boxShadow: '0 -4px 20px rgba(0,0,0,0.05)' }}
      >
        <div className="flex items-center justify-center gap-12 max-w-[440px] mx-auto">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-0.5 text-odoo-gray hover:text-odoo-purple transition-colors"
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Home</span>
          </button>
          <button
            className="flex flex-col items-center gap-0.5 text-odoo-purple"
          >
            <Users size={20} />
            <span className="text-[10px] font-medium">Profile</span>
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex flex-col items-center gap-0.5 text-odoo-gray hover:text-odoo-purple transition-colors"
          >
            <Settings size={20} />
            <span className="text-[10px] font-medium">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Profile;
