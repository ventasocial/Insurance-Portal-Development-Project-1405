import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { useClaims } from '../contexts/ClaimsContext';
import { claimsService } from '../services/claimsService';
import { ghlService } from '../services/ghlService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiArrowLeft, FiSend, FiArchive, FiUser, FiMail, FiPhone, FiFileText, FiCalendar } = FiIcons;

const AdminClaimDetail = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { claims, updateClaimStatus } = useClaims();
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(false);

  useEffect(() => {
    const currentClaim = claims.find(c => c.id === claimId);
    if (currentClaim) {
      setClaim(currentClaim);
    }
  }, [claimId, claims]);

  const handleSendStatus = async () => {
    setSendingStatus(true);
    try {
      // Trigger GHL automation
      await ghlService.triggerAutomation(claim.contactId, 'send_status_update', {
        claimId: claim.id,
        status: claim.status,
        claimNumber: claim.id?.replace('claim-', ''),
        customerName: claim.nombreAsegurado
      });
      
      toast.success('Estatus enviado al asegurado correctamente');
    } catch (error) {
      toast.error('Error al enviar el estatus');
      console.error('Send status error:', error);
    } finally {
      setSendingStatus(false);
    }
  };

  const handleArchiveClaim = async () => {
    setLoading(true);
    try {
      // Archive the claim (hide from kanban but don't delete)
      await updateClaimStatus(claimId, 'archived');
      toast.success('Reclamo archivado correctamente');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error('Error al archivar el reclamo');
      console.error('Archive error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="w-full mx-auto px-[5%] py-8">
          <div className="text-center">
            <p className="text-gray-600">Cargando información del reclamo...</p>
          </div>
        </div>
      </div>
    );
  }

  const claimNumber = claim.id?.replace('claim-', '');
  const isInInsurer = claim.status === 'sent-to-insurer';

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
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center space-x-2 text-fortex-primary hover:text-fortex-secondary mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Volver al dashboard</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Reclamo-{claimNumber}
                </h2>
                <p className="text-gray-600">
                  Detalles del reclamo administrativo
                </p>
              </div>
              <button
                onClick={isInInsurer ? handleArchiveClaim : handleSendStatus}
                disabled={loading || sendingStatus}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  isInInsurer 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-fortex-primary hover:bg-fortex-secondary text-white'
                }`}
                style={isInInsurer ? { backgroundColor: '#e33333' } : {}}
              >
                <SafeIcon icon={isInInsurer ? FiArchive : FiSend} className="w-4 h-4" />
                <span>
                  {loading || sendingStatus 
                    ? (isInInsurer ? 'Archivando...' : 'Enviando...') 
                    : (isInInsurer ? 'Archivar Tarjeta' : 'Enviar Estatus al Asegurado')
                  }
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Claim Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2 text-fortex-primary" />
                  Información del Reclamo
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Siniestro
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {claim.tipoSiniestro || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Reclamo
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {claim.tipoReclamo || 'No especificado'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Aseguradora
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {claim.aseguradora || 'No especificada'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Póliza
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {claim.numeroPoliza || 'No especificado'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relación con el Asegurado
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {claim.relacionAsegurado || 'No especificada'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                    Fecha de Creación
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {new Date(claim.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <SafeIcon icon={FiUser} className="w-5 h-5 mr-2 text-fortex-primary" />
                  Información de Contacto
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Contacto
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {`${claim.firstName || ''} ${claim.lastName || ''}`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <SafeIcon icon={FiMail} className="w-4 h-4 mr-1" />
                    Email
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {claim.email || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <SafeIcon icon={FiPhone} className="w-4 h-4 mr-1" />
                    WhatsApp
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {claim.phone || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Asegurado
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {claim.nombreAsegurado || 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email del Asegurado
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {claim.emailAsegurado || 'No especificado'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="mt-8 bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Documentos del Reclamo
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <SafeIcon icon={FiFileText} className="w-12 h-12 mx-auto mb-2" />
                <p>Los documentos se mostrarán aquí</p>
                <p className="text-sm">Documentos subidos: {claim.documentsCount || 0}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminClaimDetail;