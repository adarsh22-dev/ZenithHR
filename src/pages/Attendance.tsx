import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  Clock, 
  Calendar, 
  MapPin, 
  Coffee, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  History,
  Download,
  Filter,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Attendance() {
  const { user, token } = useAuthStore();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [clocking, setClocking] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await fetch('/api/attendance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch attendance');
      const data = await res.json();
      setAttendance(data);
      
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = data.find((a: any) => a.date === today && a.employee_id === user?.employee_id);
      if (todayRecord && !todayRecord.clock_out) {
        setIsClockedIn(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClockAction = async () => {
    setClocking(true);
    const endpoint = isClockedIn ? '/api/attendance/clock-out' : '/api/attendance/clock-in';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ employee_id: user?.employee_id })
      });
      if (res.ok) {
        setIsClockedIn(!isClockedIn);
        fetchAttendance();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setClocking(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Attendance</h1>
          <p className="text-gray-500">Track your work hours and manage breaks.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 rounded-xl text-gray-600 font-bold shadow-sm hover:bg-gray-50 transition-all">
            <Download size={18} />
            Export Log
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-[#151619] rounded-[40px] p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <Clock size={24} className="text-[#5A5A40]" />
                </div>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  isClockedIn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {isClockedIn ? 'Currently Working' : 'Off Duty'}
                </div>
              </div>
              
              <div className="mb-10">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-2">Work Session</p>
                <h2 className="text-5xl font-mono font-bold tracking-tighter">
                  {isClockedIn ? '06:42:10' : '00:00:00'}
                </h2>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleClockAction}
                  disabled={clocking}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-3 disabled:opacity-50 ${
                    isClockedIn ? 'bg-rose-500 hover:bg-rose-600' : 'bg-[#5A5A40] hover:bg-[#4A4A35]'
                  }`}
                >
                  {clocking ? <Loader2 className="animate-spin" size={24} /> : <Clock size={24} />}
                  {isClockedIn ? 'Clock Out' : 'Clock In'}
                </button>
                <button 
                  disabled={!isClockedIn}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Coffee size={24} />
                  Take a Break
                </button>
              </div>
            </div>
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-[#5A5A40]/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Today's Timeline</h3>
            <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-gray-100">
              <div className="flex gap-6 relative">
                <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 z-10 border-4 border-white">
                  <CheckCircle2 size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Clocked In</p>
                  <p className="text-xs text-gray-500">09:15 AM • Office HQ</p>
                </div>
              </div>
              <div className="flex gap-6 relative">
                <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 z-10 border-4 border-white">
                  <Coffee size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Lunch Break</p>
                  <p className="text-xs text-gray-500">01:00 PM - 01:45 PM</p>
                </div>
              </div>
              <div className="flex gap-6 relative">
                <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 z-10 border-4 border-white">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-400 italic">Pending Clock Out</p>
                  <p className="text-xs text-gray-500">Expected 06:15 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                <History size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Attendance Log</h3>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clock In</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clock Out</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Hours</th>
                  <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <Loader2 className="animate-spin text-[#5A5A40] mx-auto mb-4" size={32} />
                      <p className="text-gray-500 font-medium">Loading history...</p>
                    </td>
                  </tr>
                ) : attendance.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <p className="text-gray-500 font-medium">No attendance records found.</p>
                    </td>
                  </tr>
                ) : (
                  attendance.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-900">{new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-medium text-gray-600">{record.clock_in || '--:--'}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-medium text-gray-600">{record.clock_out || '--:--'}</p>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-sm font-bold text-gray-900">{record.total_hours ? `${record.total_hours}h` : '--'}</p>
                      </td>
                      <td className="px-8 py-5">
                        <div className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          record.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {record.status}
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
    </div>
  );
}
