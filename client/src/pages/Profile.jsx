import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, MapPin, Users,
  Copy, Plus, Trash2, Home, Eye, EyeOff, ArrowRight,
  FileText, Lock, Edit3, Check, X, Printer
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

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // Documents state
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [docForm, setDocForm] = useState({ title: '', fileUrl: '', documentType: 'Government ID' });
  const [docSubmitting, setDocSubmitting] = useState(false);

  // Payslip Modal state
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [payslipMonth, setPayslipMonth] = useState('August');
  const [payslipYear, setPayslipYear] = useState(2026);

  const tabs = isSelf
    ? ['Resume', 'Private Info', 'Documents', ...(isAdmin ? ['Salary Info'] : []), 'Security']
    : ['Resume', 'Private Info', 'Documents', ...(isAdmin ? ['Salary Info'] : [])];

  const [activeTab, setActiveTab] = useState('Private Info');

  /* ─── Fetch Profile ─── */
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const endpoint = isSelf ? `${API}/auth/me` : `${API}/employees/${id}`;
      const res = await fetch(endpoint, { headers: authHeaders() });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        // Initialize edit form values
        setEditForm({
          phone: data.phone || '',
          address: data.address || '',
          avatarUrl: data.avatarUrl || '',
          name: data.name || '',
          department: data.department || '',
          position: data.position || '',
          baseSalary: data.baseSalary || 65000,
          dob: data.dob || '',
          nationality: data.nationality || '',
          personalEmail: data.personalEmail || '',
          gender: data.gender || '',
          maritalStatus: data.maritalStatus || '',
          bankAccountNo: data.bankAccountNo || '',
          bankName: data.bankName || '',
          ifscCode: data.ifscCode || '',
          panNo: data.panNo || '',
          uanNo: data.uanNo || '',
        });
      }
    } catch { /* silent */ } finally { setLoading(false); }
  }, [id, isSelf]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  /* ─── Fetch Documents ─── */
  const fetchDocuments = useCallback(async () => {
    if (!profile) return;
    setLoadingDocs(true);
    try {
      const param = isSelf ? '' : `?employeeId=${profile.id}`;
      const res = await fetch(`${API}/documents${param}`, { headers: authHeaders() });
      if (res.ok) setDocuments(await res.json());
    } catch { /* silent */ } finally { setLoadingDocs(false); }
  }, [profile, isSelf]);

  useEffect(() => {
    if (activeTab === 'Documents') {
      fetchDocuments();
    }
  }, [activeTab, fetchDocuments]);

  /* ─── Document Submit & Delete Handlers ─── */
  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docForm.title || !docForm.fileUrl) return;
    setDocSubmitting(true);
    try {
      const res = await fetch(`${API}/documents`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          employeeId: profile.id,
          title: docForm.title,
          fileUrl: docForm.fileUrl,
          documentType: docForm.documentType
        })
      });
      if (res.ok) {
        setShowAddDocModal(false);
        setDocForm({ title: '', fileUrl: '', documentType: 'Government ID' });
        fetchDocuments();
      }
    } catch { /* silent */ } finally { setDocSubmitting(false); }
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      const res = await fetch(`${API}/documents/${docId}`, {
        method: 'DELETE',
        headers: authHeaders()
      });
      if (res.ok) {
        fetchDocuments();
      }
    } catch { /* silent */ }
  };

  /* ─── Profile Update Handler ─── */
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSubmitting(true);
    try {
      const res = await fetch(`${API}/employees/${profile.id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(editForm)
      });
      const data = await res.json();
      if (!res.ok) {
        setEditError(data.message || 'Failed to update profile');
        return;
      }
      setProfile(data.user);
      setIsEditing(false);
    } catch {
      setEditError('Connection error. Could not update profile.');
    } finally {
      setEditSubmitting(false);
    }
  };

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
        method: 'POST',
        headers: authHeaders(),
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
        {editError && (
          <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {editError}
          </div>
        )}

        <form onSubmit={handleProfileSubmit}>
          {/* Profile Card */}
          <div
            className="bg-white rounded-2xl p-5 mb-4"
            style={{
              boxShadow: '0 10px 40px -10px rgba(113,75,103,0.10), 0 4px 12px -4px rgba(113,75,103,0.05)',
              border: '1px solid #f0eeef'
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-4 flex-1">
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
                  {isEditing && isAdmin ? (
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(p => ({ ...p, name: e.target.value }))}
                      className="clay-input text-lg font-bold px-2 py-1 mb-1.5 w-full"
                    />
                  ) : (
                    <h2 className="text-xl font-bold text-odoo-text">{profile.name}</h2>
                  )}

                  <div className="space-y-1.5 mt-1">
                    <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                      <FileText size={12} /> Position: 
                      {isEditing && isAdmin ? (
                        <input
                          type="text"
                          value={editForm.position}
                          onChange={(e) => setEditForm(p => ({ ...p, position: e.target.value }))}
                          className="clay-input text-xs px-2 py-0.5"
                        />
                      ) : (
                        <span className="font-medium text-odoo-text">{profile.position || '—'}</span>
                      )}
                    </p>
                    <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                      <Mail size={12} /> Email: <span className="font-medium text-odoo-text">{profile.email}</span>
                    </p>
                    <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                      <Phone size={12} /> Mobile: 
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.phone}
                          onChange={(e) => setEditForm(p => ({ ...p, phone: e.target.value }))}
                          className="clay-input text-xs px-2 py-0.5"
                        />
                      ) : (
                        <span className="font-medium text-odoo-text">{profile.phone || '—'}</span>
                      )}
                    </p>
                    {isEditing && (
                      <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                        <FileText size={12} /> Avatar URL: 
                        <input
                          type="text"
                          value={editForm.avatarUrl}
                          onChange={(e) => setEditForm(p => ({ ...p, avatarUrl: e.target.value }))}
                          className="clay-input text-xs px-2 py-0.5 w-full"
                          placeholder="Paste image link"
                        />
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit Actions */}
              {(isSelf || isAdmin) && (
                <div>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={editSubmitting}
                        className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all shadow-sm"
                        title="Save Changes"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-400 hover:text-white transition-all shadow-sm"
                        title="Discard"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-8 h-8 rounded-lg bg-odoo-bg flex items-center justify-center text-odoo-gray hover:text-odoo-purple hover:bg-odoo-purple-light transition-all shadow-sm cursor-pointer"
                      title="Edit Profile"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Info Chips */}
            <div className="grid grid-cols-4 gap-2.5 mt-5">
              {[
                { icon: Building2, label: 'Company:', value: 'Dayflow HRMS' },
                {
                  icon: Users,
                  label: 'Department:',
                  value: isEditing && isAdmin ? (
                    <input
                      type="text"
                      value={editForm.department}
                      onChange={(e) => setEditForm(p => ({ ...p, department: e.target.value }))}
                      className="w-full text-center text-xs font-semibold border-b border-odoo-border"
                    />
                  ) : (
                    profile.department || '—'
                  )
                },
                { icon: Users, label: 'Manager:', value: '—' },
                { icon: MapPin, label: 'Location:', value: profile.address?.split(',').pop()?.trim() || '—' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="rounded-xl px-2 py-2 text-center"
                  style={{ border: '1px solid #e2e8f0', background: '#fafafa' }}
                >
                  <p className="text-[10px] text-odoo-gray leading-tight">{item.label}</p>
                  <div className="text-[11px] font-semibold text-odoo-text mt-0.5 leading-tight truncate">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex border-b border-odoo-border bg-white rounded-t-xl overflow-hidden">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-medium transition-all relative ${
                  activeTab === tab ? 'text-odoo-text' : 'text-odoo-gray hover:text-odoo-text'
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
                  
                  {/* DOB */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Date of Birth</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="date"
                        value={editForm.dob}
                        onChange={(e) => setEditForm(p => ({ ...p, dob: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.dob || '—'}</p>
                    )}
                  </div>

                  {/* Residing Address */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Residing Address</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.address}
                        onChange={(e) => setEditForm(p => ({ ...p, address: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.address || '—'}</p>
                    )}
                  </div>

                  {/* Nationality */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Nationality</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editForm.nationality}
                        onChange={(e) => setEditForm(p => ({ ...p, nationality: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.nationality || '—'}</p>
                    )}
                  </div>

                  {/* Personal Email */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Personal Email</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="email"
                        value={editForm.personalEmail}
                        onChange={(e) => setEditForm(p => ({ ...p, personalEmail: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.personalEmail || '—'}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Gender</p>
                    {isEditing && isAdmin ? (
                      <select
                        value={editForm.gender}
                        onChange={(e) => setEditForm(p => ({ ...p, gender: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.gender || '—'}</p>
                    )}
                  </div>

                  {/* Marital Status */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Marital Status</p>
                    {isEditing && isAdmin ? (
                      <select
                        value={editForm.maritalStatus}
                        onChange={(e) => setEditForm(p => ({ ...p, maritalStatus: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      >
                        <option value="">Select Status</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                      </select>
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.maritalStatus || '—'}</p>
                    )}
                  </div>
                </div>

                {/* Bank & Work Details Column */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-odoo-text border-b border-odoo-border pb-2">Bank & Work Details</h4>
                  
                  {/* Account Number */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Account Number</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editForm.bankAccountNo}
                        onChange={(e) => setEditForm(p => ({ ...p, bankAccountNo: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.bankAccountNo || '—'}</p>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Bank Name</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editForm.bankName}
                        onChange={(e) => setEditForm(p => ({ ...p, bankName: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.bankName || '—'}</p>
                    )}
                  </div>

                  {/* IFSC Code */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">IFSC Code</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editForm.ifscCode}
                        onChange={(e) => setEditForm(p => ({ ...p, ifscCode: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.ifscCode || '—'}</p>
                    )}
                  </div>

                  {/* PAN No */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">PAN No</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editForm.panNo}
                        onChange={(e) => setEditForm(p => ({ ...p, panNo: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.panNo || '—'}</p>
                    )}
                  </div>

                  {/* UAN No */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">UAN No</p>
                    {isEditing && isAdmin ? (
                      <input
                        type="text"
                        value={editForm.uanNo}
                        onChange={(e) => setEditForm(p => ({ ...p, uanNo: e.target.value }))}
                        className="clay-input text-xs px-2 py-1 mt-1 w-full"
                      />
                    ) : (
                      <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.uanNo || '—'}</p>
                    )}
                  </div>

                  {/* Emp Code */}
                  <div>
                    <p className="text-[11px] text-odoo-gray font-medium">Emp Code</p>
                    <p className="text-sm text-odoo-text font-medium mt-0.5 pb-1.5 border-b border-odoo-border/50">{profile.employeeId || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* ━━━ DOCUMENTS TAB ━━━ */}
        {activeTab === 'Documents' && (
          <div
            className="bg-white rounded-2xl p-6 space-y-4"
            style={{ boxShadow: '0 8px 30px rgba(113,75,103,0.08)', border: '1px solid #f0eeef' }}
          >
            <div className="flex items-center justify-between border-b border-odoo-border pb-3">
              <h3 className="text-base font-bold text-odoo-text">Documents Directory</h3>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddDocModal(true)}
                  className="clay-button-purple px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Plus size={14} /> Add Document
                </button>
              )}
            </div>

            {loadingDocs ? (
              <p className="text-center text-xs text-odoo-gray py-4">Loading documents...</p>
            ) : documents.length === 0 ? (
              <p className="text-center text-xs text-odoo-gray py-4">No documents recorded for this profile.</p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-odoo-border bg-odoo-bg/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-odoo-teal-light text-odoo-teal flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-odoo-text hover:text-odoo-teal underline truncate block"
                        >
                          {doc.title}
                        </a>
                        <p className="text-[9px] text-odoo-gray mt-0.5">
                          Type: <span className="font-medium text-odoo-text">{doc.documentType}</span> · Uploaded by: <span className="font-medium text-odoo-text">{doc.uploadedBy || 'HR'}</span>
                        </p>
                      </div>
                    </div>

                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-400 hover:text-white transition-all shrink-0"
                        title="Delete Document"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Document Upload Modal */}
            {showAddDocModal && (
              <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center px-4" onClick={() => setShowAddDocModal(false)}>
                <div
                  className="bg-white rounded-2xl w-full max-w-[400px] p-6 shadow-xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h4 className="text-base font-bold text-odoo-text mb-3">Upload Employee Document</h4>
                  <form onSubmit={handleAddDocument} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-odoo-text mb-1">Document Title</label>
                      <input
                        type="text"
                        value={docForm.title}
                        onChange={(e) => setDocForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Government Aadhaar Card"
                        className="clay-input w-full px-3 py-2 text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-odoo-text mb-1">Document Type</label>
                      <select
                        value={docForm.documentType}
                        onChange={(e) => setDocForm(p => ({ ...p, documentType: e.target.value }))}
                        className="clay-input w-full px-3 py-2 text-xs"
                      >
                        <option value="Government ID">Government ID</option>
                        <option value="PAN Document">PAN Document</option>
                        <option value="Employment Document">Employment Document</option>
                        <option value="Medical Certificate">Medical Certificate</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-odoo-text mb-1">File Link / URL</label>
                      <input
                        type="text"
                        value={docForm.fileUrl}
                        onChange={(e) => setDocForm(p => ({ ...p, fileUrl: e.target.value }))}
                        placeholder="https://example.com/file.pdf"
                        className="clay-input w-full px-3 py-2 text-xs"
                        required
                      />
                    </div>
                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="submit"
                        disabled={docSubmitting}
                        className="clay-button-purple flex-1 py-2 rounded-xl font-semibold"
                      >
                        {docSubmitting ? 'Uploading...' : 'Upload'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddDocModal(false)}
                        className="flex-1 py-2 rounded-xl border border-odoo-border hover:bg-odoo-bg transition-colors"
                      >
                        Discard
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
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
              <div className="px-5 py-3 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #714B67, #5c3d54)' }}>
                <h3 className="text-white font-semibold text-sm">Salary Info</h3>
                <button
                  type="button"
                  onClick={() => setShowPayslipModal(true)}
                  className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold flex items-center gap-1 transition-all"
                >
                  <Printer size={13} /> View Pay Slip
                </button>
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
                  <button type="button" className="w-7 h-7 rounded-lg bg-odoo-teal-light flex items-center justify-center text-odoo-teal hover:bg-odoo-teal hover:text-white transition-all">
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
                  <button type="button" className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all">
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

            {/* Payslip Print Modal */}
            {showPayslipModal && (
              <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowPayslipModal(false)}>
                <div
                  className="bg-white rounded-2xl w-full max-w-[500px] p-6 shadow-2xl space-y-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b border-odoo-border pb-2">
                    <h3 className="text-base font-bold text-odoo-text">Employee Payslip Invoice</h3>
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="clay-button-purple px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Printer size={13} /> Print Slip
                    </button>
                  </div>

                  {/* Print Container */}
                  <div id="print-area" className="p-4 border border-odoo-border rounded-xl space-y-4 text-xs">
                    <div className="flex justify-between items-center border-b border-odoo-border pb-3">
                      <div>
                        <h4 className="text-base font-bold text-odoo-purple">DAYFLOW HRMS</h4>
                        <p className="text-[10px] text-odoo-gray">100 Enterprise Way, Innovation City</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-odoo-text">Pay Slip</p>
                        <p className="text-[10px] text-odoo-gray">{payslipMonth} {payslipYear}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-y-1.5 py-1 border-b border-odoo-border/60">
                      <p className="text-odoo-gray">Employee Name:</p>
                      <p className="font-semibold text-odoo-text text-right">{profile.name}</p>
                      <p className="text-odoo-gray">Employee Code:</p>
                      <p className="font-semibold text-odoo-text text-right">{profile.employeeId}</p>
                      <p className="text-odoo-gray">Job Position:</p>
                      <p className="font-semibold text-odoo-text text-right">{profile.position || 'Software Developer'}</p>
                      <p className="text-odoo-gray">Department:</p>
                      <p className="font-semibold text-odoo-text text-right">{profile.department || 'Engineering'}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-bold border-b border-odoo-border/50 pb-1 text-odoo-text">
                        <span>Earnings</span>
                        <span>Amount</span>
                      </div>
                      {salary.components.map((c, i) => (
                        <div key={i} className="flex justify-between text-odoo-text py-0.5">
                          <span>{c.name}</span>
                          <span>₹{Math.round(c.amount).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1 pt-1 border-t border-odoo-border/50">
                      <div className="flex justify-between font-bold border-b border-odoo-border/50 pb-1 text-odoo-text">
                        <span>Deductions</span>
                        <span>Amount</span>
                      </div>
                      <div className="flex justify-between text-odoo-text py-0.5">
                        <span>Employee PF Contribution</span>
                        <span>₹{Math.round(salary.monthWage * 0.50 * 0.12).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-odoo-text py-0.5">
                        <span>Professional Tax</span>
                        <span>₹200</span>
                      </div>
                    </div>

                    <div className="border-t border-odoo-border pt-3 flex justify-between font-bold text-sm text-odoo-teal">
                      <span>Net Salary Distributed:</span>
                      <span>₹{Math.round(salary.netSalary).toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowPayslipModal(false)}
                    className="w-full py-2.5 rounded-xl border border-odoo-border text-xs font-semibold text-odoo-text hover:bg-odoo-bg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
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
    </div>
  );
}

export default Profile;
