import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, RefreshCw, AlertCircle } from 'lucide-react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'sonner';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/notifications');
      setNotifications(res.data?.data?.notifications || res.data?.notifications || []);
    } catch {
      toast.error('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axiosInstance.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {
      toast.error('Failed to mark as read.');
    }
  };

  const markAllRead = async () => {
    try {
      setMarkingAll(true);
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => axiosInstance.put(`/notifications/${n._id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const typeColor = (type) => {
    const map = {
      lead_assigned: 'bg-blue-100 text-blue-800',
      lead_reassigned: 'bg-amber-100 text-amber-800',
      demo_alert: 'bg-purple-100 text-purple-800',
      general: 'bg-slate-100 text-slate-700',
    };
    return map[type] || map.general;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-600" />
            Notifications
            {unreadCount > 0 && (
              <span className="px-2.5 py-0.5 text-xs font-black bg-rose-500 text-white rounded-full">{unreadCount}</span>
            )}
          </h1>
          <p className="text-xs text-slate-500 mt-1">Lead assignments, follow-up alerts, and system updates.</p>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-2xl font-bold text-xs hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              Mark All Read
            </button>
          )}
          <button
            onClick={fetchNotifications}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-2xl font-bold text-xs text-slate-700 hover:bg-slate-100 shadow-sm transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-xs text-slate-500">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-700">No Notifications</h3>
            <p className="text-xs text-slate-400 mt-1">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && markAsRead(n._id)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                n.read
                  ? 'bg-white border-slate-200'
                  : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 text-[10px] font-black rounded-full ${typeColor(n.type)}`}>
                      {n.type?.replace(/_/g, ' ').toUpperCase() || 'GENERAL'}
                    </span>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-semibold whitespace-nowrap">
                  {new Date(n.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
