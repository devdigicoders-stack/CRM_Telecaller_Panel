import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Filter, PhoneCall, Building2, Clock, TrendingUp, RefreshCw, 
  Calendar, CheckCircle2, PhoneForwarded, Users, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { leadAPI } from '../api/lead';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Timeframe Filter State
  const [timeframe, setTimeframe] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [telecallerName, setTelecallerName] = useState('');

  // Performance Metrics
  const [metrics, setMetrics] = useState({
    totalLeadsReceived: 0,
    totalCallsCompleted: 0,
    totalPendingCalls: 0,
    totalCallbacks: 0,
    totalHandedOverToSales: 0,
    remainingFollowups: 0
  });

  const [weeklyActivity, setWeeklyActivity] = useState([]);

  // Format local YYYY-MM-DD
  const formatYMD = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleTimeframeChange = (newTf) => {
    setTimeframe(newTf);
    const today = new Date();

    if (newTf === 'today') {
      const ymd = formatYMD(today);
      setStartDate(ymd);
      setEndDate(ymd);
    } else if (newTf === 'yesterday') {
      const yest = new Date();
      yest.setDate(yest.getDate() - 1);
      const ymd = formatYMD(yest);
      setStartDate(ymd);
      setEndDate(ymd);
    } else if (newTf === 'thisWeek') {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diff));
      setStartDate(formatYMD(monday));
      setEndDate(formatYMD(new Date()));
    } else if (newTf === 'thisMonth') {
      const d = new Date();
      const firstDay = new Date(d.getFullYear(), d.getMonth(), 1);
      setStartDate(formatYMD(firstDay));
      setEndDate(formatYMD(new Date()));
    }
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const params = { timeframe };
      if (timeframe === 'custom') {
        if (startDate) params.startDate = startDate;
        if (endDate) params.endDate = endDate;
      }

      const res = await leadAPI.getTelecallerPerformance(params);
      if (res?.data) {
        const payload = res.data.metrics || res.data || {};
        setMetrics(payload);
        setWeeklyActivity(res.data.weeklyActivity || res.data.dailyActivity || res.weeklyActivity || []);
        const tName = res.telecaller?.name || res.data?.telecaller?.name || '';
        if (tName) {
          setTelecallerName(tName);
        }
      }
    } catch (err) {
      console.error('Failed to load performance metrics:', err);
      toast.error('Could not load telecaller performance metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    // eslint-disable-next-line
  }, [timeframe, startDate, endDate]);

  const callRate = metrics.totalLeadsReceived > 0 
    ? Math.round((metrics.totalCallsCompleted / metrics.totalLeadsReceived) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* ══════════ HEADER ══════════ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 p-6 rounded-3xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold mb-2">
            Central Lead Qualification Console
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            {telecallerName ? `${telecallerName}'s Performance Dashboard` : 'Telecaller Performance Dashboard'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time daily calling analytics, pending calls backlog, and branch handover tracking.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchPerformanceData}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition border border-slate-700"
            title="Refresh Live Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/screening-queue')}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition"
          >
            <Filter className="w-4 h-4" />
            Screening Queue ({metrics.totalPendingCalls || 0})
          </button>
        </div>
      </div>

      {/* ══════════ TIMEFRAME SELECTOR ══════════ */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1.5">
            Date Filter:
          </span>
          {[
            { id: 'today', label: 'Today' },
            { id: 'yesterday', label: 'Yesterday' },
            { id: 'thisWeek', label: 'This Week' },
            { id: 'thisMonth', label: 'This Month' },
            { id: 'custom', label: 'Custom Range' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => handleTimeframeChange(tf.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                timeframe === tf.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {timeframe === 'custom' && (
          <div className="flex items-center gap-2 flex-wrap animate-fade-in">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">to</span>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <button
              onClick={fetchPerformanceData}
              className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-400 transition"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* ══════════ METRICS GRID (6 Synchronized KPI Cards) ══════════ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Leads Assigned / Received */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Assigned Leads
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-slate-900">
              {loading ? '...' : (metrics.totalLeadsReceived ?? 0)}
            </h2>
            <span className="text-[10px] font-bold text-blue-600 block mt-0.5">
              CRM/Admin: {metrics.totalAssignedByCrmOrAdmin ?? metrics.allTimeAssignedByCrmOrAdmin ?? 0}
            </span>
          </div>
        </div>

        {/* 2. Calls Completed */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Calls Made
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-emerald-600">
              {loading ? '...' : (metrics.totalCallsCompleted ?? 0)}
            </h2>
            <span className="text-[10px] font-bold text-emerald-600 block mt-0.5">
              Total Calls: {metrics.allTimeCallsCompleted ?? metrics.totalCallsCompleted ?? 0}
            </span>
          </div>
        </div>

        {/* 3. Pending Calls (Present & Past Backlog) */}
        <div 
          onClick={() => navigate('/screening-queue')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-amber-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Pending Calls
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-amber-600">
              {loading ? '...' : (metrics.totalPendingCalls ?? 0)}
            </h2>
            <span className="text-[10px] font-bold text-amber-600 flex items-center justify-between mt-0.5">
              <span>Past: {metrics.pendingCallsPast ?? 0}</span>
              <span>Today: {metrics.pendingCallsToday ?? 0}</span>
            </span>
          </div>
        </div>

        {/* 4. Handed Over to Sales */}
        <div 
          onClick={() => navigate('/assigned-leads')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-purple-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Sales Handover
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-purple-600">
              {loading ? '...' : (metrics.totalHandedOverToSales ?? 0)}
            </h2>
            <span className="text-[10px] font-bold text-purple-600 block mt-0.5">
              Total: {metrics.allTimeHandedOver ?? metrics.totalHandedOverToSales ?? 0} Handed
            </span>
          </div>
        </div>

        {/* 5. Callbacks Scheduled */}
        <div 
          onClick={() => navigate('/reminders')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Callbacks
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <PhoneForwarded className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-cyan-600">
              {loading ? '...' : metrics.totalCallbacks}
            </h2>
            <span className="text-[10px] font-bold text-cyan-600">Requested Call</span>
          </div>
        </div>

        {/* 6. Remaining Follow-ups */}
        <div 
          onClick={() => navigate('/reminders')}
          className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-rose-400 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Follow-ups Due
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-rose-600">
              {loading ? '...' : metrics.remainingFollowups}
            </h2>
            <span className="text-[10px] font-bold text-rose-600">Action Required</span>
          </div>
        </div>
      </div>

      {/* ══════════ CALLING COMPLETION PROGRESS BAR ══════════ */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
              Calling Target Completion Rate:
            </span>
          </div>
          <span className="text-sm font-black text-slate-900">{callRate}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-3 rounded-full transition-all duration-700 bg-gradient-to-r from-blue-500 to-emerald-500"
            style={{ width: `${Math.min(callRate, 100)}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[11px] text-slate-400 font-semibold mt-2">
          <span>{metrics.totalCallsCompleted} called</span>
          <span>{metrics.totalPendingCalls} remaining to call</span>
        </div>
      </div>

      {/* ══════════ DYNAMIC 7-DAY CALLING & SCREENING ACTIVITY CHART ══════════ */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-amber-500" />
              Daily Calling & Lead Screening Activity (Live Database Aggregation)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Calls made vs leads assigned vs sales handovers tracked dynamically across the last 7 days.
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '16px', border: 'none', color: '#fff', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="calls" name="Calls Completed" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              <Bar dataKey="received" name="Leads Received" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="handedOver" name="Handover to Sales" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
