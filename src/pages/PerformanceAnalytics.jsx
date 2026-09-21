import React, { useState, useEffect } from 'react';
import { Activity, Award, TrendingUp, DollarSign, RefreshCw } from 'lucide-react';
import { leadAPI } from '../api/lead';
import { toast } from 'sonner';

export default function PerformanceAnalytics() {
  const [loading, setLoading] = useState(true);
  const [screenedThisMonth, setScreenedThisMonth] = useState(0);
  const [convertedSales, setConvertedSales] = useState(0);
  const [accruedIncentive, setAccruedIncentive] = useState(0);

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const res = await leadAPI.getAllLeads({ limit: 200 });
      const leads = res.data?.leads || res.leads || [];

      // 1. Leads Screened This Month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const screened = leads.filter((l) => {
        const createdDate = new Date(l.createdAt);
        return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear;
      }).length;
      setScreenedThisMonth(screened);

      // 2. Converted Branch Sales
      const converted = leads.filter((l) => l.status === 'converted').length;
      setConvertedSales(converted);

      // 3. Accrued Incentive (e.g. ₹500 per converted sale or custom split)
      let incentiveTotal = 0;
      leads.forEach((l) => {
        if (l.status === 'converted') {
          incentiveTotal += l.telecallerIncentive || (l.dealValue ? Math.round(l.dealValue * 0.05) : 500);
        }
      });
      setAccruedIncentive(incentiveTotal);
    } catch (err) {
      toast.error('Failed to load performance analytics.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Activity className="w-7 h-7 text-purple-600" />
            Telecaller Qualification & Incentive Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time performance metrics, lead qualification conversion, and incentive split calculations.
          </p>
        </div>
        <button
          onClick={fetchPerformanceData}
          className="p-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 hover:bg-slate-100 shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Analytics
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leads Screened This Month</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">
            {loading ? '...' : screenedThisMonth}
          </h2>
          <span className="text-[11px] font-bold text-blue-600 mt-1 inline-block">Real Database Leads</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Converted Branch Sales</p>
          <h2 className="text-3xl font-black text-emerald-600 mt-1">
            {loading ? '...' : convertedSales}
          </h2>
          <span className="text-[11px] font-bold text-emerald-600 mt-1 inline-block">Sales Converted</span>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accrued Telecaller Incentive</p>
          <h2 className="text-3xl font-black text-purple-600 mt-1">
            {loading ? '...' : `₹${accruedIncentive.toLocaleString('en-IN')}`}
          </h2>
          <span className="text-[11px] font-bold text-purple-600 mt-1 inline-block">Calculated Incentive Split</span>
        </div>
      </div>
    </div>
  );
}
