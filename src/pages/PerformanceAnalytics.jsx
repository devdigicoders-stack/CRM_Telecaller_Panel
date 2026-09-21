import React from 'react';
import { Activity, Award, TrendingUp, DollarSign } from 'lucide-react';

export default function PerformanceAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Activity className="w-7 h-7 text-purple-600" />
          Telecaller Qualification & Incentive Tracking
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Performance metrics, lead qualification efficiency, and incentive split stats for Telecalling executive.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Leads Screened This Month</p>
          <h2 className="text-3xl font-black text-slate-900 mt-1">214</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Converted Branch Sales</p>
          <h2 className="text-3xl font-black text-emerald-600 mt-1">36</h2>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Accrued Telecaller Incentive</p>
          <h2 className="text-3xl font-black text-purple-600 mt-1">₹18,000</h2>
        </div>
      </div>
    </div>
  );
}
