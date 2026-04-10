import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBrain, FaEnvelope, FaLock, FaUser, FaPhone, FaBuilding, FaIdCard, FaEye, FaEyeSlash } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './Login.css';

const Login = ({ setUser }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    employeeId: '',
    department: '',
    phone: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  // Initialize demo users
  const initializeUsers = () => {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      const demoUsers = [
        {
          id: 1,
          name: 'Nallapu Sreeja',
          email: '2420030267@klh.edu.in',
          password: '123456',
          employeeId: '101',
          department: 'HR',
          phone: '9849270406',
          role: 'Employee',
          avatar: 'https://ui-avatars.com/api/?background=6366f1&color=fff&name=Nallapu+Sreeja',
          totalLeaves: 20,
          usedLeaves: 6,
          joinDate: '2024-01-01',
          bio: ''
        },
        {
          id: 2,
          name: 'John Doe',
          email: 'john@smartleave.com',
          password: '123456',
          employeeId: 'EMP002',
          department: 'IT',
          phone: '9876543210',
          role: 'Employee',
          avatar: 'https://ui-avatars.com/api/?background=6366f1&color=fff&name=John+Doe',
          totalLeaves: 20,
          usedLeaves: 4,
          joinDate: '2024-01-15',
          bio: ''
        }
      ];
      localStorage.setItem('users', JSON.stringify(demoUsers));
    }
  };
  initializeUsers();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.email === formData.email && u.password === formData.password);
    
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setUser(user);
      toast.success(`Welcome back, ${user.name}! 🎉`);
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      toast.error('Invalid email or password');
    }
  };

  const handleSignup = (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const existingUser = users.find(u => u.email === formData.email);
    
    if (existingUser) {
      toast.error('Email already registered');
      return;
    }
    
    const newUser = {
      id: users.length + 1,
      name: formData.name,
      email: formData.email,
      password: formData.password,
      employeeId: formData.employeeId,
      department: formData.department || 'General',
      phone: formData.phone || '',
      role: 'Employee',
      avatar: `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${formData.name.replace(' ', '+')}`,
      totalLeaves: 20,
      usedLeaves: 0,
      joinDate: new Date().toISOString().split('T')[0],
      bio: ''
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('currentUser', JSON.stringify(newUser));
    setUser(newUser);
    toast.success('Account created successfully! 🎉');
    setTimeout(() => navigate('/dashboard'), 1000);
  };

  return (
    <div className="login-container">
      <div className="login-bg-pattern"></div>
      <div className="login-card">
        {/* ========== BIG VISIBLE SmartLeaveAI LOGO ========== */}
        <div className="login-header">
          <div className="logo-wrapper">
            <FaBrain className="logo-icon-large" />
            <div className="logo-text-wrapper">
              <div className="logo-main-text">
                SmartLeave<span className="logo-ai-text">AI</span>
              </div>
              <div className="logo-sub-text">
                Intelligent Leave Management System
              </div>
            </div>
          </div>
        </div>

        <div className="login-tabs">
          <button className={`tab ${isLogin ? 'active' : ''}`} onClick={() => setIsLogin(true)}>
            Sign In
          </button>
          <button className={`tab ${!isLogin ? 'active' : ''}`} onClick={() => setIsLogin(false)}>
            Create Account
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <button type="submit" className="login-btn">Sign In</button>
            <div className="demo-credentials">
              <p>Demo Credentials:</p>
              <code>2420030267@klh.edu.in / 123456</code>
              <br />
              <code>john@smartleave.com / 123456</code>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="login-form signup-form">
            <div className="input-group">
              <FaUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name *"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address *"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaIdCard className="input-icon" />
              <input
                type="text"
                name="employeeId"
                placeholder="Employee ID *"
                value={formData.employeeId}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password *"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <FaBuilding className="input-icon" />
              <input
                type="text"
                name="department"
                placeholder="Department"
                value={formData.department}
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <FaPhone className="input-icon" />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="login-btn">Create Account</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;