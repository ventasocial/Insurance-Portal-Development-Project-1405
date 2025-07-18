import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import DocumentUploadZone from '../components/DocumentUploadZone';
import { useClaims } from '../contexts/ClaimsContext';
import { claimsService } from '../services/claimsService';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import toast from 'react-hot-toast';

const { FiArrowLeft, FiFile, FiCheck, FiX, FiClock, FiDownload } = FiIcons;

const DocumentUpload = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const { claims } = useClaims();
  const [claim, setClaim] = useState(null);
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentClaim = claims.find(c => c.id === claimId);
    if (currentClaim) {
      setClaim(currentClaim);
      loadDocuments(currentClaim);
    }
  }, [claimId, claims]);

  const loadDocuments = async (claimData) => {
    try {
      const docs = await claimsService.getClaimDocuments(claimData.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const getRequiredDocuments = (tipoReclamo, tipoSiniestro, tipoServicioReembolso, tipoServicioProgramacion, esCirugiaEspecializada) => {
    let documents = [];

    if (tipoReclamo === 'reembolso') {
      // Documentos base para reembolso
      documents = [
        { key: 'avisoAccidente', name: 'Aviso de Accidente o Enfermedad', required: true },
        { key: 'formatoReembolso', name: 'Formato de Reembolso', required: true },
        { key: 'formatoBancario', name: 'Formato Único de Información Bancaria', required: true },
        { key: 'informeMedico', name: 'Informe Médico', required: true },
        { key: 'caratulaEstadoCuenta', name: 'Carátula del Estado de Cuenta', required: true },
        { key: 'identificacionTitular', name: 'Identificación Oficial del Titular de la Cuenta Bancaria', required: true },
        { key: 'identificacionAsegurado', name: 'Identificación Oficial del Asegurado Afectado o Tutor', required: true },
        { key: 'facturasReembolso', name: 'Facturas para Reembolso', required: true },
        { key: 'recetasCorrespondientes', name: 'Recetas correspondientes a las facturas', required: true },
        { key: 'estudiosCorrespondientes', name: 'Estudios correspondientes a las facturas', required: true }
      ];

      // Agregar documentos específicos según el tipo de servicio
      if (tipoServicioReembolso === 'hospitales') {
        documents.push({ key: 'facturaHospitales', name: 'Factura de Hospitales', required: true });
      } else if (tipoServicioReembolso === 'honorarios-medicos') {
        documents.push({ key: 'facturaHonorariosMedicos', name: 'Factura de Honorarios Médicos', required: true });
      } else if (tipoServicioReembolso === 'estudios-laboratorio') {
        documents.push(
          { key: 'facturaEstudiosLab', name: 'Factura de Estudios de Laboratorio e Imagenología', required: true },
          { key: 'estudiosLaboratorio', name: 'Estudios de Laboratorio e Imagenología', required: true }
        );
      } else if (tipoServicioReembolso === 'medicamentos') {
        documents.push(
          { key: 'facturaMedicamentos', name: 'Factura de Medicamentos', required: true },
          { key: 'recetaMedicamentos', name: 'Receta de Medicamentos', required: true }
        );
      } else if (tipoServicioReembolso === 'rehabilitacion') {
        documents.push(
          { key: 'facturaRehabilitacion', name: 'Factura de Rehabilitación', required: true },
          { key: 'recetaRehabilitacion', name: 'Recetas de Rehabilitación', required: true },
          { key: 'carnetAsistencia', name: 'Carnet de Asistencia a Rehabilitación', required: true }
        );
      }
    } else if (tipoReclamo === 'programacion') {
      // Documentos base para programación
      documents = [
        { key: 'avisoAccidente', name: 'Aviso de Accidente o Enfermedad', required: true },
        { key: 'informeMedico', name: 'Informe Médico', required: true },
        { key: 'estudiosInforme', name: 'Estudios que sustenten cada informe médico', required: true },
        { key: 'identificacionAsegurado', name: 'Identificación Oficial del Asegurado', required: true }
      ];

      // Agregar documentos específicos según el tipo de servicio
      if (tipoServicioProgramacion === 'cirugia') {
        if (esCirugiaEspecializada) {
          documents.push({ key: 'formatoCirugiaEspecializada', name: 'Formato de Cirugía de Traumatología, Ortopedia y Neurocirugía', required: true });
        }
      } else if (tipoServicioProgramacion === 'medicamentos') {
        documents.push({ key: 'recetaMedicamentos', name: 'Recetas de Medicamentos', required: true });
      } else if (tipoServicioProgramacion === 'rehabilitacion') {
        documents.push({ key: 'bitacoraMedico', name: 'Bitácora del Médico (incluyendo número de terapias, sesiones y duración)', required: true });
      }
    } else if (tipoReclamo === 'maternidad') {
      // Documentos para maternidad (puedes definir estos según tus necesidades)
      documents = [
        { key: 'avisoAccidente', name: 'Aviso de Accidente o Enfermedad', required: true },
        { key: 'informeMedico', name: 'Informe Médico', required: true },
        { key: 'identificacionAsegurado', name: 'Identificación Oficial del Asegurado', required: true }
      ];
    }

    return documents;
  };

  const handleFileUpload = async (file, documentType) => {
    setLoading(true);
    try {
      await claimsService.uploadDocument(claimId, documentType, file);
      toast.success('Documento subido correctamente');
      await loadDocuments(claim);
    } catch (error) {
      toast.error('Error al subir el documento');
      console.error('Upload error:', error);
    } finally {
      setLoading(false);
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

  const requiredDocuments = getRequiredDocuments(
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
            <button
              onClick={() => navigate(`/claim/${claimId}`)}
              className="flex items-center space-x-2 text-fortex-primary hover:text-fortex-secondary mb-4"
            >
              <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
              <span>Volver al formulario</span>
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Documentos - R-{claim.id?.replace('claim-', '').toUpperCase()}
            </h2>
            <p className="text-gray-600">
              Sube los documentos requeridos para tu reclamo de {claim.tipoReclamo}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {requiredDocuments.map((docType) => {
              const status = getDocumentStatus(docType.key);
              const doc = documents[docType.key];
              
              return (
                <motion.div
                  key={docType.key}
                  className="bg-white rounded-lg shadow-sm p-6"
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
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                  ) : null}

                  {status === 'rejected' && doc?.comments && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800">
                        <strong>Comentarios:</strong> {doc.comments}
                      </p>
                    </div>
                  )}

                  {(!doc || status === 'rejected') && (
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
        </motion.div>
      </main>
    </div>
  );
};

export default DocumentUpload;