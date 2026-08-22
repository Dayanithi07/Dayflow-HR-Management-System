import { useState } from 'react';
import { User, Lock, EyeOff, Eye, ArrowRight } from 'lucide-react';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/';
    } catch (err) {
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-odoo-bg flex items-center justify-center px-4 font-outfit">
      <div className="w-full max-w-[420px]">
        {/* Main Login Card */}
        <div className="bg-white rounded-2xl px-10 pt-12 pb-10"
          style={{
            boxShadow: '0 10px 40px -10px rgba(113, 75, 103, 0.10), 0 4px 12px -4px rgba(113, 75, 103, 0.05)',
            border: '1px solid #f0eeef'
          }}>

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
            Welcome back
          </h1>
          <p className="text-center text-odoo-gray text-sm mb-8">
            Please enter your details to sign in.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Login ID / Email */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-odoo-text mb-1.5">
                Login ID / Email
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-odoo-gray">
                  <User size={18} />
                </div>
                <input
                  id="email-input"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your ID or email"
                  className="clay-input w-full pl-10 pr-4 py-3 text-sm text-odoo-text placeholder-odoo-gray/60"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-odoo-text">
                  Password
                </label>
                <button type="button" className="text-xs text-odoo-gray hover:text-odoo-purple transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-odoo-gray">
                  <Lock size={18} />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="clay-input w-full pl-10 pr-11 py-3 text-sm text-odoo-text placeholder-odoo-gray/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-odoo-gray hover:text-odoo-text transition-colors"
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              id="sign-in-button"
              type="submit"
              disabled={loading}
              className="clay-button-purple w-full py-3.5 rounded-xl text-white font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <ArrowRight size={18} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Note Card */}
        <div className="mt-4 bg-white rounded-2xl py-5 px-6 text-center"
          style={{
            boxShadow: '0 6px 20px -6px rgba(113, 75, 103, 0.08)',
            border: '1px solid #f0eeef'
          }}>
          <p className="text-sm text-odoo-gray mb-1">
            New employee? Your account will be created by HR/Admin.
          </p>
          <a
            href="/create-employee"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-odoo-purple hover:text-odoo-purple-hover transition-colors"
          >
            HR/Admin <span className="text-xs">→</span> Create Employee
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
