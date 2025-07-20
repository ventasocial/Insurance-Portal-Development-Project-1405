import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useAuth } from '../contexts/AuthContext';
import { claimsService } from '../services/claimsService';
import toast from 'react-hot-toast';

const { FiX, FiChevronRight, FiChevronLeft, FiSave, FiUser, FiMail, FiPhone, FiFileText } = FiIcons;

const NewClaimModal = ({ isOpen, onClose, onClaimCreated, initialData = null }) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [createdClaimId, setCreatedClaimId] = useState(null);
  const [saveAseguradoData, setSaveAseguradoData] = useState(false);
  
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

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData
      }));
    }
  }, [initialData]);

  const validatePhone = (phone) => {
    // Formato esperado: +52 81 1234 5678 o variaciones similares
    const regex = /^\+\d{2}\s?\d{2}\s?\d{4}\s?\d{4}$/;
    return regex.test(phone);
  };

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNextStep = async (e) => {
    e.preventDefault();

    // Validaciones básicas
    if (!formData.nombreAsegurado) {
      toast.error('Por favor ingresa el nombre del asegurado');
      return;
    }
    if (!formData.numeroPoliza) {
      toast.error('Por favor ingresa el número de póliza');
      return;
    }
    if (!formData.aseguradora) {
      toast.error('Por favor selecciona la aseguradora');
      return;
    }
    if (!formData.relacionAsegurado) {
      toast.error('Por favor selecciona la relación con el asegurado');
      return;
    }
    if (!formData.tipoReclamo) {
      toast.error('Por favor selecciona el tipo de reclamo');
      return;
    }

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
        contactId: user?.id || 'demo-user',
        servicios: formData.servicios || [],
        tipoServicioReembolso: formData.tipoReclamo === 'reembolso' ? formData.servicios.join(',') : '',
        tipoServicioProgramacion: formData.tipoReclamo === 'programacion' ? formData.servicios.join(',') : ''
      };

      const newClaim = await claimsService.createClaim(submissionData);
      setCreatedClaimId(newClaim.id);

      // Guardar información del asegurado para futuros reclamos si está activado el checkbox
      if (saveAseguradoData && formData.nombreAsegurado) {
        await handleSaveAsegurado();
      }

      toast.success('¡Reclamo creado exitosamente!');
      if (onClaimCreated) {
        onClaimCreated(newClaim);
      }

      // Avanzar al paso de documentos
      setCurrentStep(2);
    } catch (error) {
      toast.error('Error al crear el reclamo: ' + (error.message || 'Inténtalo de nuevo'));
      console.error('Create claim error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsegurado = async () => {
    try {
      await claimsService.saveAsegurado({
        user_id: user?.id,
        nombre: formData.nombreAsegurado,
        email: formData.emailAsegurado,
        poliza: formData.numeroPoliza,
        digito_verificador: formData.digitoVerificador,
        aseguradora: formData.aseguradora,
        relacion_asegurado: formData.relacionAsegurado
      });
      toast.success('Información del asegurado guardada');
    } catch (error) {
      console.error('Error saving asegurado:', error);
      // No mostrar error al usuario ya que esto es opcional
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
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
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <SafeIcon icon={FiFileText} className="w-6 h-6 mr-2 text-fortex-primary" />
              {currentStep === 1 ? 'Nuevo Reclamo' : 'Documentos Requeridos'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <SafeIcon icon={FiX} className="w-5 h-5" />
            </button>
          </div>

          {/* Form Steps */}
          <div className="p-6">
            {currentStep === 1 ? (
              <form onSubmit={handleNextStep} className="space-y-6">
                {/* Contact Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
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
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Apellidos
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                        required
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                        required
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                        placeholder="+52 81 1234 5678"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Información del Seguro
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Relación con el Asegurado
                      </label>
                      <select
                        value={formData.relacionAsegurado}
                        onChange={(e) => handleInputChange('relacionAsegurado', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                        required
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
                        Nombre del Asegurado
                      </label>
                      <input
                        type="text"
                        value={formData.nombreAsegurado}
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
                        value={formData.emailAsegurado}
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
                        value={formData.numeroPoliza}
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
                        value={formData.digitoVerificador}
                        onChange={(e) => handleInputChange('digitoVerificador', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aseguradora
                      </label>
                      <select
                        value={formData.aseguradora}
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
                  </div>
                </div>

                {/* Claim Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Información del Reclamo
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Reclamo
                      </label>
                      <select
                        value={formData.tipoReclamo}
                        onChange={(e) => {
                          handleInputChange('tipoReclamo', e.target.value);
                          handleInputChange('servicios', []);
                          handleInputChange('tipoSiniestro', '');
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                        required
                      >
                        <option value="">Seleccionar...</option>
                        <option value="reembolso">Reembolso</option>
                        <option value="programacion">Programación</option>
                        <option value="maternidad">Maternidad</option>
                      </select>
                    </div>

                    {formData.tipoReclamo === 'reembolso' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Siniestro
                        </label>
                        <select
                          value={formData.tipoSiniestro}
                          onChange={(e) => handleInputChange('tipoSiniestro', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                          required
                        >
                          <option value="">Seleccionar...</option>
                          <option value="inicial">Inicial</option>
                          <option value="complemento">Complemento</option>
                        </select>
                      </div>
                    )}

                    {formData.tipoSiniestro === 'complemento' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Reclamo
                        </label>
                        <input
                          type="text"
                          value={formData.numeroReclamo}
                          onChange={(e) => handleInputChange('numeroReclamo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                          placeholder="Número proporcionado por la aseguradora"
                          required
                        />
                      </div>
                    )}
                  </div>

                  {/* Servicios */}
                  {formData.tipoReclamo && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Servicio
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {formData.tipoReclamo === 'reembolso' && (
                          <>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.servicios.includes('hospitales')}
                                onChange={(e) => {
                                  const servicios = e.target.checked
                                    ? [...formData.servicios, 'hospitales']
                                    : formData.servicios.filter(s => s !== 'hospitales');
                                  handleInputChange('servicios', servicios);
                                }}
                                className="rounded text-fortex-primary focus:ring-fortex-primary"
                              />
                              <span className="text-sm text-gray-700">Hospitales</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.servicios.includes('honorarios-medicos')}
                                onChange={(e) => {
                                  const servicios = e.target.checked
                                    ? [...formData.servicios, 'honorarios-medicos']
                                    : formData.servicios.filter(s => s !== 'honorarios-medicos');
                                  handleInputChange('servicios', servicios);
                                }}
                                className="rounded text-fortex-primary focus:ring-fortex-primary"
                              />
                              <span className="text-sm text-gray-700">Honorarios Médicos</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.servicios.includes('estudios-laboratorio')}
                                onChange={(e) => {
                                  const servicios = e.target.checked
                                    ? [...formData.servicios, 'estudios-laboratorio']
                                    : formData.servicios.filter(s => s !== 'estudios-laboratorio');
                                  handleInputChange('servicios', servicios);
                                }}
                                className="rounded text-fortex-primary focus:ring-fortex-primary"
                              />
                              <span className="text-sm text-gray-700">Estudios y Laboratorio</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.servicios.includes('medicamentos')}
                                onChange={(e) => {
                                  const servicios = e.target.checked
                                    ? [...formData.servicios, 'medicamentos']
                                    : formData.servicios.filter(s => s !== 'medicamentos');
                                  handleInputChange('servicios', servicios);
                                }}
                                className="rounded text-fortex-primary focus:ring-fortex-primary"
                              />
                              <span className="text-sm text-gray-700">Medicamentos</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.servicios.includes('rehabilitacion')}
                                onChange={(e) => {
                                  const servicios = e.target.checked
                                    ? [...formData.servicios, 'rehabilitacion']
                                    : formData.servicios.filter(s => s !== 'rehabilitacion');
                                  handleInputChange('servicios', servicios);
                                }}
                                className="rounded text-fortex-primary focus:ring-fortex-primary"
                              />
                              <span className="text-sm text-gray-700">Rehabilitación</span>
                            </label>
                          </>
                        )}
                        {formData.tipoReclamo === 'programacion' && (
                          <>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.servicios.includes('cirugia')}
                                onChange={(e) => {
                                  const servicios = e.target.checked
                                    ? [...formData.servicios, 'cirugia']
                                    : formData.servicios.filter(s => s !== 'cirugia');
                                  handleInputChange('servicios', servicios);
                                }}
                                className="rounded text-fortex-primary focus:ring-fortex-primary"
                              />
                              <span className="text-sm text-gray-700">Cirugía</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.servicios.includes('medicamentos')}
                                onChange={(e) => {
                                  const servicios = e.target.checked
                                    ? [...formData.servicios, 'medicamentos']
                                    : formData.servicios.filter(s => s !== 'medicamentos');
                                  handleInputChange('servicios', servicios);
                                }}
                                className="rounded text-fortex-primary focus:ring-fortex-primary"
                              />
                              <span className="text-sm text-gray-700">Medicamentos</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={formData.servicios.includes('rehabilitacion')}
                                onChange={(e) => {
                                  const servicios = e.target.checked
                                    ? [...formData.servicios, 'rehabilitacion']
                                    : formData.servicios.filter(s => s !== 'rehabilitacion');
                                  handleInputChange('servicios', servicios);
                                }}
                                className="rounded text-fortex-primary focus:ring-fortex-primary"
                              />
                              <span className="text-sm text-gray-700">Rehabilitación</span>
                            </label>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Cirugía Especializada */}
                  {formData.tipoReclamo === 'programacion' && formData.servicios.includes('cirugia') && (
                    <div className="mt-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.esCirugiaEspecializada}
                          onChange={(e) => handleInputChange('esCirugiaEspecializada', e.target.checked)}
                          className="rounded text-fortex-primary focus:ring-fortex-primary"
                        />
                        <span className="text-sm text-gray-700">
                          Es cirugía de Traumatología, Ortopedia o Neurocirugía
                        </span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Save Asegurado Data */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={saveAseguradoData}
                    onChange={(e) => setSaveAseguradoData(e.target.checked)}
                    className="rounded text-fortex-primary focus:ring-fortex-primary"
                  />
                  <label className="text-sm text-gray-700">
                    Guardar información del asegurado para futuros reclamos
                  </label>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleClose}
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
            ) : (
              <div className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ¡Reclamo creado exitosamente!
                </h3>
                <p className="text-gray-600 mb-6">
                  Tu reclamo ha sido registrado. Ahora puedes subir los documentos requeridos.
                </p>
                <button
                  onClick={() => {
                    handleClose();
                    window.location.href = `#/documents/${createdClaimId}`;
                  }}
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors"
                >
                  <SafeIcon icon={FiChevronRight} className="w-4 h-4" />
                  <span>Continuar con los Documentos</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NewClaimModal;