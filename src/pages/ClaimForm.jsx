import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { useClaims } from '../contexts/ClaimsContext';
import { claimsService } from '../services/claimsService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiSave, FiArrowLeft, FiUpload } = FiIcons;

const ClaimForm = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { claims } = useClaims();
  const [claim, setClaim] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentClaim = claims.find(c => c.id === claimId);
    if (currentClaim) {
      setClaim(currentClaim);
      setFormData(currentClaim);
    }
  }, [claimId, claims]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <main className="w-full max-w-4xl mx-auto px-[5%] py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-fortex-primary hover:text-fortex-secondary mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Volver al dashboard</span>
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Reclamo-{claimNumber}
            </h2>
            <p className="text-gray-600">
              Completa la información de tu reclamo
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Información del Reclamo
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
              </div>

              {/* Insured Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo del Asegurado
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dígito Verificador
                  </label>
                  <input
                    type="text"
                    value={formData.digitoVerificador || claim.digitoVerificador || ''}
                    onChange={(e) => handleInputChange('digitoVerificador', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Claim Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Reclamo
                  </label>
                  <select
                    value={formData.tipoReclamo || claim.tipoReclamo || ''}
                    onChange={(e) => handleInputChange('tipoReclamo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar...</option>
                    <option value="reembolso">Reembolso</option>
                    <option value="programacion">Programación</option>
                    <option value="maternidad">Maternidad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Siniestro
                  </label>
                  <select
                    value={formData.tipoSiniestro || claim.tipoSiniestro || ''}
                    onChange={(e) => handleInputChange('tipoSiniestro', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    required={formData.tipoReclamo === 'reembolso'}
                    disabled={formData.tipoReclamo !== 'reembolso'}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="inicial">Inicial</option>
                    <option value="complemento">Complemento</option>
                  </select>
                </div>

                {/* Número de Reclamo de la Aseguradora (solo para reembolso/inicial) - Solo visible */}
                {formData.tipoReclamo === 'reembolso' && formData.tipoSiniestro === 'inicial' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
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
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors disabled:opacity-50"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default ClaimForm;