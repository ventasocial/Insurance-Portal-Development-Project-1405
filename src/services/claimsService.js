import supabase from '../lib/supabase';

// Generate a random 4-character alphanumeric string
const generateClaimCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Helper function to format claim data from Supabase
const formatClaimData = (claim) => {
  if (!claim) return null;
  
  // Generate short ID if it's a UUID
  let claimId = claim.id;
  if (claim.id && claim.id.includes('-') && claim.id.length > 10) {
    // If it's a UUID, create a short readable ID
    claimId = `claim-${generateClaimCode()}`;
  } else if (!claim.id) {
    claimId = `claim-${generateClaimCode()}`;
  }
  
  return {
    id: claimId,
    contactId: claim.contact_id,
    firstName: claim.first_name,
    lastName: claim.last_name,
    email: claim.email,
    phone: claim.phone,
    nombreAsegurado: claim.nombre_asegurado,
    emailAsegurado: claim.email_asegurado,
    numeroPoliza: claim.numero_poliza,
    digitoVerificador: claim.digito_verificador,
    relacionAsegurado: claim.relacion_asegurado,
    tipoSiniestro: claim.tipo_siniestro,
    tipoReclamo: claim.tipo_reclamo,
    tipoServicioReembolso: claim.tipo_servicio_reembolso,
    tipoServicioProgramacion: claim.tipo_servicio_programacion,
    esCirugiaEspecializada: claim.es_cirugia_especializada,
    aseguradora: claim.aseguradora,
    status: claim.status || 'pending',
    createdAt: claim.created_at,
    updatedAt: claim.updated_at,
    lastEditedBy: claim.last_edited_by,
    documentsCount: claim.documents_count || 0,
    numeroReclamo: claim.numero_reclamo,
    numeroReclamoAseguradora: claim.numero_reclamo_aseguradora,
    descripcionSiniestro: claim.descripcion_siniestro,
    fechaSiniestro: claim.fecha_siniestro
  };
};

// Helper function to format data for Supabase
const formatForSupabase = (claimData) => {
  return {
    id: claimData.id || `claim-${generateClaimCode()}`,
    contact_id: claimData.contactId || 'demo-contact-456',
    first_name: claimData.firstName,
    last_name: claimData.lastName,
    email: claimData.email,
    phone: claimData.phone,
    nombre_asegurado: claimData.nombreAsegurado,
    email_asegurado: claimData.emailAsegurado,
    numero_poliza: claimData.numeroPoliza,
    digito_verificador: claimData.digitoVerificador,
    relacion_asegurado: claimData.relacionAsegurado,
    tipo_siniestro: claimData.tipoSiniestro,
    tipo_reclamo: claimData.tipoReclamo,
    tipo_servicio_reembolso: claimData.tipoServicioReembolso,
    tipo_servicio_programacion: claimData.tipoServicioProgramacion,
    es_cirugia_especializada: claimData.esCirugiaEspecializada,
    aseguradora: claimData.aseguradora,
    status: claimData.status || 'pending',
    last_edited_by: claimData.lastEditdBy,
    documents_count: claimData.documentsCount,
    numero_reclamo: claimData.numeroReclamo,
    numero_reclamo_aseguradora: claimData.numeroReclamoAseguradora,
    descripcion_siniestro: claimData.descripcionSiniestro,
    fecha_siniestro: claimData.fechaSiniestro
  };
};

// Demo data for claims
const demoClaims = [
  {
    id: 'claim-ABCD',
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
    documentsCount: 3,
    numeroReclamoAseguradora: 'R-12345'
  },
  {
    id: 'claim-EFGH',
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
    createdAt: '2023-12-15T10:30:00Z',
    updatedAt: '2024-01-05T10:30:00Z',
    lastEditedBy: 'Operador',
    documentsCount: 5,
    numeroReclamoAseguradora: 'R-67890'
  },
  {
    id: 'claim-IJKL',
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
    tipoSiniestro: 'inicial',
    tipoReclamo: 'programacion',
    tipoServicioProgramacion: 'cirugia',
    aseguradora: 'Qualitas',
    status: 'sent-to-insurer',
    createdAt: '2023-11-15T10:30:00Z',
    updatedAt: '2024-01-10T10:30:00Z',
    lastEditedBy: 'Administrador',
    documentsCount: 4,
    numeroReclamoAseguradora: 'R-54321'
  }
];

// Mock documents data
const mockDocuments = {
  'claim-ABCD': {
    avisoAccidente: {
      status: 'approved',
      files: [
        {
          name: 'aviso_accidente.pdf',
          url: '#',
          uploadedAt: '2024-01-15T10:45:00Z'
        }
      ]
    },
    informeMedico: {
      status: 'rejected',
      comments: 'El informe médico no está completo. Falta la firma del médico.',
      files: [
        {
          name: 'informe_medico.pdf',
          url: '#',
          uploadedAt: '2024-01-15T11:00:00Z'
        }
      ]
    },
    formatoReembolso: {
      status: 'under-review',
      files: [
        {
          name: 'formato_reembolso.pdf',
          url: '#',
          uploadedAt: '2024-01-15T11:15:00Z'
        }
      ]
    }
  }
};

export const claimsService = {
  async getUserClaims(contactId) {
    try {
      console.log('Fetching user claims for contact ID:', contactId);
      // Try to fetch from Supabase
      const { data: claims, error } = await supabase
        .from('claims_fortex')
        .select('*')
        .eq('contact_id', contactId);
      
      if (error) {
        console.error('Supabase error fetching user claims:', error);
        throw error;
      }
      
      if (claims && claims.length > 0) {
        console.log(`Found ${claims.length} claims in Supabase`);
        return claims.map(claim => formatClaimData(claim));
      } else {
        console.log('No claims found in Supabase, returning demo data');
        // If no claims found, return demo data
        return demoClaims;
      }
    } catch (error) {
      console.error('Error fetching user claims:', error);
      // Fallback to demo data
      return demoClaims;
    }
  },

  async getAllClaims() {
    try {
      console.log('Fetching all claims');
      const { data: claims, error } = await supabase
        .from('claims_fortex')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Supabase error fetching all claims:', error);
        throw error;
      }
      
      if (claims && claims.length > 0) {
        console.log(`Found ${claims.length} claims in Supabase`);
        return claims.map(claim => formatClaimData(claim));
      } else {
        console.log('No claims found in Supabase, returning demo data');
        // If no claims found, return demo data
        return demoClaims;
      }
    } catch (error) {
      console.error('Error fetching all claims:', error);
      // Fallback to demo data
      return demoClaims;
    }
  },

  async getClaim(claimId) {
    try {
      console.log('Fetching claim with ID:', claimId);
      const { data: claim, error } = await supabase
        .from('claims_fortex')
        .select('*')
        .eq('id', claimId)
        .single();
      
      if (error) {
        console.error('Supabase error fetching claim:', error);
        throw error;
      }
      
      return formatClaimData(claim);
    } catch (error) {
      console.error('Error fetching claim:', error);
      // Fallback to demo claim if ID matches
      const demoClaim = demoClaims.find(c => c.id === claimId);
      if (demoClaim) {
        return demoClaim;
      }
      throw error;
    }
  },

  async createClaim(claimData) {
    try {
      console.log('Creating new claim:', claimData);
      const formattedData = formatForSupabase(claimData);
      
      const { data: newClaim, error } = await supabase
        .from('claims_fortex')
        .insert([formattedData])
        .select()
        .single();
      
      if (error) {
        console.error('Supabase error creating claim:', error);
        throw error;
      }
      
      return formatClaimData(newClaim);
    } catch (error) {
      console.error('Error creating claim:', error);
      // Fallback to create a mock claim
      const newClaim = {
        id: `claim-${generateClaimCode()}`,
        contactId: claimData.contactId || 'demo-contact-456',
        ...claimData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastEditedBy: 'Sistema (Creación)',
        documentsCount: 0
      };
      
      // Add to demo claims
      demoClaims.push(newClaim);
      
      return newClaim;
    }
  },

  async updateClaim(claimId, updateData) {
    try {
      console.log('Updating claim:', claimId, updateData);
      // Format data for Supabase
      const updates = {};
      Object.entries(updateData).forEach(([key, value]) => {
        const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updates[snakeKey] = value;
      });
      
      updates.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('claims_fortex')
        .update(updates)
        .eq('id', claimId);
      
      if (error) {
        console.error('Supabase error updating claim:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating claim:', error);
      
      // Update demo claim if ID matches
      const demoClaimIndex = demoClaims.findIndex(c => c.id === claimId);
      if (demoClaimIndex !== -1) {
        demoClaims[demoClaimIndex] = {
          ...demoClaims[demoClaimIndex],
          ...updateData,
          updatedAt: new Date().toISOString()
        };
      }
      
      return { success: true, demo: true };
    }
  },

  async updateClaimStatus(claimId, status, comments = '') {
    try {
      console.log('Updating claim status:', claimId, status);
      const updates = {
        status,
        updated_at: new Date().toISOString(),
        last_edited_by: 'Operador (Cambio de estado)'
      };
      
      if (comments) {
        updates.comments = comments;
      }
      
      const { error } = await supabase
        .from('claims_fortex')
        .update(updates)
        .eq('id', claimId);
      
      if (error) {
        console.error('Supabase error updating claim status:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating claim status:', error);
      
      // Update demo claim status if ID matches
      const demoClaimIndex = demoClaims.findIndex(c => c.id === claimId);
      if (demoClaimIndex !== -1) {
        demoClaims[demoClaimIndex].status = status;
        demoClaims[demoClaimIndex].updatedAt = new Date().toISOString();
        if (status === 'archived') {
          // Remove from the array if archived
          demoClaims.splice(demoClaimIndex, 1);
        }
      }
      
      return { success: true, demo: true };
    }
  },

  async getClaimDocuments(claimId) {
    try {
      console.log('Fetching documents for claim ID:', claimId);
      const { data: documents, error } = await supabase
        .from('claim_documents_fortex')
        .select('*')
        .eq('claim_id', claimId);
      
      if (error) {
        console.error('Supabase error fetching documents:', error);
        throw error;
      }
      
      if (documents && documents.length > 0) {
        console.log(`Found ${documents.length} documents in Supabase`);
        
        // Format documents into the expected structure
        const formattedDocs = {};
        documents.forEach(doc => {
          if (!formattedDocs[doc.document_type]) {
            formattedDocs[doc.document_type] = {
              status: doc.status || 'pending',
              comments: doc.comments || '',
              files: []
            };
          }
          
          formattedDocs[doc.document_type].files.push({
            name: doc.file_name,
            url: doc.file_url,
            uploadedAt: doc.uploaded_at
          });
        });
        
        return formattedDocs;
      }
      
      // Return mock documents if available
      return mockDocuments[claimId] || {};
    } catch (error) {
      console.error('Error fetching claim documents:', error);
      // Fallback to mock documents
      return mockDocuments[claimId] || {};
    }
  },

  async uploadDocument(claimId, documentType, file) {
    try {
      console.log('Uploading document:', documentType, 'for claim:', claimId);
      
      // In a real implementation, this would upload to Supabase Storage
      // For now, we'll create a simulated URL and document record
      const fileUrl = URL.createObjectURL(file);
      
      const docData = {
        claim_id: claimId,
        document_type: documentType,
        file_name: file.name,
        file_url: fileUrl,
        status: 'under-review',
        uploaded_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('claim_documents_fortex')
        .insert([docData]);
      
      if (error) {
        console.error('Supabase error uploading document:', error);
        throw error;
      }
      
      // Update document count on the claim
      await this.updateClaim(claimId, {
        documentsCount: (await this.getClaimDocuments(claimId)).length || 1,
        lastEditedBy: 'Cliente (Subida de documento)',
        updatedAt: new Date().toISOString()
      });
      
      return { success: true, fileUrl };
    } catch (error) {
      console.error('Error uploading document:', error);
      
      // Update mock documents for demo
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
      
      // Update demo claim document count
      const demoClaimIndex = demoClaims.findIndex(c => c.id === claimId);
      if (demoClaimIndex !== -1) {
        demoClaims[demoClaimIndex].documentsCount = 
          (demoClaims[demoClaimIndex].documentsCount || 0) + 1;
        demoClaims[demoClaimIndex].updatedAt = new Date().toISOString();
      }
      
      return { success: true, demo: true };
    }
  },

  async updateDocumentStatus(claimId, documentType, status, comments = '') {
    try {
      console.log('Updating document status:', claimId, documentType, status);
      
      const updates = {
        status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: 'Operador'
      };
      
      if (comments) {
        updates.comments = comments;
      }
      
      const { error } = await supabase
        .from('claim_documents_fortex')
        .update(updates)
        .eq('claim_id', claimId)
        .eq('document_type', documentType);
      
      if (error) {
        console.error('Supabase error updating document status:', error);
        throw error;
      }
      
      // Update claim last edited info
      await this.updateClaim(claimId, {
        lastEditedBy: 'Operador (Revisión de documento)',
        updatedAt: new Date().toISOString()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Error updating document status:', error);
      
      // Update mock document status
      if (mockDocuments[claimId] && mockDocuments[claimId][documentType]) {
        mockDocuments[claimId][documentType].status = status;
        if (comments) {
          mockDocuments[claimId][documentType].comments = comments;
        }
        
        // Check if all documents are now approved to update claim status
        if (status === 'approved') {
          const docs = mockDocuments[claimId];
          const allApproved = Object.values(docs).every(doc => doc.status === 'approved');
          if (allApproved && Object.keys(docs).length > 0) {
            this.updateClaimStatus(claimId, 'verified');
          }
        }
      }
      
      return { success: true, demo: true };
    }
  }
};