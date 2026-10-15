import React, { useState, useEffect } from 'react';
import { 
  Clock, Phone, AlertCircle, Calendar, CheckCircle2, RefreshCw, 
  MessageCircle, Edit3, X, History, User, Tag, Send, Check 
} from 'lucide-react';
import { leadAPI } from '../api/lead';
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { value: 'interested', label: 'Interested', color: 'bg-emerald-100 text-emerald-800' },
  { value: 'callback', label: 'Callback Requested', color: 'bg-blue-100 text-blue-800' },
  { value: 'ringing', label: 'Ringing / No Answer', color: 'bg-amber-100 text-amber-800' },
  { value: 'busy', label: 'Busy / Call Later', color: 'bg-orange-100 text-orange-800' },
  { value: 'not_interested', label: 'Not Interested', color: 'bg-slate-100 text-slate-800' },
  { value: 'call_done', label: 'Call Done', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'invalid_number', label: 'Invalid / Wrong Number', color: 'bg-rose-100 text-rose-800' },
  { value: 'converted', label: 'Converted / Ready to Close', color: 'bg-teal-100 text-teal-800' }
];

const QUICK_TAGS = [
  'Asked to call tomorrow',
  'Interested in 5kW Solar',
  'Wants branch visit',
  'Phone not reachable',
  'Requested quotation on WhatsApp',
  'Follow-up next week'
];

export default function FollowUpReminders() {
  const [todayReminders, setTodayReminders] = useState([]);
  const [missedReminders, setMissedReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');

  // Remark Modal State
  const [activeRemarkLead, setActiveRemarkLead] = useState(null);
  const [remarkStatus, setRemarkStatus] = useState('callback');
  const [remarkNote, setRemarkNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAllLeads({ limit: 1000 });
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

  const openRemarkModal = (lead) => {
    setActiveRemarkLead(lead);
    setRemarkStatus(lead.status || 'callback');
    setRemarkNote('');
    
    // Default next follow-up to tomorrow same time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setMinutes(0, 0, 0);
    const tzOffset = tomorrow.getTimezoneOffset() * 60000;
    const localISOTime = new Date(tomorrow.getTime() - tzOffset).toISOString().slice(0, 16);
    setNextFollowUpDate(localISOTime);
  };

  const handleSaveRemark = async (e) => {
    e.preventDefault();
    if (!activeRemarkLead) return;
    if (!remarkNote.trim()) {
      toast.error('Please enter a remark note.');
      return;
    }

    try {
      setSubmittingRemark(true);
      await leadAPI.logCall(activeRemarkLead._id, {
        callStatus: remarkStatus,
        note: remarkNote.trim(),
        followUpDate: nextFollowUpDate ? new Date(nextFollowUpDate).toISOString() : null,
      });

      toast.success('Remark and follow-up updated successfully!');
      setActiveRemarkLead(null);
      fetchReminders();
    } catch (err) {
      toast.error('Failed to update remark: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingRemark(false);
    }
  };

  const filteredList = (activeTab === 'today' ? todayReminders : missedReminders).filter((lead) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (lead.name && lead.name.toLowerCase().includes(q)) ||
      (lead.phone && lead.phone.includes(q)) ||
      (lead.city && lead.city.toLowerCase().includes(q)) ||
      (lead.status && lead.status.toLowerCase().includes(q))
    );
  });

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
            Real-time callback reminders, pending customer follow-ups, and remark logging for Telecallers.
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

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-2.5">
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

        <div className="w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, phone, city..."
            className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Reminders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            Loading follow-up schedule...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">
              No {activeTab === 'today' ? "Today's" : "Missed"} Follow-ups Found
            </h3>
            <p className="text-xs text-slate-400 mt-1">All scheduled callbacks are clear!</p>
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
                  <th className="py-3.5 px-4 text-center">Actions & Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredList.map((lead) => {
                  const cleanedPhone = lead.phone.replace(/\D/g, '');
                  const waPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
                  const latestRemark =
                    lead.remarks && lead.remarks.length > 0
                      ? lead.remarks[lead.remarks.length - 1]
                      : null;

                  return (
                    <tr key={lead._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm">{lead.name || 'Unnamed Lead'}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span>{lead.phone}</span>
                          {lead.city && (
                            <span className="text-[10px] text-slate-400">({lead.city})</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-blue-600">
                        {lead.followUpDate ? new Date(lead.followUpDate).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-xl uppercase">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs">
                        {latestRemark ? (
                          <div>
                            <p className="truncate font-semibold">{latestRemark.note}</p>
                            <span className="text-[10px] text-slate-400">
                              {new Date(latestRemark.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No notes yet</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openRemarkModal(lead)}
                            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                            title="Add Remark / Update Follow-up"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Remark
                          </button>
                          <a
                            href={`tel:${lead.phone}`}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition flex items-center gap-1 shadow-sm"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(
                              `Hello ${lead.name || ''}, regarding your solar inquiry:`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-xl transition"
                            title="Chat on WhatsApp"
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

      {/* ══════════ REMARK & CALLBACK MODAL ══════════ */}
      {activeRemarkLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-500" />
                  Add Remark & Update Callback
                </h3>
                <p className="text-xs text-slate-500">
                  Customer: <strong className="text-slate-800">{activeRemarkLead.name || 'Unnamed'}</strong> ({activeRemarkLead.phone})
                </p>
              </div>
              <button
                onClick={() => setActiveRemarkLead(null)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Previous Remarks History */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-blue-600" />
                  Remark History ({activeRemarkLead.remarks?.length || 0})
                </h4>
                {activeRemarkLead.remarks && activeRemarkLead.remarks.length > 0 ? (
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1 border border-slate-200 rounded-2xl p-3 bg-slate-50/50">
                    {[...activeRemarkLead.remarks].reverse().map((r, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs">
                        <p className="text-slate-800 font-semibold leading-relaxed">{r.note}</p>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                          <span>{r.addedBy?.name || 'Telecaller'}</span>
                          <span>{new Date(r.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 text-center">
                    No previous remarks recorded for this lead.
                  </div>
                )}
              </div>

              {/* Form to Add New Remark */}
              <form onSubmit={handleSaveRemark} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Status Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Update Lead Calling Status *
                    </label>
                    <select
                      value={remarkStatus}
                      onChange={(e) => setRemarkStatus(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Reschedule Callback Date & Time */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Next Follow-up / Callback Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Tags */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Quick Notes:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          setRemarkNote((prev) => (prev ? `${prev} | ${tag}` : tag));
                        }}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-slate-100 hover:bg-amber-100 text-slate-700 hover:text-amber-900 border border-slate-200 transition"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remark Note Input */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Remark Note / Customer Feedback *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={remarkNote}
                    onChange={(e) => setRemarkNote(e.target.value)}
                    placeholder="Enter what the customer said, requirement details, callback reason..."
                    className="w-full p-3.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveRemarkLead(null)}
                    className="px-5 py-2.5 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRemark || !remarkNote.trim()}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-2xl text-xs font-black shadow-md shadow-amber-500/20 transition flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingRemark ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Save Remark & Update
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
