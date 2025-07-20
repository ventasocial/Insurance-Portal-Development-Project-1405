import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const { FiFileText, FiClock, FiCheckCircle, FiXCircle, FiArrowRight, FiUser, FiPlus } = FiIcons;

const ClaimCard = ({ claim, isAdmin = false, onCreateComplemento }) => {
  const navigate = useNavigate();

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return FiClock;
      case 'approved': return FiCheckCircle;
      case 'rejected': return FiXCircle;
      case 'verified': return FiCheckCircle;
      default: return FiFileText;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'under-review': return 'text-blue-600 bg-blue-100';
      case 'verified': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'under-review': return 'En Revisión';
      case 'incomplete': return 'Incompleto';
      case 'verified': return 'Aprobado';
      case 'sent-to-insurer': return 'Enviado a Aseguradora';
      case 'finalized': return 'Finalizado';
      default: return capitalizeFirstLetter(status);
    }
  };

  const handleCardClick = () => {
    if (isAdmin) {
      // Admin sees all claim details
      navigate(`/admin/claim/${claim.id}`);
    } else {
      // Client sees claim form or documents
      navigate(`/claim/${claim.id}`);
    }
  };

  const handleCreateComplemento = (e) => {
    e.stopPropagation();
    if (onCreateComplemento) {
      onCreateComplemento(claim);
    }
  };

  // Format ID to show a shorter version
  const formatClaimNumber = (id) => {
    if (!id) return '';
    // If the ID is a UUID, take just the first part
    if (id.includes('-')) {
      return id.split('-')[0].toUpperCase();
    }
    return id.toUpperCase();
  };

  const claimNumber = formatClaimNumber(claim.id);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM, yyyy h:mm a", { locale: es });
  };

  // Check if complemento button should be shown
  const showComplementoButton = claim.tipoReclamo === 'reembolso' && 
    claim.tipoSiniestro === 'inicial' && 
    claim.numeroReclamoAseguradora;

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow relative"
      whileHover={{ y: -2 }}
      onClick={handleCardClick}
    >
      {/* Complemento Button - VISIBLE SIEMPRE EN LA TARJETA */}
      {showComplementoButton && (
        <button
          onClick={(e) => handleCreateComplemento(e)}
          className="absolute top-3 right-3 bg-fortex-primary text-white rounded-md px-3 py-1.5 hover:bg-fortex-secondary transition-colors z-10 flex items-center space-x-1"
          title="Crear reclamo complemento"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4" />
          <span className="text-xs font-medium">Complemento</span>
        </button>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiFileText} className="w-8 h-8 text-fortex-primary" />
          <div>
            <h3 className="text-sm text-gray-900">
              R-{claimNumber}
            </h3>
            <p className="text-sm text-gray-600">
              {capitalizeFirstLetter(claim.tipoReclamo)}
            </p>
          </div>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)}`}>
          <SafeIcon icon={getStatusIcon(claim.status)} className="w-4 h-4" />
          <span>{getStatusText(claim.status)}</span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Asegurado:</span>
          <span className="font-medium">{claim.nombreAsegurado}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Póliza:</span>
          <span className="font-medium">{claim.numeroPoliza}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Aseguradora:</span>
          <span className="font-medium">{claim.aseguradora || 'No especificada'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Número de Reclamo:</span>
          <span className="font-medium">{claim.numeroReclamoAseguradora || claim.numeroReclamo || 'No asignado'}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Fecha de Creación:</span>
          <span className="font-medium">{new Date(claim.createdAt).toLocaleDateString()}</span>
        </div>

        {isAdmin && (
          <div className="flex justify-between text-sm text-gray-500 pt-2 border-t border-gray-100 mt-2">
            <div className="flex items-center">
              <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
              <span>Editado:</span>
            </div>
            <span className="ml-1">{formatDateTime(claim.updatedAt)}</span>
          </div>
        )}

        {isAdmin && claim.lastEditedBy && (
          <div className="flex justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <SafeIcon icon={FiUser} className="w-3 h-3 mr-1" />
              <span>Editado por:</span>
            </div>
            <span>{claim.lastEditedBy}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <span>Documentos:</span>
          <span className="font-medium">{claim.documentsCount || 0}</span>
        </div>
        <SafeIcon icon={FiArrowRight} className="w-5 h-5 text-fortex-primary" />
      </div>
    </motion.div>
  );
};

export default ClaimCard;