// GoHighLevel API Service
// This service handles all interactions with the GoHighLevel API

const GHL_API_BASE = process.env.REACT_APP_GHL_API_BASE || 'https://rest.gohighlevel.com/v1';
const GHL_API_KEY = process.env.REACT_APP_GHL_API_KEY;

class GHLService {
  constructor() {
    this.apiKey = GHL_API_KEY;
    this.baseURL = GHL_API_BASE;
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      if (!response.ok) {
        throw new Error(`GHL API Error: ${response.status} ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('GHL API Request failed:', error);
      throw error;
    }
  }

  // Contact Methods
  async getContact(contactId) {
    return this.makeRequest(`/contacts/${contactId}`);
  }

  async updateContact(contactId, data) {
    return this.makeRequest(`/contacts/${contactId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getContactCustomFields(contactId) {
    const contact = await this.getContact(contactId);
    return contact.customFields || {};
  }

  async updateContactCustomField(contactId, fieldKey, value) {
    return this.makeRequest(`/contacts/${contactId}/customFields`, {
      method: 'POST',
      body: JSON.stringify({ key: fieldKey, value: value })
    });
  }

  // Opportunity Methods
  async getOpportunity(opportunityId) {
    return this.makeRequest(`/opportunities/${opportunityId}`);
  }

  async updateOpportunity(opportunityId, data) {
    return this.makeRequest(`/opportunities/${opportunityId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getOpportunityCustomFields(opportunityId) {
    const opportunity = await this.getOpportunity(opportunityId);
    return opportunity.customFields || {};
  }

  async updateOpportunityCustomField(opportunityId, fieldKey, value) {
    return this.makeRequest(`/opportunities/${opportunityId}/customFields`, {
      method: 'POST',
      body: JSON.stringify({ key: fieldKey, value: value })
    });
  }

  async updateOpportunityStage(opportunityId, stageId) {
    return this.updateOpportunity(opportunityId, { pipelineStageId: stageId });
  }

  // File Upload Methods
  async uploadFile(file, folderId = null) {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    return this.makeRequest('/files', {
      method: 'POST',
      body: formData,
      headers: {
        // Remove Content-Type to let browser set it with boundary
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  // Magic Link Validation
  async validateMagicLink(token) {
    // This would typically involve decoding a JWT token or validating against GHL
    // For now, we'll simulate the validation
    try {
      // In production, you'd verify the token signature and extract contact info
      const decodedToken = this.decodeToken(token);
      const contact = await this.getContact(decodedToken.contactId);
      return {
        contactId: contact.id,
        email: contact.email,
        firstName: contact.firstName,
        lastName: contact.lastName,
        phone: contact.phone
      };
    } catch (error) {
      throw new Error('Invalid or expired magic link');
    }
  }

  decodeToken(token) {
    // Simplified token decoding - in production use proper JWT library
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error('Token expired');
      }
      return payload;
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  // Pipeline and Stage Management
  async getPipelines() {
    return this.makeRequest('/pipelines');
  }

  async getPipelineStages(pipelineId) {
    return this.makeRequest(`/pipelines/${pipelineId}/stages`);
  }

  // Claim-specific methods that map to GHL fields
  async getClaimData(contactId, opportunityId) {
    const [contact, opportunity] = await Promise.all([
      this.getContact(contactId),
      this.getOpportunity(opportunityId)
    ]);

    return {
      // Contact fields
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      phone: contact.phone,

      // Opportunity custom fields
      relacionAsegurado: opportunity.customFields?.relacion_con_el_asegurado,
      nombreAsegurado: opportunity.customFields?.nombre_completo_del_asegurado,
      emailAsegurado: opportunity.customFields?.email_del_asegurado,
      numeroPoliza: opportunity.customFields?.numero_de_poliza,
      tipoSiniestro: opportunity.customFields?.tipo_de_siniestro,
      tipoReclamo: opportunity.customFields?.tipo_de_reclamo,
      digitoVerificador: opportunity.customFields?.digito_verificador,
      aseguradora: opportunity.customFields?.aseguradora,

      // Document fields
      avisoAccidente: opportunity.customFields?.aviso_de_accidente_o_enfermedad,
      informeMedico: opportunity.customFields?.informe_medico,
      formatoReembolso: opportunity.customFields?.formato_de_reembolso,
      recetasMedicas: opportunity.customFields?.recetas_medicas__disponibles,
      estudiosLaboratorio: opportunity.customFields?.estudios_de_laboratorio_e_imagenologia__disponibilidad,

      // Document review fields
      informeMedicoRevision: opportunity.customFields?.informe_medico__revision,
      informeMedicoComentarios: opportunity.customFields?.informe_medico__comentarios,

      // Status
      status: this.mapPipelineStageToStatus(opportunity.pipelineStageId),
      pipelineStageId: opportunity.pipelineStageId
    };
  }

  async updateClaimDocument(opportunityId, documentType, fileUrl, status = 'under-review') {
    const updates = {};
    updates[documentType] = fileUrl;
    updates[`${documentType}__revision`] = status;
    return this.updateOpportunityCustomField(opportunityId, updates);
  }

  async updateDocumentReview(opportunityId, documentType, status, comments = '') {
    const updates = {};
    updates[`${documentType}__revision`] = status;
    if (comments) {
      updates[`${documentType}__comentarios`] = comments;
    }
    return this.updateOpportunityCustomField(opportunityId, updates);
  }

  mapPipelineStageToStatus(stageId) {
    // This mapping would be configured based on your GHL pipeline setup
    const stageMapping = {
      'stage-1': 'pending',         // Documentación Recibida
      'stage-2': 'incomplete',      // Documentación Incompleta
      'stage-3': 'verified',        // Documentación Verificada
      'stage-4': 'sent-to-insurer', // Enviado a la Aseguradora
      'stage-5': 'finalized'        // Reclamo Finalizado
    };
    return stageMapping[stageId] || 'pending';
  }

  mapStatusToPipelineStage(status) {
    const statusMapping = {
      'pending': 'stage-1',
      'incomplete': 'stage-2',
      'verified': 'stage-3',
      'sent-to-insurer': 'stage-4',
      'finalized': 'stage-5'
    };
    return statusMapping[status] || 'stage-1';
  }
}

export const ghlService = new GHLService();