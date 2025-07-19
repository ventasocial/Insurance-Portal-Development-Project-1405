import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import { useClaims } from '../contexts/ClaimsContext';
import { claimsService } from '../services/claimsService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const { FiSave, FiArrowLeft, FiUpload, FiArchive, FiUser, FiMail, FiPhone, FiFileText, FiCalendar } = FiIcons;

const ClaimForm = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { claims } = useClaims();
  const [claim, setClaim] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  useEffect(() => {
    const currentClaim = claims.find(c => c.id === claimId);
    if (currentClaim) {
      setClaim(currentClaim);
      setFormData(currentClaim);
    }
  }, [claimId, claims]);

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Validación de teléfono
  const validatePhone = (phone) => {
    // Formato esperado: +52 81 1234 5678 o variaciones similares
    const regex = /^\+\d{2}\s?\d{2}\s?\d{4}\s?\d{4}$/;
    return regex.test(phone);
  };

  // Validación de email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar número de teléfono
    if (!validatePhone(formData.phone)) {
      toast.error('El número de WhatsApp debe tener el formato: +52 81 1234 5678');
      return;
    }

    // Validar email
    if (!validateEmail(formData.email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }

    // Validar email del asegurado si está presente
    if (formData.emailAsegurado && !validateEmail(formData.emailAsegurado)) {
      toast.error('Por favor ingresa un correo electrónico válido para el asegurado');
      return;
    }

    setLoading(true);
    try {
      await claimsService.updateClaim(claimId, formData);
      toast.success('Información actualizada correctamente');
    } catch (error) {
      toast.error('Error al actualizar la información');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClaim = async () => {
    setLoading(true);
    try {
      await claimsService.updateClaimStatus(claimId, 'archived');
      toast.success('Reclamo archivado correctamente');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Error al archivar el reclamo');
      console.error('Archive error:', error);
    } finally {
      setLoading(false);
      setShowArchiveConfirm(false);
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

  // Extract just the number part from claim ID
  const claimNumber = claim.id?.replace('claim-', '').toUpperCase();

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
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-fortex-primary hover:text-fortex-secondary"
              >
                <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
                <span>Volver al dashboard</span>
              </button>
              <button
                onClick={() => setShowArchiveConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <SafeIcon icon={FiArchive} className="w-4 h-4" />
                <span>Archivar</span>
              </button>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reclamo-{claimNumber}
            </h2>
            <p className="text-gray-600">
              Completa la información de tu reclamo
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Claim Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2 text-fortex-primary" />
                  Información del Reclamo
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    <select
                      value={formData.aseguradora || claim.aseguradora || ''}
                      onChange={(e) => handleInputChange('aseguradora', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      <option value="GNP">GNP</option>
                      <option value="AXA">AXA</option>
                      <option value="Qualitas">Qualitas</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Póliza
                    </label>
                    <input
                      type="text"
                      value={formData.numeroPoliza || claim.numeroPoliza || ''}
                      onChange={(e) => handleInputChange('numeroPoliza', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relación con el Asegurado
                  </label>
                  <select
                    value={formData.relacionAsegurado || claim.relacionAsegurado || ''}
                    onChange={(e) => handleInputChange('relacionAsegurado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="titular">Titular</option>
                    <option value="conyuge">Cónyuge</option>
                    <option value="hijo">Hijo/a</option>
                    <option value="padre">Padre/Madre</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                {/* Número de Reclamo de la Aseguradora (solo para reembolso/inicial) - Solo visible */}
                {formData.tipoReclamo === 'reembolso' && formData.tipoSiniestro === 'inicial' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Reclamo de la Aseguradora
                    </label>
                    <input
                      type="text"
                      value={formData.numeroReclamoAseguradora || claim.numeroReclamoAseguradora || ''}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      placeholder="Asignado por el operador"
                    />
                  </div>
                )}

                {/* Número de Reclamo (para complemento) */}
                {formData.tipoReclamo === 'reembolso' && formData.tipoSiniestro === 'complemento' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Reclamo
                    </label>
                    <input
                      type="text"
                      value={formData.numeroReclamo || claim.numeroReclamo || ''}
                      onChange={(e) => handleInputChange('numeroReclamo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      placeholder="Número Proporcionado por la Aseguradora"
                      required
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                    Fecha de Creación
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {formatDateTime(claim.createdAt)}
                  </p>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <SafeIcon icon={FiUser} className="w-5 h-5 mr-2 text-fortex-primary" />
                  Información de Contacto
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Contacto
                  </label>
                  <input
                    type="text"
                    value={`${claim.firstName || ''} ${claim.lastName || ''}`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <SafeIcon icon={FiMail} className="w-4 h-4 mr-1" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={claim.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <SafeIcon icon={FiPhone} className="w-4 h-4 mr-1" />
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.phone || claim.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                  <small className="text-xs text-gray-500 mt-1 block">
                    Ingresa tu número con código de país
                  </small>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Asegurado
                  </label>
                  <input
                    type="text"
                    value={formData.nombreAsegurado || claim.nombreAsegurado || ''}
                    onChange={(e) => handleInputChange('nombreAsegurado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email del Asegurado
                  </label>
                  <input
                    type="email"
                    value={formData.emailAsegurado || claim.emailAsegurado || ''}
                    onChange={(e) => handleInputChange('emailAsegurado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dígito Verificador
                  </label>
                  <input
                    type="text"
                    value={formData.digitoVerificador || claim.digitoVerificador || ''}
                    onChange={(e) => handleInputChange('digitoVerificador', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                </div>
              </form>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-6">
            <button
              type="button"
              onClick={() => navigate(`/documents/${claimId}`)}
              className="flex items-center space-x-2 px-6 py-3 border border-fortex-primary text-fortex-primary rounded-lg hover:bg-fortex-primary hover:text-white transition-colors"
            >
              <SafeIcon icon={FiUpload} className="w-4 h-4" />
              <span>Subir Documentos</span>
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors disabled:opacity-50"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </motion.div>
      </main>

      {/* Modal de confirmación para archivar */}
      <AnimatePresence>
        {showArchiveConfirm && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-lg shadow-xl w-full max-w-md p-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4">Confirmar archivo</h3>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro que deseas archivar este reclamo? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowArchiveConfirm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleArchiveClaim}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Archivando...' : 'Archivar reclamo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClaimForm;