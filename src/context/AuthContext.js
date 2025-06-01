// frontend/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { Spin } from 'antd';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    token: localStorage.getItem('token'),
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const API_URL = 'im-backend-dvg3fybah4dkb8c4.japanwest-01.azurewebsites.net/api';
  // console.log('AuthProvider: Initializing/Re-rendering. isLoading:', authState.isLoading);

  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // useCallback for loadUser is good, ensure its dependencies are truly empty if it should not change.
  const loadUser = useCallback(async (currentToken = localStorage.getItem('token')) => {
    // console.log('AuthProvider: loadUser called. Token:', currentToken ? 'Exists' : 'None');
    if (currentToken) {
      setAuthToken(currentToken);
      try {
        const decodedToken = jwtDecode(currentToken);
        // console.log('AuthProvider: Token decoded:', decodedToken);

        if (decodedToken.exp * 1000 < Date.now()) {
          // console.log('AuthProvider: Token expired.');
          localStorage.removeItem('token');
          setAuthToken(null);
          setAuthState({ token: null, user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        // console.log('AuthProvider: Fetching user from /api/auth/me...');
        const res = await axios.get(`${API_URL}/auth/me`);
        // console.log('AuthProvider: Response from /api/auth/me:', res.data);

        if (res.data.user && res.data.user.role) {
          // console.log('AuthProvider: User loaded successfully:', res.data.user);
          setAuthState({
            token: currentToken,
            user: res.data.user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          console.error("AuthProvider: User data or role missing from /api/auth/me response:", res.data);
          localStorage.removeItem('token');
          setAuthToken(null);
          setAuthState({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
      } catch (error) {
        console.error("AuthProvider: Error in loadUser (fetching /auth/me or decoding):", error.response ? error.response.data : error.message);
        localStorage.removeItem('token');
        setAuthToken(null);
        setAuthState({ token: null, user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      // console.log('AuthProvider: No token found, setting isLoading to false.');
      setAuthToken(null);
      setAuthState(prevState => ({ ...prevState, token: null, user: null, isAuthenticated: false, isLoading: false }));
    }
  }, []); // API_URL is defined outside, so it's stable. setAuthToken and setAuthState are stable.

  useEffect(() => {
    console.log('AuthProvider: Mount effect triggered to call loadUser.');
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, []); // <-- CRITICAL CHANGE: Empty dependency array to run only ONCE on mount.

  const login = async (email, password) => {
    // console.log('AuthProvider: login attempt for email:', email);
    setAuthState(prevState => ({ ...prevState, isLoading: true }));
    try {
      const res = await axios.post(`${API_URL}/auth/signin`, { email, password });
      // console.log('AuthProvider: Login API response:', res.data);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      await loadUser(res.data.token); 
      // console.log('AuthProvider: User state after login and loadUser:', authState); // authState might be stale here
      return { success: true, user: res.data.user };
    } catch (error) {
      console.error('AuthProvider: Login error:', error.response ? error.response.data : error.message);
      setAuthState({ token: null, user: null, isAuthenticated: false, isLoading: false });
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (username, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, { username, email, password });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('Signup error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = () => {
    // console.log('AuthProvider: logout called.');
    localStorage.removeItem('token');
    setAuthToken(null);
    setAuthState({ token: null, user: null, isAuthenticated: false, isLoading: false });
  };

  const forgotPassword = async (email) => {
    try {
      const res = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('Forgot password error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response?.data?.message || 'Request failed' };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      const res = await axios.put(`${API_URL}/auth/resetpassword/${resetToken}`, { password });
      return { success: true, message: res.data.message };
    } catch (error) {
      console.error('Reset password error:', error.response ? error.response.data : error.message);
      return { success: false, message: error.response?.data?.message || 'Password reset failed' };
    }
  };

  // This effect is just for logging when authState changes
  // useEffect(() => {
  //   console.log('AuthProvider: authState changed:', authState);
  // }, [authState]);


  if (authState.isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000' }}>
        <Spin size="large" tip="Initializing App..." />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, loadUser, forgotPassword, resetPassword, API_URL, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
