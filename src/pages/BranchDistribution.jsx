import React, { useState } from 'react';
import { Building2, MapPin, Navigation, Search, CheckCircle } from 'lucide-react';

export default function BranchDistribution() {
  const [pin, setPin] = useState('');
  const [city, setCity] = useState('');

  const sampleBranches = [
    { name: 'Lucknow Central Hub', city: 'Lucknow', state: 'UP', pincodes: ['226001', '226002', '226010'], status: 'Active' },
    { name: 'Bihar Regional Branch', city: 'Patna', state: 'Bihar', pincodes: ['800001', '800002', '800020'], status: 'Active' },
    { name: 'MP Central Branch', city: 'Bhopal', state: 'MP', pincodes: ['462001', '462002'], status: 'Active' },
    { name: 'Kolkata East Branch', city: 'Kolkata', state: 'West Bengal', pincodes: ['700001', '700002'], status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Building2 className="w-7 h-7 text-emerald-600" />
          Branch Location & Map Engine Directory
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Branch network directory used by the automated PIN Code and distance matching engine.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sampleBranches.map((b, idx) => (
          <div key={idx} className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                {b.name}
              </h3>
              <span className="px-2.5 py-0.5 text-[10px] font-black bg-emerald-100 text-emerald-800 rounded-full">
                {b.status}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {b.city}, {b.state}
            </p>
            <div className="mt-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Coverage PIN Codes:</span>
              <div className="flex flex-wrap gap-1.5">
                {b.pincodes.map((p) => (
                  <span key={p} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[11px] font-mono font-bold rounded-lg">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
