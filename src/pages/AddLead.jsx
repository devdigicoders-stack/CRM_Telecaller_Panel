import React, { useState } from 'react';
import { UserPlus, Phone, Mail, MapPin, Send, X } from 'lucide-react';
import { leadAPI } from '../api/lead';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const SOURCES = ['WhatsApp', 'Website', 'Direct', 'IndiaMART', 'Reference', 'Facebook', 'Other'];
const PRIORITIES = ['high', 'medium', 'low'];

export default function AddLead() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', email: '', source: 'Direct',
    priority: 'medium', city: '', state: '', pinCode: '', remark: '',
  });
  const [phoneExists, setPhoneExists] = useState(null);
  const [checkingPhone, setCheckingPhone] = useState(false);

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const checkPhone = async (phone) => {
    if (phone.replace(/\D/g, '').length < 10) { setPhoneExists(null); return; }
    try {
      setCheckingPhone(true);
      const res = await leadAPI.checkPhone(phone);
      setPhoneExists(res.exists ? res.lead : null);
    } catch {
      setPhoneExists(null);
    } finally {
      setCheckingPhone(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
      toast.error('Valid phone number required.');
      return;
    }
    try {
      setSubmitting(true);
      await leadAPI.createLead(form);
      toast.success('Lead added successfully!');
      navigate('/screening-queue');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add lead.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <UserPlus className="w-7 h-7 text-amber-500" />
          Add New Lead
        </h1>
        <p className="text-xs text-slate-500 mt-1">Log a new incoming customer inquiry from call or walk-in.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-5">

        {/* Phone — first so we can check duplicate */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="tel"
              required
              value={form.phone}
              onChange={(e) => { set('phone', e.target.value); checkPhone(e.target.value); }}
              placeholder="10-digit mobile number"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            {checkingPhone && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">Checking...</span>}
          </div>
          {phoneExists && (
            <div className="mt-2 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-700 flex items-center gap-2">
              <X className="w-4 h-4" />
              Duplicate! Lead already exists: <span className="underline">{phoneExists.name || phoneExists.phone}</span> — Status: {phoneExists.status}
            </div>
          )}
        </div>

        {/* Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Customer Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Full name"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder="customer@email.com"
              className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Source + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lead Source</label>
            <select
              value={form.source}
              onChange={(e) => set('source', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Priority</label>
            <select
              value={form.priority}
              onChange={(e) => set('priority', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-xs font-bold bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
            >
              {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> Location (for branch routing)
          </label>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              placeholder="City"
              className="px-3 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <input
              type="text"
              value={form.state}
              onChange={(e) => set('state', e.target.value)}
              placeholder="State"
              className="px-3 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
            <input
              type="text"
              value={form.pinCode}
              onChange={(e) => set('pinCode', e.target.value)}
              placeholder="PIN Code"
              className="px-3 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Remark */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Initial Remark / Requirement</label>
          <textarea
            rows={3}
            value={form.remark}
            onChange={(e) => set('remark', e.target.value)}
            placeholder="Customer requirement, product interest, notes..."
            className="w-full px-4 py-2.5 border border-slate-300 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 border border-slate-300 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !!phoneExists}
            className="px-6 py-2.5 bg-amber-500 text-slate-950 rounded-2xl text-xs font-black hover:bg-amber-400 transition shadow-md shadow-amber-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Adding...' : 'Add Lead'}
          </button>
        </div>
      </form>
    </div>
  );
}
