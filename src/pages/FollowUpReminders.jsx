import React, { useState, useEffect } from 'react';
import { Clock, Phone, AlertCircle, Calendar, CheckCircle2, RefreshCw, MessageCircle } from 'lucide-react';
import { leadAPI } from '../api/lead';
import { toast } from 'sonner';

export default function FollowUpReminders() {
  const [todayReminders, setTodayReminders] = useState([]);
  const [missedReminders, setMissedReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAllLeads({ limit: 200 });
      const leads = res.data?.leads || res.leads || [];

      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      const todayList = [];
      const missedList = [];

      leads.forEach((l) => {
        if (!l.followUpDate) return;
        const fDate = new Date(l.followUpDate);
        const fDateStr = fDate.toISOString().split('T')[0];

        if (fDateStr === todayStr) {
          todayList.push(l);
        } else if (fDate < now && fDateStr !== todayStr && l.status !== 'converted' && l.status !== 'closed') {
          missedList.push(l);
        }
      });

      setTodayReminders(todayList);
      setMissedReminders(missedList);
    } catch {
      toast.error('Failed to load follow-up reminders.');
    } finally {
      setLoading(false);
    }
  };

  const activeList = activeTab === 'today' ? todayReminders : missedReminders;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Clock className="w-7 h-7 text-blue-600" />
            Follow-up & Reminder Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time callback reminders and pending customer follow-up schedule for Telecallers.
          </p>
        </div>
        <button
          onClick={fetchReminders}
          className="p-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 hover:bg-slate-100 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Reminders
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'today'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Today's Follow-ups ({todayReminders.length})
        </button>
        <button
          onClick={() => setActiveTab('missed')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'missed'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-500/20'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          Missed Follow-ups ({missedReminders.length})
        </button>
      </div>

      {/* Reminders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            Loading follow-up schedule...
          </div>
        ) : activeList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No {activeTab === 'today' ? "Today's" : "Missed"} Follow-ups Pending</h3>
            <p className="text-xs text-slate-400 mt-1">All scheduled callbacks are up to date!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Customer Name & Phone</th>
                  <th className="py-3.5 px-4">Scheduled Date & Time</th>
                  <th className="py-3.5 px-4">Calling Status</th>
                  <th className="py-3.5 px-4">Latest Remarks</th>
                  <th className="py-3.5 px-4 text-center">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {activeList.map((lead) => {
                  const cleanedPhone = lead.phone.replace(/\D/g, '');
                  const waPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
                  return (
                    <tr key={lead._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{lead.name || 'Unnamed Lead'}</div>
                        <div className="text-xs text-slate-500">{lead.phone}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">
                        {new Date(lead.followUpDate).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-xl">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                        {lead.remarks?.length > 0 ? lead.remarks[lead.remarks.length - 1].note : 'No notes'}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`tel:${lead.phone}`}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call Now
                          </a>
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${lead.name || ''},`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
