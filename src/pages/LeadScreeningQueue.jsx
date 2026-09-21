import React, { useState, useEffect } from 'react';
import { 
  Phone, MessageCircle, MapPin, CheckCircle, Clock, Search, 
  RefreshCw, Send, AlertCircle, Building2, User, FileText, 
  ShieldCheck, Lock, ChevronRight, Filter, Navigation
} from 'lucide-react';
import { toast } from 'sonner';
import { leadAPI } from '../api/lead';

export default function LeadScreeningQueue() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [totalLeads, setTotalLeads] = useState(0);

  // Call Modal State
  const [activeCallLead, setActiveCallLead] = useState(null);
  const [callStatus, setCallStatus] = useState('interested');
  const [callNote, setCallNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submittingCall, setSubmittingCall] = useState(false);

  // Branch Handover Modal State
  const [activeBranchLead, setActiveBranchLead] = useState(null);
  const [pinCode, setPinCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [handoverRemark, setHandoverRemark] = useState('');
  const [branchSuggestions, setBranchSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [selectedBranchUserId, setSelectedBranchUserId] = useState('');
  const [submittingHandover, setSubmittingHandover] = useState(false);

  useEffect(() => {
    fetchQueue();
  }, [search, sourceFilter]);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getScreeningQueue({ search, source: sourceFilter });
      setLeads(res.data?.leads || []);
      setTotalLeads(res.total || 0);
    } catch (err) {
      toast.error('Failed to load lead screening queue: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCallModal = (lead) => {
    setActiveCallLead(lead);
    setCallStatus(lead.status === 'new' ? 'interested' : lead.status);
    setCallNote('');
    setFollowUpDate('');
  };

  const handleSaveCall = async (e) => {
    e.preventDefault();
    if (!activeCallLead) return;
    try {
      setSubmittingCall(true);
      await leadAPI.logCall(activeCallLead._id, {
        callStatus,
        note: callNote,
        followUpDate: followUpDate || null,
      });
      toast.success('Call action logged successfully!');
      setActiveCallLead(null);
      fetchQueue();
    } catch (err) {
      toast.error('Failed to log call: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingCall(false);
    }
  };

  const handleOpenBranchModal = async (lead) => {
    setActiveBranchLead(lead);
    setPinCode(lead.pinCode || '');
    setCity(lead.city || '');
    setState(lead.state || '');
    setHandoverRemark('');
    setSelectedBranchId('');
    setSelectedBranchUserId('');
    await fetchBranchSuggestions(lead._id, lead.pinCode || '', lead.city || '', lead.state || '');
  };

  const fetchBranchSuggestions = async (leadId, pin, cty, st) => {
    try {
      setLoadingSuggestions(true);
      const res = await leadAPI.suggestBranches(leadId, { pinCode: pin, city: cty, state: st });
      const suggs = res.suggestions || [];
      setBranchSuggestions(suggs);
      if (suggs.length > 0) {
        setSelectedBranchId(suggs[0].branch._id);
        if (suggs[0].branch.branchManager?._id) {
          setSelectedBranchUserId(suggs[0].branch.branchManager._id);
        }
      }
    } catch (err) {
      toast.error('Failed to fetch nearest branch suggestions.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleConfirmHandover = async (e) => {
    e.preventDefault();
    if (!activeBranchLead || !selectedBranchId) {
      toast.error('Please select a branch to route the lead.');
      return;
    }
    try {
      setSubmittingHandover(true);
      await leadAPI.qualifyAndAssignBranch(activeBranchLead._id, {
        branchId: selectedBranchId,
        branchUserId: selectedBranchUserId || null,
        city,
        state,
        pinCode,
        handoverRemark,
      });
      toast.success('Lead qualified and assigned to Branch!');
      setActiveBranchLead(null);
      fetchQueue();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setSubmittingHandover(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Filter className="w-7 h-7 text-amber-500" />
            Lead Screening & Qualification Queue ("Lead Chhatna" Panel)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Raw incoming WhatsApp and web leads waiting for call screening and location-based branch routing.
          </p>
        </div>
        <button
          onClick={fetchQueue}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-100 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Unscreened Pool
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, phone, email, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-2xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
        >
          <option value="">All Lead Sources</option>
          <option value="WhatsApp">WhatsApp Inquiry</option>
          <option value="Website">Website Form</option>
          <option value="Direct">Direct Call</option>
          <option value="IndiaMART">IndiaMART</option>
        </select>
      </div>

      {/* Leads Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
            Loading Unscreened Leads...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Raw Unscreened Leads</h3>
            <p className="text-xs mt-1 text-slate-400">All incoming leads have been screened and assigned!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Lead Name & Phone</th>
                  <th className="py-3.5 px-4">Source</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Received Date</th>
                  <th className="py-3.5 px-4 text-center">Qualification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leads.map((lead) => {
                  const cleanedPhone = lead.phone.replace(/\D/g, '');
                  const waPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
                  return (
                    <tr key={lead._id} className="hover:bg-amber-50/30 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">{lead.name || 'Unnamed Lead'}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="font-bold text-slate-600">{lead.phone}</span>
                          <a
                            href={`tel:${lead.phone}`}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Call Now"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={`https://wa.me/${waPhone}?text=${encodeURIComponent(`Hello ${lead.name || ''},`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Open WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 text-slate-800 rounded-xl border border-slate-200">
                          {lead.source || 'Direct'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 text-[11px] font-bold bg-amber-100 text-amber-800 rounded-xl border border-amber-200">
                          {lead.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-700 font-semibold">
                          {lead.city || lead.address ? (
                            <span>{lead.city || lead.address} {lead.pinCode ? `(${lead.pinCode})` : ''}</span>
                          ) : (
                            <span className="text-amber-600 font-bold flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Location Pending
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenCallModal(lead)}
                            className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl text-xs transition border border-blue-200 flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            Call Log
                          </button>
                          <button
                            onClick={() => handleOpenBranchModal(lead)}
                            className="px-3 py-1.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            Assign Branch
                          </button>
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

      {/* Call Modal */}
      {activeCallLead && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Phone className="w-5 h-5 text-blue-600" />
              Screening Call Log — {activeCallLead.name || activeCallLead.phone}
            </h2>

            <form onSubmit={handleSaveCall} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Calling Status Tag</label>
                <select
                  value={callStatus}
                  onChange={(e) => setCallStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-blue-500"
                >
                  <option value="interested">Interested</option>
                  <option value="callback">Callback Requested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="invalid_number">Invalid Number</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs font-medium focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Requirements & Call Remarks</label>
                <textarea
                  rows={4}
                  placeholder="Enter requirement details..."
                  value={callNote}
                  onChange={(e) => setCallNote(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveCallLead(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCall}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 shadow-md transition disabled:opacity-50"
                >
                  {submittingCall ? 'Saving...' : 'Save Call Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch Handover Modal */}
      {activeBranchLead && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-emerald-600" />
              Map Location Check & Branch Handover
            </h2>

            <form onSubmit={handleConfirmHandover} className="mt-4 space-y-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Target Branch</label>
                {branchSuggestions.length > 0 ? (
                  <div className="space-y-2">
                    {branchSuggestions.map((sugg) => (
                      <div
                        key={sugg.branch._id}
                        onClick={() => setSelectedBranchId(sugg.branch._id)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                          selectedBranchId === sugg.branch._id
                            ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500'
                            : 'border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-xs text-slate-900 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            {sugg.branch.name}
                            <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 rounded-full">
                              {sugg.matchType}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Distance: {sugg.distanceKm} {typeof sugg.distanceKm === 'number' ? 'KM' : ''}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="branch"
                          checked={selectedBranchId === sugg.branch._id}
                          onChange={() => {}}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500">No active branch suggested.</div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Handover Notes for Branch</label>
                <textarea
                  rows={3}
                  placeholder="Enter notes for branch sales team..."
                  value={handoverRemark}
                  onChange={(e) => setHandoverRemark(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveBranchLead(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingHandover}
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                >
                  {submittingHandover ? 'Processing...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
