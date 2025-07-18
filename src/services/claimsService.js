// Mock claims service
// In production, this would connect to GoHighLevel API

// Generate a random 4-character alphanumeric string
const generateClaimCode = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result.toUpperCase();
};

// Track used claim codes to avoid duplicates
const usedClaimCodes = new Set();

const mockClaims = [
  {
    id: 'claim-abcd',
    contactId: 'demo-contact-456',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'demo@cliente.com',
    phone: '+52 55 1234 5678',
    nombreAsegurado: 'Juan Pérez García',
    emailAsegurado: 'juan.perez@email.com',
    numeroPoliza: 'POL-123456',
    digitoVerificador: '7',
    relacionAsegurado: 'titular',
    tipoSiniestro: 'inicial',
    tipoReclamo: 'reembolso',
    tipoServicioReembolso: 'hospitales',
    aseguradora: 'GNP',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    lastEditedBy: 'Administrador',
    documentsCount: 3
  },
  {
    id: 'claim-efgh',
    contactId: 'demo-contact-456',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'demo@cliente.com',
    phone: '+52 55 1234 5678',
    nombreAsegurado: 'María Pérez García',
    emailAsegurado: 'maria.perez@email.com',
    numeroPoliza: 'POL-789012',
    digitoVerificador: '3',
    relacionAsegurado: 'conyuge',
    tipoSiniestro: 'complemento',
    tipoReclamo: 'reembolso',
    tipoServicioReembolso: 'medicamentos',
    aseguradora: 'AXA',
    status: 'verified',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    lastEditedBy: 'Carlos Rodríguez',
    documentsCount: 5
  },
  {
    id: 'claim-ijkl',
    contactId: 'demo-contact-456',
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'demo@cliente.com',
    phone: '+52 55 1234 5678',
    nombreAsegurado: 'Carlos Pérez García',
    emailAsegurado: 'carlos.perez@email.com',
    numeroPoliza: 'POL-345678',
    digitoVerificador: '9',
    relacionAsegurado: 'hijo',
    tipoReclamo: 'programacion',
    tipoServicioProgramacion: 'cirugia',
    esCirugiaEspecializada: true,
    aseguradora: 'Qualitas',
    status: 'sent-to-insurer',
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-14T11:30:00Z',
    lastEditedBy: 'Laura Sánchez',
    documentsCount: 7
  }
];

// Initialize used claim codes from existing claims
mockClaims.forEach(claim => {
  const code = claim.id.replace('claim-', '');
  usedClaimCodes.add(code);
});

// Mock admin claims (for admin panel)
const allMockClaims = [
  ...mockClaims,
  {
    id: 'claim-mnop',
    contactId: 'contact-789',
    firstName: 'Ana',
    lastName: 'González',
    email: 'ana.gonzalez@email.com',
    phone: '+52 55 9876 5432',
    nombreAsegurado: 'Ana González López',
    emailAsegurado: 'ana.gonzalez@email.com',
    numeroPoliza: 'POL-987654',
    digitoVerificador: '2',
    relacionAsegurado: 'titular',
    tipoSiniestro: 'inicial',
    tipoReclamo: 'reembolso',
    tipoServicioReembolso: 'honorarios-medicos',
    aseguradora: 'GNP',
    status: 'pending',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-13T14:20:00Z',
    lastEditedBy: 'Miguel Ángel',
    documentsCount: 2
  },
  {
    id: 'claim-qrst',
    contactId: 'contact-101',
    firstName: 'Luis',
    lastName: 'Martínez',
    email: 'luis.martinez@email.com',
    phone: '+52 55 5555 1234',
    nombreAsegurado: 'Luis Martínez Rodríguez',
    emailAsegurado: 'luis.martinez@email.com',
    numeroPoliza: 'POL-555666',
    digitoVerificador: '5',
    relacionAsegurado: 'titular',
    tipoReclamo: 'programacion',
    tipoServicioProgramacion: 'medicamentos',
    aseguradora: 'AXA',
    status: 'verified',
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-16T08:45:00Z',
    lastEditedBy: 'Patricia Gómez',
    documentsCount: 8
  },
  {
    id: 'claim-uvwx',
    contactId: 'contact-202',
    firstName: 'Carmen',
    lastName: 'Jiménez',
    email: 'carmen.jimenez@email.com',
    phone: '+52 55 7777 8888',
    nombreAsegurado: 'Carmen Jiménez Vega',
    emailAsegurado: 'carmen.jimenez@email.com',
    numeroPoliza: 'POL-777888',
    digitoVerificador: '1',
    relacionAsegurado: 'titular',
    tipoReclamo: 'maternidad',
    aseguradora: 'Qualitas',
    status: 'sent-to-insurer',
    createdAt: '2024-01-01T13:45:00Z',
    updatedAt: '2024-01-17T16:00:00Z',
    lastEditedBy: 'Roberto Torres',
    documentsCount: 6
  },
  {
    id: 'claim-yzab',
    contactId: 'contact-303',
    firstName: 'Rodrigo',
    lastName: 'Sánchez',
    email: 'rodrigo.sanchez@email.com',
    phone: '+52 55 2222 3333',
    nombreAsegurado: 'Rodrigo Sánchez Flores',
    emailAsegurado: 'rodrigo.sanchez@email.com',
    numeroPoliza: 'POL-222333',
    digitoVerificador: '4',
    relacionAsegurado: 'titular',
    tipoSiniestro: 'inicial',
    tipoReclamo: 'reembolso',
    tipoServicioReembolso: 'rehabilitacion',
    aseguradora: 'GNP',
    status: 'archived',
    createdAt: '2023-12-15T08:30:00Z',
    updatedAt: '2024-01-10T16:45:00Z', // 26 days for processing
    lastEditedBy: 'Laura Torres',
    documentsCount: 5
  },
  {
    id: 'claim-cdef',
    contactId: 'contact-404',
    firstName: 'Gabriela',
    lastName: 'López',
    email: 'gabriela.lopez@email.com',
    phone: '+52 55 4444 5555',
    nombreAsegurado: 'Gabriela López Mendoza',
    emailAsegurado: 'gabriela.lopez@email.com',
    numeroPoliza: 'POL-444555',
    digitoVerificador: '8',
    relacionAsegurado: 'titular',
    tipoReclamo: 'programacion',
    tipoServicioProgramacion: 'rehabilitacion',
    aseguradora: 'AXA',
    status: 'archived',
    createdAt: '2023-12-20T11:15:00Z',
    updatedAt: '2024-01-05T09:30:00Z', // 16 days for processing
    lastEditedBy: 'Carlos Gómez',
    documentsCount: 7
  }
];

// Add all claim codes to the set
allMockClaims.forEach(claim => {
  const code = claim.id.replace('claim-', '');
  usedClaimCodes.add(code);
});

const mockDocuments = {
  'claim-abcd': {
    avisoAccidente: {
      status: 'approved',
      files: [
        { name: 'aviso_accidente.pdf', url: '#', uploadedAt: '2024-01-15T10:45:00Z' }
      ]
    },
    informeMedico: {
      status: 'rejected',
      comments: 'El informe médico no está completo. Falta la firma del médico.',
      files: [
        { name: 'informe_medico.pdf', url: '#', uploadedAt: '2024-01-15T11:00:00Z' }
      ]
    },
    formatoReembolso: {
      status: 'under-review',
      files: [
        { name: 'formato_reembolso.pdf', url: '#', uploadedAt: '2024-01-15T11:15:00Z' }
      ]
    },
    identificacionAsegurado: {
      status: 'pending',
      files: [
        { name: 'ine_frente.pdf', url: '#', uploadedAt: '2024-01-15T11:20:00Z' }
      ]
    },
    facturaHospitales: {
      status: 'approved',
      files: [
        { name: 'factura_hospital.pdf', url: '#', uploadedAt: '2024-01-15T11:25:00Z' }
      ]
    }
  },
  'claim-efgh': {
    avisoAccidente: {
      status: 'approved',
      files: [
        { name: 'aviso_enfermedad.pdf', url: '#', uploadedAt: '2024-01-10T14:30:00Z' }
      ]
    },
    informeMedico: {
      status: 'approved',
      files: [
        { name: 'informe_medico_completo.pdf', url: '#', uploadedAt: '2024-01-10T15:00:00Z' }
      ]
    },
    identificacionAsegurado: {
      status: 'approved',
      files: [
        { name: 'ine_frente_reverso.pdf', url: '#', uploadedAt: '2024-01-11T09:30:00Z' }
      ]
    }
  }
};

// Helper function to generate unique ID
const generateClaimId = () => {
  let claimCode;
  do {
    claimCode = generateClaimCode();
  } while (usedClaimCodes.has(claimCode));
  
  usedClaimCodes.add(claimCode);
  return 'claim-' + claimCode.toLowerCase();
};

// Helper function to check if all documents are approved
const checkAllDocumentsApproved = (claimId) => {
  const docs = mockDocuments[claimId];
  if (!docs || Object.keys(docs).length === 0) return false;
  
  return Object.values(docs).every(doc => doc.status === 'approved');
};

export const claimsService = {
  async getUserClaims(contactId) {
    // Simulate API call to GoHighLevel
    return new Promise((resolve) => {
      setTimeout(() => {
        const userClaims = mockClaims.filter(claim => claim.contactId === contactId);
        resolve(userClaims);
      }, 1000);
    });
  },

  async getAllClaims() {
    // Simulate API call to GoHighLevel
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter out archived claims for the main view
        const activeClaims = allMockClaims;
        resolve(activeClaims);
      }, 1000);
    });
  },

  async getClaim(claimId) {
    // Simulate API call to GoHighLevel
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const claim = allMockClaims.find(c => c.id === claimId);
        if (claim) {
          resolve(claim);
        } else {
          reject(new Error('Claim not found'));
        }
      }, 500);
    });
  },

  async createClaim(claimData) {
    // Simulate API call to GoHighLevel
    return new Promise((resolve) => {
      setTimeout(() => {
        const newClaim = {
          id: generateClaimId(),
          contactId: 'demo-contact-456', // In production, get from auth context
          ...claimData,
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastEditedBy: 'Sistema (Creación)',
          documentsCount: 0
        };

        // Add to mock data
        mockClaims.push(newClaim);
        allMockClaims.push(newClaim);
        resolve(newClaim);
      }, 1500);
    });
  },

  async updateClaim(claimId, updateData) {
    // Simulate API call to GoHighLevel
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, this would update the GoHighLevel contact/opportunity fields
        console.log('Updating claim:', claimId, updateData);
        
        // Update the claim in mock data
        const claimIndex = allMockClaims.findIndex(c => c.id === claimId);
        if (claimIndex !== -1) {
          allMockClaims[claimIndex] = {
            ...allMockClaims[claimIndex],
            ...updateData,
            updatedAt: new Date().toISOString(),
            lastEditedBy: updateData.lastEditedBy || 'Usuario del sistema'
          };
          
          // Also update in mockClaims if it exists there
          const userClaimIndex = mockClaims.findIndex(c => c.id === claimId);
          if (userClaimIndex !== -1) {
            mockClaims[userClaimIndex] = {
              ...mockClaims[userClaimIndex],
              ...updateData,
              updatedAt: new Date().toISOString(),
              lastEditedBy: updateData.lastEditedBy || 'Usuario del sistema'
            };
          }
        }
        
        resolve({ success: true });
      }, 1000);
    });
  },

  async updateClaimStatus(claimId, status, comments = '') {
    // Simulate API call to GoHighLevel
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, this would update the opportunity pipeline stage
        const claimIndex = allMockClaims.findIndex(c => c.id === claimId);
        if (claimIndex !== -1) {
          allMockClaims[claimIndex].status = status;
          allMockClaims[claimIndex].updatedAt = new Date().toISOString();
          allMockClaims[claimIndex].lastEditedBy = 'Operador (Cambio de estado)';
          if (comments) {
            allMockClaims[claimIndex].comments = comments;
          }
        }
        
        // Also update in mockClaims if it exists there
        const userClaimIndex = mockClaims.findIndex(c => c.id === claimId);
        if (userClaimIndex !== -1) {
          mockClaims[userClaimIndex].status = status;
          mockClaims[userClaimIndex].updatedAt = new Date().toISOString();
          mockClaims[userClaimIndex].lastEditedBy = 'Operador (Cambio de estado)';
          if (comments) {
            mockClaims[userClaimIndex].comments = comments;
          }
        }
        
        resolve({ success: true });
      }, 500);
    });
  },

  async getClaimDocuments(claimId) {
    // Simulate API call to GoHighLevel
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockDocuments[claimId] || {});
      }, 500);
    });
  },

  async uploadDocument(claimId, documentType, file) {
    // Simulate file upload to GoHighLevel
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, this would:
        // 1. Upload file to GoHighLevel file storage
        // 2. Update the corresponding custom field
        // 3. Set document status to 'under-review'
        if (!mockDocuments[claimId]) {
          mockDocuments[claimId] = {};
        }
        if (!mockDocuments[claimId][documentType]) {
          mockDocuments[claimId][documentType] = { files: [] };
        }
        mockDocuments[claimId][documentType].files.push({
          name: file.name,
          url: URL.createObjectURL(file),
          uploadedAt: new Date().toISOString()
        });
        mockDocuments[claimId][documentType].status = 'under-review';
        
        // Update document count on the claim
        const claimIndex = allMockClaims.findIndex(c => c.id === claimId);
        if (claimIndex !== -1) {
          const currentCount = allMockClaims[claimIndex].documentsCount || 0;
          allMockClaims[claimIndex].documentsCount = currentCount + 1;
          allMockClaims[claimIndex].lastEditedBy = 'Cliente (Subida de documento)';
          allMockClaims[claimIndex].updatedAt = new Date().toISOString();
        }
        
        resolve({ success: true });
      }, 2000);
    });
  },

  async updateDocumentStatus(claimId, documentType, status, comments = '') {
    // Simulate API call to GoHighLevel
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, this would update the document review status fields
        if (mockDocuments[claimId] && mockDocuments[claimId][documentType]) {
          mockDocuments[claimId][documentType].status = status;
          if (comments) {
            mockDocuments[claimId][documentType].comments = comments;
          }
          
          // Update the claim's last edited information
          const claimIndex = allMockClaims.findIndex(c => c.id === claimId);
          if (claimIndex !== -1) {
            allMockClaims[claimIndex].lastEditedBy = 'Operador (Revisión de documento)';
            allMockClaims[claimIndex].updatedAt = new Date().toISOString();
            
            // Check if all documents are now approved to update claim status
            if (status === 'approved' && checkAllDocumentsApproved(claimId)) {
              allMockClaims[claimIndex].status = 'verified';
              
              // Also update in mockClaims if it exists there
              const userClaimIndex = mockClaims.findIndex(c => c.id === claimId);
              if (userClaimIndex !== -1) {
                mockClaims[userClaimIndex].status = 'verified';
                mockClaims[userClaimIndex].updatedAt = new Date().toISOString();
                mockClaims[userClaimIndex].lastEditedBy = 'Sistema (Todos los documentos aprobados)';
              }
            }
          }
        }
        resolve({ success: true });
      }, 500);
    });
  }
};