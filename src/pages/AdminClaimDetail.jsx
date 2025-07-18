import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import DocumentUploadZone from '../components/DocumentUploadZone';
import { useClaims } from '../contexts/ClaimsContext';
import { claimsService } from '../services/claimsService';
import { ghlService } from '../services/ghlService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const { FiArrowLeft, FiSend, FiArchive, FiUser, FiMail, FiPhone, FiFileText, FiCalendar, FiCheckCircle, FiXCircle, FiDownload, FiClock, FiUpload } = FiIcons;

const AdminClaimDetail = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { claims, updateClaimStatus } = useClaims();
  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [sendingStatus, setSendingStatus] = useState(false);
  const [processingDocId, setProcessingDocId] = useState(null);
  const [documentComments, setDocumentComments] = useState({});

  useEffect(() => {
    const currentClaim = claims.find(c => c.id === claimId);
    if (currentClaim) {
      setClaim(currentClaim);
      loadDocuments(currentClaim.id);
    }
  }, [claimId, claims]);

  const loadDocuments = async (id) => {
    try {
      const docs = await claimsService.getClaimDocuments(id);
      setDocuments(docs);
      // Initialize comments state from loaded documents
      const initialComments = {};
      Object.entries(docs).forEach(([docType, docInfo]) => {
        initialComments[docType] = docInfo.comments || '';
      });
      setDocumentComments(initialComments);
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
        { key: 'caratulaEstadoCuenta', name: 'Carátula del Estado de Cuenta', required: true },
        { key: 'identificacionTitular', name: 'Identificación Oficial del Titular de la Cuenta Bancaria', required: true },
        { key: 'identificacionAsegurado', name: 'Identificación Oficial del Asegurado Afectado o Tutor', required: true },
      ];

      documents.documentosSiniestro = [
        { key: 'facturasReembolso', name: 'Facturas para Reembolso', required: true },
        { key: 'recetasCorrespondientes', name: 'Recetas correspondientes a las facturas', required: true },
        { key: 'estudiosCorrespondientes', name: 'Estudios correspondientes a las facturas', required: true }
      ];

      // Agregar documentos específicos según el tipo de servicio
      const servicios = tipoServicioReembolso ? tipoServicioReembolso.split(',') : [];
      if (servicios.includes('hospitales')) {
        documents.documentosSiniestro.push({ key: 'facturaHospitales', name: 'Factura de Hospitales', required: true });
      }
      if (servicios.includes('honorarios-medicos')) {
        documents.documentosSiniestro.push({ key: 'facturaHonorariosMedicos', name: 'Factura de Honorarios Médicos', required: true });
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
          documents.formasAseguradora.push({ key: 'formatoCirugiaEspecializada', name: 'Formato de Cirugía de Traumatología, Ortopedia y Neurocirugía', required: true });
        }
      }
      if (servicios.includes('medicamentos')) {
        documents.documentosSiniestro.push({ key: 'recetaMedicamentos', name: 'Recetas de Medicamentos', required: true });
      }
      if (servicios.includes('rehabilitacion')) {
        documents.documentosSiniestro.push({ key: 'bitacoraMedico', name: 'Bitácora del Médico (incluyendo número de terapias, sesiones y duración)', required: true });
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

  const handleSendStatus = async () => {
    setSendingStatus(true);
    try {
      // Trigger GHL automation
      await ghlService.triggerAutomation(claim.contactId, 'send_status_update', {
        claimId: claim.id,
        status: claim.status,
        claimNumber: claim.id?.replace('claim-', '').toUpperCase(),
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

  const handleCommentChange = (documentType, value) => {
    setDocumentComments(prev => ({
      ...prev,
      [documentType]: value
    }));
  };

  const handleDocumentStatus = async (documentType, status) => {
    setProcessingDocId(documentType);
    const comments = documentComments[documentType] || '';

    // Si es rechazado y no hay comentarios, solicitar comentarios
    if (status === 'rejected' && comments.trim() === '') {
      toast.error('Debes agregar un comentario para rechazar el documento');
      setProcessingDocId(null);
      return;
    }

    // Aprobado puede ir sin comentarios
    try {
      await claimsService.updateDocumentStatus(claimId, documentType, status, comments);
      await loadDocuments(claimId);

      // Check if all documents are now approved to update claim status
      if (status === 'approved') {
        const updatedDocs = await claimsService.getClaimDocuments(claimId);
        const allDocsApproved = Object.values(updatedDocs).every(
          doc => doc.status === 'approved'
        );
        if (allDocsApproved && Object.keys(updatedDocs).length > 0) {
          await updateClaimStatus(claimId, 'verified');
          toast.success('Todos los documentos aprobados. Reclamo verificado.');
        }
      }

      toast.success(`Documento ${status === 'approved' ? 'aprobado' : (status === 'rejected' ? 'rechazado' : 'pendiente')} correctamente`);
    } catch (error) {
      toast.error('Error al actualizar el estado del documento');
      console.error('Document status update error:', error);
    } finally {
      setProcessingDocId(null);
    }
  };

  const handleFileUpload = async (file, documentType) => {
    setLoading(true);
    try {
      await claimsService.uploadDocument(claimId, documentType, file);
      toast.success('Documento subido correctamente');
      await loadDocuments(claimId);
    } catch (error) {
      toast.error('Error al subir el documento');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, "d 'de' MMMM, yyyy HH:mm", { locale: es });
  };

  const getDocumentTypeLabel = (key) => {
    const documentTypes = {
      'avisoAccidente': 'Aviso de Accidente/Enfermedad',
      'informeMedico': 'Informe Médico',
      'formatoReembolso': 'Formato de Reembolso',
      'recetasMedicas': 'Recetas Médicas',
      'estudiosLaboratorio': 'Estudios de Laboratorio',
      'documentosBancarios': 'Documentos Bancarios',
      'identificacionOficial': 'Identificación Oficial',
      'facturas': 'Facturas',
    };
    return documentTypes[key] || key;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'under-review': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'under-review': return 'En Revisión';
      default: return 'Desconocido';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return FiCheckCircle;
      case 'rejected': return FiXCircle;
      case 'under-review': return FiClock;
      default: return FiFileText;
    }
  };

  const handleDownloadFile = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const claimNumber = claim.id?.replace('claim-', '').toUpperCase();
  const isInInsurer = claim.status === 'sent-to-insurer';
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
                  R-{claimNumber}
                </h2>
                <p className="text-gray-600">
                  Detalles del reclamo administrativo
                </p>
                <div className="text-sm text-gray-500 mt-1 flex items-center">
                  <SafeIcon icon={FiClock} className="w-3 h-3 mr-1" />
                  <span>Editado: {formatDateTime(claim.updatedAt)} por {claim.lastEditedBy || 'Usuario del sistema'}</span>
                </div>
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

                {/* Número de Reclamo de la Aseguradora (solo para reembolso/inicial) */}
                {claim.tipoReclamo === 'reembolso' && claim.tipoSiniestro === 'inicial' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Reclamo de la Aseguradora
                    </label>
                    <input
                      type="text"
                      value={claim.numeroReclamoAseguradora || ''}
                      onChange={(e) => {
                        const updatedClaim = { ...claim, numeroReclamoAseguradora: e.target.value };
                        setClaim(updatedClaim);
                        claimsService.updateClaim(claimId, { numeroReclamoAseguradora: e.target.value });
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                      placeholder="Ingrese el número proporcionado por la aseguradora"
                    />
                  </div>
                )}

                {/* Número de Reclamo (para complemento) */}
                {claim.tipoReclamo === 'reembolso' && claim.tipoSiniestro === 'complemento' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Número de Reclamo
                    </label>
                    <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                      {claim.numeroReclamo || 'No especificado'}
                    </p>
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
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Documentos del Reclamo
              </h3>
              <button
                onClick={handleSendStatus}
                disabled={loading || sendingStatus}
                className="flex items-center space-x-2 px-6 py-3 bg-fortex-primary text-white rounded-lg hover:bg-fortex-secondary transition-colors disabled:opacity-50"
              >
                <SafeIcon icon={FiSend} className="w-4 h-4" />
                <span>
                  {sendingStatus ? 'Enviando...' : 'Enviar Estatus al Asegurado'}
                </span>
              </button>
            </div>
            <div className="p-6">
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
                      const status = documents[docType.key]?.status || 'pending';
                      const doc = documents[docType.key];
                      return (
                        <div key={docType.key} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">{docType.name}</h5>
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              <SafeIcon icon={getStatusIcon(status)} className="w-4 h-4" />
                              <span>{getStatusText(status)}</span>
                            </div>
                          </div>
                          
                          {/* Upload Zone */}
                          <div className="mb-4">
                            <DocumentUploadZone
                              onFileUpload={(file) => handleFileUpload(file, docType.key)}
                              documentType={docType.key}
                              acceptedFiles={doc?.files || []}
                            />
                          </div>

                          {/* File List */}
                          {doc && doc.files && doc.files.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {doc.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-2">
                                    <SafeIcon icon={FiFileText} className="w-4 h-4 text-fortex-primary" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadFile(file.url, file.name)}
                                    className="text-fortex-primary hover:text-fortex-secondary"
                                  >
                                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Status Actions */}
                          <div className="flex space-x-2 mb-3">
                            <button
                              onClick={() => handleDocumentStatus(docType.key, 'approved')}
                              disabled={processingDocId === docType.key}
                              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                              }`}
                            >
                              <SafeIcon icon={FiCheckCircle} className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleDocumentStatus(docType.key, 'rejected')}
                              disabled={processingDocId === docType.key}
                              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                              }`}
                            >
                              <SafeIcon icon={FiXCircle} className="w-4 h-4 mx-auto" />
                            </button>
                          </div>

                          {/* Comments */}
                          <div>
                            <textarea
                              value={documentComments[docType.key] || ''}
                              onChange={(e) => handleCommentChange(docType.key, e.target.value)}
                              placeholder="Comentarios para el asegurado..."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                              rows={2}
                            />
                          </div>
                        </div>
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
                      const status = documents[docType.key]?.status || 'pending';
                      const doc = documents[docType.key];
                      return (
                        <div key={docType.key} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">{docType.name}</h5>
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              <SafeIcon icon={getStatusIcon(status)} className="w-4 h-4" />
                              <span>{getStatusText(status)}</span>
                            </div>
                          </div>
                          
                          {/* Upload Zone */}
                          <div className="mb-4">
                            <DocumentUploadZone
                              onFileUpload={(file) => handleFileUpload(file, docType.key)}
                              documentType={docType.key}
                              acceptedFiles={doc?.files || []}
                            />
                          </div>

                          {/* File List */}
                          {doc && doc.files && doc.files.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {doc.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-2">
                                    <SafeIcon icon={FiFileText} className="w-4 h-4 text-fortex-primary" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadFile(file.url, file.name)}
                                    className="text-fortex-primary hover:text-fortex-secondary"
                                  >
                                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Status Actions */}
                          <div className="flex space-x-2 mb-3">
                            <button
                              onClick={() => handleDocumentStatus(docType.key, 'approved')}
                              disabled={processingDocId === docType.key}
                              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                              }`}
                            >
                              <SafeIcon icon={FiCheckCircle} className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleDocumentStatus(docType.key, 'rejected')}
                              disabled={processingDocId === docType.key}
                              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                              }`}
                            >
                              <SafeIcon icon={FiXCircle} className="w-4 h-4 mx-auto" />
                            </button>
                          </div>

                          {/* Comments */}
                          <div>
                            <textarea
                              value={documentComments[docType.key] || ''}
                              onChange={(e) => handleCommentChange(docType.key, e.target.value)}
                              placeholder="Comentarios para el asegurado..."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                              rows={2}
                            />
                          </div>
                        </div>
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
                      const status = documents[docType.key]?.status || 'pending';
                      const doc = documents[docType.key];
                      return (
                        <div key={docType.key} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-gray-900">{docType.name}</h5>
                            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                              <SafeIcon icon={getStatusIcon(status)} className="w-4 h-4" />
                              <span>{getStatusText(status)}</span>
                            </div>
                          </div>
                          
                          {/* Upload Zone */}
                          <div className="mb-4">
                            <DocumentUploadZone
                              onFileUpload={(file) => handleFileUpload(file, docType.key)}
                              documentType={docType.key}
                              acceptedFiles={doc?.files || []}
                            />
                          </div>

                          {/* File List */}
                          {doc && doc.files && doc.files.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {doc.files.map((file, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                  <div className="flex items-center space-x-2">
                                    <SafeIcon icon={FiFileText} className="w-4 h-4 text-fortex-primary" />
                                    <span className="text-sm font-medium">{file.name}</span>
                                  </div>
                                  <button
                                    onClick={() => handleDownloadFile(file.url, file.name)}
                                    className="text-fortex-primary hover:text-fortex-secondary"
                                  >
                                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Status Actions */}
                          <div className="flex space-x-2 mb-3">
                            <button
                              onClick={() => handleDocumentStatus(docType.key, 'approved')}
                              disabled={processingDocId === docType.key}
                              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                              }`}
                            >
                              <SafeIcon icon={FiCheckCircle} className="w-4 h-4 mx-auto" />
                            </button>
                            <button
                              onClick={() => handleDocumentStatus(docType.key, 'rejected')}
                              disabled={processingDocId === docType.key}
                              className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors ${
                                status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                              }`}
                            >
                              <SafeIcon icon={FiXCircle} className="w-4 h-4 mx-auto" />
                            </button>
                          </div>

                          {/* Comments */}
                          <div>
                            <textarea
                              value={documentComments[docType.key] || ''}
                              onChange={(e) => handleCommentChange(docType.key, e.target.value)}
                              placeholder="Comentarios para el asegurado..."
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                              rows={2}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminClaimDetail;