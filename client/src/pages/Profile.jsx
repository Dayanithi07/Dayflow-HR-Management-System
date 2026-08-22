import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, MapPin, Users,
  Copy, Plus, Trash2, ChevronRight, Settings, Home
} from 'lucide-react';

const SALARY_COMPONENTS = [
  { name: 'Basic', percent: '50%', desc: 'Monthly Basic', amount: 25000 },
  { name: 'HRA', percent: '25%', desc: 'House Rent Allowance', amount: 12500 },
  { name: 'Special Allowance', percent: '25%', desc: 'Other', amount: 12500 },
];

const DEDUCTIONS = {
  'PF Contribution': [
    { name: 'Employee PF', amount: 1800 },
    { name: 'Employer PF', amount: 1800 },
  ],
  'Tax Deductions': [
    { name: 'Income Tax', amount: 2000 },
    { name: 'Professional Tax', amount: 200 },
  ],
};

const PROFILE = {
  name: 'My Name',
  loginId: 'mylogin',
  email: 'myemail@example.com',
  mobile: '123-456-7890',
  company: 'Dayflow HRMS',
  department: 'Engineering',
  manager: 'Sarah Jenkins',
  location: 'New York',
  monthWage: 50000,
  yearlyWage: 600000,
  workingDays: 22,
  breakTime: '1 hr',
  about: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  lovesAboutJob: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor.',
  skills: [],
  certifications: [],
};

function Profile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Salary Info');
  const tabs = ['Resume', 'Private Info', 'Salary Info'];

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
          <h1 className="text-lg font-bold text-odoo-text">My Profile</h1>
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
            <div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-300 to-purple-400 flex items-center justify-center text-white text-xl font-bold shrink-0"
              style={{ boxShadow: '0 4px 12px rgba(113,75,103,0.2)' }}
            >
              MN
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-odoo-text">{PROFILE.name}</h2>
              <div className="space-y-0.5 mt-1">
                <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                  Login ID: <span className="font-medium text-odoo-text">{PROFILE.loginId}</span>
                </p>
                <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                  <Mail size={12} /> Email: <span className="font-medium text-odoo-text">{PROFILE.email}</span>
                </p>
                <p className="text-xs text-odoo-gray flex items-center gap-1.5">
                  <Phone size={12} /> Mobile: <span className="font-medium text-odoo-text">{PROFILE.mobile}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Info Chips */}
          <div className="grid grid-cols-4 gap-2.5 mt-5">
            {[
              { icon: Building2, label: 'Company:', value: PROFILE.company },
              { icon: Users, label: 'Department:', value: PROFILE.department },
              { icon: Users, label: 'Manager:', value: PROFILE.manager },
              { icon: MapPin, label: 'Location:', value: PROFILE.location },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl px-3 py-2.5 text-center"
                style={{
                  border: '1px solid #e2e8f0',
                  background: '#fafafa'
                }}
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

        {/* Salary Info Tab */}
        {activeTab === 'Salary Info' && (
          <div className="space-y-4">
            {/* Salary Overview Card */}
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                boxShadow: '0 8px 30px rgba(113,75,103,0.08)',
                border: '1px solid #f0eeef'
              }}
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
                    { label: 'Month Wage:', value: PROFILE.monthWage.toLocaleString() },
                    { label: 'Yearly wage:', value: PROFILE.yearlyWage.toLocaleString() },
                    { label: 'Working days:', value: PROFILE.workingDays },
                    { label: 'Break Time:', value: PROFILE.breakTime },
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
                style={{
                  boxShadow: '0 8px 30px rgba(113,75,103,0.08)',
                  border: '1px solid #f0eeef'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm text-odoo-text">Salary Components</h4>
                  <button className="w-7 h-7 rounded-lg bg-odoo-teal-light flex items-center justify-center text-odoo-teal hover:bg-odoo-teal hover:text-white transition-all">
                    <Copy size={14} />
                  </button>
                </div>
                <div className="space-y-3.5">
                  {SALARY_COMPONENTS.map((comp, i) => (
                    <div key={i}>
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-odoo-text">{comp.name}</p>
                          <p className="text-[10px] text-odoo-gray">({comp.percent}) - {comp.desc}</p>
                        </div>
                        <p className="text-sm font-bold text-odoo-text">{comp.amount.toLocaleString()}</p>
                      </div>
                      {i < SALARY_COMPONENTS.length - 1 && (
                        <div className="border-b border-odoo-border/50 mt-3" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Deductions */}
              <div
                className="bg-white rounded-2xl p-4"
                style={{
                  boxShadow: '0 8px 30px rgba(113,75,103,0.08)',
                  border: '1px solid #f0eeef'
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-sm text-odoo-text">Deductions</h4>
                  <button className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center text-red-400 hover:bg-red-400 hover:text-white transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="space-y-3">
                  {Object.entries(DEDUCTIONS).map(([category, items], ci) => (
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
                          <p className="text-xs font-semibold text-odoo-text">{item.amount.toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* About & Skills Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* About Section */}
              <div className="space-y-3">
                <div
                  className="bg-white rounded-2xl p-4"
                  style={{
                    boxShadow: '0 4px 16px rgba(113,75,103,0.06)',
                    border: '1px solid #f0eeef'
                  }}
                >
                  <h4 className="font-semibold text-sm text-odoo-text mb-2">About:</h4>
                  <p className="text-[11px] text-odoo-gray leading-relaxed">{PROFILE.about}</p>
                </div>
                <div
                  className="bg-white rounded-2xl p-4"
                  style={{
                    boxShadow: '0 4px 16px rgba(113,75,103,0.06)',
                    border: '1px solid #f0eeef'
                  }}
                >
                  <h4 className="font-semibold text-sm text-odoo-text mb-2">What I love about my job:</h4>
                  <p className="text-[11px] text-odoo-gray leading-relaxed">{PROFILE.lovesAboutJob}</p>
                </div>
              </div>

              {/* Skills & Certifications */}
              <div className="space-y-3">
                <div
                  className="bg-white rounded-2xl p-4"
                  style={{
                    boxShadow: '0 4px 16px rgba(113,75,103,0.06)',
                    border: '1px solid #f0eeef'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-odoo-text">Skills</h4>
                    <button className="text-odoo-teal text-xs font-semibold flex items-center gap-0.5 hover:text-odoo-teal-hover transition-colors">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <p className="text-[11px] text-odoo-gray mt-2">No skills added yet</p>
                </div>
                <div
                  className="bg-white rounded-2xl p-4"
                  style={{
                    boxShadow: '0 4px 16px rgba(113,75,103,0.06)',
                    border: '1px solid #f0eeef'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-odoo-text">Certification</h4>
                    <button className="text-odoo-teal text-xs font-semibold flex items-center gap-0.5 hover:text-odoo-teal-hover transition-colors">
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <p className="text-[11px] text-odoo-gray mt-2">No certifications added yet</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resume Tab */}
        {activeTab === 'Resume' && (
          <div
            className="bg-white rounded-2xl p-6 text-center"
            style={{
              boxShadow: '0 8px 30px rgba(113,75,103,0.08)',
              border: '1px solid #f0eeef'
            }}
          >
            <h3 className="text-lg font-semibold text-odoo-text mb-2">Resume</h3>
            <p className="text-sm text-odoo-gray">Work experience and education details</p>
          </div>
        )}

        {/* Private Info Tab */}
        {activeTab === 'Private Info' && (
          <div
            className="bg-white rounded-2xl p-6 text-center"
            style={{
              boxShadow: '0 8px 30px rgba(113,75,103,0.08)',
              border: '1px solid #f0eeef'
            }}
          >
            <h3 className="text-lg font-semibold text-odoo-text mb-2">Private Info</h3>
            <p className="text-sm text-odoo-gray">Personal and emergency contact information</p>
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
