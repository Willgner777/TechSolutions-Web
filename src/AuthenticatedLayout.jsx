import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDevPage from './AdminDevPage';

export default function AuthenticatedLayout({ userProfile }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <main className="p-6">
        <Routes>
          <Route path="/admin-dev" element={<AdminDevPage userProfile={userProfile} />} />
          <Route path="*" element={<Navigate to="/admin-dev" replace />} />
        </Routes>
      </main>
    </div>
  );
}