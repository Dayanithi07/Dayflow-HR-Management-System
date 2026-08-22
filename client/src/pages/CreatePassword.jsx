import { useState, useMemo } from 'react';
import { EyeOff, Eye, ArrowRight } from 'lucide-react';

function CreatePassword() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const strength = useMemo(() => {
    if (!newPassword) return { level: 0, label: '', color: '' };
    let score = 0;
    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    if (newPassword.length >= 12) score++;

    if (score <= 1) return { level: 1, label: 'WEAK', color: '#e74c3c' };
    if (score <= 2) return { level: 2, label: 'FAIR STRENGTH', color: '#f39c12' };
    if (score <= 3) return { level: 3, label: 'GOOD', color: '#3498db' };
    return { level: 4, label: 'STRONG', color: '#27ae60' };
  }, [newPassword]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Failed to update password');
        return;
      }
      setSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-odoo-bg flex items-center justify-center px-4 font-outfit">
      <div className="w-full max-w-[420px]">
        <div
          className="bg-white rounded-2xl px-10 pt-12 pb-10"
          style={{
            boxShadow: '0 10px 40px -10px rgba(113, 75, 103, 0.10), 0 4px 12px -4px rgba(113, 75, 103, 0.05)',
            border: '1px solid #f0eeef'
          }}
        >
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="/favicon.svg"
              alt="Dayflow HRMS"
              className="w-[210px] h-[150px] object-contain"
            />
          </div>

          {/* Heading */}
          <h1 className="text-center text-[28px] font-semibold text-odoo-text mb-1.5">
            Create New Password
          </h1>
          <p className="text-center text-odoo-gray text-sm mb-8">
            For security, please change your temporary password before continuing.
          </p>

          {/* Messages */}
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm text-center">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Current Password */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-odoo-text mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current-password-input"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="clay-input w-full pl-4 pr-11 py-3 text-sm text-odoo-text placeholder-odoo-gray/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-text transition-colors"
                >
                  {showCurrent ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="mb-1">
              <label className="block text-sm font-medium text-odoo-text mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password-input"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="clay-input w-full pl-4 pr-11 py-3 text-sm text-odoo-text placeholder-odoo-gray/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-text transition-colors"
                >
                  {showNew ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Password Strength */}
            {newPassword && (
              <div className="mb-4">
                <div className="flex gap-1.5 mt-2 mb-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-[3px] flex-1 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: i <= strength.level ? strength.color : '#e2e8f0'
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-[11px] font-semibold tracking-wide"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <div className={`${newPassword ? '' : 'mt-5'} mb-6`}>
              <label className="block text-sm font-medium text-odoo-text mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password-input"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="clay-input w-full pl-4 pr-11 py-3 text-sm text-odoo-text placeholder-odoo-gray/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-text transition-colors"
                >
                  {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="update-password-button"
              type="submit"
              disabled={loading}
              className="clay-button-purple w-full py-3.5 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Updating...' : (
                <>
                  Update Password
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePassword;
