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
      console.log('Fetching claims for user:', user.id, 'isAdmin:', isAdmin);
      const claimsData = isAdmin 
        ? await claimsService.getAllClaims() 
        : await claimsService.getUserClaims(user.contactId);
      
      console.log('Claims data fetched:', claimsData.length, 'claims');
      setClaims(claimsData);
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateClaimStatus = async (claimId, status, comments = '') => {
    try {
      console.log('Updating claim status:', claimId, status);
      await claimsService.updateClaimStatus(claimId, status, comments);
      await fetchClaims();
    } catch (error) {
      console.error('Error updating claim status:', error);
      throw error;
    }
  };

  const updateDocumentStatus = async (claimId, documentType, status, comments = '') => {
    try {
      console.log('Updating document status:', claimId, documentType, status);
      await claimsService.updateDocumentStatus(claimId, documentType, status, comments);
      await fetchClaims();
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      console.log('User detected, fetching claims');
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