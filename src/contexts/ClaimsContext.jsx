import React, { createContext, useContext, useState, useEffect } from 'react';
import { claimsService } from '../services/claimsService';
import { useAuth } from './AuthContext';

const ClaimsContext = createContext();

export const useClaims = () => {
  const context = useContext(ClaimsContext);
  if (!context) {
    throw new Error('useClaims must be used within a ClaimsProvider');
  }
  return context;
};

export const ClaimsProvider = ({ children }) => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAdmin } = useAuth();

  const fetchClaims = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const claimsData = isAdmin 
        ? await claimsService.getAllClaims()
        : await claimsService.getUserClaims(user.contactId);
      setClaims(claimsData);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId, status, comments = '') => {
    try {
      await claimsService.updateClaimStatus(claimId, status, comments);
      await fetchClaims();
    } catch (error) {
      console.error('Error updating claim status:', error);
      throw error;
    }
  };

  const updateDocumentStatus = async (claimId, documentType, status, comments = '') => {
    try {
      await claimsService.updateDocumentStatus(claimId, documentType, status, comments);
      await fetchClaims();
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchClaims();
    }
  }, [user, isAdmin]);

  const value = {
    claims,
    loading,
    fetchClaims,
    updateClaimStatus,
    updateDocumentStatus
  };

  return (
    <ClaimsContext.Provider value={value}>
      {children}
    </ClaimsContext.Provider>
  );
};