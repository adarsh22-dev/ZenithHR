import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Calendar, 
  Search, 
  Filter, 
  Loader2, 
  Gift,
  ChevronRight,
  Info
} from 'lucide-react';

export default function CompanyLeaves() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company Leaves</h1>
          <p className="text-gray-500">Special leaves granted by the company for specific events or milestones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { title: 'Marriage Leave', days: '5 Days', description: 'Granted for the employee\'s own marriage. One-time benefit.' },
          { title: 'Paternity Leave', days: '10 Days', description: 'Granted to new fathers for child care and support.' },
          { title: 'Bereavement Leave', days: '3 Days', description: 'Granted in the unfortunate event of the death of an immediate family member.' },
          { title: 'Volunteer Leave', days: '2 Days', description: 'Annual leave for participating in community service or volunteering.' },
        ].map((leave, i) => (
          <div key={i} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:border-[#5A5A40]/30 transition-all group">
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Gift size={24} />
              </div>
              <span className="text-lg font-bold text-gray-900">{leave.days}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{leave.title}</h3>
            <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
              {leave.description}
            </p>
            <button className="flex items-center gap-2 text-[#5A5A40] font-bold text-sm group-hover:gap-3 transition-all">
              View Eligibility
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      <div className="bg-[#151619] p-10 rounded-[40px] text-white">
        <div className="flex items-center gap-4 mb-6">
          <Info className="text-[#5A5A40]" size={28} />
          <h3 className="text-2xl font-bold">Important Note</h3>
        </div>
        <p className="text-gray-400 font-medium leading-relaxed max-w-3xl">
          Company leaves are subject to approval and may require supporting documentation (e.g., marriage certificate, medical records). These leaves do not carry forward to the next year and are not encashable.
        </p>
      </div>
    </div>
  );
}
