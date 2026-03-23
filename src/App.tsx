import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Settings as SettingsIcon, 
  LogOut,
  Bell,
  Search,
  ChevronDown,
  ChevronRight,
  Menu,
  X,
  User,
  FileText,
  AlertTriangle,
  BookOpen,
  MapPin,
  History,
  ClipboardList,
  LifeBuoy,
  Building2
} from 'lucide-react';
import { useAuthStore } from './store/authStore';
import Dashboard from './pages/Dashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AttendanceDashboard from './pages/AttendanceDashboard';
import LeaveDashboard from './pages/LeaveDashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Payroll from './pages/Payroll';
import Performance from './pages/Performance';
import Settings from './pages/Settings';
import Login from './pages/Login';
import PlaceholderPage from './pages/PlaceholderPage';
import EmployeeProfile from './pages/EmployeeProfile';
import WorkTypeRequests from './pages/WorkTypeRequests';
import Holidays from './pages/Holidays';
import AttendanceLogs from './pages/AttendanceLogs';
import MovementRegister from './pages/MovementRegister';
import Policies from './pages/Policies';
import DisciplinaryActions from './pages/DisciplinaryActions';
import HelpDesk from './pages/HelpDesk';
import AllCompany from './pages/AllCompany';
import LeaveAllocation from './pages/LeaveAllocation';
import HourAccount from './pages/HourAccount';
import WorkRecords from './pages/WorkRecords';
import CompanyLeaves from './pages/CompanyLeaves';
import RestrictLeaves from './pages/RestrictLeaves';
import CompensatoryLeaveRequests from './pages/CompensatoryLeaveRequests';
import { motion, AnimatePresence } from 'motion/react';

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Building2, label: 'All Company', path: '/company' },
    { 
      icon: Users, 
      label: 'Employee', 
      subItems: [
        { label: 'Dashboard', path: '/employee/dashboard' },
        { label: 'Profile', path: '/employee/profile' },
        { label: 'Work Type Requests', path: '/employee/work-type' },
        { label: 'Disciplinary Actions', path: '/employee/disciplinary' },
        { label: 'Policies', path: '/employee/policies' },
      ]
    },
    { 
      icon: Clock, 
      label: 'Attendance', 
      subItems: [
        { label: 'Dashboard', path: '/attendance/dashboard' },
        { label: 'Movement Register', path: '/attendance/movement' },
        { label: 'Hour Account', path: '/attendance/hours' },
        { label: 'Work Records', path: '/attendance/records' },
        { label: 'Attendance Logs', path: '/attendance/logs' },
        { label: 'My Attendances', path: '/attendance/my' },
      ]
    },
    { 
      icon: Calendar, 
      label: 'Leave', 
      subItems: [
        { label: 'Dashboard', path: '/leave/dashboard' },
        { label: 'My Leave Requests', path: '/leave/requests' },
        { label: 'Leave Allocation Request', path: '/leave/allocation' },
        { label: 'Holidays', path: '/leave/holidays' },
        { label: 'Company Leaves', path: '/leave/company' },
        { label: 'Restrict Leaves', path: '/leave/restrict' },
        { label: 'Compensatory Leave Requests', path: '/leave/compensatory' },
      ]
    },
    { icon: DollarSign, label: 'Payroll', path: '/payroll' },
    { icon: TrendingUp, label: 'Performance', path: '/performance' },
    { icon: LifeBuoy, label: 'Help Desk', path: '/help-desk' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="w-64 bg-[#151619] h-screen fixed left-0 top-0 text-white p-6 flex flex-col overflow-y-auto scrollbar-hide z-50">
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center">
          <span className="text-xl font-bold">Z</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">ZenithHR</h1>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.subItems ? (
              <div>
                <button
                  onClick={() => toggleMenu(item.label)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-gray-400 hover:text-white hover:bg-white/5 ${
                    expandedMenus.includes(item.label) ? 'text-white bg-white/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {expandedMenus.includes(item.label) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
                <AnimatePresence>
                  {expandedMenus.includes(item.label) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden ml-4 mt-1 space-y-1"
                    >
                      {item.subItems.map((sub) => (
                        <Link
                          key={sub.path}
                          to={sub.path}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                            location.pathname === sub.path 
                              ? 'text-white bg-[#5A5A40]/20' 
                              : 'text-gray-500 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>{sub.label}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to={item.path!}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  location.pathname === item.path 
                    ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/10 mt-6">
        <div className="flex items-center gap-3 px-2 mb-6">
          <div className="w-10 h-10 rounded-full bg-gray-700 overflow-hidden">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} alt="avatar" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{user?.email.split('@')[0]}</p>
            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{user?.role}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-rose-400 hover:bg-rose-400/10 transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}

function Header() {
  const { user } = useAuthStore();
  
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 w-96">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="bg-transparent border-none outline-none text-sm w-full"
        />
      </div>

      <div className="flex items-center gap-6">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
        </button>
        
        <div className="w-px h-6 bg-gray-200" />
        
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">Acme Corp</p>
            <p className="text-[10px] text-gray-400 font-bold uppercase">Enterprise Plan</p>
          </div>
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
            <ChevronDown size={16} className="text-gray-400" />
          </div>
        </div>
      </div>
    </header>
  );
}

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <PrivateRoute>
            <div className="min-h-screen bg-[#F8F9FA] flex overflow-hidden">
              <Sidebar />
              <div className="flex-1 ml-64 flex flex-col h-screen overflow-y-auto relative">
                <Header />
                <main className="p-8 max-w-7xl mx-auto w-full relative">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/company" element={<AllCompany />} />
                    
                    <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
                    <Route path="/employee/profile" element={<EmployeeProfile />} />
                    <Route path="/employee/work-type" element={<WorkTypeRequests />} />
                    <Route path="/employee/disciplinary" element={<DisciplinaryActions />} />
                    <Route path="/employee/policies" element={<Policies />} />
                    
                    <Route path="/attendance/dashboard" element={<AttendanceDashboard />} />
                    <Route path="/attendance/movement" element={<MovementRegister />} />
                    <Route path="/attendance/hours" element={<HourAccount />} />
                    <Route path="/attendance/records" element={<WorkRecords />} />
                    <Route path="/attendance/logs" element={<AttendanceLogs />} />
                    <Route path="/attendance/my" element={<Attendance />} />
                    
                    <Route path="/leave/dashboard" element={<LeaveDashboard />} />
                    <Route path="/leave/requests" element={<Leaves />} />
                    <Route path="/leave/allocation" element={<LeaveAllocation />} />
                    <Route path="/leave/holidays" element={<Holidays />} />
                    <Route path="/leave/company" element={<CompanyLeaves />} />
                    <Route path="/leave/restrict" element={<RestrictLeaves />} />
                    <Route path="/leave/compensatory" element={<CompensatoryLeaveRequests />} />

                    <Route path="/employees" element={<Employees />} />
                    <Route path="/attendance" element={<Attendance />} />
                    <Route path="/leaves" element={<Leaves />} />
                    <Route path="/payroll" element={<Payroll />} />
                    <Route path="/performance" element={<Performance />} />
                    <Route path="/help-desk" element={<HelpDesk />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </div>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  );
}
