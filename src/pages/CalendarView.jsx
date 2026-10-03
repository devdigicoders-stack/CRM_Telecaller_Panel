import React, { useState, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Phone, MessageCircle, RefreshCw, Clock } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'sonner';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarView() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => { fetchCalendar(); }, []);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/calendar');
      setLeads(res.data?.data?.leads || res.data?.leads || []);
    } catch {
      toast.error('Failed to load calendar.');
    } finally {
      setLoading(false);
    }
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Group leads by date
  const leadsByDate = {};
  leads.forEach(lead => {
    if (!lead.followUpDate) return;
    const d = new Date(lead.followUpDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const key = d.getDate();
      if (!leadsByDate[key]) leadsByDate[key] = [];
      leadsByDate[key].push(lead);
    }
  });

  const selectedLeads = selectedDay ? (leadsByDate[selectedDay] || []) : [];
  const today = new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-blue-600" />
            Follow-up Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">Visual calendar of all scheduled follow-up dates.</p>
        </div>
        <button onClick={fetchCalendar} className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-100 shadow-sm transition">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
          {/* Month Nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition">
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-base font-extrabold text-slate-900">{MONTHS[month]} {year}</h2>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-100 rounded-xl transition">
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[11px] font-extrabold text-slate-400 uppercase py-1">{d}</div>
            ))}
          </div>

          {/* Date Cells */}
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const day = i + 1;
              const hasLeads = leadsByDate[day]?.length > 0;
              const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-2xl text-xs font-bold transition
                    ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25' :
                      isToday ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20' :
                      hasLeads ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200' :
                      'text-slate-600 hover:bg-slate-100'}`}
                >
                  {day}
                  {hasLeads && !isSelected && (
                    <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  )}
                  {hasLeads && isSelected && (
                    <span className="text-[9px] font-black mt-0.5">{leadsByDate[day].length}</span>
                  )}
                </button>
              );
            })}
          </div>

          {loading && (
            <div className="mt-4 text-center text-xs text-slate-400">Loading calendar data...</div>
          )}
        </div>

        {/* Selected Day Leads */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
          <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            {selectedDay ? `${MONTHS[month]} ${selectedDay} — ${selectedLeads.length} Follow-up${selectedLeads.length !== 1 ? 's' : ''}` : 'Select a date'}
          </h3>

          {!selectedDay ? (
            <p className="text-xs text-slate-400 text-center py-8">Click on a date to see follow-ups</p>
          ) : selectedLeads.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">No follow-ups on this date</p>
          ) : (
            <div className="space-y-3">
              {selectedLeads.map(lead => {
                const cleanedPhone = lead.phone.replace(/\D/g, '');
                const waPhone = cleanedPhone.length === 10 ? `91${cleanedPhone}` : cleanedPhone;
                return (
                  <div key={lead._id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="font-extrabold text-slate-900 text-xs">{lead.name || 'Unnamed Lead'}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{lead.phone}</div>
                    <div className="text-[11px] font-bold text-blue-600 mt-1">
                      {new Date(lead.followUpDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-full">
                      {lead.status}
                    </span>
                    <div className="flex gap-2 mt-2">
                      <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-blue-600 text-white rounded-xl text-[11px] font-bold hover:bg-blue-700 transition">
                        <Phone className="w-3 h-3" /> Call
                      </a>
                      <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-emerald-500 text-white rounded-xl text-[11px] font-bold hover:bg-emerald-600 transition">
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
