import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Mail, 
  Phone, 
  MapPin,
  Briefcase,
  Calendar,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

import { validateForm } from '../utils/validation';

export default function Employees() {
  const { token, user } = useAuthStore();
  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department_id: '',
    role_id: '',
    joining_date: '',
    birthday: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchEmployees();
    fetchMetadata();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setEmployees(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [deptRes, roleRes] = await Promise.all([
        fetch('/api/departments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/roles', { headers: { Authorization: `Bearer ${token}` } })
      ]);
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (roleRes.ok) setRoles(await roleRes.json());
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddEmployee = async () => {
    setFieldErrors({});
    
    const errors = validateForm(formData, {
      first_name: [{ type: 'required' }],
      last_name: [{ type: 'required' }],
      email: [{ type: 'required' }, { type: 'email' }],
      department_id: [{ type: 'required' }],
      role_id: [{ type: 'required' }],
      joining_date: [{ type: 'required' }, { type: 'date' }]
    });

    if (errors.length > 0) {
      const errorMap: Record<string, string> = {};
      errors.forEach(err => errorMap[err.field] = err.message);
      setFieldErrors(errorMap);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          department_id: parseInt(formData.department_id),
          role_id: parseInt(formData.role_id)
        })
      });
      if (res.ok) {
        setShowAddModal(false);
        setFormData({
          first_name: '',
          last_name: '',
          email: '',
          department_id: '',
          role_id: '',
          joining_date: '',
          birthday: '',
          status: 'Active'
        });
        fetchEmployees();
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to add employee');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employees</h1>
          <p className="text-gray-500">Manage your workforce and their information.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'hr_manager') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all"
          >
            <UserPlus size={20} />
            Add Employee
          </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-600 font-bold hover:bg-gray-100 transition-all">
            <Filter size={18} />
            Filters
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-gray-600 font-bold hover:bg-gray-100 transition-all">
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="animate-spin text-[#5A5A40]" size={40} />
          <p className="text-gray-500 font-medium">Loading workforce data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEmployees.map((emp, index) => (
              <motion.div
                key={emp.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden border-2 border-white shadow-sm">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${emp.email}`} alt="avatar" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-[#5A5A40] transition-colors">
                        {emp.first_name} {emp.last_name}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{emp.employee_code}</p>
                    </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                      <Briefcase size={16} />
                    </div>
                    <span className="font-medium">{emp.role_name || 'Employee'} • {emp.department_name || 'General'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                      <Mail size={16} />
                    </div>
                    <span className="font-medium truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400">
                      <Calendar size={16} />
                    </div>
                    <span className="font-medium">Joined {new Date(emp.joining_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                    emp.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {emp.status}
                  </div>
                  <button className="text-xs font-bold text-[#5A5A40] hover:underline">View Profile</button>
                </div>

                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gray-50 rounded-full group-hover:bg-[#5A5A40]/5 transition-colors -z-10" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && filteredEmployees.length === 0 && (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
            <Search size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No employees found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      )}

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add New Employee</h2>
                  <p className="text-gray-500">Create a new employee profile and user account</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="text-gray-400" size={24} />
                </button>
              </div>
              <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.email ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                  {fieldErrors.email && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.email}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Department</label>
                    <select 
                      className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.department_id ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      value={formData.department_id}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {fieldErrors.department_id && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.department_id}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Role</label>
                    <select 
                      className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.role_id ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      value={formData.role_id}
                      onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    >
                      <option value="">Select Role</option>
                      {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                    {fieldErrors.role_id && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.role_id}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Joining Date</label>
                    <input 
                      type="date" 
                      className={`w-full px-4 py-3 bg-gray-50 border ${fieldErrors.joining_date ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10`}
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                    />
                    {fieldErrors.joining_date && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.joining_date}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</label>
                    <select 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="New Hire">New Hire</option>
                    </select>
                  </div>
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
              </div>
              <div className="p-8 bg-gray-50 flex gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-4 rounded-2xl bg-white border border-gray-100 text-gray-600 font-bold hover:bg-gray-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddEmployee}
                  disabled={submitting}
                  className="flex-1 py-4 rounded-2xl bg-[#5A5A40] text-white font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                  Add Employee
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
