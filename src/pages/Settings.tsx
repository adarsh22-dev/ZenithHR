import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  User, 
  Bell, 
  Shield, 
  Globe, 
  Moon, 
  HelpCircle, 
  Lock, 
  Check, 
  X, 
  Loader2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MODULES = ['Employees', 'Attendance', 'Leaves', 'Payroll', 'Performance', 'Reports'];
const ACTIONS = ['read', 'write', 'delete'];

export default function Settings() {
  const { user, token } = useAuthStore();
  const [activeSection, setActiveSection] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [permissions, setPermissions] = useState<any>({});
  const [selectedRole, setSelectedRole] = useState('hr_manager');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchPermissions();
    }
  }, [user]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/permissions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPermissions(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/permissions', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          role: selectedRole, 
          permissions: permissions[selectedRole] 
        })
      });
      if (res.ok) {
        alert('Permissions saved successfully!');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const togglePermission = (module: string, action: string) => {
    setPermissions((prev: any) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [module]: {
          ...prev[selectedRole][module],
          [action]: !prev[selectedRole][module][action]
        }
      }
    }));
  };

  const sections = [
    { title: 'Account Settings', icon: User, desc: 'Manage your profile and personal info' },
    { title: 'Notifications', icon: Bell, desc: 'Configure how you receive alerts' },
    { title: 'Privacy & Security', icon: Shield, desc: 'Protect your account and data' },
    ...(user?.role === 'admin' ? [
      { title: 'Role Permissions', icon: Lock, desc: 'Define access for different roles', isCustom: true },
      { title: 'Company Settings', icon: Globe, desc: 'Manage organization preferences' }
    ] : [])
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage your account preferences and system configuration.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {sections.map((section, i) => (
            <button 
              key={i}
              onClick={() => setActiveSection(i)}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold transition-all ${
                activeSection === i 
                  ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' 
                  : 'text-gray-500 hover:bg-white hover:shadow-sm'
              }`}
            >
              <section.icon size={20} />
              <div className="text-left">
                <p className="leading-none">{section.title}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            {sections[activeSection].isCustom ? (
              <motion.div 
                key="permissions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-10"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Role Permissions</h3>
                    <p className="text-gray-500 mt-1 font-medium">Define granular access for different user roles.</p>
                  </div>
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold px-6 py-3 outline-none focus:ring-2 focus:ring-[#5A5A40]/10"
                  >
                    <option value="admin">Admin</option>
                    <option value="hr_manager">HR Manager</option>
                    <option value="employee">Employee</option>
                  </select>
                </div>

                <div className="overflow-x-auto relative min-h-[400px]">
                  {loading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-3xl">
                      <Loader2 size={40} className="text-[#5A5A40] animate-spin" />
                    </div>
                  )}
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-50">
                        <th className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Module</th>
                        {ACTIONS.map(action => (
                          <th key={action} className="pb-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">{action}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {MODULES.map(module => (
                        <tr key={module} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-6 font-bold text-gray-900">{module}</td>
                          {ACTIONS.map(action => (
                            <td key={action} className="py-6 text-center">
                              <button 
                                onClick={() => togglePermission(module, action)}
                                disabled={selectedRole === 'admin'}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-all ${
                                  permissions[selectedRole]?.[module]?.[action] 
                                    ? 'bg-emerald-50 text-emerald-600 shadow-sm shadow-emerald-600/10' 
                                    : 'bg-rose-50 text-rose-600 shadow-sm shadow-rose-600/10'
                                } ${selectedRole === 'admin' ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
                              >
                                {permissions[selectedRole]?.[module]?.[action] ? <Check size={20} /> : <X size={20} />}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-6 border-t border-gray-50 flex justify-end">
                  <button 
                    onClick={handleSavePermissions}
                    disabled={saving || selectedRole === 'admin'}
                    className="px-8 py-4 bg-[#5A5A40] text-white rounded-2xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving && <Loader2 size={20} className="animate-spin" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="general"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-8">System Preferences</h3>
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                          <Moon size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Dark Mode</p>
                          <p className="text-sm text-gray-500 font-medium">Adjust the interface appearance</p>
                        </div>
                      </div>
                      <div 
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`w-14 h-7 rounded-full relative cursor-pointer transition-all ${isDarkMode ? 'bg-[#5A5A40]' : 'bg-gray-200'}`}
                      >
                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${isDarkMode ? 'left-8' : 'left-1'}`} />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400">
                          <HelpCircle size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">Help & Support</p>
                          <p className="text-sm text-gray-500 font-medium">Get assistance with ZenithHR</p>
                        </div>
                      </div>
                      <button className="text-sm font-bold text-[#5A5A40] hover:underline">Contact Support</button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group cursor-pointer hover:border-[#5A5A40]/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <Globe size={20} />
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#5A5A40] transition-colors" />
                    </div>
                    <h4 className="font-bold text-gray-900">Language</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">English (US)</p>
                  </div>
                  <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm group cursor-pointer hover:border-[#5A5A40]/30 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-rose-600">
                        <Bell size={20} />
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#5A5A40] transition-colors" />
                    </div>
                    <h4 className="font-bold text-gray-900">Notifications</h4>
                    <p className="text-xs text-gray-500 font-medium mt-1">All alerts enabled</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
