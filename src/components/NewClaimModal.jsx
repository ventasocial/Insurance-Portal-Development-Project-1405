import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { claimsService } from '../services/claimsService';
import toast from 'react-hot-toast';

const { FiX, FiSave, FiUser, FiMail, FiPhone, FiFileText } = FiIcons;

const NewClaimModal = ({ isOpen, onClose, onClaimCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Contact info (pre-filled from user)
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    // Relationship and insured info
    relacionAsegurado: '',
    nombreAsegurado: '',
    emailAsegurado: '',
    // Policy info
    numeroPoliza: '',
    digitoVerificador: '',
    aseguradora: '',
    // Claim info
    tipoSiniestro: '',
    tipoReclamo: '',
    // Additional details
    descripcionSiniestro: '',
    fechaSiniestro: ''
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newClaim = await claimsService.createClaim(formData);
      toast.success('¡Reclamo creado exitosamente!');
      onClaimCreated(newClaim);
      onClose();
      // Reset form
      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        relacionAsegurado: '',
        nombreAsegurado: '',
        emailAsegurado: '',
        numeroPoliza: '',
        digitoVerificador: '',
        aseguradora: '',
        tipoSiniestro: '',
        tipoReclamo: '',
        descripcionSiniestro: '',
        fechaSiniestro: ''
      });
    } catch (error) {
      toast.error('Error al crear el reclamo');
      console.error('Create claim error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">
              Crear Nuevo Reclamo
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiUser} className="w-5 h-5 mr-2 text-fortex-primary" />
                Información de Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apellidos
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    placeholder="Tus apellidos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp
                  </label>
                  <div className="relative">
                    <SafeIcon icon={FiPhone} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      placeholder="+52 55 1234 5678"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Insured Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2 text-fortex-primary" />
                Información del Asegurado
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relación con el Asegurado
                  </label>
                  <select
                    required
                    value={formData.relacionAsegurado}
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo del Asegurado
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombreAsegurado}
                    onChange={(e) => handleInputChange('nombreAsegurado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    placeholder="Nombre completo del asegurado"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email del Asegurado
                  </label>
                  <input
                    type="email"
                    value={formData.emailAsegurado}
                    onChange={(e) => handleInputChange('emailAsegurado', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    placeholder="email@asegurado.com"
                  />
                </div>
              </div>
            </div>

            {/* Policy Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información de la Póliza
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Póliza
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.numeroPoliza}
                    onChange={(e) => handleInputChange('numeroPoliza', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    placeholder="POL-123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dígito Verificador
                  </label>
                  <input
                    type="text"
                    value={formData.digitoVerificador}
                    onChange={(e) => handleInputChange('digitoVerificador', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    placeholder="7"
                    maxLength="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aseguradora
                  </label>
                  <select
                    required
                    value={formData.aseguradora}
                    onChange={(e) => handleInputChange('aseguradora', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="GNP">GNP</option>
                    <option value="AXA">AXA</option>
                    <option value="Qualitas">Qualitas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Claim Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Reclamo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Siniestro
                  </label>
                  <select
                    required
                    value={formData.tipoSiniestro}
                    onChange={(e) => handleInputChange('tipoSiniestro', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="accidente">Accidente</option>
                    <option value="enfermedad">Enfermedad</option>
                    <option value="maternidad">Maternidad</option>
                    <option value="emergencia">Emergencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Reclamo
                  </label>
                  <select
                    required
                    value={formData.tipoReclamo}
                    onChange={(e) => handleInputChange('tipoReclamo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="reembolso">Reembolso</option>
                    <option value="pago-directo">Pago Directo</option>
                    <option value="carta-garantia">Carta Garantía</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Siniestro
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.fechaSiniestro}
                    onChange={(e) => handleInputChange('fechaSiniestro', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Siniestro
                </label>
                <textarea
                  rows={3}
                  value={formData.descripcionSiniestro}
                  onChange={(e) => handleInputChange('descripcionSiniestro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  placeholder="Describe brevemente lo ocurrido..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors disabled:opacity-50"
              >
                <SafeIcon icon={FiSave} className="w-4 h-4" />
                <span>{loading ? 'Creando...' : 'Crear Reclamo'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewClaimModal;