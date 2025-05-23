import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const navigate = useNavigate();

  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification({ ...notification, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    // Input validation
    if (!email && !password) {
      showNotification('Please enter your email and password.', 'error');
      return;
    } else if (!email) {
      showNotification('Please enter your email.', 'error');
      return;
    } else if (!password) {
      showNotification('Please enter your password.', 'error');
      return;
    }

    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      showNotification('Logged in successfully!', 'success');
      navigate('/Home');
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* Notification Popup */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Left Panel */}
      <div className="left-panel">
        <div className="logo">
          <h2>TaskFlow</h2>
          <p>Task Management System</p>
        </div>
        <div className="login-box">
          <h2>LOG IN</h2>
          <form onSubmit={handleLogin}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email"
            />

            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-label="Password"
            />

            <div className="auth-buttons">
              <button type="submit" disabled={loading}>
                {loading ? 'Logging in...' : 'LOG IN'}
              </button>
              <button type="button" onClick={() => navigate('/signup')}>
                SIGN UP
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Panel */}
      <div className="right-panel">
        <div className="help-box">
          <h2>NEED HELP?</h2>
          <p>CREATE A FREE ACCOUNT TO ACCESS THE WEBSITE NOW</p>
          <div className="help-icons">
            <div className="icon-box" />
            <div className="icon-box" />
            <div className="icon-box" />
            <div className="icon-box" />
            <div className="icon-box" />
          </div>
        </div>
        <div className="contact-info">
          <p><strong>FACEBOOK:</strong> TMA PH</p>
          <p><strong>X:</strong> @TMAPH</p>
          <p><strong>INSTAGRAM:</strong> TMA_PH</p>
          <p><strong>CONTACT NO:</strong> 0945-876-9089</p>
          <p><strong>EMAIL:</strong> TMAPH@BUSINESS.COM</p>
        </div>
      </div>
    </div>
  );
}

export default Login;