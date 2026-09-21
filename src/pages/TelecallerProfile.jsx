import React from 'react';
import { User, Phone, Mail, Award, ShieldCheck, Target, Calculator } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TelecallerProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <User className="w-7 h-7 text-amber-500" />
          Telecaller Executive Profile & Incentive Rules
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Account settings, daily calling targets, and dual ownership incentive split structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-1 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center font-black text-white text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">{user?.name || 'Lucknow Telecaller'}</h2>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">{user?.role || 'Calling Executive'}</p>
          <p className="text-xs text-slate-400 mt-2">{user?.email || 'telecaller@crm.com'}</p>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-around text-xs">
            <div>
              <span className="block font-bold text-slate-400 uppercase">Daily Target</span>
              <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">50 Calls</span>
            </div>
            <div>
              <span className="block font-bold text-slate-400 uppercase">Handover Target</span>
              <span className="font-extrabold text-emerald-600 text-sm mt-0.5 block">15 Leads</span>
            </div>
          </div>
        </div>

        {/* Incentive Split Rules */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Calculator className="w-5 h-5 text-purple-600" />
            Dual Ownership Incentive Split Rules
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
              <span className="text-xs font-extrabold text-amber-800 uppercase tracking-wider block">Origin Telecaller Incentive</span>
              <h4 className="text-2xl font-black text-amber-700 mt-1">5% Split / ₹500</h4>
              <p className="text-xs text-amber-900 mt-2 font-medium">
                Accrued on every lead qualified by Lucknow Telecaller that converts into a successful branch sale.
              </p>
            </div>

            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
              <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">Branch Closer Incentive</span>
              <h4 className="text-2xl font-black text-emerald-700 mt-1">10% Split / ₹1,000</h4>
              <p className="text-xs text-emerald-900 mt-2 font-medium">
                Accrued by Branch Sales Representative upon completing product demo and closing the sale.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-2">
            <div className="font-extrabold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              Reassignment & Lead Lock Policy
            </div>
            <p>
              Telecallers are allowed maximum <strong>1 reassignment/correction</strong> per lead. After 1 edit, the lead is automatically locked and can only be modified by Super Admin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
