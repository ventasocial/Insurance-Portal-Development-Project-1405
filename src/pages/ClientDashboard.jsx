import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import ClaimCard from '../components/ClaimCard';
import NewClaimModal from '../components/NewClaimModal';
import { useClaims } from '../contexts/ClaimsContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';

const { FiPlus, FiFileText } = FiIcons;

const ClientDashboard = () => {
  const { claims, loading, fetchClaims } = useClaims();
  const { user } = useAuth();
  const [showNewClaimModal, setShowNewClaimModal] = useState(false);

  const handleNewClaim = () => {
    setShowNewClaimModal(true);
  };

  const handleClaimCreated = (newClaim) => {
    // Refresh claims list
    fetchClaims();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="w-full mx-auto px-[5%] py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenido, {user?.firstName || user?.email}
            </h2>
            <p className="text-gray-600">
              Gestiona tus reclamos de seguros de manera fácil y segura
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiFileText} className="w-8 h-8 text-fortex-primary" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Reclamos</p>
                  <p className="text-2xl font-bold text-gray-900">{claims.length}</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiFileText} className="w-8 h-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Proceso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {claims.filter(c => ['pending', 'under-review', 'incomplete'].includes(c.status)).length}
                  </p>
                </div>
              </div>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6"
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center">
                <SafeIcon icon={FiFileText} className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Finalizados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {claims.filter(c => c.status === 'finalized').length}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Claims List */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Mis Reclamos
                </h3>
                <button
                  onClick={handleNewClaim}
                  className="flex items-center space-x-2 px-4 py-2 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-4 h-4" />
                  <span>Nuevo Reclamo</span>
                </button>
              </div>
            </div>
            <div className="p-6">
              {claims.length === 0 ? (
                <div className="text-center py-12">
                  <SafeIcon icon={FiFileText} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No tienes reclamos activos
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Cuando tengas reclamos pendientes, aparecerán aquí
                  </p>
                  <button
                    onClick={handleNewClaim}
                    className="px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
                  >
                    Crear primer reclamo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {claims.map((claim) => (
                    <ClaimCard key={claim.id} claim={claim} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>

      {/* New Claim Modal */}
      <NewClaimModal
        isOpen={showNewClaimModal}
        onClose={() => setShowNewClaimModal(false)}
        onClaimCreated={handleClaimCreated}
      />
    </div>
  );
};

export default ClientDashboard;