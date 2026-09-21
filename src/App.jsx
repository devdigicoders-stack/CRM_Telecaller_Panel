import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import LeadScreeningQueue from './pages/LeadScreeningQueue';
import FollowUpReminders from './pages/FollowUpReminders';
import AssignedBranchLeads from './pages/AssignedBranchLeads';
import DailyCallsTracking from './pages/DailyCallsTracking';
import BranchDistribution from './pages/BranchDistribution';
import PerformanceAnalytics from './pages/PerformanceAnalytics';
import TelecallerProfile from './pages/TelecallerProfile';

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white font-bold text-sm">
        Loading Telecaller Panel...
      </div>
    );
  }
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="screening-queue" element={<LeadScreeningQueue />} />
            <Route path="reminders" element={<FollowUpReminders />} />
            <Route path="assigned-leads" element={<AssignedBranchLeads />} />
            <Route path="my-calls" element={<DailyCallsTracking />} />
            <Route path="branch-distribution" element={<BranchDistribution />} />
            <Route path="performance-analytics" element={<PerformanceAnalytics />} />
            <Route path="profile" element={<TelecallerProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
