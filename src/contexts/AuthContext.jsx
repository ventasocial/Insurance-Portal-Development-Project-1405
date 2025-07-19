import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { supabaseService } from '../services/supabaseService';
import supabase from '../lib/supabase';

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
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log('Initializing authentication');
        
        // Check for existing Supabase session
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        
        if (session) {
          console.log('Found Supabase session:', session.user.email);
          const userData = {
            id: session.user.id,
            contactId: session.user.id,
            email: session.user.email,
            firstName: session.user.user_metadata?.firstName || 'Usuario',
            lastName: session.user.user_metadata?.lastName || '',
            phone: session.user.user_metadata?.phone || '',
            roles: session.user.user_metadata?.roles || ['client']
          };
          setUser(userData);
          setRoles(userData.roles);
        } else {
          console.log('No Supabase session, checking for stored tokens');
          // Fallback to stored token
          const token = localStorage.getItem('fortex_token');
          const adminToken = localStorage.getItem('fortex_admin_token');
          const operatorToken = localStorage.getItem('fortex_operator_token');

          if (adminToken) {
            console.log('Found admin token');
            const adminUser = await authService.validateAdminToken(adminToken);
            if (adminUser) {
              setUser(adminUser);
              setRoles(['admin', 'operator']);
            }
          } else if (operatorToken) {
            console.log('Found operator token');
            const operatorUser = await authService.validateAdminToken(operatorToken);
            if (operatorUser) {
              setUser(operatorUser);
              setRoles(['operator']);
            }
          } else if (token) {
            console.log('Found client token');
            const userData = await authService.validateMagicLink(token);
            if (userData) {
              setUser(userData);
              setRoles(userData.roles || ['client']);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (event === 'SIGNED_IN' && session) {
          const userData = {
            id: session.user.id,
            contactId: session.user.id,
            email: session.user.email,
            firstName: session.user.user_metadata?.firstName || 'Usuario',
            lastName: session.user.user_metadata?.lastName || '',
            phone: session.user.user_metadata?.phone || '',
            roles: session.user.user_metadata?.roles || ['client']
          };
          setUser(userData);
          setRoles(userData.roles);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setRoles([]);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with email:', email);
      
      // Try Supabase login
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!error && data?.user) {
          console.log('Supabase login successful:', data.user.email);
          const userData = {
            id: data.user.id,
            contactId: data.user.id,
            email: data.user.email,
            firstName: data.user.user_metadata?.firstName || 'Usuario',
            lastName: data.user.user_metadata?.lastName || '',
            phone: data.user.user_metadata?.phone || '',
            roles: data.user.user_metadata?.roles || ['client']
          };
          setUser(userData);
          setRoles(userData.roles || ['client']);
          return userData;
        }
      } catch (e) {
        console.error('Supabase login failed, falling back to demo login:', e);
      }

      // Fallback to demo login for specific credentials
      if (email === 'admin@fortex.com' && password === 'admin123') {
        console.log('Using admin demo login');
        return adminLogin({ email, password });
      } else if (email === 'operator@fortex.com' && password === 'operator123') {
        console.log('Using operator demo login');
        return operatorLogin({ email, password });
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            roles: ['client']
          }
        }
      });
      
      if (error) throw error;
      
      console.log('User signed up successfully');
      return data;
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const loginDemo = () => {
    console.log('Using demo login');
    const demoUser = {
      id: 'demo-user-123',
      contactId: 'demo-contact-456',
      email: 'demo@cliente.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      phone: '+52 55 1234 5678',
      roles: ['client']
    };
    setUser(demoUser);
    setRoles(['client']);
    localStorage.setItem('fortex_token', 'demo-token-active');
    return demoUser;
  };

  const adminLogin = async (credentials) => {
    try {
      const { email, password } = credentials;
      console.log('Attempting admin login with email:', email);

      if (email === 'admin@fortex.com' && password === 'admin123') {
        const adminData = {
          user: {
            id: 'admin-123',
            email: 'admin@fortex.com',
            firstName: 'Administrador',
            roles: ['admin', 'operator']
          },
          token: 'admin-token-12345'
        };
        setUser(adminData.user);
        setRoles(['admin', 'operator']);
        localStorage.setItem('fortex_admin_token', adminData.token);
        console.log('Admin login successful');
        return adminData;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Admin login error:', error);
      throw error;
    }
  };

  const operatorLogin = async (credentials) => {
    try {
      const { email, password } = credentials;
      console.log('Attempting operator login with email:', email);

      if (email === 'operator@fortex.com' && password === 'operator123') {
        const operatorData = {
          user: {
            id: 'operator-123',
            email: 'operator@fortex.com',
            firstName: 'Operador',
            roles: ['operator']
          },
          token: 'operator-token-12345'
        };
        setUser(operatorData.user);
        setRoles(['operator']);
        localStorage.setItem('fortex_operator_token', operatorData.token);
        console.log('Operator login successful');
        return operatorData;
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (error) {
      console.error('Operator login error:', error);
      throw error;
    }
  };

  const hasRole = (requiredRole) => {
    return roles.includes(requiredRole);
  };

  const hasAnyRole = (requiredRoles) => {
    return requiredRoles.some(role => roles.includes(role));
  };

  const updateUserProfile = async (profileData) => {
    try {
      if (user?.id && user.id.startsWith('demo-') === false) {
        // Update in Supabase
        await supabaseService.updateUserProfile(profileData);
      }
      setUser(prev => ({ ...prev, ...profileData }));
      console.log('User profile updated:', profileData);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Logging out');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Supabase signout error:', error);
    }
    setUser(null);
    setRoles([]);
    localStorage.removeItem('fortex_token');
    localStorage.removeItem('fortex_admin_token');
    localStorage.removeItem('fortex_operator_token');
  };

  const value = {
    user,
    roles,
    loading,
    isAdmin: hasRole('admin'),
    isOperator: hasRole('operator'),
    hasRole,
    hasAnyRole,
    login,
    signUp,
    loginDemo,
    adminLogin,
    operatorLogin,
    updateUserProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};