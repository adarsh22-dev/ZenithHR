import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  ShieldAlert, 
  Calendar, 
  Info, 
  AlertCircle,
  Loader2,
  Lock
} from 'lucide-react';

export default function RestrictLeaves() {
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Restrict Leaves</h1>
          <p className="text-gray-500">View periods where leave applications are restricted due to high business demand.</p>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
            <Lock size={20} />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Blackout Periods 2024</h3>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Year-End Closing', range: 'Dec 20 - Dec 31', reason: 'Financial auditing and reporting.' },
              { title: 'Product Launch Q2', range: 'Apr 15 - Apr 30', reason: 'Critical release window for major features.' },
              { title: 'Annual Conference', range: 'Sep 10 - Sep 15', reason: 'All-hands event and client summit.' },
            ].map((period, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
                <div className="flex items-center gap-2 text-rose-600 mb-4">
                  <AlertCircle size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Restricted</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-1">{period.title}</h4>
                <p className="text-sm font-bold text-[#5A5A40] mb-4">{period.range}</p>
                <p className="text-xs text-gray-500 font-medium leading-relaxed">
                  {period.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 p-8 rounded-[40px] border border-amber-100 flex gap-6">
        <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center shrink-0">
          <Info size={24} />
        </div>
        <div>
          <h4 className="text-lg font-bold text-amber-900 mb-2">Exception Policy</h4>
          <p className="text-sm text-amber-800 font-medium leading-relaxed">
            In case of emergencies or pre-planned essential travel, exceptions can be made with VP-level approval. Please submit your request at least 4 weeks in advance for restricted periods.
          </p>
        </div>
      </div>
    </div>
  );
}
