import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import DocumentUploadZone from '../components/DocumentUploadZone';
import { useClaims } from '../contexts/ClaimsContext';
import { claimsService } from '../services/claimsService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiArrowLeft, FiFile, FiCheck, FiX, FiClock, FiDownload, FiArchive, FiSend } = FiIcons;

const DocumentUpload = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { claims } = useClaims();
  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(false);
  const [uploadingDocType, setUploadingDocType] = useState(null);

  useEffect(() => {
    const currentClaim = claims.find(c => c.id === claimId);
    if (currentClaim) {
      setClaim(currentClaim);
      loadDocuments(currentClaim);
    }
  }, [claimId, claims]);

  // Función para capitalizar la primera letra
  const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  const loadDocuments = async (claimData) => {
    try {
      const docs = await claimsService.getClaimDocuments(claimData.id);
      console.log("Loaded documents:", docs);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const getRequiredDocuments = (tipoReclamo, tipoSiniestro, tipoServicioReembolso, tipoServicioProgramacion, esCirugiaEspecializada) => {
    let documents = {
      formasAseguradora: [],
      informacionPersonal: [],
      documentosSiniestro: []
    };

    if (tipoReclamo === 'reembolso') {
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
      const servicios = tipoServicioReembolso ? tipoServicioReembolso.split(',') : [];
      if (servicios.includes('hospitales')) {
        documents.documentosSiniestro.push(
          { key: 'facturaHospitales', name: 'Factura de Hospitales', required: true }
        );
      }
      if (servicios.includes('honorarios-medicos')) {
        documents.documentosSiniestro.push(
          { key: 'facturaHonorariosMedicos', name: 'Factura de Honorarios Médicos', required: true }
        );
      }
      if (servicios.includes('estudios-laboratorio')) {
        documents.documentosSiniestro.push(
          { key: 'facturaEstudiosLab', name: 'Factura de Estudios de Laboratorio e Imagenología', required: true },
          { key: 'estudiosLaboratorio', name: 'Estudios de Laboratorio e Imagenología', required: true }
        );
      }
      if (servicios.includes('medicamentos')) {
        documents.documentosSiniestro.push(
          { key: 'facturaMedicamentos', name: 'Factura de Medicamentos', required: true },
          { key: 'recetaMedicamentos', name: 'Receta de Medicamentos', required: true }
        );
      }
      if (servicios.includes('rehabilitacion')) {
        documents.documentosSiniestro.push(
          { key: 'facturaRehabilitacion', name: 'Factura de Rehabilitación', required: true },
          { key: 'recetaRehabilitacion', name: 'Recetas de Rehabilitación', required: true },
          { key: 'carnetAsistencia', name: 'Carnet de Asistencia a Rehabilitación', required: true }
        );
      }
    } else if (tipoReclamo === 'programacion') {
      // Documentos base para programación
      documents.formasAseguradora = [
        { key: 'avisoAccidente', name: 'Aviso de Accidente o Enfermedad', required: true },
        { key: 'informeMedico', name: 'Informe Médico', required: true },
      ];

      documents.informacionPersonal = [
        { key: 'identificacionAsegurado', name: 'Identificación Oficial del Asegurado', required: true }
      ];

      documents.documentosSiniestro = [
        { key: 'estudiosInforme', name: 'Estudios que sustenten cada informe médico', required: true }
      ];

      // Agregar documentos específicos según el tipo de servicio
      const servicios = tipoServicioProgramacion ? tipoServicioProgramacion.split(',') : [];
      if (servicios.includes('cirugia')) {
        if (esCirugiaEspecializada) {
          documents.formasAseguradora.push(
            { key: 'formatoCirugiaEspecializada', name: 'Formato de Cirugía de Traumatología, Ortopedia y Neurocirugía', required: true }
          );
        }
      }
      if (servicios.includes('medicamentos')) {
        documents.documentosSiniestro.push(
          { key: 'recetaMedicamentos', name: 'Recetas de Medicamentos', required: true }
        );
      }
      if (servicios.includes('rehabilitacion')) {
        documents.documentosSiniestro.push(
          { key: 'bitacoraMedico', name: 'Bitácora del Médico (incluyendo número de terapias, sesiones y duración)', required: true }
        );
      }
    } else if (tipoReclamo === 'maternidad') {
      // Documentos para maternidad
      documents.formasAseguradora = [
        { key: 'avisoAccidente', name: 'Aviso de Accidente o Enfermedad', required: true },
        { key: 'informeMedico', name: 'Informe Médico', required: true },
      ];

      documents.informacionPersonal = [
        { key: 'identificacionAsegurado', name: 'Identificación Oficial del Asegurado', required: true }
      ];
    }

    return documents;
  };

  const handleFileUpload = async (file, documentType) => {
    setUploadingDocType(documentType);
    setLoading(true);
    try {
      console.log(`Uploading file ${file.name} for document type ${documentType}`);
      await claimsService.uploadDocument(claimId, documentType, file);
      toast.success('Documento subido correctamente');
      await loadDocuments(claim);
    } catch (error) {
      toast.error('Error al subir el documento');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
      setUploadingDocType(null);
    }
  };

  const getDocumentStatus = (docKey) => {
    const doc = documents[docKey];
    if (!doc) return 'pending';
    return doc.status || 'pending';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return FiCheck;
      case 'rejected': return FiX;
      case 'under-review': return FiClock;
      default: return FiFile;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'under-review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'under-review': return 'En Revisión';
      default: return 'Pendiente';
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

  const handleSendStatus = async () => {
    setSendingStatus(true);
    try {
      // Simulate sending status
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Estatus enviado correctamente');
    } catch (error) {
      toast.error('Error al enviar el estatus');
      console.error('Send status error:', error);
    } finally {
      setSendingStatus(false);
    }
  };

  // Validar si se puede enviar estatus
  const canSendStatus = () => {
    const allDocs = Object.values(documents);
    if (allDocs.length === 0) return false;
    
    // Verificar que todos los documentos estén aprobados o rechazados (con comentarios)
    return allDocs.every(doc => {
      if (doc.status === 'approved') return true;
      if (doc.status === 'rejected' && doc.comments && doc.comments.trim() !== '') return true;
      return false;
    });
  };

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600">Cargando información del reclamo...</p>
          </div>
        </div>
      </div>
    );
  }

  const requiredDocumentsMap = getRequiredDocuments(
    claim.tipoReclamo,
    claim.tipoSiniestro,
    claim.tipoServicioReembolso,
    claim.tipoServicioProgramacion,
    claim.esCirugiaEspecializada
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <button
                onClick={() => navigate(`/claim/${claimId}`)}
                className="flex items-center space-x-2 text-fortex-primary hover:text-fortex-secondary mb-4"
              >
                <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
                <span>Volver al formulario</span>
              </button>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Documentos - R-{claim.id?.substring(0, 8).toUpperCase()}
            </h2>
            <p className="text-gray-600">
              Sube los documentos requeridos para tu reclamo de {capitalizeFirstLetter(claim.tipoReclamo)}
            </p>
          </div>

          {/* Sección: Formas de la Aseguradora */}
          {requiredDocumentsMap.formasAseguradora.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="h-px bg-fortex-primary flex-1"></div>
                <h4 className="text-lg font-semibold text-fortex-primary mx-4">Formas de la Aseguradora</h4>
                <div className="h-px bg-fortex-primary flex-1"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requiredDocumentsMap.formasAseguradora.map((docType) => {
                  const status = getDocumentStatus(docType.key);
                  const doc = documents[docType.key];
                  const isUploading = uploadingDocType === docType.key;
                  
                  return (
                    <motion.div
                      key={docType.key}
                      className="bg-gray-50 rounded-lg shadow-sm p-6 border border-gray-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {docType.name}
                        </h3>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          <SafeIcon icon={getStatusIcon(status)} className="w-4 h-4" />
                          <span>{getStatusText(status)}</span>
                        </div>
                      </div>

                      {doc && doc.files && doc.files.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {doc.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center space-x-3">
                                <SafeIcon icon={FiFile} className="w-5 h-5 text-fortex-primary" />
                                <div>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-fortex-primary hover:text-fortex-secondary"
                                  >
                                    {file.name}
                                  </a>
                                  <p className="text-xs text-gray-500">
                                    Subido el {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => window.open(file.url, '_blank')}
                                className="p-2 text-fortex-primary hover:text-fortex-secondary transition-colors"
                              >
                                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Estado:</strong> Pendiente de subir documento
                          </p>
                        </div>
                      )}

                      {status === 'rejected' && doc?.comments && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Comentarios:</strong> {doc.comments}
                          </p>
                        </div>
                      )}

                      {(!doc || status === 'rejected' || doc.files.length === 0) && (
                        <DocumentUploadZone
                          onFileUpload={(file) => handleFileUpload(file, docType.key)}
                          documentType={docType.key}
                          acceptedFiles={doc?.files || []}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sección: Información Personal */}
          {requiredDocumentsMap.informacionPersonal.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="h-px bg-fortex-secondary flex-1"></div>
                <h4 className="text-lg font-semibold text-fortex-secondary mx-4">Información Personal</h4>
                <div className="h-px bg-fortex-secondary flex-1"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requiredDocumentsMap.informacionPersonal.map((docType) => {
                  const status = getDocumentStatus(docType.key);
                  const doc = documents[docType.key];
                  const isUploading = uploadingDocType === docType.key;
                  
                  return (
                    <motion.div
                      key={docType.key}
                      className="bg-blue-50 rounded-lg shadow-sm p-6 border border-blue-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {docType.name}
                        </h3>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          <SafeIcon icon={getStatusIcon(status)} className="w-4 h-4" />
                          <span>{getStatusText(status)}</span>
                        </div>
                      </div>

                      {doc && doc.files && doc.files.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {doc.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center space-x-3">
                                <SafeIcon icon={FiFile} className="w-5 h-5 text-fortex-primary" />
                                <div>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-fortex-primary hover:text-fortex-secondary"
                                  >
                                    {file.name}
                                  </a>
                                  <p className="text-xs text-gray-500">
                                    Subido el {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => window.open(file.url, '_blank')}
                                className="p-2 text-fortex-primary hover:text-fortex-secondary transition-colors"
                              >
                                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Estado:</strong> Pendiente de subir documento
                          </p>
                        </div>
                      )}

                      {status === 'rejected' && doc?.comments && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Comentarios:</strong> {doc.comments}
                          </p>
                        </div>
                      )}

                      {(!doc || status === 'rejected' || doc.files.length === 0) && (
                        <DocumentUploadZone
                          onFileUpload={(file) => handleFileUpload(file, docType.key)}
                          documentType={docType.key}
                          acceptedFiles={doc?.files || []}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sección: Documentos del Siniestro */}
          {requiredDocumentsMap.documentosSiniestro.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <div className="h-px bg-orange-400 flex-1"></div>
                <h4 className="text-lg font-semibold text-orange-600 mx-4">Documentos del Siniestro</h4>
                <div className="h-px bg-orange-400 flex-1"></div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {requiredDocumentsMap.documentosSiniestro.map((docType) => {
                  const status = getDocumentStatus(docType.key);
                  const doc = documents[docType.key];
                  const isUploading = uploadingDocType === docType.key;
                  
                  return (
                    <motion.div
                      key={docType.key}
                      className="bg-orange-50 rounded-lg shadow-sm p-6 border border-orange-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {docType.name}
                        </h3>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                          <SafeIcon icon={getStatusIcon(status)} className="w-4 h-4" />
                          <span>{getStatusText(status)}</span>
                        </div>
                      </div>

                      {doc && doc.files && doc.files.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {doc.files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                              <div className="flex items-center space-x-3">
                                <SafeIcon icon={FiFile} className="w-5 h-5 text-fortex-primary" />
                                <div>
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm font-medium text-fortex-primary hover:text-fortex-secondary"
                                  >
                                    {file.name}
                                  </a>
                                  <p className="text-xs text-gray-500">
                                    Subido el {new Date(file.uploadedAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => window.open(file.url, '_blank')}
                                className="p-2 text-fortex-primary hover:text-fortex-secondary transition-colors"
                              >
                                <SafeIcon icon={FiDownload} className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mb-4 p-3 bg-white border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-600">
                            <strong>Estado:</strong> Pendiente de subir documento
                          </p>
                        </div>
                      )}

                      {status === 'rejected' && doc?.comments && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-800">
                            <strong>Comentarios:</strong> {doc.comments}
                          </p>
                        </div>
                      )}

                      {(!doc || status === 'rejected' || doc.files.length === 0) && (
                        <DocumentUploadZone
                          onFileUpload={(file) => handleFileUpload(file, docType.key)}
                          documentType={docType.key}
                          acceptedFiles={doc?.files || []}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Botones inferiores */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => setShowArchiveConfirm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <SafeIcon icon={FiArchive} className="w-4 h-4" />
              <span>Archivar</span>
            </button>
            <button
              onClick={handleSendStatus}
              disabled={!canSendStatus() || sendingStatus}
              className="flex items-center space-x-2 px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <SafeIcon icon={FiSend} className="w-4 h-4" />
              <span>
                {sendingStatus ? 'Enviando...' : 'Enviar Estatus al Asegurado'}
              </span>
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
                  {loading ? 'Archivando...' : 'Archivar'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DocumentUpload;