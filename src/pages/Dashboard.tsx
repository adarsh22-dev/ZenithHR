import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Clock, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  MoreHorizontal,
  Plus,
  CheckCircle2,
  AlertCircle,
  Timer,
  X,
  UserPlus,
  FilePlus,
  Briefcase,
  CreditCard,
  Star,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

const data = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 30 },
  { name: 'Wed', value: 60 },
  { name: 'Thu', value: 45 },
  { name: 'Fri', value: 70 },
  { name: 'Sat', value: 20 },
  { name: 'Sun', value: 10 },
];

const deptData = [
  { name: 'Eng', value: 45, color: '#5A5A40' },
  { name: 'HR', value: 15, color: '#8E9299' },
  { name: 'Mkt', value: 25, color: '#151619' },
  { name: 'Sales', value: 15, color: '#E6E6E6' },
];

function StatCard({ icon: Icon, label, value, trend, trendType }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#5A5A40]">
          <Icon size={24} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
          trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {trendType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {trend}
        </div>
      </div>
      <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">{label}</p>
      <h3 className="text-3xl font-bold text-gray-900 mt-1">{value}</h3>
    </div>
  );
}

function AdminDashboard({ stats, onAction, mounted }: any) {
  const cards = [
    {
      title: 'Work Records',
      desc: 'Detailed logs of daily tasks, projects, and activities.',
      icon: FilePlus,
      color: 'bg-emerald-50 text-emerald-600',
      actions: [
        { label: 'Add Record', onClick: () => onAction('work-record'), primary: true },
        { label: 'View All', path: '/attendance/records' }
      ]
    },
    {
      title: 'Attendance Logs',
      desc: 'View and manage detailed attendance records across the organization.',
      icon: Clock,
      color: 'bg-indigo-50 text-indigo-600',
      actions: [
        { label: 'Export Logs', path: '/attendance/logs', primary: true },
        { label: 'Dashboard', path: '/attendance/dashboard' }
      ]
    },
    {
      title: 'Leaves',
      desc: 'Manage leave requests and track balances across departments.',
      icon: Calendar,
      color: 'bg-rose-50 text-rose-600',
      actions: [
        { label: 'Request Leave', onClick: () => onAction('leave-request'), primary: true },
        { label: 'Dashboard', path: '/leave/dashboard' }
      ]
    },
    {
      title: 'Payroll',
      desc: 'Manage company-wide salary, bonuses, and payroll processing.',
      icon: CreditCard,
      color: 'bg-amber-50 text-amber-600',
      actions: [
        { label: 'Generate Payroll', path: '/payroll', primary: true },
        { label: 'Download All', path: '/payroll' }
      ]
    },
    {
      title: 'Performance',
      desc: 'Track employee growth, goals, and feedback cycles.',
      icon: TrendingUp,
      color: 'bg-violet-50 text-violet-600',
      actions: [
        { label: 'Initiate Review', onClick: () => onAction('performance-review'), primary: true },
        { label: 'View Reports', path: '/performance' }
      ]
    },
    {
      title: 'Holidays',
      desc: 'View and manage upcoming public and company holidays.',
      icon: Star,
      color: 'bg-blue-50 text-blue-600',
      actions: [
        { label: 'Add Holiday', onClick: () => onAction('holiday'), primary: true },
        { label: 'View Calendar', path: '/leaves/holidays' }
      ]
    },
    {
      title: 'Disciplinary Actions',
      desc: 'Record and monitor formal disciplinary measures and compliance.',
      icon: AlertCircle,
      color: 'bg-orange-50 text-orange-600',
      actions: [
        { label: 'Record Action', path: '/employees/disciplinary', primary: true },
        { label: 'View History', path: '/employees/disciplinary' }
      ]
    },
    {
      title: 'Settings',
      desc: 'Manage account preferences, notifications, and system configuration.',
      icon: Settings,
      color: 'bg-gray-50 text-gray-600',
      actions: [
        { label: 'Role Permissions', path: '/settings', primary: true },
        { label: 'Account Settings', path: '/settings' },
        { label: 'Notifications', path: '/settings' }
      ]
    }
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Users} label="Total Employees" value={stats?.totalEmployees || 0} trend="+12%" trendType="up" />
        <StatCard icon={Calendar} label="Active Leaves" value={stats?.activeLeaves || 0} trend="-2%" trendType="down" />
        <StatCard icon={Clock} label="Avg. Attendance" value="94.2%" trend="+0.5%" trendType="up" />
        <StatCard icon={TrendingUp} label="KPI Score" value="4.8" trend="+0.2" trendType="up" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col h-full">
            <div className={`w-14 h-14 ${card.color} rounded-2xl flex items-center justify-center mb-6`}>
              <card.icon size={28} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
            <p className="text-sm text-gray-500 font-medium mb-8 flex-1 leading-relaxed">{card.desc}</p>
            <div className="space-y-3">
              {card.actions.map((action: any, j) => (
                action.onClick ? (
                  <button
                    key={j}
                    onClick={action.onClick}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      action.primary 
                        ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/10 hover:bg-[#4A4A35]' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {action.label}
                  </button>
                ) : (
                  <Link
                    key={j}
                    to={action.path}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                      action.primary 
                        ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/10 hover:bg-[#4A4A35]' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {action.label}
                  </Link>
                )
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Workforce Overview</h3>
              <p className="text-sm text-gray-500">Employee growth over the last 7 days</p>
            </div>
          </div>
          <div className="h-[300px] w-full relative min-h-[300px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5A5A40" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#5A5A40" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151619', border: 'none', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#5A5A40" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-gray-900 mb-8">Department Distribution</h3>
          <div className="h-[250px] w-full mb-8 relative min-h-[250px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%" debounce={1}>
                <BarChart data={deptData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                  <Tooltip cursor={{ fill: '#F9FAFB' }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="space-y-4">
            {deptData.map((dept) => (
              <div key={dept.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                  <span className="text-sm font-bold text-gray-700">{dept.name}</span>
                </div>
                <span className="text-sm font-bold text-gray-900">{dept.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      <div className="bg-[#151619] rounded-[40px] p-10 text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl font-bold mb-2 tracking-tight">Good morning, {user?.email.split('@')[0]}!</h2>
            <p className="text-gray-400 text-lg">You have 3 tasks pending for today. Let's make it productive!</p>
            <div className="flex items-center gap-6 mt-8">
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Current Time</span>
                <span className="text-2xl font-mono font-bold">{time.toLocaleTimeString()}</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col">
                <span className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Hours Worked</span>
                <span className="text-2xl font-mono font-bold">06:42:10</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4 min-w-[240px]">
            <button 
              onClick={() => setIsClockedIn(!isClockedIn)}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                isClockedIn ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#5A5A40] hover:bg-[#4A4A35]'
              }`}
            >
              <Clock size={24} />
              {isClockedIn ? 'Clock Out' : 'Clock In'}
            </button>
            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3">
              <Calendar size={24} />
              Request Leave
            </button>
          </div>
        </div>
        
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#5A5A40]/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -top-20 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Attendance Summary</h3>
            <Timer size={20} className="text-gray-400" />
          </div>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">On Time</span>
              <span className="text-sm font-bold text-emerald-600">18 Days</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[85%]" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500 font-medium">Late Arrival</span>
              <span className="text-sm font-bold text-amber-600">2 Days</span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[10%]" />
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Leave Balance</h3>
            <Calendar size={20} className="text-gray-400" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Annual</p>
              <p className="text-2xl font-bold text-gray-900">12/18</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-2xl">
              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Sick</p>
              <p className="text-2xl font-bold text-gray-900">04/06</p>
            </div>
          </div>
          <button className="w-full mt-6 py-3 rounded-xl border border-gray-100 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            View History
          </button>
        </div>

        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900">Upcoming Holidays</h3>
            <AlertCircle size={20} className="text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex flex-col items-center justify-center text-rose-600">
                <span className="text-[10px] font-bold uppercase">Mar</span>
                <span className="text-lg font-bold leading-none">25</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Holi Festival</p>
                <p className="text-xs text-gray-500">Public Holiday</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center text-indigo-600">
                <span className="text-[10px] font-bold uppercase">Apr</span>
                <span className="text-lg font-bold leading-none">10</span>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Good Friday</p>
                <p className="text-xs text-gray-500">Public Holiday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.role === 'admin' || user?.role === 'hr_manager') {
      fetch('/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch stats');
        return res.json();
      })
      .then(data => setStats(data))
      .catch(err => console.error('Dashboard Stats Error:', err));
    }
  }, [user, token]);

  const handleAction = (type: string) => {
    // For now, we just open the general "Add New" modal
    // In a real app, we might pre-select the type in the modal
    setShowAddModal(true);
  };

  const addOptions = [
    { icon: UserPlus, label: 'New Employee', desc: 'Add a new member to your team', color: 'bg-indigo-50 text-indigo-600', path: '/employees' },
    { icon: Calendar, label: 'Leave Request', desc: 'Submit a new leave application', color: 'bg-rose-50 text-rose-600', path: '/leaves' },
    { icon: FilePlus, label: 'Work Record', desc: 'Log your daily activities', color: 'bg-emerald-50 text-emerald-600', path: '/attendance/records' },
    { icon: Briefcase, label: 'New Project', desc: 'Create a new project workspace', color: 'bg-amber-50 text-amber-600', path: '/attendance/records' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500">Welcome back to your ZenithHR workspace.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-500 hover:text-gray-700 shadow-sm transition-all">
            <Calendar size={20} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all"
          >
            <Plus size={20} />
            Add New
          </button>
        </div>
      </div>

      {user?.role === 'admin' || user?.role === 'hr_manager' ? (
        <AdminDashboard stats={stats} onAction={handleAction} mounted={mounted} />
      ) : (
        <EmployeeDashboard />
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
                  <h2 className="text-2xl font-bold text-gray-900">Add New</h2>
                  <p className="text-gray-500">Select what you would like to create</p>
                </div>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {addOptions.map((option, i) => (
                  <Link
                    key={i}
                    to={option.path}
                    onClick={() => setShowAddModal(false)}
                    className="flex items-start gap-4 p-6 rounded-3xl border border-gray-100 hover:border-[#5A5A40]/30 hover:bg-gray-50 transition-all text-left group"
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${option.color}`}>
                      <option.icon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-[#5A5A40] transition-colors">{option.label}</h3>
                      <p className="text-sm text-gray-500 font-medium">{option.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
