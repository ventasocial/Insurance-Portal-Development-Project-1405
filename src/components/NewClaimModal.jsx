import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { claimsService } from '../services/claimsService';
import toast from 'react-hot-toast';

const { FiX, FiSave, FiUser, FiMail, FiPhone, FiClipboard, FiCalendar, FiTrash2, FiArrowRight } = FiIcons;

const NewClaimModal = ({ isOpen, onClose, onClaimCreated, initialData = null }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saveAseguradoData, setSaveAseguradoData] = useState(true);
  const [savedAsegurados, setSavedAsegurados] = useState([]);
  const [selectedAsegurado, setSelectedAsegurado] = useState(null);
  const [currentStep, setCurrentStep] = useState(1); // 1 = form, 2 = documents
  const [servicioOptions, setServicioOptions] = useState({ reembolso: [], programacion: [] });
  const [createdClaimId, setCreatedClaimId] = useState(null); // Store the created claim ID
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
    servicios: [],
    esCirugiaEspecializada: false,
    descripcionSiniestro: '',
    fechaSiniestro: '',
    numeroReclamo: ''
  });

  // Inicializar el formulario con datos iniciales si existen
  useEffect(() => {
    if (initialData) {
      setFormData({
        ...formData,
        ...initialData,
        servicios: initialData.servicios || []
      });
    }

    // Cargar los asegurados guardados
    const loadSavedAsegurados = async () => {
      try {
        // Cargar desde Supabase los asegurados del usuario actual
        const asegurados = await claimsService.getSavedAsegurados(user?.id);
        setSavedAsegurados(asegurados);
      } catch (error) {
        console.error('Error cargando asegurados:', error);
      }
    };

    loadSavedAsegurados();
  }, [initialData, user?.id]);

  useEffect(() => {
    // Configurar las opciones de servicio disponibles
    setServicioOptions({
      reembolso: [
        { id: 'hospitales', label: 'Hospitales' },
        { id: 'honorarios-medicos', label: 'Honorarios Médicos' },
        { id: 'estudios-laboratorio', label: 'Estudios de Laboratorio' },
        { id: 'medicamentos', label: 'Medicamentos' },
        { id: 'rehabilitacion', label: 'Rehabilitación' }
      ],
      programacion: [
        { id: 'cirugia', label: 'Cirugía' },
        { id: 'medicamentos', label: 'Medicamentos' },
        { id: 'rehabilitacion', label: 'Rehabilitación' }
      ]
    });
  }, []);

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

  const handleServiceToggle = (serviceId) => {
    setFormData(prev => {
      const currentServices = prev.servicios || [];
      if (currentServices.includes(serviceId)) {
        return {
          ...prev,
          servicios: currentServices.filter(id => id !== serviceId)
        };
      } else {
        return {
          ...prev,
          servicios: [...currentServices, serviceId]
        };
      }
    });
  };

  const handleAseguradoSelect = (asegurado) => {
    if (asegurado) {
      setFormData(prev => ({
        ...prev,
        nombreAsegurado: asegurado.nombre,
        emailAsegurado: asegurado.email,
        numeroPoliza: asegurado.poliza,
        digitoVerificador: asegurado.digitoVerificador,
        aseguradora: asegurado.aseguradora
      }));
      setSelectedAsegurado(asegurado);
    } else {
      setSelectedAsegurado(null);
    }
  };

  const handleDeleteAsegurado = async (aseguradoId) => {
    try {
      await claimsService.deleteAsegurado(aseguradoId);
      setSavedAsegurados(prev => prev.filter(a => a.id !== aseguradoId));
      if (selectedAsegurado && selectedAsegurado.id === aseguradoId) {
        setSelectedAsegurado(null);
      }
      toast.success('Asegurado eliminado correctamente');
    } catch (error) {
      toast.error('Error al eliminar asegurado');
      console.error('Delete asegurado error:', error);
    }
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
      const newAsegurado = {
        user_id: user.id,
        nombre: formData.nombreAsegurado,
        email: formData.emailAsegurado,
        poliza: formData.numeroPoliza,
        digitoVerificador: formData.digitoVerificador,
        aseguradora: formData.aseguradora
      };

      // Guardar en Supabase y obtener el ID generado
      const savedAsegurado = await claimsService.saveAsegurado(newAsegurado);
      
      if (savedAsegurado) {
        setSavedAsegurados(prev => [...prev, savedAsegurado]);
      }
      return savedAsegurado;
    } catch (error) {
      console.error('Error guardando asegurado:', error);
      throw error;
    }
  };

  const nextStep = async (e) => {
    e.preventDefault();
    
    // Validaciones para el primer paso
    if (!validatePhone(formData.phone)) {
      toast.error('El número de WhatsApp debe tener el formato: +52 81 1234 5678');
      return;
    }
    
    if (!validateEmail(formData.email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    if (formData.emailAsegurado && !validateEmail(formData.emailAsegurado)) {
      toast.error('Por favor ingresa un correo electrónico válido para el asegurado');
      return;
    }
    
    if (formData.tipoReclamo && formData.servicios.length === 0) {
      toast.error('Por favor selecciona al menos un tipo de servicio');
      return;
    }

    // Crear el reclamo en la base de datos
    setLoading(true);
    try {
      // Convertir los servicios seleccionados a formato adecuado para el backend
      const submissionData = {
        ...formData,
        contactId: user?.id,
        tipoServicioReembolso: formData.tipoReclamo === 'reembolso' ? formData.servicios.join(',') : '',
        tipoServicioProgramacion: formData.tipoReclamo === 'programacion' ? formData.servicios.join(',') : '',
      };

      const newClaim = await claimsService.createClaim(submissionData);
      setCreatedClaimId(newClaim.id); // Store the claim ID
      
      // Guardar información del asegurado para futuros reclamos si está activado el checkbox
      if (saveAseguradoData && formData.nombreAsegurado) {
        await handleSaveAsegurado();
      }
      
      toast.success('¡Reclamo creado exitosamente!');
      onClaimCreated(newClaim);
      
      // Avanzar al paso de documentos
      setCurrentStep(2);
    } catch (error) {
      toast.error('Error al crear el reclamo');
      console.error('Create claim error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    onClose();
    
    // Si es un complemento, redirigir al usuario a la página de documentos
    if (formData.tipoSiniestro === 'complemento' && createdClaimId) {
      setTimeout(() => {
        window.location.href = `#/claim/${createdClaimId}`;
      }, 500);
    }

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
      servicios: [],
      esCirugiaEspecializada: false,
      descripcionSiniestro: '',
      fechaSiniestro: '',
      numeroReclamo: ''
    });
    setSelectedAsegurado(null);
    setCurrentStep(1);
    setCreatedClaimId(null);
  };

  if (!isOpen) return null;

  const getRequiredDocuments = () => {
    let documents = {
      formasAseguradora: [],
      informacionPersonal: [],
      documentosSiniestro: []
    };

    if (formData.tipoReclamo === 'reembolso') {
      // Documentos base para reembolso
      documents.formasAseguradora = [
        { key: 'avisoAccidente', name: 'Aviso de Accidente o Enfermedad', required: true },
        { key: 'formatoReembolso', name: 'Formato de Reembolso', required: true },
        { key: 'formatoBancario', name: 'Formato Único de Información Bancaria', required: true },
        { key: 'informeMedico', name: 'Informe Médico', required: true },
      ];
      documents.informacionPersonal = [
        { key: 'identificacionTitular', name: 'Identificación Oficial del Titular de la Cuenta Bancaria', required: true },
        { key: 'identificacionAsegurado', name: 'Identificación Oficial del Asegurado Afectado o Tutor', required: true },
        { key: 'caratulaEstadoCuenta', name: 'Carátula del Estado de Cuenta', required: true },
      ];
      documents.documentosSiniestro = [
        { key: 'facturasReembolso', name: 'Facturas para Reembolso', required: true },
        { key: 'recetasCorrespondientes', name: 'Recetas correspondientes a las facturas', required: true },
        { key: 'estudiosCorrespondientes', name: 'Estudios correspondientes a las facturas', required: true }
      ];

      // Agregar documentos específicos según el tipo de servicio
      const servicios = formData.servicios || [];
      if (servicios.includes('hospitales')) {
        documents.documentosSiniestro.push({key: 'facturaHospitales', name: 'Factura de Hospitales', required: true});
      }
      // Otros servicios...
    } else if (formData.tipoReclamo === 'programacion') {
      // Documentos base para programación
      documents.formasAseguradora = [
        { key: 'avisoAccidente', name: 'Aviso de Accidente o Enfermedad', required: true },
        { key: 'informeMedico', name: 'Informe Médico', required: true },
      ];
      // Otros documentos para programación...
    }
    
    return documents;
  };

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
              {initialData?.tipoSiniestro === 'complemento' ? 'Nuevo Reclamo Complemento' : 'Nuevo Reclamo'}
              {currentStep === 2 && " - Documentos Requeridos"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          {/* Form - Step 1 */}
          {currentStep === 1 && (
            <form onSubmit={nextStep} className="p-6 space-y-6">
              {/* Asegurados guardados */}
              {savedAsegurados.length > 0 && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-700 mb-3">Asegurados Guardados</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {savedAsegurados.map((asegurado) => (
                      <div
                        key={asegurado.id}
                        className={`flex justify-between items-center p-3 rounded-md cursor-pointer border ${
                          selectedAsegurado?.id === asegurado.id ? 'bg-blue-50 border-blue-300' : 'border-gray-300'
                        }`}
                        onClick={() => handleAseguradoSelect(asegurado)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-sm">{asegurado.nombre}</p>
                          <p className="text-xs text-gray-500">Póliza: {asegurado.poliza} - {asegurado.aseguradora}</p>
                        </div>
                        <button
                          type="button"
                          className="text-red-500 hover:text-red-700 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAsegurado(asegurado.id);
                          }}
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                    onChange={(e) => {
                      handleInputChange('tipoReclamo', e.target.value);
                      handleInputChange('servicios', []);
                    }}
                    required
                    disabled={initialData?.tipoSiniestro === 'complemento'}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                      initialData?.tipoSiniestro === 'complemento'
                        ? 'bg-gray-50 text-gray-600'
                        : 'focus:ring-2 focus:ring-fortex-primary focus:border-transparent'
                    }`}
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
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Siniestro
                      </label>
                      <select
                        value={formData.tipoSiniestro}
                        onChange={(e) => handleInputChange('tipoSiniestro', e.target.value)}
                        required
                        disabled={initialData?.tipoSiniestro === 'complemento'}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${
                          initialData?.tipoSiniestro === 'complemento'
                            ? 'bg-gray-50 text-gray-600'
                            : 'focus:ring-2 focus:ring-fortex-primary focus:border-transparent'
                        }`}
                      >
                        <option value="">Seleccionar...</option>
                        <option value="inicial">Inicial</option>
                        <option value="complemento">Complemento</option>
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

                  {/* Tipo de Servicio con checkboxes para Reembolso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo de Servicio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {servicioOptions.reembolso.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`service-${option.id}`}
                            checked={formData.servicios?.includes(option.id)}
                            onChange={() => handleServiceToggle(option.id)}
                            className="w-4 h-4 text-fortex-primary focus:ring-fortex-primary border-gray-300 rounded"
                          />
                          <label htmlFor={`service-${option.id}`} className="ml-2 block text-sm text-gray-900">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {formData.tipoReclamo === 'programacion' && (
                <>
                  {/* Tipo de Servicio con checkboxes para Programación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Tipo de Servicio
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {servicioOptions.programacion.map((option) => (
                        <div key={option.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`service-${option.id}`}
                            checked={formData.servicios?.includes(option.id)}
                            onChange={() => handleServiceToggle(option.id)}
                            className="w-4 h-4 text-fortex-primary focus:ring-fortex-primary border-gray-300 rounded"
                          />
                          <label htmlFor={`service-${option.id}`} className="ml-2 block text-sm text-gray-900">
                            {option.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formData.servicios?.includes('cirugia') && (
                    <div className="flex items-center mt-3">
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
                </>
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
                  <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
                  <span>{loading ? 'Creando...' : 'Continuar'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Step 2 - Documents Required */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Documentos requeridos para tu reclamo</h3>
                <p className="text-sm text-blue-700">
                  Para continuar con el proceso, necesitarás subir los siguientes documentos. 
                  Puedes hacerlo ahora o más tarde desde la página de detalles del reclamo.
                </p>
              </div>

              {/* Documentos requeridos según el tipo de reclamo */}
              <div className="space-y-6">
                {Object.entries(getRequiredDocuments()).map(([category, docs]) => {
                  if (docs.length === 0) return null;
                  
                  return (
                    <div key={category} className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        {category === 'formasAseguradora' && 'Formas de la Aseguradora'}
                        {category === 'informacionPersonal' && 'Información Personal'}
                        {category === 'documentosSiniestro' && 'Documentos del Siniestro'}
                      </h4>
                      <ul className="list-disc pl-5 space-y-2">
                        {docs.map(doc => (
                          <li key={doc.key} className="text-sm text-gray-700">
                            {doc.name}
                            {doc.required && <span className="text-red-500 ml-1">*</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex items-center space-x-2 px-4 py-2 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
                >
                  <SafeIcon icon={FiSave} className="w-4 h-4" />
                  <span>Finalizar</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewClaimModal;