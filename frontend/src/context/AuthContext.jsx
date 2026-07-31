import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize/validate token on load
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.user);
        } catch (err) {
          console.error("Token verification failed. Logging out.", err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', { name, email, password });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Google OAuth / Facebook Authentication
  const socialLogin = async (provider, credentialOrEmail, name) => {
    setLoading(true);
    try {
      const endpoint = provider === 'google' ? '/auth/google' : '/auth/facebook';
      const body = provider === 'google'
        ? { credential: credentialOrEmail }
        : { email: credentialOrEmail, name };
      const res = await api.post(endpoint, body);
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Passkey mock authentication
  const passkeyRegister = async (credentialId) => {
    try {
      const res = await api.post('/auth/passkey/register', { credentialId });
      return res;
    } catch (err) {
      throw err;
    }
  };

  const passkeyLogin = async (credentialId) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/passkey/login', { credentialId });
      localStorage.setItem('token', res.token);
      setToken(res.token);
      setUser(res.user);
      setLoading(false);
      return res.user;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  const updateProfile = async (name, email, password) => {
    try {
      const res = await api.put('/auth/profile', { name, email, password });
      setUser(res.user);
      return res.message;
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      socialLogin,
      passkeyRegister,
      passkeyLogin,
      logout,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
