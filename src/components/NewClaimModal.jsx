import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { claimsService } from '../services/claimsService';
import toast from 'react-hot-toast';

const { FiX, FiSave, FiUser, FiMail, FiPhone, FiClipboard, FiCalendar } = FiIcons;

const NewClaimModal = ({ isOpen, onClose, onClaimCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveAseguradoData, setSaveAseguradoData] = useState(true);
  const [formData, setFormData] = useState({
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
    tipoServicioReembolso: '',
    tipoServicioProgramacion: '',
    esCirugiaEspecializada: false,
    descripcionSiniestro: '',
    fechaSiniestro: '',
    numeroReclamo: ''
  });

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

  // Manejar guardado de asegurado
  const handleSaveAsegurado = async () => {
    try {
      // En producción, esto guardaría en Supabase o en GHL
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Asegurado guardado:', {
        nombre: formData.nombreAsegurado,
        email: formData.emailAsegurado,
        poliza: formData.numeroPoliza,
        digitoVerificador: formData.digitoVerificador,
        aseguradora: formData.aseguradora
      });
    } catch (error) {
      console.error('Error guardando asegurado:', error);
      throw error;
    }
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
      const newClaim = await claimsService.createClaim(formData);
      toast.success('¡Reclamo creado exitosamente!');

      // Guardar información del asegurado para futuros reclamos si está activado el checkbox
      if (saveAseguradoData && formData.nombreAsegurado) {
        await handleSaveAsegurado();
      }

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
        tipoServicioReembolso: '',
        tipoServicioProgramacion: '',
        esCirugiaEspecializada: false,
        descripcionSiniestro: '',
        fechaSiniestro: '',
        numeroReclamo: ''
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
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <SafeIcon icon={FiClipboard} className="w-5 h-5 mr-2 text-fortex-primary" />
              Nuevo Reclamo
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Contacto
                </label>
                <input
                  type="text"
                  value={`${formData.firstName} ${formData.lastName}`}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <SafeIcon icon={FiMail} className="w-4 h-4 mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <SafeIcon icon={FiPhone} className="w-4 h-4 mr-1" />
                  WhatsApp
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  placeholder="+52 81 1234 5678"
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
                  value={formData.relacionAsegurado}
                  onChange={(e) => handleInputChange('relacionAsegurado', e.target.value)}
                  required
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <SafeIcon icon={FiUser} className="w-4 h-4 mr-1" />
                  Nombre Completo del Asegurado
                </label>
                <input
                  type="text"
                  value={formData.nombreAsegurado}
                  onChange={(e) => handleInputChange('nombreAsegurado', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  placeholder="Nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <SafeIcon icon={FiMail} className="w-4 h-4 mr-1" />
                  Email del Asegurado
                </label>
                <input
                  type="email"
                  value={formData.emailAsegurado}
                  onChange={(e) => handleInputChange('emailAsegurado', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  placeholder="asegurado@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Póliza
                </label>
                <input
                  type="text"
                  value={formData.numeroPoliza}
                  onChange={(e) => handleInputChange('numeroPoliza', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  placeholder="Ejemplo: 12345678"
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
                  placeholder="Ejemplo: 7"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aseguradora
                </label>
                <select
                  value={formData.aseguradora}
                  onChange={(e) => handleInputChange('aseguradora', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="GNP">GNP</option>
                  <option value="AXA">AXA</option>
                  <option value="Qualitas">Qualitas</option>
                  <option value="Banorte">Banorte</option>
                  <option value="Mapfre">Mapfre</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reclamo
                </label>
                <select
                  value={formData.tipoReclamo}
                  onChange={(e) => handleInputChange('tipoReclamo', e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="reembolso">Reembolso</option>
                  <option value="programacion">Programación</option>
                  <option value="maternidad">Maternidad</option>
                </select>
              </div>
            </div>

            {/* Campos condicionales según el tipo de reclamo */}
            {formData.tipoReclamo === 'reembolso' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Siniestro
                  </label>
                  <select
                    value={formData.tipoSiniestro}
                    onChange={(e) => handleInputChange('tipoSiniestro', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="inicial">Inicial</option>
                    <option value="complemento">Complemento</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Servicio
                  </label>
                  <select
                    value={formData.tipoServicioReembolso}
                    onChange={(e) => handleInputChange('tipoServicioReembolso', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="hospitales">Hospitales</option>
                    <option value="honorarios-medicos">Honorarios Médicos</option>
                    <option value="estudios-laboratorio">Estudios de Laboratorio</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="rehabilitacion">Rehabilitación</option>
                  </select>
                </div>
                {formData.tipoSiniestro === 'complemento' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Reclamo
                    </label>
                    <input
                      type="text"
                      value={formData.numeroReclamo}
                      onChange={(e) => handleInputChange('numeroReclamo', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      placeholder="Número proporcionado por la aseguradora"
                    />
                  </div>
                )}
              </div>
            )}

            {formData.tipoReclamo === 'programacion' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Servicio
                  </label>
                  <select
                    value={formData.tipoServicioProgramacion}
                    onChange={(e) => handleInputChange('tipoServicioProgramacion', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="cirugia">Cirugía</option>
                    <option value="medicamentos">Medicamentos</option>
                    <option value="rehabilitacion">Rehabilitación</option>
                  </select>
                </div>
                {formData.tipoServicioProgramacion === 'cirugia' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="cirugia-especializada"
                      checked={formData.esCirugiaEspecializada}
                      onChange={(e) => handleInputChange('esCirugiaEspecializada', e.target.checked)}
                      className="w-4 h-4 text-fortex-primary focus:ring-fortex-primary border-gray-300 rounded"
                    />
                    <label htmlFor="cirugia-especializada" className="ml-2 block text-sm text-gray-900">
                      Es cirugía de Traumatología, Ortopedia o Neurocirugía
                    </label>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-1" />
                  Fecha del Siniestro
                </label>
                <input
                  type="date"
                  value={formData.fechaSiniestro}
                  onChange={(e) => handleInputChange('fechaSiniestro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del Siniestro
                </label>
                <textarea
                  value={formData.descripcionSiniestro}
                  onChange={(e) => handleInputChange('descripcionSiniestro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                  rows={3}
                  placeholder="Breve descripción del siniestro"
                ></textarea>
              </div>
            </div>

            {/* Checkbox para guardar información del asegurado */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="save-asegurado"
                checked={saveAseguradoData}
                onChange={(e) => setSaveAseguradoData(e.target.checked)}
                className="w-4 h-4 text-fortex-primary focus:ring-fortex-primary border-gray-300 rounded"
              />
              <label htmlFor="save-asegurado" className="ml-2 block text-sm text-gray-900">
                Guardar datos del Asegurado Afectado
              </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors disabled:opacity-50"
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