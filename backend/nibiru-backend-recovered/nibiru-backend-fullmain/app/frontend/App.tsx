import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CodexVault } from './pages/CodexVault';
import { KeyDetail } from './pages/KeyDetail';
import { Toast } from './components/Toast';

export const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          <Route path="/codex" element={<CodexVault />} />
          <Route path="/key/:keyId" element={<KeyDetail />} />
          {/* Add more routes as needed */}
        </Routes>
        <Toast />
      </div>
    </Router>
  );
}; 