import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { claimsService } from '../services/claimsService';
import supabase from '../lib/supabase';
import toast from 'react-hot-toast';

const { FiX, FiSave, FiUser, FiMail, FiPhone, FiFileText, FiTrash2, FiStar } = FiIcons;

const NewClaimModal = ({ isOpen, onClose, onClaimCreated }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedAsegurados, setSavedAsegurados] = useState([]);
  const [showSavedAsegurados, setShowSavedAsegurados] = useState(false);
  const [loadingSavedData, setLoadingSavedData] = useState(false);
  const [deletingAsegurado, setDeletingAsegurado] = useState(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

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
    tipoServicioReembolso: '',
    tipoServicioProgramacion: '',
    esCirugiaEspecializada: false,
    // Additional details
    descripcionSiniestro: '',
    fechaSiniestro: '',
    // Número de reclamo para complemento
    numeroReclamo: ''
  });

  useEffect(() => {
    // Update user data if it changes
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Cargar datos guardados cuando se abre el modal
  useEffect(() => {
    if (isOpen && user) {
      fetchSavedAsegurados();
    }
  }, [isOpen, user]);

  const fetchSavedAsegurados = async () => {
    if (!user) return;
    
    setLoadingSavedData(true);
    try {
      const { data, error } = await supabase
        .from('saved_asegurados')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      setSavedAsegurados(data || []);
    } catch (error) {
      console.error('Error al cargar asegurados guardados:', error);
    } finally {
      setLoadingSavedData(false);
    }
  };

  const handleSaveAsegurado = async () => {
    if (!user || !formData.nombreAsegurado) return;
    
    try {
      // Verificar si ya existe
      const existingIndex = savedAsegurados.findIndex(
        item => item.nombre_asegurado === formData.nombreAsegurado
      );
      
      // Si existe, actualizarlo
      if (existingIndex >= 0) {
        const { error } = await supabase
          .from('saved_asegurados')
          .update({
            relacion_asegurado: formData.relacionAsegurado,
            numero_poliza: formData.numeroPoliza,
            digito_verificador: formData.digitoVerificador,
            aseguradora: formData.aseguradora
          })
          .eq('id', savedAsegurados[existingIndex].id);
        
        if (error) throw error;
        toast.success('Información de asegurado actualizada');
      } 
      // Si no existe, crearlo
      else {
        const { error } = await supabase
          .from('saved_asegurados')
          .insert({
            user_id: user.id,
            nombre_asegurado: formData.nombreAsegurado,
            relacion_asegurado: formData.relacionAsegurado,
            numero_poliza: formData.numeroPoliza,
            digito_verificador: formData.digitoVerificador,
            aseguradora: formData.aseguradora
          });
        
        if (error) throw error;
        toast.success('Asegurado guardado para futuros reclamos');
      }
      
      fetchSavedAsegurados();
    } catch (error) {
      console.error('Error al guardar asegurado:', error);
      toast.error('No se pudo guardar la información');
    }
  };

  const handleDeleteAsegurado = async (id) => {
    if (confirmarBorrado) {
      try {
        const { error } = await supabase
          .from('saved_asegurados')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        toast.success('Asegurado eliminado correctamente');
        fetchSavedAsegurados();
        setConfirmarBorrado(false);
        setDeletingAsegurado(null);
      } catch (error) {
        console.error('Error al eliminar asegurado:', error);
        toast.error('No se pudo eliminar el registro');
      }
    } else {
      setDeletingAsegurado(id);
      setConfirmarBorrado(true);
    }
  };

  const handleLoadAsegurado = (asegurado) => {
    setFormData(prev => ({
      ...prev,
      nombreAsegurado: asegurado.nombre_asegurado,
      relacionAsegurado: asegurado.relacion_asegurado,
      numeroPoliza: asegurado.numero_poliza,
      digitoVerificador: asegurado.digito_verificador,
      aseguradora: asegurado.aseguradora
    }));
    setShowSavedAsegurados(false);
    toast.success('Información cargada');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updatedData = { ...prev, [field]: value };

      // Auto-fill nombreAsegurado when relationship is "titular"
      if (field === 'relacionAsegurado' && value === 'titular') {
        updatedData.nombreAsegurado = `${prev.firstName} ${prev.lastName}`.trim();
        updatedData.emailAsegurado = prev.email;
      }

      // Reset tipo de servicio when changing tipo de reclamo
      if (field === 'tipoReclamo') {
        updatedData.tipoServicioReembolso = '';
        updatedData.tipoServicioProgramacion = '';
        updatedData.esCirugiaEspecializada = false;
        // Reset tipoSiniestro if not reembolso
        if (value !== 'reembolso') {
          updatedData.tipoSiniestro = '';
        }
      }

      // Reset checkbox when changing tipo de servicio
      if (field === 'tipoServicioProgramacion') {
        updatedData.esCirugiaEspecializada = false;
      }

      return updatedData;
    });
  };

  // Validación de teléfono
  const validatePhone = (phone) => {
    // Formato esperado: +52 81 1234 5678 o variaciones similares
    const regex = /^\+\d{2}\s?\d{2}\s?\d{4}\s?\d{4}$/;
    return regex.test(phone);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar número de teléfono
    if (!validatePhone(formData.phone)) {
      toast.error('El número de WhatsApp debe tener el formato: +52 81 1234 5678');
      return;
    }

    setLoading(true);
    try {
      const newClaim = await claimsService.createClaim(formData);
      toast.success('¡Reclamo creado exitosamente!');
      
      // Guardar información del asegurado para futuros reclamos
      if (formData.nombreAsegurado) {
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
                    <SafeIcon
                      icon={FiMail}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    />
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
                    <SafeIcon
                      icon={FiPhone}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                    />
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      placeholder="+52 81 1234 5678"
                    />
                    <small className="text-xs text-gray-500 mt-1 block">
                      Formato: +52 81 1234 5678
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Insured Information */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <SafeIcon icon={FiFileText} className="w-5 h-5 mr-2 text-fortex-primary" />
                  Información del Asegurado
                </h3>
                <div className="flex space-x-2">
                  <button 
                    type="button"
                    onClick={() => setShowSavedAsegurados(!showSavedAsegurados)}
                    className="text-sm px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 flex items-center"
                  >
                    <SafeIcon icon={FiStar} className="w-4 h-4 mr-1" />
                    {showSavedAsegurados ? 'Ocultar guardados' : 'Asegurados guardados'}
                  </button>
                  {formData.nombreAsegurado && (
                    <button 
                      type="button"
                      onClick={handleSaveAsegurado}
                      className="text-sm px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100"
                    >
                      Guardar asegurado
                    </button>
                  )}
                </div>
              </div>

              {/* Lista de asegurados guardados */}
              {showSavedAsegurados && (
                <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-700 mb-2">Asegurados guardados</h4>
                  {loadingSavedData ? (
                    <p className="text-sm text-gray-500">Cargando...</p>
                  ) : savedAsegurados.length > 0 ? (
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {savedAsegurados.map((asegurado) => (
                        <div 
                          key={asegurado.id} 
                          className="flex justify-between items-center bg-white p-2 rounded border border-gray-200"
                        >
                          <div className="flex-1">
                            <button
                              type="button"
                              onClick={() => handleLoadAsegurado(asegurado)}
                              className="text-left text-fortex-primary hover:text-fortex-secondary font-medium"
                            >
                              {asegurado.nombre_asegurado}
                            </button>
                            <div className="text-xs text-gray-500">
                              {asegurado.aseguradora} - Póliza: {asegurado.numero_poliza}
                            </div>
                          </div>
                          <div>
                            {deletingAsegurado === asegurado.id && confirmarBorrado ? (
                              <div className="flex items-center space-x-2">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteAsegurado(asegurado.id)}
                                  className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded"
                                >
                                  Confirmar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingAsegurado(null);
                                    setConfirmarBorrado(false);
                                  }}
                                  className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleDeleteAsegurado(asegurado.id)}
                                className="text-red-500 hover:text-red-700 p-1"
                              >
                                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No hay asegurados guardados</p>
                  )}
                </div>
              )}

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
                    <option value="programacion">Programación</option>
                    <option value="maternidad">Maternidad</option>
                  </select>
                </div>

                {/* Tipo de Siniestro - Solo para Reembolso */}
                {formData.tipoReclamo === 'reembolso' && (
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
                      <option value="inicial">Inicial</option>
                      <option value="complemento">Complemento</option>
                    </select>
                  </div>
                )}

                {/* Número de Reclamo para Complemento */}
                {formData.tipoReclamo === 'reembolso' && formData.tipoSiniestro === 'complemento' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Número de Reclamo
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.numeroReclamo}
                      onChange={(e) => handleInputChange('numeroReclamo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      placeholder="Número Proporcionado por la Aseguradora"
                    />
                  </div>
                )}

                {/* Tipo de Servicio para Reembolso */}
                {formData.tipoReclamo === 'reembolso' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Servicio
                    </label>
                    <select
                      required
                      value={formData.tipoServicioReembolso}
                      onChange={(e) => handleInputChange('tipoServicioReembolso', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="rehabilitacion">Rehabilitación</option>
                      <option value="honorarios-medicos">Honorarios Médicos</option>
                      <option value="hospitales">Hospitales</option>
                      <option value="estudios-laboratorio">Estudios de Laboratorio e Imagenología</option>
                    </select>
                  </div>
                )}

                {/* Tipo de Servicio para Programación */}
                {formData.tipoReclamo === 'programacion' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Servicio
                    </label>
                    <select
                      required
                      value={formData.tipoServicioProgramacion}
                      onChange={(e) => handleInputChange('tipoServicioProgramacion', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      <option value="rehabilitacion">Rehabilitación</option>
                      <option value="medicamentos">Medicamentos</option>
                      <option value="cirugia">Cirugía</option>
                    </select>
                  </div>
                )}

                {/* Checkbox para Cirugía Especializada */}
                {formData.tipoReclamo === 'programacion' && formData.tipoServicioProgramacion === 'cirugia' && (
                  <div className="col-span-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.esCirugiaEspecializada}
                        onChange={(e) => handleInputChange('esCirugiaEspecializada', e.target.checked)}
                        className="rounded border-gray-300 text-fortex-primary focus:ring-fortex-primary"
                      />
                      <span className="text-sm text-gray-700">
                        Cirugía de Traumatología, Ortopedia o Neurología
                      </span>
                    </label>
                  </div>
                )}

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