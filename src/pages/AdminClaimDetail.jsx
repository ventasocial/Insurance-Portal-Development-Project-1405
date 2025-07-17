import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import { useClaims } from '../contexts/ClaimsContext';
import { claimsService } from '../services/claimsService';
import { ghlService } from '../services/ghlService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const { FiArrowLeft, FiSend, FiArchive, FiUser, FiMail, FiPhone, FiFileText, FiCalendar, FiCheckCircle, FiXCircle, FiDownload, FiClock } = FiIcons;

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
    
    // If no comments and trying to approve or reject, set to pending
    const finalStatus = (comments.trim() === '' && (status === 'approved' || status === 'rejected')) 
      ? 'pending' 
      : status;
    
    try {
      await claimsService.updateDocumentStatus(claimId, documentType, finalStatus, comments);
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
      
      toast.success(`Documento ${finalStatus === 'approved' ? 'aprobado' : (finalStatus === 'rejected' ? 'rechazado' : 'pendiente')} correctamente`);
    } catch (error) {
      toast.error('Error al actualizar el estado del documento');
      console.error('Document status update error:', error);
    } finally {
      setProcessingDocId(null);
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
                  <span>Última edición: {formatDateTime(claim.updatedAt)} por {claim.lastEditedBy || 'Usuario del sistema'}</span>
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
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Documentos del Reclamo
              </h3>
            </div>
            <div className="p-6">
              {Object.keys(documents).length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo de Documento
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Archivos
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Comentarios para el Asegurado
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(documents).map(([docType, docInfo]) => (
                        <tr key={docType}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{getDocumentTypeLabel(docType)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(docInfo.status)}`}>
                              {getStatusText(docInfo.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-2">
                              {docInfo.files && docInfo.files.map((file, idx) => (
                                <div key={idx} className="flex items-center space-x-2 text-sm">
                                  <SafeIcon icon={FiFileText} className="w-4 h-4 text-gray-500" />
                                  <a 
                                    href={file.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="text-fortex-primary hover:text-fortex-secondary truncate max-w-xs"
                                  >
                                    {file.name}
                                  </a>
                                  <button
                                    onClick={() => handleDownloadFile(file.url, file.name)}
                                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                                  >
                                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <textarea
                              value={documentComments[docType] || ''}
                              onChange={(e) => handleCommentChange(docType, e.target.value)}
                              placeholder="Comentarios para el asegurado..."
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-fortex-primary focus:border-transparent"
                              rows={2}
                            />
                            <div className="text-xs text-gray-500 mt-1">
                              {documentComments[docType]?.trim() === '' && 
                                'El documento quedará como "Pendiente" sin comentarios'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            <button
                              onClick={() => handleDocumentStatus(docType, 'approved')}
                              disabled={processingDocId === docType}
                              className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                                docInfo.status === 'approved'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
                              }`}
                            >
                              <SafeIcon icon={FiCheckCircle} className="w-4 h-4 mr-1" />
                              Aprobado
                            </button>
                            <button
                              onClick={() => handleDocumentStatus(docType, 'rejected')}
                              disabled={processingDocId === docType}
                              className={`inline-flex items-center px-3 py-1 rounded-md text-sm transition-colors ${
                                docInfo.status === 'rejected'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
                              }`}
                              style={docInfo.status === 'rejected' ? { backgroundColor: '#fee2e2', color: '#b91c1c' } : {}}
                            >
                              <SafeIcon icon={FiXCircle} className="w-4 h-4 mr-1" />
                              Rechazado
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <SafeIcon icon={FiFileText} className="w-12 h-12 mx-auto mb-2" />
                  <p>No hay documentos subidos para este reclamo</p>
                  <p className="text-sm">Documentos subidos: {claim.documentsCount || 0}</p>
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