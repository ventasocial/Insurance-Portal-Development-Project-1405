import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('fortex_token');
        const adminToken = localStorage.getItem('fortex_admin_token');
        
        if (adminToken) {
          const adminUser = await authService.validateAdminToken(adminToken);
          if (adminUser) {
            setUser(adminUser);
            setIsAdmin(true);
          }
        } else if (token) {
          const userData = await authService.validateMagicLink(token);
          if (userData) {
            setUser(userData);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (token) => {
    try {
      const userData = await authService.validateMagicLink(token);
      setUser(userData);
      setIsAdmin(false);
      localStorage.setItem('fortex_token', token);
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const loginDemo = () => {
    const demoUser = {
      id: 'demo-user-123',
      contactId: 'demo-contact-456',
      email: 'demo@cliente.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+52 55 1234 5678'
    };
    setUser(demoUser);
    setIsAdmin(false);
    localStorage.setItem('fortex_token', 'demo-token-active');
    return demoUser;
  };

  const adminLogin = async (credentials) => {
    const adminData = await authService.adminLogin(credentials);
    setUser(adminData.user);
    setIsAdmin(true);
    localStorage.setItem('fortex_admin_token', adminData.token);
    return adminData;
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('fortex_token');
    localStorage.removeItem('fortex_admin_token');
  };

  const value = {
    user,
    isAdmin,
    loading,
    login,
    loginDemo,
    adminLogin,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};