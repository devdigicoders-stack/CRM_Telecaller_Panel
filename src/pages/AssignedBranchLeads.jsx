import React, { useState, useEffect } from 'react';
import { Building2, Search, CheckCircle, Navigation, ShieldCheck, MapPin, RefreshCw } from 'lucide-react';
import { leadAPI } from '../api/lead';
import { toast } from 'sonner';

export default function AssignedBranchLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAssignedLeads();
  }, [search]);

  const fetchAssignedLeads = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAllLeads({ search, limit: 100 });
      const allLeads = res.data?.leads || res.leads || [];

      // Filter leads handed over to branches
      const assignedList = allLeads.filter(
        (l) => l.status === 'assigned_to_branch' || l.assignedBranch || l.originTelecaller || l.status === 'converted'
      );
      setLeads(assignedList);
    } catch {
      toast.error('Failed to load assigned branch leads.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-emerald-600" />
            Handed Over & Assigned Branch Leads
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Leads qualified by Telecalling team and handed over to local branch sales representatives.
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

      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by customer name, phone, city, branch..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading handed-over branch leads...</div>
        ) : leads.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-bold">No handed-over branch leads found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Lead Name & Phone</th>
                  <th className="py-3.5 px-4">Location Verified</th>
                  <th className="py-3.5 px-4">Origin Telecaller</th>
                  <th className="py-3.5 px-4">Target Branch</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Lock Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leads.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div>{l.name || 'Unnamed Lead'}</div>
                      <div className="text-slate-500 text-xs">{l.phone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 font-bold text-emerald-700">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        {l.city || 'Verified'} {l.pinCode ? `(${l.pinCode})` : ''}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {l.originTelecaller?.name || 'Lucknow Telecaller'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      {l.assignedBranch?.name || 'Local Branch'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-xl">
                        {l.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {l.isLocked ? (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-slate-900 text-amber-400 rounded-full">
                          🔒 Locked (Max 1 Edit)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-blue-100 text-blue-800 rounded-full">
                          Unlocked
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
