import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  Loader2, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  User,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { validateForm } from '../utils/validation';

export default function HelpDesk() {
  const { token, user } = useAuthStore();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await fetch('/api/help-desk', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm(newTicket, {
      subject: [{ type: 'required' }],
      description: [{ type: 'required' }]
    });

    if (errors.length > 0) {
      const errorMap: Record<string, string> = {};
      errors.forEach(err => errorMap[err.field] = err.message);
      setFieldErrors(errorMap);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/help-desk', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ 
          employee_id: user?.employee_id,
          ...newTicket
        })
      });
      if (res.ok) {
        setShowModal(false);
        setNewTicket({ subject: '', description: '', priority: 'Medium' });
        setFieldErrors({});
        fetchTickets();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Help Desk</h1>
          <p className="text-gray-500">Submit and track support requests for IT, HR, or facilities.</p>
        </div>
        <button 
          onClick={() => {
            setShowModal(true);
            setFieldErrors({});
          }}
          className="flex items-center gap-2 px-6 py-3 bg-[#5A5A40] text-white rounded-xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all"
        >
          <Plus size={20} />
          Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Tickets', value: tickets.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Open', value: tickets.filter(t => t.status === 'Open').length, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Resolved', value: tickets.filter(t => t.status === 'Resolved').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <MessageSquare size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
              <LifeBuoy size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Support Tickets</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search tickets..." 
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-[#5A5A40]/10"
              />
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket ID</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Created</th>
                <th className="px-8 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <Loader2 className="animate-spin text-[#5A5A40] mx-auto mb-4" size={32} />
                    <p className="text-gray-500 font-medium">Loading tickets...</p>
                  </td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <p className="text-gray-500 font-medium">No tickets found.</p>
                  </td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">#TK-{ticket.id.toString().padStart(4, '0')}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{ticket.subject}</p>
                      <p className="text-xs text-gray-500 font-medium truncate max-w-[200px]">{ticket.description}</p>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        ticket.priority === 'Urgent' ? 'bg-rose-50 text-rose-600' : 
                        ticket.priority === 'High' ? 'bg-amber-50 text-amber-600' : 
                        'bg-indigo-50 text-indigo-600'
                      }`}>
                        {ticket.priority}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        ticket.status === 'Resolved' ? 'bg-emerald-50 text-emerald-600' : 
                        ticket.status === 'Open' ? 'bg-rose-50 text-rose-600' : 
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {ticket.status}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-gray-900">{new Date(ticket.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="px-8 py-6">
                      <button className="text-gray-400 group-hover:text-[#5A5A40] transition-colors">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-[#151619]/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Create Support Ticket</h3>
                <p className="text-gray-500 mb-8 font-medium">Describe your issue and we'll get back to you shortly.</p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Subject</label>
                    <input 
                      type="text"
                      placeholder="e.g. Printer not working"
                      value={newTicket.subject}
                      onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                      className={`w-full bg-gray-50 border ${fieldErrors.subject ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-bold text-gray-900`}
                    />
                    {fieldErrors.subject && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.subject}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Priority</label>
                    <select 
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-bold text-gray-900"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                    <textarea 
                      value={newTicket.description}
                      onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                      placeholder="Provide more details about your request..."
                      className={`w-full bg-gray-50 border ${fieldErrors.description ? 'border-rose-300 ring-2 ring-rose-50' : 'border-gray-100'} rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-[#5A5A40]/10 font-medium text-gray-900 min-h-[120px]`}
                    />
                    {fieldErrors.description && <p className="text-[10px] text-rose-500 font-bold ml-1">{fieldErrors.description}</p>}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button 
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="flex-1 py-4 bg-[#5A5A40] text-white rounded-2xl font-bold shadow-lg shadow-[#5A5A40]/20 hover:bg-[#4A4A35] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : null}
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
