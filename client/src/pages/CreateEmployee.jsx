import { useState, useRef } from 'react';
import { Building2, Mail, Phone, Copy, RefreshCw, Camera, CheckCircle2 } from 'lucide-react';

function CreateEmployee() {
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    companyName: 'Dayflow Global',
    firstName: '',
    email: '',
    phone: '',
  });

  const [credentials, setCredentials] = useState({
    loginId: generateLoginId(),
    tempPassword: generateTempPassword(),
  });

  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState({ id: false, pass: false });
  const [showPassClear, setShowPassClear] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function generateLoginId() {
    const now = new Date();
    const dateStr = now.getFullYear().toString() +
      String(now.getMonth() + 1).padStart(2, '0') +
      String(now.getDate()).padStart(2, '0') +
      String(now.getHours()).padStart(2, '0') +
      String(now.getMinutes()).padStart(2, '0');
    return '01JOD' + dateStr + String(Math.floor(Math.random() * 10));
  }

  function generateTempPassword() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%';
    let result = '';
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be under 2MB');
      return;
    }
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Only JPG/PNG files are allowed');
      return;
    }
    setProfileImage(file);
    setProfilePreview(URL.createObjectURL(file));
    setError('');
  };

  const handleCopy = async (text, field) => {
    await navigator.clipboard.writeText(text);
    setCopied(prev => ({ ...prev, [field]: true }));
    setTimeout(() => setCopied(prev => ({ ...prev, [field]: false })), 2000);
  };

  const handleRegenerate = () => {
    setCredentials({
      loginId: generateLoginId(),
      tempPassword: generateTempPassword(),
    });
    setShowPassClear(false);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('companyName', form.companyName);
      formData.append('firstName', form.firstName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('loginId', credentials.loginId);
      formData.append('tempPassword', credentials.tempPassword);
      if (profileImage) formData.append('profileImage', profileImage);

      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to create employee');
        return;
      }
      setSuccess('Employee account created successfully!');
    } catch {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-odoo-bg flex flex-col items-center py-8 px-4 font-outfit">
      <div className="w-full max-w-[440px] space-y-5">

        {/* Logo */}
        <div className="flex justify-center">
          <img src="/favicon.svg" alt="Dayflow HRMS" className="w-[210px] h-[130px] object-contain" />
        </div>

        {/* Messages */}
        {error && (
          <div className="px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
            {error}
          </div>
        )}
        {success && (
          <div className="px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm text-center">
            {success}
          </div>
        )}

        {/* Profile Picture Card */}
        <div
          className="bg-white rounded-2xl p-8 text-center"
          style={{
            boxShadow: '0 10px 40px -10px rgba(113,75,103,0.10), 0 4px 12px -4px rgba(113,75,103,0.05)',
            border: '1px solid #f0eeef'
          }}
        >
          {/* Upload Circle */}
          <div className="flex justify-center mb-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative w-[90px] h-[90px] rounded-full border-2 border-dashed border-odoo-gray/30 flex items-center justify-center bg-odoo-bg/50 hover:border-odoo-purple/50 transition-all group overflow-hidden"
            >
              {profilePreview ? (
                <>
                  <img src={profilePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
                    <Camera size={22} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-odoo-gray group-hover:text-odoo-purple transition-colors">
                  <Camera size={24} />
                  <span className="text-[10px] font-medium">Upload</span>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          <h2 className="text-lg font-semibold text-odoo-text mb-1">Profile Picture</h2>
          <p className="text-xs text-odoo-gray leading-relaxed">
            Upload a professional photo for the employee's<br />
            ID and directory profile. Max size 2MB (JPG/PNG)
          </p>
        </div>

        {/* Employee Details Card */}
        <div
          className="bg-white rounded-2xl px-8 pt-7 pb-8"
          style={{
            boxShadow: '0 10px 40px -10px rgba(113,75,103,0.10), 0 4px 12px -4px rgba(113,75,103,0.05)',
            border: '1px solid #f0eeef'
          }}
        >
          <h2 className="text-xl font-semibold text-odoo-text mb-5">Employee Details</h2>

          <form onSubmit={handleSubmit} id="create-employee-form">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-odoo-text mb-1.5">Company Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-odoo-gray">
                    <Building2 size={16} />
                  </div>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => handleChange('companyName', e.target.value)}
                    className="clay-input w-full pl-9 pr-3 py-2.5 text-sm text-odoo-text bg-odoo-bg/50"
                    readOnly
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-odoo-text mb-1.5">
                  First Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="first-name-input"
                  type="text"
                  value={form.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="e.g. Doe"
                  className="clay-input w-full px-3 py-2.5 text-sm text-odoo-text placeholder-odoo-gray/60"
                  required
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-odoo-text mb-1.5">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-odoo-gray">
                    <Mail size={16} />
                  </div>
                  <input
                    id="email-input"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jane.doe@dayflow.com"
                    className="clay-input w-full pl-9 pr-3 py-2.5 text-sm text-odoo-text placeholder-odoo-gray/60"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-odoo-text mb-1.5">Phone Number</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-odoo-gray">
                    <Phone size={16} />
                  </div>
                  <input
                    id="phone-input"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="clay-input w-full pl-9 pr-3 py-2.5 text-sm text-odoo-text placeholder-odoo-gray/60"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Account Credentials Card */}
        <div
          className="bg-white rounded-2xl px-8 pt-7 pb-8"
          style={{
            boxShadow: '0 10px 40px -10px rgba(113,75,103,0.10), 0 4px 12px -4px rgba(113,75,103,0.05)',
            border: '1px solid #f0eeef'
          }}
        >
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-odoo-purple-light flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#714B67" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-odoo-text">Account Credentials</h2>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            {/* Login ID */}
            <div>
              <label className="block text-[11px] font-semibold text-odoo-gray uppercase tracking-wider mb-1.5">
                System Generated LOGIN ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={credentials.loginId}
                  readOnly
                  className="clay-input w-full pl-3 pr-9 py-2.5 text-sm text-odoo-text bg-odoo-bg/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(credentials.loginId, 'id')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-purple transition-colors"
                  title="Copy Login ID"
                >
                  {copied.id ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Temp Password */}
            <div>
              <label className="block text-[11px] font-semibold text-odoo-gray uppercase tracking-wider mb-1.5">
                TEMP PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassClear ? 'text' : 'password'}
                  value={credentials.tempPassword}
                  readOnly
                  className="clay-input w-full pl-3 pr-9 py-2.5 text-sm text-odoo-text bg-odoo-bg/50 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(credentials.tempPassword, 'pass')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-purple transition-colors"
                  title="Copy Password"
                >
                  {copied.pass ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>

          {/* Regenerate */}
          <button
            type="button"
            onClick={handleRegenerate}
            className="w-full py-2.5 rounded-xl border border-odoo-border text-sm font-medium text-odoo-text hover:bg-odoo-bg/60 transition-colors flex items-center justify-center gap-2 mb-4"
          >
            <RefreshCw size={15} />
            Regenerate Password
          </button>

          {/* Finalize Button */}
          <button
            type="submit"
            form="create-employee-form"
            disabled={loading}
            className="clay-button-purple w-full py-3.5 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? 'Creating...' : (
              <>
                <CheckCircle2 size={18} />
                Finalize & Create Account
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateEmployee;
