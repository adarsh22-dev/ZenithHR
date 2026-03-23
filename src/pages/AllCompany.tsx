import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Building2, 
  Users, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AllCompany() {
  const { token } = useAuthStore();
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch departments');
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Organization Overview</h1>
          <p className="text-gray-500">Explore the structure, departments, and key metrics of ZenithHR.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#5A5A40]/5 rounded-full -mr-32 -mt-32" />
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-[#5A5A40] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#5A5A40]/20">
                  <Building2 size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Zenith Global Solutions</h2>
                  <p className="text-gray-500 font-medium">Empowering Innovation Since 2010</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-gray-50">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Headquarters</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={14} className="text-[#5A5A40]" />
                    San Francisco, CA
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Website</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Globe size={14} className="text-[#5A5A40]" />
                    zenithhr.com
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Industry</p>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <TrendingUp size={14} className="text-[#5A5A40]" />
                    Technology
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900 px-2">Departments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loading ? (
                <p>Loading departments...</p>
              ) : (
                departments.map((dept) => (
                  <motion.div 
                    key={dept.id}
                    whileHover={{ y: -4 }}
                    className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white transition-all">
                        <Users size={24} />
                      </div>
                      <ChevronRight size={20} className="text-gray-300 group-hover:text-[#5A5A40] transition-colors" />
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{dept.name}</h4>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                      {dept.description}
                    </p>
                    <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-widest">
                      <span>12 Employees</span>
                      <div className="w-1 h-1 bg-gray-300 rounded-full" />
                      <span>4 Open Roles</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-[#151619] p-8 rounded-[40px] text-white">
            <h3 className="text-xl font-bold mb-8">Contact Information</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                  <Mail size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Email</p>
                  <p className="text-sm font-bold">contact@zenithhr.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone</p>
                  <p className="text-sm font-bold">+1 (555) 000-1234</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Address</p>
                  <p className="text-sm font-bold">101 Market St, San Francisco</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Company Awards</h3>
            <div className="space-y-6">
              {[
                { title: 'Best Workplace 2023', issuer: 'Forbes' },
                { title: 'Innovation Award', issuer: 'TechCrunch' },
                { title: 'Top HR Solution', issuer: 'Gartner' },
              ].map((award, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{award.title}</p>
                    <p className="text-xs text-gray-500 font-medium">{award.issuer}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
