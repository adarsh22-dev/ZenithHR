import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  Shield, 
  Edit3,
  Camera,
  Loader2,
  CheckCircle2,
  X,
  Save,
  ClipboardList,
  PieChart as PieChartIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { validateForm } from '../utils/validation';

export default function EmployeeProfile() {
  const { user, token } = useAuthStore();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState('overview');
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [fetchingData, setFetchingData] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    work_location: '',
    status: '',
    birthday: ''
  });

  useEffect(() => {
    if (user?.employee_id) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'leaves' && user?.employee_id) {
      fetchLeaveBalances();
    } else if (activeTab === 'work' && user?.employee_id) {
      fetchAttendanceRecords();
    }
  }, [activeTab, user]);

  const fetchProfile = async () => {
    if (!user?.employee_id) return;
    try {
      const res = await fetch(`/api/employees/${user.employee_id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setEmployee(data);
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        phone: data.phone || '',
        work_location: data.work_location || '',
        status: data.status || '',
        birthday: data.birthday || ''
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveBalances = async () => {
    setFetchingData(true);
    try {
      const res = await fetch('/api/leave-balances', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch leave balances');
      const data = await res.json();
      const myData = Array.isArray(data) ? data.filter((b: any) => b.employee_id === user?.employee_id) : [];
      setLeaveBalances(myData);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingData(false);
    }
  };

  const fetchAttendanceRecords = async () => {
    setFetchingData(true);
    try {
      const res = await fetch('/api/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      const myData = Array.isArray(data) ? data.filter((r: any) => r.employee_id === user?.employee_id) : [];
      setAttendanceRecords(myData);
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingData(false);
    }
  };

  const handleUpdateProfile = async () => {
    setFieldErrors({});

    const validationRules: Record<string, any[]> = {
      phone: [{ type: 'required' }, { type: 'phone' }],
      work_location: [{ type: 'required' }]
    };

    if (user?.role === 'admin' || user?.role === 'hr_manager') {
      validationRules.first_name = [{ type: 'required' }];
      validationRules.last_name = [{ type: 'required' }];
      validationRules.status = [{ type: 'required' }];
    }

    const errors = validateForm(formData, validationRules);

    if (errors.length > 0) {
      const errorMap: Record<string, string> = {};
      errors.forEach(err => errorMap[err.field] = err.message);
      setFieldErrors(errorMap);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/employees/${user?.employee_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowEditModal(false);
        fetchProfile();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-[#5A5A40]" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative h-48 bg-[#5A5A40] rounded-[40px] overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
      </div>

      <div className="px-8 -mt-24 relative z-10">
        <div className="flex flex-col md:flex-row items-end gap-6 mb-8">
          <div className="relative group">
            <div className="w-40 h-40 rounded-[40px] border-8 border-[#F8F9FA] bg-white overflow-hidden shadow-xl">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${employee?.first_name}`} 
                alt="profile" 
                className="w-full h-full object-cover"
              />
            </div>
            <button className="absolute bottom-2 right-2 p-3 bg-[#5A5A40] text-white rounded-2xl shadow-lg opacity-0 group-hover:opacity-100 transition-all">
              <Camera size={20} />
            </button>
          </div>
          
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">{employee?.first_name} {employee?.last_name}</h1>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 ${
                employee?.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
              }`}>
                <CheckCircle2 size={12} />
                {employee?.status}
              </div>
            </div>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <Briefcase size={16} />
              {employee?.role_name} • {employee?.department_name}
            </p>
          </div>

          <div className="pb-4">
            <button 
              onClick={() => setShowEditModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-600 font-bold shadow-sm hover:bg-gray-50 transition-all"
            >
              <Edit3 size={18} />
              Edit Profile
            </button>
          </div>
        </div>

        <div className="flex items-center gap-8 border-b border-gray-100 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'leaves', label: 'Leave Balances', icon: Calendar },
            { id: 'work', label: 'Work Records', icon: ClipboardList },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold transition-all relative ${
                activeTab === tab.id ? 'text-[#5A5A40]' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <tab.icon size={18} />
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5A5A40]"
                />
              )}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-8">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                    <div className="flex items-center gap-3 text-gray-900 font-bold">
                      <Mail size={18} className="text-gray-400" />
                      {employee?.email}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                    <div className="flex items-center gap-3 text-gray-900 font-bold">
                      <Phone size={18} className="text-gray-400" />
                      {employee?.phone || 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</p>
                    <div className="flex items-center gap-3 text-gray-900 font-bold">
                      <MapPin size={18} className="text-gray-400" />
                      {employee?.work_location || 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Joined Date</p>
                    <div className="flex items-center gap-3 text-gray-900 font-bold">
                      <Calendar size={18} className="text-gray-400" />
                      {employee?.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'Not provided'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Birthday</p>
                    <div className="flex items-center gap-3 text-gray-900 font-bold">
                      <Calendar size={18} className="text-gray-400" />
                      {employee?.birthday ? new Date(employee.birthday).toLocaleDateString() : 'Not provided'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-8">Work Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee ID</p>
                    <p className="text-gray-900 font-bold">EMP-00{employee?.id}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</p>
                    <p className="text-gray-900 font-bold capitalize">{user?.role.replace('_', ' ')}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Reporting To</p>
                    <p className="text-gray-900 font-bold">Sarah Jenkins (HR Director)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Work Type</p>
                    <p className="text-gray-900 font-bold">{employee?.contract_type || 'Full-time'} • {employee?.work_location || 'On-site'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Security</h3>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-[#5A5A40]" />
                      <span className="text-sm font-bold text-gray-900">Two-Factor Auth</span>
                    </div>
                    <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </div>
                  </div>
                  <button className="w-full py-4 rounded-2xl border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
                    Change Password
                  </button>
                </div>
              </div>

              <div className="bg-[#151619] p-8 rounded-[40px] text-white">
                <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                <p className="text-gray-400 text-sm mb-6">If you need to update sensitive information, please contact HR.</p>
                <button className="w-full py-4 rounded-2xl bg-[#5A5A40] text-sm font-bold hover:bg-[#4A4A35] transition-all">
                  Contact HR Support
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900">Leave Balances</h3>
              {fetchingData && <Loader2 className="animate-spin text-[#5A5A40]" size={20} />}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {leaveBalances.length > 0 ? (
                leaveBalances.map((balance) => (
                  <React.Fragment key={balance.id}>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Annual Leave</p>
                      <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-bold text-gray-900">{balance.annual_total - balance.annual_used}</h4>
                        <p className="text-xs font-bold text-gray-500 mb-1">/ {balance.annual_total} Days</p>
                      </div>
                      <div className="mt-4 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-[#5A5A40] h-full transition-all duration-500" 
                          style={{ width: `${((balance.annual_total - balance.annual_used) / balance.annual_total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Sick Leave</p>
                      <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-bold text-gray-900">{balance.sick_total - balance.sick_used}</h4>
                        <p className="text-xs font-bold text-gray-500 mb-1">/ {balance.sick_total} Days</p>
                      </div>
                      <div className="mt-4 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full transition-all duration-500" 
                          style={{ width: `${((balance.sick_total - balance.sick_used) / balance.sick_total) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Personal Leave</p>
                      <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-bold text-gray-900">{balance.personal_total - balance.personal_used}</h4>
                        <p className="text-xs font-bold text-gray-500 mb-1">/ {balance.personal_total} Days</p>
                      </div>
                      <div className="mt-4 w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-500 h-full transition-all duration-500" 
                          style={{ width: `${((balance.personal_total - balance.personal_used) / balance.personal_total) * 100}%` }}
                        />
                      </div>
                    </div>
                  </React.Fragment>
                ))
              ) : (
                <div className="col-span-3 py-12 text-center">
                  <p className="text-gray-400 font-bold">No leave balances found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'work' && (
          <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Attendance History</h3>
              {fetchingData && <Loader2 className="animate-spin text-[#5A5A40]" size={20} />}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clock In</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clock Out</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Hours</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record) => (
                      <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-900">{record.date}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-medium text-gray-600">{record.clock_in || '--:--'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-medium text-gray-600">{record.clock_out || '--:--'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-gray-900">{record.total_hours ? `${record.total_hours}h` : '--'}</p>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                            record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {record.status}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-12 text-center">
                        <p className="text-gray-400 font-bold">No attendance records found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <p className="text-gray-500">Update your personal and work information</p>
                </div>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-8 space-y-6">
                {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">First Name</label>
                      <input 
                        type="text" 
                        className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.first_name ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`} 
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      />
                      {fieldErrors.first_name && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.first_name}</p>}
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Last Name</label>
                      <input 
                        type="text" 
                        className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.last_name ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`} 
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      />
                      {fieldErrors.last_name && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.last_name}</p>}
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone Number</label>
                  <input 
                    type="text" 
                    className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.phone ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`} 
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                  {fieldErrors.phone && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.phone}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Work Location</label>
                  <input 
                    type="text" 
                    className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.work_location ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`} 
                    value={formData.work_location}
                    onChange={(e) => setFormData({ ...formData, work_location: e.target.value })}
                  />
                  {fieldErrors.work_location && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.work_location}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Birthday</label>
                  <input 
                    type="date" 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10" 
                    value={formData.birthday}
                    onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                  />
                </div>

                {(user?.role === 'admin' || user?.role === 'hr_manager') && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Terminated">Terminated</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={submitting}
                    className="flex-1 py-4 rounded-2xl bg-[#5A5A40] text-white font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
