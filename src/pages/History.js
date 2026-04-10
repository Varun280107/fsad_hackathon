import React, { useState, useEffect } from 'react';
import './History.css';

const History = ({ user }) => {
  const [leaves, setLeaves] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Load leaves from localStorage or use sample data
    const storedLeaves = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    if (storedLeaves.length === 0) {
      const sampleLeaves = [
        { id: 1, type: 'Sick Leave', startDate: '2024-03-20', endDate: '2024-03-21', days: 2, reason: 'Fever', status: 'PENDING', appliedDate: '2024-03-19' },
        { id: 2, type: 'Casual Leave', startDate: '2024-03-15', endDate: '2024-03-17', days: 3, reason: 'Family function', status: 'APPROVED', appliedDate: '2024-03-10' },
        { id: 3, type: 'Annual Leave', startDate: '2024-03-10', endDate: '2024-03-12', days: 3, reason: 'Vacation', status: 'APPROVED', appliedDate: '2024-03-05' },
        { id: 4, type: 'Emergency Leave', startDate: '2024-03-05', endDate: '2024-03-05', days: 1, reason: 'Emergency', status: 'REJECTED', appliedDate: '2024-03-04' }
      ];
      setLeaves(sampleLeaves);
    } else {
      setLeaves(storedLeaves);
    }
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

  const filteredLeaves = leaves.filter(leave => {
    const matchesStatus = filterStatus === 'all' || leave.status === filterStatus;
    const matchesSearch = leave.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          leave.reason.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="history">
      <div className="page-header">
        <h1>Leave History</h1>
        <p>View all your leave requests</p>
      </div>

      <div className="filters">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search by leave type or reason..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Leave Type</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Applied Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeaves.length === 0 ? (
              <tr><td colSpan="7" className="text-center">No leave requests found</td></tr>
            ) : (
              filteredLeaves.map(leave => (
                <tr key={leave.id}>
                  <td>{leave.type}</td>
                  <td>{formatDate(leave.startDate)}</td>
                  <td>{formatDate(leave.endDate)}</td>
                  <td>{leave.days}</td>
                  <td>{leave.reason}</td>
                  <td>{getStatusBadge(leave.status)}</td>
                  <td>{formatDate(leave.appliedDate)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default History;