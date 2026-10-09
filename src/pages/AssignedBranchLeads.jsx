import React, { useState, useEffect } from 'react';
import { 
  Building2, Search, CheckCircle, Navigation, ShieldCheck, MapPin, 
  RefreshCw, Phone, MessageCircle, FileText, User, AlertCircle, 
  Clock, Check, Filter, ChevronRight
} from 'lucide-react';
import { leadAPI } from '../api/lead';
import { branchAPI } from '../api/branch';
import { toast } from 'sonner';
import axiosInstance from '../api/axiosInstance';

export default function AssignedBranchLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allBranchesList, setAllBranchesList] = useState([]);

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
  const [branchSalesPersons, setBranchSalesPersons] = useState([]);
  const [submittingHandover, setSubmittingHandover] = useState(false);
  const [manualBranchSelect, setManualBranchSelect] = useState(false);

  // Quick Remark Modal State
  const [activeRemarkLead, setActiveRemarkLead] = useState(null);
  const [remarkNote, setRemarkNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [submittingRemark, setSubmittingRemark] = useState(false);

  useEffect(() => {
    fetchAssignedLeads();
    fetchAllBranches();
  }, [search]);

  const fetchAllBranches = async () => {
    try {
      const res = await branchAPI.getBranches();
      setAllBranchesList(res.branches || res.data || []);
    } catch {
      // ignore
    }
  };

  const fetchAssignedLeads = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAllLeads({ search, limit: 150 });
      const allLeads = res.data?.leads || res.leads || [];
      setLeads(allLeads);
    } catch {
      toast.error('Failed to load assigned branch leads.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBranchModal = async (lead) => {
    setActiveBranchLead(lead);
    setPinCode(lead.pinCode || '');
    setCity(lead.city || '');
    setState(lead.state || '');
    setHandoverRemark('');
    setSelectedBranchId(lead.assignedBranch?._id || lead.assignedBranch || '');
    setSelectedBranchUserId(lead.branchOwner?._id || lead.branchOwner || '');
    setManualBranchSelect(false);
    await fetchBranchSuggestions(lead._id, lead.pinCode || '', lead.city || '', lead.state || '');
  };

  const fetchBranchSuggestions = async (leadId, pin, cty, st) => {
    try {
      setLoadingSuggestions(true);
      const res = await leadAPI.suggestBranches(leadId, { pinCode: pin, city: cty, state: st });
      const suggs = res.suggestions || [];
      setBranchSuggestions(suggs);
      if (suggs.length > 0) {
        const firstBranch = suggs[0].branch;
        setSelectedBranchId(firstBranch._id);
        const persons = firstBranch.assignedUsers || [];
        setBranchSalesPersons(persons);
        setSelectedBranchUserId(persons.length > 0 ? persons[0]._id : '');
      } else {
        // Fallback to all branches
        if (allBranchesList.length > 0) {
          setSelectedBranchId(allBranchesList[0]._id);
          const persons = allBranchesList[0].assignedUsers || [];
          setBranchSalesPersons(persons);
          setSelectedBranchUserId(persons.length > 0 ? persons[0]._id : '');
        }
      }
    } catch (err) {
      toast.error('Failed to fetch nearest branch suggestions.');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleBranchChange = (branchId) => {
    setSelectedBranchId(branchId);
    let matchedBranch = branchSuggestions.find((s) => s.branch._id === branchId)?.branch;
    if (!matchedBranch) {
      matchedBranch = allBranchesList.find((b) => b._id === branchId);
    }
    const persons = matchedBranch?.assignedUsers || [];
    setBranchSalesPersons(persons);
    setSelectedBranchUserId(persons.length > 0 ? persons[0]._id : '');
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
      toast.success(`Lead successfully assigned to branch!`);
      setActiveBranchLead(null);
      fetchAssignedLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to assign lead.');
    } finally {
      setSubmittingHandover(false);
    }
  };

  const handleOpenRemarkModal = (lead) => {
    setActiveRemarkLead(lead);
    setRemarkNote('');
    setFollowUpDate(lead.followUpDate ? new Date(lead.followUpDate).toISOString().slice(0, 16) : '');
    setNewStatus(lead.status);
  };

  const handleSaveRemark = async (e) => {
    e.preventDefault();
    if (!remarkNote.trim()) {
      toast.error('Please enter a remark note.');
      return;
    }
    try {
      setSubmittingRemark(true);
      await axiosInstance.post(`/leads/${activeRemarkLead._id}/remarks`, {
        note: remarkNote,
        followUpDate: followUpDate || null,
        status: newStatus || undefined,
      });
      toast.success('Remark added successfully!');
      setActiveRemarkLead(null);
      fetchAssignedLeads();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save remark.');
    } finally {
      setSubmittingRemark(false);
    }
  };

  // Filter leads based on selected tab
  const filteredLeads = leads.filter((l) => {
    if (statusFilter === 'assigned') {
      return l.status === 'assigned_to_branch' || l.assignedBranch;
    }
    if (statusFilter === 'pending') {
      return l.status !== 'assigned_to_branch' && !l.assignedBranch;
    }
    if (statusFilter === 'in_process') {
      return ['in_process', 'interested', 'callback'].includes(l.status);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-600" />
            Handed Over & Assigned Branch Leads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage leads qualified by Telecallers, write remarks, and assign/reassign directly to local branch sales teams.
          </p>
        </div>
        <button
          onClick={fetchAssignedLeads}
          className="p-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 hover:bg-slate-100 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh List
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by customer name, phone, city, branch, remarks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Leads ({leads.length})
            </button>
            <button
              onClick={() => setStatusFilter('assigned')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === 'assigned'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Assigned to Branch ({leads.filter((l) => l.status === 'assigned_to_branch' || l.assignedBranch).length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              Pending Assignment ({leads.filter((l) => l.status !== 'assigned_to_branch' && !l.assignedBranch).length})
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-3"></div>
            Loading leads...
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            No matching leads found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Lead Name & Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Origin Telecaller</th>
                  <th className="py-3.5 px-4">Assigned Branch & Staff</th>
                  <th className="py-3.5 px-4">Handover Remarks</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Lock</th>
                  <th className="py-3.5 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLeads.map((l) => {
                  const cleanedPhone = (l.phone || '').replace(/\D/g, '');
                  const waPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
                  const latestRemark = l.remarks?.length > 0 ? l.remarks[l.remarks.length - 1].note : 'No remarks yet';
                  const isAssigned = l.status === 'assigned_to_branch' || l.assignedBranch;

                  return (
                    <tr key={l._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="font-extrabold text-slate-900">{l.name || 'Unnamed Lead'}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500 font-semibold">{l.phone}</span>
                          {l.phone && (
                            <>
                              <a href={`tel:${l.phone}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg" title="Call Now">
                                <Phone className="w-3.5 h-3.5" />
                              </a>
                              <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg" title="WhatsApp">
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="flex items-center gap-1 font-bold text-emerald-700">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          {l.city || l.address || 'Location Pending'} {l.state ? `, ${l.state}` : ''} {l.pinCode ? `(${l.pinCode})` : ''}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {l.originTelecaller?.name || l.createdBy?.name || 'Telecaller'}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        {l.assignedBranch?.name ? (
                          <>
                            <div>{l.assignedBranch.name}</div>
                            {l.branchOwner?.name && (
                              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Rep: {l.branchOwner.name}
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-md text-[11px]">
                            Not Assigned
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-700">
                        <div className="truncate text-xs font-medium" title={latestRemark}>
                          {latestRemark}
                        </div>
                        {l.remarks?.length > 0 && l.remarks[l.remarks.length - 1].createdAt && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(l.remarks[l.remarks.length - 1].createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-xl whitespace-nowrap ${
                          l.status === 'assigned_to_branch' || l.status === 'converted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : l.status === 'interested'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {l.isLocked ? (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-900 text-amber-400 rounded-full">
                            🔒 Locked
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full">
                            Unlocked
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1.5 whitespace-nowrap">
                          {/* Direct Assign / Reassign Button */}
                          <button
                            onClick={() => handleOpenBranchModal(l)}
                            className={`px-3 py-1.5 font-bold rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 ${
                              isAssigned
                                ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                : 'bg-emerald-500 text-white hover:bg-emerald-600 ring-2 ring-emerald-300 animate-pulse'
                            }`}
                            title={isAssigned ? 'Reassign to another branch / staff' : 'Directly Assign to Branch'}
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            {isAssigned ? 'Reassign' : 'Assign'}
                          </button>

                          {/* Quick Remark Button */}
                          <button
                            onClick={() => handleOpenRemarkModal(l)}
                            className="px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold rounded-xl text-xs transition border border-amber-200 flex items-center gap-1"
                            title="Add call remark or update note"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Remark
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

      {/* Branch Assignment / Handover Modal */}
      {activeBranchLead && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-emerald-600" />
                Assign Lead to Branch
              </h2>
              <span className="text-xs px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-xl border border-emerald-200">
                {activeBranchLead.name || activeBranchLead.phone}
              </span>
            </div>

            <form onSubmit={handleConfirmHandover} className="mt-4 space-y-4">
              {/* Location Inputs with Search */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Customer Location (PIN / City / State)</label>
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">PIN Code</label>
                    <input
                      type="text"
                      placeholder="e.g. 226001"
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">City</label>
                    <input
                      type="text"
                      placeholder="e.g. Lucknow"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-0.5">State</label>
                    <input
                      type="text"
                      placeholder="e.g. Uttar Pradesh"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border border-slate-300 rounded-xl p-2 text-xs font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => fetchBranchSuggestions(activeBranchLead._id, pinCode, city, state)}
                    className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingSuggestions ? 'animate-spin' : ''}`} />
                    Update Branch Suggestions
                  </button>
                </div>
              </div>

              {/* Branch Selection Mode */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700">Target Branch</label>
                  <button
                    type="button"
                    onClick={() => setManualBranchSelect(!manualBranchSelect)}
                    className="text-[11px] font-bold text-blue-600 hover:underline"
                  >
                    {manualBranchSelect ? 'Show Suggested Branches' : 'Choose from all branches'}
                  </button>
                </div>

                {manualBranchSelect ? (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => handleBranchChange(e.target.value)}
                    className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">-- Select Target Branch --</option>
                    {allBranchesList.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.city || b.state || 'Branch'})
                      </option>
                    ))}
                  </select>
                ) : branchSuggestions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {branchSuggestions.map((sugg) => (
                      <div
                        key={sugg.branch._id}
                        onClick={() => handleBranchChange(sugg.branch._id)}
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
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Distance: {sugg.distanceKm} {typeof sugg.distanceKm === 'number' ? 'KM' : ''} • City: {sugg.branch.city || 'N/A'}
                          </div>
                        </div>
                        <input
                          type="radio"
                          name="branchRadio"
                          checked={selectedBranchId === sugg.branch._id}
                          onChange={() => handleBranchChange(sugg.branch._id)}
                          className="accent-emerald-600"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 font-semibold">
                    No automatic branch match found for this location. Please select from all branches above.
                  </div>
                )}
              </div>

              {/* Staff / Sales Representative Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assign to Branch Sales Executive / Staff</label>
                {branchSalesPersons.length > 0 ? (
                  <select
                    value={selectedBranchUserId}
                    onChange={(e) => setSelectedBranchUserId(e.target.value)}
                    className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="">-- Assign to Branch Manager / General Pool --</option>
                    {branchSalesPersons.map((sp) => (
                      <option key={sp._id} value={sp._id}>
                        {sp.name} {sp.role ? `(${sp.role})` : ''} {sp.phone ? `- ${sp.phone}` : ''}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 text-xs text-amber-700 bg-amber-50 rounded-2xl border border-amber-200 font-semibold">
                    ℹ️ Lead will be assigned to Branch Manager pool (no individual sales executive configured yet).
                  </div>
                )}
              </div>

              {/* Handover Remarks */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Handover Notes / Client Requirements</label>
                <textarea
                  rows={3}
                  placeholder="Enter client discussion summary, product requirement, budget, timeline..."
                  value={handoverRemark}
                  onChange={(e) => setHandoverRemark(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs focus:ring-2 focus:ring-emerald-500 resize-none font-medium"
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
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {submittingHandover ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Remark Modal */}
      {activeRemarkLead && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-lg font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-500" />
              Add Call Remark — {activeRemarkLead.name || activeRemarkLead.phone}
            </h2>
            <form onSubmit={handleSaveRemark} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs font-bold focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="interested">Interested</option>
                  <option value="callback">Callback</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="in_process">In Process</option>
                  <option value="assigned_to_branch">Handed Over to Branch</option>
                  <option value="converted">Converted</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Follow-up Date & Time</label>
                <input
                  type="datetime-local"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Remark Note *</label>
                <textarea
                  rows={4}
                  required
                  value={remarkNote}
                  onChange={(e) => setRemarkNote(e.target.value)}
                  placeholder="Call notes, customer response, next steps..."
                  className="w-full border border-slate-300 rounded-2xl p-2.5 text-xs focus:ring-2 focus:ring-amber-500 resize-none font-medium"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveRemarkLead(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRemark}
                  className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-black hover:bg-amber-400 shadow-md transition disabled:opacity-50"
                >
                  {submittingRemark ? 'Saving...' : 'Save Remark'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

