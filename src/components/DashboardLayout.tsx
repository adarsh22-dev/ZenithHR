import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  Calendar, 
  CreditCard, 
  TrendingUp, 
  FileText, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  ClipboardList,
  History,
  UserCheck
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import AIAssistant from './AIAssistant';

interface NavItem {
  icon: any;
  label: string;
  path?: string;
  role?: string[];
  children?: { label: string; path: string; icon?: any }[];
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { 
    icon: Users, 
    label: 'Employee', 
    role: ['admin', 'hr_manager'],
    children: [
      { label: 'Profile', path: '/employees' },
      { label: 'Work Type Requests', path: '/employees/work-type' },
      { label: 'Disciplinary Actions', path: '/employees/disciplinary' },
      { label: 'Policies', path: '/employees/policies' },
    ]
  },
  { 
    icon: Clock, 
    label: 'Attendance', 
    children: [
      { label: 'Movement Register', path: '/attendance/movement', icon: ClipboardList },
      { label: 'Hour Account', path: '/attendance/hours', icon: History },
      { label: 'Work Records', path: '/attendance/records', icon: FileText },
      { label: 'Attendance Logs', path: '/attendance/logs', icon: History },
      { label: 'Overtime View', path: '/attendance/overtime', icon: TrendingUp },
      { label: 'My Attendances', path: '/attendance', icon: UserCheck },
    ]
  },
  { 
    icon: Calendar, 
    label: 'Leave', 
    children: [
      { label: 'Dashboard', path: '/leaves' },
      { label: 'My Leave Requests', path: '/leaves/my-requests' },
      { label: 'Leave Allocation Request', path: '/leaves/allocation' },
      { label: 'Holidays', path: '/leaves/holidays' },
      { label: 'Company Leaves', path: '/leaves/company' },
      { label: 'Restrict Leaves', path: '/leaves/restrict' },
      { label: 'Compensatory Leave Requests', path: '/leaves/compensatory' },
    ]
  },
  { icon: CreditCard, label: 'Payroll', path: '/payroll', role: ['admin', 'hr_manager'] },
  { icon: TrendingUp, label: 'Performance', path: '/performance' },
  { icon: FileText, label: 'Reports', path: '/reports', role: ['admin', 'hr_manager'] },
  { icon: HelpCircle, label: 'Help Desk', path: '/help' },
  { icon: Settings, label: 'Settings', path: '/settings', role: ['admin'] },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [expandedMenus, setExpandedMenus] = React.useState<string[]>(['Attendance']);

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev => 
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => {
    if (!item.role) return true;
    return item.role.includes(user?.role || '');
  });

  const renderNavItem = (item: NavItem, isMobile = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.label);
    const isActive = item.path ? location.pathname === item.path : item.children?.some(c => location.pathname === c.path);

    if (hasChildren) {
      return (
        <div key={item.label} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.label)}
            className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
              isActive 
                ? 'bg-[#5A5A40]/5 text-[#5A5A40]' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-[#5A5A40]'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </div>
            {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pl-10 space-y-1"
              >
                {item.children?.map((child) => {
                  const isChildActive = location.pathname === child.path;
                  return (
                    <Link
                      key={child.path}
                      to={child.path}
                      onClick={() => isMobile && setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                        isChildActive 
                          ? 'text-[#5A5A40] font-bold' 
                          : 'text-gray-400 hover:text-[#5A5A40]'
                      }`}
                    >
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path!}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
          isActive 
            ? 'bg-[#5A5A40] text-white shadow-lg shadow-[#5A5A40]/20' 
            : 'text-gray-500 hover:bg-gray-50 hover:text-[#5A5A40]'
        }`}
      >
        <item.icon size={20} />
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white border-r border-gray-100 h-screen sticky top-0 overflow-y-auto">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">Z</span>
            </div>
            <h1 className="text-xl font-serif font-bold text-[#1a1a1a]">ZenithHR</h1>
          </div>

          <nav className="space-y-1">
            {filteredNavItems.map((item) => renderNavItem(item))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-gray-50">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 text-gray-500"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden md:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
              <div className="w-8 h-8 bg-[#5A5A40]/10 rounded-lg flex items-center justify-center text-[#5A5A40]">
                <Users size={18} />
              </div>
              <select className="bg-transparent border-none text-sm font-bold text-gray-700 outline-none cursor-pointer">
                <option>All Companies</option>
                <option>Zenith Corp</option>
                <option>Horilla Tech</option>
              </select>
            </div>

            <form onSubmit={handleSearch} className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-[#5A5A40]/10 outline-none"
              />
            </form>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <button className="relative p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-all">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-[1px] bg-gray-100 mx-2 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.email.split('@')[0]}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-full border-2 border-white shadow-sm overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email}`} 
                  alt="Avatar"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <AIAssistant />

      {/* Mobile Menu Overlay */}
      <AnimatePresence mode="wait">
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-50 lg:hidden p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#5A5A40] rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">Z</span>
                  </div>
                  <h1 className="text-lg font-serif font-bold text-[#1a1a1a]">ZenithHR</h1>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X size={24} className="text-gray-400" />
                </button>
              </div>
              <nav className="space-y-1">
                {filteredNavItems.map((item) => renderNavItem(item, true))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
