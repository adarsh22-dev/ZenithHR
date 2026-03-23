import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Clock, 
  Search, 
  Filter, 
  Download, 
  Calendar as CalendarIcon,
  User,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export default function AttendanceLogs() {
  const { token, user } = useAuthStore();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      alert('Attendance logs exported successfully!');
    }, 1500);
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch logs');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    `${log.first_name} ${log.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.employee_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance Logs</h1>
          <p className="text-gray-500">View and manage detailed attendance records across the organization.</p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-600 font-bold shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
          {exporting ? 'Exporting...' : 'Export Logs'}
        </button>
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by employee name or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all">
              <Filter size={20} />
            </button>
            <button className="p-3 bg-gray-50 text-gray-500 rounded-xl hover:bg-gray-100 transition-all flex items-center gap-2 font-bold text-sm">
              <CalendarIcon size={18} />
              This Month
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employee</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check In</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Check Out</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Duration</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-[#5A5A40] mx-auto mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Loading attendance logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-gray-500 font-medium">No attendance records found.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden">
                          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.first_name}`} alt="" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{log.first_name} {log.last_name}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{log.employee_code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        {log.check_in}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                        <div className="w-2 h-2 rounded-full bg-rose-500" />
                        {log.check_out || '--:--'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-medium text-gray-600">{log.duration || '--'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        log.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 
                        log.status === 'Late' ? 'bg-amber-50 text-amber-600' : 
                        'bg-rose-50 text-rose-600'
                      }`}>
                        {log.status === 'Present' ? <CheckCircle2 size={12} /> : 
                         log.status === 'Late' ? <AlertCircle size={12} /> : 
                         <XCircle size={12} />}
                        {log.status}
                      </div>
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
