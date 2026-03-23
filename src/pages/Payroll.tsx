import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  DollarSign, 
  Download, 
  Filter, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  Loader2,
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Payroll() {
  const { user, token } = useAuthStore();
  const [payroll, setPayroll] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    fetchPayroll();
  }, []);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      alert('Payroll generated successfully for the current month!');
    }, 2000);
  };

  const fetchPayroll = async () => {
    try {
      const res = await fetch('/api/payroll', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch payroll');
      const data = await res.json();
      setPayroll(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'hr_manager';

  const stats = isAdmin ? [
    { label: 'Total Net Salary', value: '$124,500', trend: '+2.5%', trendType: 'up' },
    { label: 'Bonuses Paid', value: '$12,400', trend: '+1.2%', trendType: 'up' },
    { label: 'Tax Deductions', value: '$24,800', trend: '+0.5%', trendType: 'up' },
  ] : [
    { label: 'Monthly Salary', value: '$5,400.00', trend: '+2.5%', trendType: 'up' },
    { label: 'Total Earnings', value: '$16,200.00', trend: '+1.2%', trendType: 'up' },
    { label: 'Next Payout', value: 'Mar 31, 2024', trend: 'In 19 days', trendType: 'neutral' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Payroll</h1>
          <p className="text-gray-500">
            {isAdmin ? 'Manage company-wide salary, bonuses, and payroll processing.' : 'View your compensation, bonuses, and payslips.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-600 font-bold shadow-sm hover:bg-gray-50 transition-all">
            <Download size={18} />
            Download All
          </button>
          {isAdmin && (
            <button 
              onClick={handleGenerate}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="animate-spin" size={20} /> : null}
              {generating ? 'Generating...' : 'Generate Payroll'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-600'
              }`}>
                {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <CreditCard size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Payment History</h3>
          </div>
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Filter size={20} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Month</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Basic Salary</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Net Salary</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payslip</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-[#5A5A40] mx-auto mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Loading payroll records...</p>
                  </td>
                </tr>
              ) : payroll.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-gray-500 font-medium">No payroll records found.</p>
                  </td>
                </tr>
              ) : (
                payroll.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.first_name}`} alt="" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{p.first_name} {p.last_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">ID: EMP-00{p.employee_id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{p.month} {p.year}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-gray-600">${p.basic_salary.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-emerald-600">${p.net_salary.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest">
                        <CheckCircle2 size={12} />
                        Paid
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button className="flex items-center gap-2 text-xs font-bold text-[#5A5A40] hover:underline">
                        <Download size={14} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
