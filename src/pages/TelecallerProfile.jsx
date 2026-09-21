import React from 'react';
import { User, Phone, Mail, Award, ShieldCheck, Target, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TelecallerProfile() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <User className="w-7 h-7 text-amber-500" />
          Telecaller Executive Profile
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Account details, daily calling targets, and qualification performance guidelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-1 text-center">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-amber-600 rounded-3xl flex items-center justify-center font-black text-white text-3xl mx-auto mb-4 shadow-lg shadow-amber-500/20">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'T'}
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">{user?.name || 'Lucknow Telecaller'}</h2>
          <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-1">{user?.role || 'Calling Executive'}</p>
          <p className="text-xs text-slate-400 mt-2">{user?.email || 'telecaller@crm.com'}</p>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-around text-xs">
            <div>
              <span className="block font-bold text-slate-400 uppercase">Daily Call Target</span>
              <span className="font-extrabold text-slate-900 text-sm mt-0.5 block">50 Calls</span>
            </div>
            <div>
              <span className="block font-bold text-slate-400 uppercase">Handover Target</span>
              <span className="font-extrabold text-emerald-600 text-sm mt-0.5 block">15 Leads</span>
            </div>
          </div>
        </div>

        {/* Guidelines & Policy */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            Lead Qualification & Routing Guidelines
          </h3>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Address & Location Verification</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Always verify customer PIN Code and City before assigning lead to a branch to ensure correct map engine routing.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-slate-900">Reassignment & Lead Lock Policy</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Telecallers are allowed maximum <strong>1 reassignment/correction</strong> per lead. After 1 edit, the lead is automatically locked and can only be modified by Super Admin.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
