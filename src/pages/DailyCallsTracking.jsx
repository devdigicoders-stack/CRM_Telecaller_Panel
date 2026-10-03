import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar, Search, Filter, Clock, MessageSquare, CheckCircle, RefreshCw, MapPin } from 'lucide-react';
import { leadAPI } from '../api/lead';
import { toast } from 'sonner';

export default function DailyCallsTracking() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchCallLogs();
  }, [filterStatus, search]);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAllLeads({
        search: search || undefined,
        status: filterStatus || undefined,
        limit: 100,
      });
      setLeads(res.data?.leads || res.leads || []);
    } catch {
      toast.error('Failed to load call tracking data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <PhoneCall className="w-7 h-7 text-amber-500" />
            Daily Calling & Follow-up Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of telecaller call logs, remarks, follow-up dates, and qualification status.
          </p>
        </div>
        <button
          onClick={fetchCallLogs}
          className="p-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 hover:bg-slate-100 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Tracking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 border border-slate-200 rounded-2xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold text-slate-700"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="assigned">Assigned</option>
          <option value="interested">Interested</option>
          <option value="callback">Callback</option>
          <option value="not_interested">Not Interested</option>
          <option value="assigned_to_branch">Handed Over to Branch</option>
          <option value="converted">Converted</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-3"></div>
            Loading call tracking history...
          </div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">No call tracking records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Lead Name & Phone</th>
                  <th className="py-3.5 px-4">Status & Routing</th>
                  <th className="py-3.5 px-4">Follow-up Date</th>
                  <th className="py-3.5 px-4">Latest Remarks / Handover Log</th>
                  <th className="py-3.5 px-4">Total Logs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leads.map((lead) => {
                  const cleanedPhone = (lead.phone || '').replace(/\D/g, '');
                  const waPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
                  const latestRemark = lead.remarks?.length > 0 ? lead.remarks[lead.remarks.length - 1].note : 'No remarks yet';
                  const isHandedOver = lead.status === 'assigned_to_branch' || lead.assignedBranch;

                  return (
                    <tr key={lead._id} className="hover:bg-slate-50 transition">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        <div className="font-extrabold text-slate-900">{lead.name || 'Unnamed Lead'}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-slate-500 font-semibold">{lead.phone}</span>
                          {lead.phone && (
                            <>
                              <a href={`tel:${lead.phone}`} className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg">
                                📞
                              </a>
                              <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                                💬
                              </a>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2.5 py-1 text-[11px] font-bold rounded-xl w-fit ${
                            isHandedOver ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {lead.status}
                          </span>
                          {isHandedOver && lead.assignedBranch?.name && (
                            <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> Branch: {lead.assignedBranch.name}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-600">
                        {lead.followUpDate ? (
                          <span className="flex items-center gap-1 text-blue-600 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(lead.followUpDate).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-sm">
                        <div className="truncate text-xs font-medium" title={latestRemark}>
                          {latestRemark}
                        </div>
                        {lead.remarks?.length > 0 && lead.remarks[lead.remarks.length - 1].createdAt && (
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(lead.remarks[lead.remarks.length - 1].createdAt).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short'
                            })}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-600 text-center">
                        <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs">
                          {lead.remarks?.length || 0}
                        </span>
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
