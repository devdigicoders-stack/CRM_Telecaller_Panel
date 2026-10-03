import React, { useState, useEffect } from 'react';
import { PhoneCall, MessageCircle, Search, RefreshCw, AlertCircle, Clock, FileText } from 'lucide-react';
import { leadAPI } from '../api/lead';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import axiosInstance from '../api/axiosInstance';

const STATUS_COLORS = {
  new: 'bg-slate-100 text-slate-700',
  assigned: 'bg-blue-100 text-blue-800',
  interested: 'bg-emerald-100 text-emerald-800',
  callback: 'bg-amber-100 text-amber-800',
  not_interested: 'bg-rose-100 text-rose-800',
  converted: 'bg-purple-100 text-purple-800',
  in_process: 'bg-cyan-100 text-cyan-800',
};

export default function MyLeads() {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeLead, setActiveLead] = useState(null);
  const [remarkNote, setRemarkNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchMyLeads(); }, [search, statusFilter]);

  const fetchMyLeads = async () => {
    try {
      setLoading(true);
      setLeads([]);
    } catch {
      toast.error('Failed to load your leads.');
    } finally {
      setLoading(false);
    }
  };

  const openRemarkModal = (lead) => {
    setActiveLead(lead);
    setRemarkNote('');
    setFollowUpDate('');
    setNewStatus(lead.status);
  };

  const handleSaveRemark = async (e) => {
    e.preventDefault();
    if (!remarkNote.trim()) { toast.error('Remark note required.'); return; }
    try {
      setSubmitting(true);
      await axiosInstance.post(`/leads/${activeLead._id}/remarks`, {
        note: remarkNote,
        followUpDate: followUpDate || null,
        status: newStatus || undefined,
      });
      toast.success('Remark saved!');
      setActiveLead(null);
      fetchMyLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save remark.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-7 h-7 text-amber-500" />
            My Leads
          </h1>
          <p className="text-xs text-slate-500 mt-1">All leads assigned to you — add remarks, set follow-ups.</p>
        </div>
        <button onClick={fetchMyLeads} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-100 shadow-sm transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-2xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
        >
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="assigned">Assigned</option>
          <option value="interested">Interested</option>
          <option value="callback">Callback</option>
          <option value="not_interested">Not Interested</option>
          <option value="in_process">In Process</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      {/* Leads List */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
            Loading your leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No leads assigned to you</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Follow-up</th>
                  <th className="py-3.5 px-4">Last Remark</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leads.map((lead) => {
                  const cleanedPhone = lead.phone.replace(/\D/g, '');
                  const waPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
                  return (
                    <tr key={lead._id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{lead.name || 'Unnamed'}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500">{lead.phone}</span>
                          <a href={`tel:${lead.phone}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <PhoneCall className="w-3.5 h-3.5" />
                          </a>
                          <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-xl ${STATUS_COLORS[lead.status] || 'bg-slate-100 text-slate-700'}`}>
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        {lead.followUpDate ? (
                          <span className="flex items-center gap-1 font-bold text-blue-600">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(lead.followUpDate).toLocaleDateString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-400">Not set</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600">
                        {lead.remarks?.length > 0 ? lead.remarks[lead.remarks.length - 1].note : '—'}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => openRemarkModal(lead)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 font-bold rounded-xl text-xs transition border border-amber-200 mx-auto"
                        >
                          <FileText className="w-3.5 h-3.5" /> Add Remark
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Remark Modal */}
      {activeLead && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              Add Remark — {activeLead.name || activeLead.phone}
            </h2>
            <form onSubmit={handleSaveRemark} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-amber-500"
                >
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="interested">Interested</option>
                  <option value="callback">Callback</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="in_process">In Process</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date</label>
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remark *</label>
                <textarea
                  rows={4}
                  required
                  value={remarkNote}
                  onChange={(e) => setRemarkNote(e.target.value)}
                  placeholder="Call notes, customer response, next steps..."
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setActiveLead(null)} className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-400 shadow-md transition disabled:opacity-50">
                  {submitting ? 'Saving...' : 'Save Remark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
