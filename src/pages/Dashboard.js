import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaChartLine } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalLeaves: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    availableLeaves: 20,
    usedLeaves: 0
  });

  const [recentRequests, setRecentRequests] = useState([]);

  // Sample leave data
  const leavesData = [
    { id: 1, type: 'Sick Leave', startDate: '2024-03-20', endDate: '2024-03-21', days: 2, status: 'PENDING' },
    { id: 2, type: 'Casual Leave', startDate: '2024-03-15', endDate: '2024-03-17', days: 3, status: 'APPROVED' },
    { id: 3, type: 'Annual Leave', startDate: '2024-03-10', endDate: '2024-03-12', days: 3, status: 'APPROVED' },
    { id: 4, type: 'Emergency Leave', startDate: '2024-03-05', endDate: '2024-03-05', days: 1, status: 'REJECTED' }
  ];

  useEffect(() => {
    // Calculate stats
    const total = leavesData.length;
    const pending = leavesData.filter(l => l.status === 'PENDING').length;
    const approved = leavesData.filter(l => l.status === 'APPROVED').length;
    const rejected = leavesData.filter(l => l.status === 'REJECTED').length;
    const used = leavesData.filter(l => l.status === 'APPROVED').reduce((sum, l) => sum + l.days, 0);
    const available = 20 - used;

    setStats({
      totalLeaves: total,
      pendingLeaves: pending,
      approvedLeaves: approved,
      rejectedLeaves: rejected,
      availableLeaves: available,
      usedLeaves: used
    });

    setRecentRequests([...leavesData].reverse().slice(0, 3));
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status) => {
    let className = 'status-badge ';
    if (status === 'APPROVED') className += 'status-approved';
    else if (status === 'PENDING') className += 'status-pending';
    else className += 'status-rejected';
    return <span className={className}>{status}</span>;
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}! Manage your leaves efficiently with SmartLeave AI</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total"><FaCalendarAlt /></div>
          <div className="stat-info">
            <h3>Total Leaves</h3>
            <p className="stat-number">{stats.totalLeaves}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending"><FaClock /></div>
          <div className="stat-info">
            <h3>Pending</h3>
            <p className="stat-number">{stats.pendingLeaves}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon approved"><FaCheckCircle /></div>
          <div className="stat-info">
            <h3>Approved</h3>
            <p className="stat-number">{stats.approvedLeaves}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon rejected"><FaTimesCircle /></div>
          <div className="stat-info">
            <h3>Rejected</h3>
            <p className="stat-number">{stats.rejectedLeaves}</p>
          </div>
        </div>
      </div>

      <div className="balance-card">
        <h3><FaChartLine /> Leave Balance</h3>
        <div className="balance-progress">
          <div className="balance-info">
            <span>Available Leaves</span>
            <span className="balance-value">{stats.availableLeaves}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${(stats.usedLeaves / 20) * 100}%` }}></div>
          </div>
          <div className="balance-details">
            <span>Used: <strong>{stats.usedLeaves}</strong></span>
            <span>Total: <strong>20</strong></span>
          </div>
        </div>
      </div>

      <div className="recent-requests">
        <h3><FaClock /> Recent Leave Requests</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr><th>Leave Type</th><th>Start Date</th><th>End Date</th><th>Days</th><th>Status</th></tr>
            </thead>
            <tbody>
              {recentRequests.length === 0 ? (
                <tr><td colSpan="5" className="text-center">No recent requests</td></tr>
              ) : (
                recentRequests.map(request => (
                  <tr key={request.id}>
                    <td>{request.type}</td>
                    <td>{formatDate(request.startDate)}</td>
                    <td>{formatDate(request.endDate)}</td>
                    <td>{request.days}</td>
                    <td>{getStatusBadge(request.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;