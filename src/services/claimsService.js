// Mock claims service
// In production, this would connect to GoHighLevel API

const mockClaims = [
  {
    id: 'claim-001',
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
    tipoSiniestro: 'accidente',
    tipoReclamo: 'reembolso',
    aseguradora: 'GNP',
    status: 'pending',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    documentsCount: 3
  },
  {
    id: 'claim-002',
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
    tipoSiniestro: 'enfermedad',
    tipoReclamo: 'pago-directo',
    aseguradora: 'AXA',
    status: 'under-review',
    createdAt: '2024-01-10T14:20:00Z',
    updatedAt: '2024-01-12T09:15:00Z',
    documentsCount: 5
  },
  {
    id: 'claim-003',
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
    tipoSiniestro: 'maternidad',
    tipoReclamo: 'carta-garantia',
    aseguradora: 'Qualitas',
    status: 'verified',
    createdAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-14T11:30:00Z',
    documentsCount: 7
  }
];

// Mock admin claims (for admin panel)
const allMockClaims = [
  ...mockClaims,
  {
    id: 'claim-004',
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
    tipoSiniestro: 'accidente',
    tipoReclamo: 'reembolso',
    aseguradora: 'GNP',
    status: 'incomplete',
    createdAt: '2024-01-12T09:15:00Z',
    updatedAt: '2024-01-13T14:20:00Z',
    documentsCount: 2
  },
  {
    id: 'claim-005',
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
    tipoSiniestro: 'enfermedad',
    tipoReclamo: 'pago-directo',
    aseguradora: 'AXA',
    status: 'sent-to-insurer',
    createdAt: '2024-01-05T11:30:00Z',
    updatedAt: '2024-01-16T08:45:00Z',
    documentsCount: 8
  },
  {
    id: 'claim-006',
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
    tipoSiniestro: 'emergencia',
    tipoReclamo: 'carta-garantia',
    aseguradora: 'Qualitas',
    status: 'finalized',
    createdAt: '2024-01-01T13:45:00Z',
    updatedAt: '2024-01-17T16:00:00Z',
    documentsCount: 6
  }
];

const mockDocuments = {
  'claim-001': {
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
    }
  },
  'claim-002': {
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
    identificacionOficial: {
      status: 'under-review',
      files: [
        { name: 'ine_frente_reverso.pdf', url: '#', uploadedAt: '2024-01-11T09:30:00Z' }
      ]
    }
  }
};

// Helper function to generate unique ID
const generateClaimId = () => {
  return 'claim-' + Math.random().toString(36).substr(2, 9);
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
        resolve(allMockClaims);
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
            updatedAt: new Date().toISOString()
          };
          
          // Also update in mockClaims if it exists there
          const userClaimIndex = mockClaims.findIndex(c => c.id === claimId);
          if (userClaimIndex !== -1) {
            mockClaims[userClaimIndex] = {
              ...mockClaims[userClaimIndex],
              ...updateData,
              updatedAt: new Date().toISOString()
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
          if (comments) {
            allMockClaims[claimIndex].comments = comments;
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
        }
        resolve({ success: true });
      }, 500);
    });
  }
};