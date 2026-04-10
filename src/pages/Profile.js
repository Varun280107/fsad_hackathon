import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaIdCard, FaBuilding, FaPhone, FaCalendar, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Profile.css';

const Profile = ({ user, setUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    department: user.department,
    role: user.role,
    bio: user.bio || ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const updatedUser = { ...user, ...formData };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    setUser(updatedUser);
    setIsEditing(false);
    toast.success('Profile updated successfully!');
  };

  const usedLeaves = user.usedLeaves || 0;
  const totalLeaves = user.totalLeaves || 20;
  const remainingLeaves = totalLeaves - usedLeaves;
  const leavePercentage = (usedLeaves / totalLeaves) * 100;

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your personal information</p>
      </div>

      <div className="profile-container">
        <div className="profile-header-card">
          <div className="profile-avatar">
            <img src={user.avatar || `https://ui-avatars.com/api/?background=6366f1&color=fff&size=120&name=${user.name}`} alt={user.name} />
            <button className="edit-avatar-btn">
              <FaEdit />
            </button>
          </div>
          <div className="profile-stats">
            <div className="stat-item">
              <h3>{totalLeaves}</h3>
              <p>Total Leaves</p>
            </div>
            <div className="stat-item">
              <h3>{usedLeaves}</h3>
              <p>Used Leaves</p>
            </div>
            <div className="stat-item">
              <h3>{remainingLeaves}</h3>
              <p>Remaining</p>
            </div>
          </div>
        </div>

        <div className="profile-info-card">
          <div className="card-header">
            <h2>Personal Information</h2>
            {!isEditing ? (
              <button className="edit-btn" onClick={() => setIsEditing(true)}>
                <FaEdit /> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="save-btn" onClick={handleSave}>
                  <FaSave /> Save
                </button>
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  <FaTimes /> Cancel
                </button>
              </div>
            )}
          </div>

          <div className="info-grid">
            <div className="info-item">
              <FaUser className="info-icon" />
              <div className="info-content">
                <label>Full Name</label>
                {isEditing ? (
                  <input type="text" name="name" value={formData.name} onChange={handleChange} />
                ) : (
                  <p>{user.name}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <FaEnvelope className="info-icon" />
              <div className="info-content">
                <label>Email Address</label>
                {isEditing ? (
                  <input type="email" name="email" value={formData.email} onChange={handleChange} />
                ) : (
                  <p>{user.email}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <FaIdCard className="info-icon" />
              <div className="info-content">
                <label>Employee ID</label>
                <p>{user.employeeId}</p>
              </div>
            </div>

            <div className="info-item">
              <FaBuilding className="info-icon" />
              <div className="info-content">
                <label>Department</label>
                {isEditing ? (
                  <input type="text" name="department" value={formData.department} onChange={handleChange} />
                ) : (
                  <p>{user.department}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <FaPhone className="info-icon" />
              <div className="info-content">
                <label>Phone Number</label>
                {isEditing ? (
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} />
                ) : (
                  <p>{user.phone || 'Not provided'}</p>
                )}
              </div>
            </div>

            <div className="info-item">
              <FaCalendar className="info-icon" />
              <div className="info-content">
                <label>Join Date</label>
                <p>{new Date(user.joinDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>

          <div className="bio-section">
            <label>Bio / About</label>
            {isEditing ? (
              <textarea name="bio" rows="3" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..." />
            ) : (
              <p>{user.bio || 'No bio added yet'}</p>
            )}
          </div>

          <div className="leave-summary">
            <h3>Leave Summary</h3>
            <div className="leave-progress">
              <div className="progress-label">
                <span>Used: {usedLeaves} days</span>
                <span>Remaining: {remainingLeaves} days</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${leavePercentage}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;