import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaBrain, FaTachometerAlt, FaPaperPlane, FaHistory, 
  FaUser, FaSignOutAlt, FaUserCircle 
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Sidebar.css';

const Sidebar = ({ user, onLogout }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    toast.success('Logged out successfully!');
    navigate('/');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaBrain style={{ fontSize: '2rem', color: '#a78bfa' }} />
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'white' }}>
              SmartLeave<span style={{ color: '#a78bfa' }}>AI</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
              Employee Leave System
            </div>
          </div>
        </div>
      </div>

      <div className="user-profile-sidebar">
        <img src={user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${user.name}`} alt={user.name} />
        <div className="user-info-sidebar">
          <h4>{user.name}</h4>
          <p>{user.role}</p>
          <span>{user.employeeId}</span>
        </div>
      </div>

      <nav className="nav-menu">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaTachometerAlt />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/apply-leave" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaPaperPlane />
          <span>Apply Leave</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaHistory />
          <span>History</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
          <FaUserCircle />
          <span>My Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;