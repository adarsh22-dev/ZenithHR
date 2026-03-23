import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Clock, 
  Search, 
  Filter, 
  Loader2, 
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

export default function HourAccount() {
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Hour Account</h1>
          <p className="text-gray-500">Monitor working hours, overtime, and deficit balances.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Total Hours (MTD)</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-gray-900">164.5</h3>
            <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
              <TrendingUp size={14} />
              +12%
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Overtime Balance</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-gray-900">8.2</h3>
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Clock size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Deficit Hours</p>
          <div className="flex items-end justify-between">
            <h3 className="text-4xl font-bold text-gray-900">0.0</h3>
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">Monthly Breakdown</h3>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Expected</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actual</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Difference</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                { date: '2024-03-11', expected: '8.0', actual: '8.5', diff: '+0.5', status: 'Overtime' },
                { date: '2024-03-10', expected: '8.0', actual: '8.0', diff: '0.0', status: 'Regular' },
                { date: '2024-03-09', expected: '8.0', actual: '9.2', diff: '+1.2', status: 'Overtime' },
                { date: '2024-03-08', expected: '8.0', actual: '7.5', diff: '-0.5', status: 'Deficit' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 font-bold text-gray-900">{row.date}</td>
                  <td className="px-8 py-6 text-gray-600 font-medium">{row.expected}h</td>
                  <td className="px-8 py-6 text-gray-900 font-bold">{row.actual}h</td>
                  <td className={`px-8 py-6 font-bold ${row.diff.startsWith('+') ? 'text-emerald-600' : row.diff === '0.0' ? 'text-gray-400' : 'text-rose-600'}`}>
                    {row.diff}h
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                      row.status === 'Overtime' ? 'bg-emerald-50 text-emerald-600' : 
                      row.status === 'Regular' ? 'bg-gray-50 text-gray-500' : 
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
