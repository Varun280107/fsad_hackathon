import React, { useState } from 'react';
import './ApplyLeave.css';

const ApplyLeave = ({ user }) => {
  const [formData, setFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [totalDays, setTotalDays] = useState('');

  const leaveTypes = ['Sick Leave', 'Casual Leave', 'Annual Leave', 'Emergency Leave'];

  const calculateDays = (start, end) => {
    if (start && end) {
      const diffTime = Math.abs(new Date(end) - new Date(start));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      setTotalDays(diffDays);
      return diffDays;
    }
    return 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'startDate' || name === 'endDate') {
      const start = name === 'startDate' ? value : formData.startDate;
      const end = name === 'endDate' ? value : formData.endDate;
      calculateDays(start, end);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.leaveType || !formData.startDate || !formData.endDate || !formData.reason) {
      alert('Please fill all required fields');
      return;
    }
    
    const newLeave = {
      id: Date.now(),
      type: formData.leaveType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: totalDays,
      reason: formData.reason,
      status: 'PENDING',
      appliedDate: new Date().toISOString().split('T')[0]
    };
    
    const existingLeaves = JSON.parse(localStorage.getItem('leaveRequests') || '[]');
    existingLeaves.unshift(newLeave);
    localStorage.setItem('leaveRequests', JSON.stringify(existingLeaves));
    
    alert('Leave request submitted successfully!');
    
    setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
    setTotalDays('');
  };

  return (
    <div className="apply-leave">
      <div className="page-header">
        <h1>Apply for Leave</h1>
        <p>Submit your leave request for approval</p>
      </div>

      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Leave Type *</label>
            <select name="leaveType" value={formData.leaveType} onChange={handleChange} required>
              <option value="">Select Leave Type</option>
              {leaveTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Total Days</label>
            <input type="text" value={totalDays} readOnly />
          </div>

          <div className="form-group">
            <label>Reason *</label>
            <textarea name="reason" rows="4" value={formData.reason} onChange={handleChange} placeholder="Please provide detailed reason..." required></textarea>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => {
              setFormData({ leaveType: '', startDate: '', endDate: '', reason: '' });
              setTotalDays('');
            }}>Clear</button>
            <button type="submit" className="btn-primary">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;