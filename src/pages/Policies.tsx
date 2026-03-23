import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Download, 
  Loader2, 
  ChevronRight,
  FileText,
  Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Policies() {
  const { token } = useAuthStore();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await fetch('/api/policies', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch policies');
      const data = await res.json();
      setPolicies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPolicies = policies.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Policies</h1>
          <p className="text-gray-500">Access and review all organization guidelines and compliance documents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-widest">Categories</h3>
            <div className="space-y-2">
              {['All Policies', 'Work Arrangement', 'General', 'Benefits', 'Security'].map((cat) => (
                <button 
                  key={cat}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                    cat === 'All Policies' ? 'bg-[#5A5A40] text-white' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-[#151619] p-6 rounded-[32px] text-white">
            <h3 className="font-bold mb-2">Need Clarification?</h3>
            <p className="text-xs text-gray-400 mb-4 leading-relaxed">If you have questions regarding any policy, please reach out to the HR department.</p>
            <button className="w-full py-3 bg-[#5A5A40] rounded-xl text-xs font-bold hover:bg-[#4A4A35] transition-all">
              Contact HR
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-4 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search policies..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-medium"
              />
            </div>
            <button className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
              <Filter size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full py-20 text-center">
                <Loader2 className="animate-spin text-[#5A5A40] mx-auto mb-4" size={32} />
                <p className="text-gray-500 font-medium">Loading policies...</p>
              </div>
            ) : filteredPolicies.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <p className="text-gray-500 font-medium">No policies found.</p>
              </div>
            ) : (
              filteredPolicies.map((policy) => (
                <motion.div 
                  key={policy.id}
                  whileHover={{ y: -4 }}
                  className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm group cursor-pointer hover:border-[#5A5A40]/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-[#5A5A40]">
                      <FileText size={24} />
                    </div>
                    <button className="p-2 text-gray-300 hover:text-[#5A5A40] transition-colors">
                      <Download size={20} />
                    </button>
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{policy.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-6 font-medium leading-relaxed">
                    {policy.content}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <Calendar size={12} />
                      Eff: {policy.effective_date}
                    </div>
                    <div className="flex items-center gap-1 text-[#5A5A40] font-bold text-sm">
                      Read More
                      <ChevronRight size={16} />
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
