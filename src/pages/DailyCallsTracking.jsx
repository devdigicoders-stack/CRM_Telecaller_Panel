import React, { useState, useEffect } from 'react';
import { PhoneCall, Calendar, Search, Filter, Clock, MessageSquare, CheckCircle } from 'lucide-react';
import { leadAPI } from '../api/lead';
import { toast } from 'sonner';

export default function DailyCallsTracking() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchCallLogs();
  }, [filterStatus]);

  const fetchCallLogs = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAllLeads({ limit: 50 });
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
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading call tracking history...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Lead Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Calling Status</th>
                  <th className="py-3.5 px-4">Follow-up Date</th>
                  <th className="py-3.5 px-4">Latest Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leads.map((lead) => (
                  <tr key={lead._id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{lead.name || 'Unnamed Lead'}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-600">{lead.phone}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-blue-100 text-blue-800 rounded-xl">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-500">
                      {lead.followUpDate ? new Date(lead.followUpDate).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate">
                      {lead.remarks?.length > 0 ? lead.remarks[lead.remarks.length - 1].note : 'No remarks yet'}
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
