import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../lib/api';
import useAuthStore from '../store/useAuthStore';

const UnderlineField = ({ label, value, type = 'text', onChange, disabled = false }) => (
  <div className="flex items-center gap-4 mb-4">
    <label className="text-sm font-['Indie_Flower',sans-serif] text-gray-300 w-1/3 text-left">{label}</label>
    <div className="flex-1">
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-transparent border-b border-gray-500 text-sm font-['Indie_Flower',sans-serif] text-white focus:outline-none focus:border-white pb-1"
      />
    </div>
  </div>
);

function Profile() {
  const { employeeId } = useParams();
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Resume');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const isSelf = !employeeId || currentUser?.id === employeeId;
  const targetId = isSelf ? 'me' : employeeId;

  useEffect(() => {
    fetchProfile();
  }, [targetId]);

  const fetchProfile = async () => {
    try {
      const res = await api.get(`/employees/${targetId}`);
      setProfile(res.data);
    } catch (err) {
      // Mock Data
      setProfile({
        profile: {
          full_name: 'My Name',
          job_title: 'Job Position',
          email: 'Email',
          phone: 'Mobile',
          department: 'Department',
          location: 'Location',
          date_of_birth: '1990-01-01',
          residing_address: '123 Street',
          nationality: 'Indian',
          personal_email: 'personal@email.com',
          gender: 'Male',
          marital_status: 'Single',
          date_of_joining: '2022-01-01'
        },
        resume: {
          about: 'Lorem Ipsum is simply dummy text...',
          what_i_love_about_my_job: 'Lorem Ipsum is simply dummy text...',
          interests_and_hobbies: 'Lorem Ipsum is simply dummy text...'
        },
        manager: {
          full_name: 'Manager Name'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-400 font-['Indie_Flower',sans-serif]">Loading profile...</div>;
  }

  return (
    <div className="p-4 mx-4">
      <div className="border border-gray-600 bg-[#111111] w-full max-w-6xl mx-auto">
        {/* Header Title */}
        <div className="border-b border-gray-600 px-4 py-2">
          <h1 className="text-lg font-['Indie_Flower',sans-serif] text-white">My Profile</h1>
        </div>

        {/* Profile Card Header */}
        <div className="flex p-8 gap-8 border-b border-gray-600">
          <div className="relative w-24 h-24 rounded-full bg-[#6d2f33] border border-gray-500 flex items-center justify-center">
             <div className="w-10 h-10 border border-gray-900 rotate-45 flex items-center justify-center">
               <div className="w-6 h-1 bg-gray-900 -rotate-45"></div>
             </div>
          </div>
          
          <div className="flex-1 flex gap-16">
            <div className="space-y-2">
              <h2 className="text-2xl font-['Indie_Flower',sans-serif] text-white">{profile?.profile?.full_name}</h2>
              <div className="space-y-1">
                <UnderlineField label="Login ID" value="OIJODO20220001" disabled />
                <UnderlineField label="Email" value={profile?.profile?.email} disabled />
                <UnderlineField label="Mobile" value={profile?.profile?.phone} disabled />
              </div>
            </div>
            
            <div className="space-y-2">
               <UnderlineField label="Company" value="Odoo India" disabled />
               <UnderlineField label="Department" value={profile?.profile?.department} disabled />
               <UnderlineField label="Manager" value={profile?.manager?.full_name} disabled />
               <UnderlineField label="Location" value={profile?.profile?.location} disabled />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600 px-4 mt-4">
          {['Resume', 'Private Info', 'Salary Info', 'Security'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1 border border-gray-600 border-b-0 font-['Indie_Flower',sans-serif] text-sm ${
                activeTab === tab ? 'bg-[#151515] text-white' : 'text-gray-400 hover:text-white bg-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

<<<<<<< HEAD
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
=======
        {/* Content */}
        <div className="p-8 bg-[#151515] min-h-[400px]">
          {activeTab === 'Resume' && (
             <div className="flex gap-8">
               <div className="flex-1 space-y-6">
                  <div className="border border-gray-600 p-4 relative">
                     <span className="absolute -top-3 left-2 bg-[#151515] px-1 text-sm font-['Indie_Flower',sans-serif] text-white">About</span>
                     <p className="text-sm font-['Indie_Flower',sans-serif] text-gray-400 mt-2">{profile?.resume?.about}</p>
                  </div>
                  <div className="border border-gray-600 p-4 relative">
                     <span className="absolute -top-3 left-2 bg-[#151515] px-1 text-sm font-['Indie_Flower',sans-serif] text-white">What I love about my job</span>
                     <p className="text-sm font-['Indie_Flower',sans-serif] text-gray-400 mt-2">{profile?.resume?.what_i_love_about_my_job}</p>
                  </div>
                  <div className="border border-gray-600 p-4 relative">
                     <span className="absolute -top-3 left-2 bg-[#151515] px-1 text-sm font-['Indie_Flower',sans-serif] text-white">My interests and hobbies</span>
                     <p className="text-sm font-['Indie_Flower',sans-serif] text-gray-400 mt-2">{profile?.resume?.interests_and_hobbies}</p>
                  </div>
               </div>
               
               <div className="w-64 space-y-6">
                  <div className="border border-gray-600 p-4 min-h-[150px] relative">
                     <span className="absolute -top-3 left-2 bg-[#151515] px-1 text-sm font-['Indie_Flower',sans-serif] text-white">Skills</span>
                     <button className="text-xs font-['Indie_Flower',sans-serif] text-gray-400 mt-2 block">+ Add Skills</button>
                  </div>
                  <div className="border border-gray-600 p-4 min-h-[150px] relative">
                     <span className="absolute -top-3 left-2 bg-[#151515] px-1 text-sm font-['Indie_Flower',sans-serif] text-white">Certification</span>
                     <button className="text-xs font-['Indie_Flower',sans-serif] text-gray-400 mt-2 block">+ Add Skills</button>
                  </div>
               </div>
             </div>
          )}

          {activeTab === 'Private Info' && (
             <div className="grid grid-cols-2 gap-x-16 gap-y-2 max-w-4xl">
                <div>
                   <UnderlineField label="Date of Birth" value={profile?.profile?.date_of_birth} />
                   <UnderlineField label="Residing Address" value={profile?.profile?.residing_address} />
                   <UnderlineField label="Nationality" value={profile?.profile?.nationality} />
                   <UnderlineField label="Personal Email" value={profile?.profile?.personal_email} />
                   <UnderlineField label="Gender" value={profile?.profile?.gender} />
                   <UnderlineField label="Marital Status" value={profile?.profile?.marital_status} />
                   <UnderlineField label="Date of Joining" value={profile?.profile?.date_of_joining} />
                </div>
                <div>
                   <h3 className="text-sm font-['Indie_Flower',sans-serif] text-white mb-4 underline">Bank Details</h3>
                   <UnderlineField label="Account Number" value="" />
                   <UnderlineField label="Bank Name" value="" />
                   <UnderlineField label="IFSC Code" value="" />
                   <UnderlineField label="PAN No" value="" />
                   <UnderlineField label="UAN No" value="" />
                   <UnderlineField label="Emp Code" value="" />
                </div>
             </div>
          )}
          
          {activeTab === 'Salary Info' && (
             <div className="text-center mt-10">
                <p className="font-['Indie_Flower',sans-serif] text-gray-400">Salary Info tab Should only be visible to Admin</p>
             </div>
          )}
          
          {activeTab === 'Security' && (
             <div className="max-w-md">
                <UnderlineField label="Old Password" type="password" />
                <UnderlineField label="New Password" type="password" />
                <button className="bg-[#a352cc] text-black font-semibold py-1.5 px-4 rounded mt-4 text-sm font-['Indie_Flower',sans-serif]">Update</button>
             </div>
          )}
>>>>>>> e6474b0 (feat: implement authentication flow, protected routes, and core HR management pages with updated theme styling)
        </div>
      </div>
    </div>
  );
}

export default Profile;
