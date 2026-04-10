import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ApplyLeave from './pages/ApplyLeave';
import History from './pages/History';
import Profile from './pages/Profile';
import Login from './pages/Login';
import './styles/App.css';
import { Toaster } from 'react-hot-toast';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleSetUser = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  // Wrap everything in Router
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#fff',
          borderRadius: '12px',
        },
      }} />
      
      {!user ? (
        <Login setUser={handleSetUser} />
      ) : (
        <div className="app-container">
          <Sidebar user={user} onLogout={handleLogout} />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" />} />
              <Route path="/dashboard" element={<Dashboard user={user} />} />
              <Route path="/apply-leave" element={<ApplyLeave user={user} />} />
              <Route path="/history" element={<History user={user} />} />
              <Route path="/profile" element={<Profile user={user} setUser={handleSetUser} />} />
            </Routes>
          </main>
        </div>
      )}
    </Router>
  );
}

export default App;