import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, PhoneCall, Building2, Clock, TrendingUp, RefreshCw 
} from 'lucide-react';
import { leadAPI } from '../api/lead';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [screeningCount, setScreeningCount] = useState(0);
  const [handedOverCount, setHandedOverCount] = useState(0);
  const [followUpsCount, setFollowUpsCount] = useState(0);
  const [conversionRate, setConversionRate] = useState('0.0%');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // 1. Fetch live unscreened queue count
      const queueRes = await leadAPI.getScreeningQueue();
      const unscreenedTotal = queueRes.total || 0;
      setScreeningCount(unscreenedTotal);

      // 2. Fetch live lead data for real metrics
      const allLeadsRes = await leadAPI.getAllLeads({ limit: 100 });
      const leads = allLeadsRes.data?.leads || allLeadsRes.leads || [];

      // Count handed over to branch
      const handedOver = leads.filter(
        (l) => l.status === 'assigned_to_branch' || l.assignedBranch || l.originTelecaller
      ).length;
      setHandedOverCount(handedOver);

      // Count today's follow-ups
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const followUps = leads.filter((l) => {
        if (!l.followUpDate) return false;
        const fDateStr = new Date(l.followUpDate).toISOString().split('T')[0];
        return fDateStr === todayStr;
      }).length;
      setFollowUpsCount(followUps);

      // Calculate efficiency
      const totalProcessed = unscreenedTotal + handedOver;
      if (totalProcessed > 0) {
        const rate = ((handedOver / totalProcessed) * 100).toFixed(1);
        setConversionRate(`${rate}%`);
      } else {
        setConversionRate('100%');
      }
    } catch {
      toast.error('Could not connect to live database API.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = [
    { day: 'Mon', calls: 12, qualified: 8, handedOver: 7 },
    { day: 'Tue', calls: 18, qualified: 12, handedOver: 10 },
    { day: 'Wed', calls: 15, qualified: 9, handedOver: 8 },
    { day: 'Thu', calls: 22, qualified: 15, handedOver: 14 },
    { day: 'Fri', calls: 20, qualified: 14, handedOver: 12 },
    { day: 'Sat', calls: 16, qualified: 10, handedOver: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold mb-2">
            Central Lead Qualification Console
          </div>
          <h1 className="text-2xl font-black tracking-tight">Lucknow Telecaller Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter raw leads, log calls, verify customer PIN/city, and assign qualified leads to local branches.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/screening-queue')}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Filter className="w-4 h-4" />
            Open Lead Screening Queue ({screeningCount})
          </button>
        </div>
      </div>

      {/* Metric Cards - Connected to Real Database APIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unscreened Queue</p>
            <h2 className="text-3xl font-black text-amber-600 mt-1">
              {loading ? '...' : screeningCount}
            </h2>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">Real Database Leads</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Handed Over to Branch</p>
            <h2 className="text-3xl font-black text-emerald-600 mt-1">
              {loading ? '...' : handedOverCount}
            </h2>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">Location Verified</span>
          </div>
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Call Follow-ups</p>
            <h2 className="text-3xl font-black text-blue-600 mt-1">
              {loading ? '...' : followUpsCount}
            </h2>
            <span className="text-[11px] font-bold text-blue-600 mt-1 inline-block">Scheduled Callbacks</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Qualification Efficiency</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">
              {loading ? '...' : conversionRate}
            </h2>
            <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">Handover Conversion</span>
          </div>
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Daily Calling & Follow-up Tracking Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-amber-500" />
              Daily Calling & Lead Screening Activity
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Calls executed vs qualified leads handed over to branches.</p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="calls" name="Total Calls Made" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              <Bar dataKey="qualified" name="Leads Qualified" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="handedOver" name="Assigned to Branch" fill="#f59e0b" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
