import supabase from '../lib/supabase';

const CLAIMS_TABLE = 'claims_fortex_xyz123';
const DOCUMENTS_TABLE = 'claim_documents_fortex_xyz123';
const ASEGURADOS_TABLE = 'saved_asegurados_fortex_xyz123';

export const claimsService = {
  // Crear un nuevo reclamo
  async createClaim(claimData) {
    try {
      console.log('Creating claim with data:', claimData);
      
      // Asegurar que tenemos un contact_id válido
      let contactId = claimData.contactId;
      if (!contactId) {
        const { data: { user } } = await supabase.auth.getUser();
        contactId = user?.id || 'demo-user-' + Math.floor(Math.random() * 1000);
      }

      // Formatear los datos para Supabase
      const formattedData = {
        contact_id: contactId,
        first_name: claimData.firstName || '',
        last_name: claimData.lastName || '',
        email: claimData.email || '',
        phone: claimData.phone || '',
        relacion_asegurado: claimData.relacionAsegurado || '',
        nombre_asegurado: claimData.nombreAsegurado || '',
        email_asegurado: claimData.emailAsegurado || '',
        numero_poliza: claimData.numeroPoliza || '',
        digito_verificador: claimData.digitoVerificador || '',
        aseguradora: claimData.aseguradora || '',
        tipo_siniestro: claimData.tipoSiniestro || '',
        tipo_reclamo: claimData.tipoReclamo || '',
        tipo_servicio_reembolso: Array.isArray(claimData.servicios) ? claimData.servicios.join(',') : '',
        tipo_servicio_programacion: Array.isArray(claimData.servicios) ? claimData.servicios.join(',') : '',
        es_cirugia_especializada: claimData.esCirugiaEspecializada || false,
        descripcion_siniestro: claimData.descripcionSiniestro || '',
        fecha_siniestro: claimData.fechaSiniestro || null,
        numero_reclamo: claimData.numeroReclamo || '',
        status: 'pending'
      };

      console.log('Formatted data for Supabase:', formattedData);

      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .insert(formattedData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Claim created successfully:', data);
      
      // Formatear la respuesta para que sea compatible con el frontend
      const formattedResponse = {
        id: data.id,
        contactId: data.contact_id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        relacionAsegurado: data.relacion_asegurado,
        nombreAsegurado: data.nombre_asegurado,
        emailAsegurado: data.email_asegurado,
        numeroPoliza: data.numero_poliza,
        digitoVerificador: data.digito_verificador,
        aseguradora: data.aseguradora,
        tipoSiniestro: data.tipo_siniestro,
        tipoReclamo: data.tipo_reclamo,
        tipoServicioReembolso: data.tipo_servicio_reembolso,
        tipoServicioProgramacion: data.tipo_servicio_programacion,
        esCirugiaEspecializada: data.es_cirugia_especializada,
        descripcionSiniestro: data.descripcion_siniestro,
        fechaSiniestro: data.fecha_siniestro,
        numeroReclamo: data.numero_reclamo,
        numeroReclamoAseguradora: data.numero_reclamo_aseguradora,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        documentsCount: data.documents_count || 0
      };

      return formattedResponse;
    } catch (error) {
      console.error('Error creating claim:', error);
      throw new Error('Error al crear el reclamo: ' + (error.message || 'Error desconocido'));
    }
  },

  // Obtener reclamos de un usuario
  async getUserClaims(userId) {
    try {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .select('*')
        .eq('contact_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Formatear los datos para el frontend
      return data.map(claim => ({
        id: claim.id,
        contactId: claim.contact_id,
        firstName: claim.first_name,
        lastName: claim.last_name,
        email: claim.email,
        phone: claim.phone,
        relacionAsegurado: claim.relacion_asegurado,
        nombreAsegurado: claim.nombre_asegurado,
        emailAsegurado: claim.email_asegurado,
        numeroPoliza: claim.numero_poliza,
        digitoVerificador: claim.digito_verificador,
        aseguradora: claim.aseguradora,
        tipoSiniestro: claim.tipo_siniestro,
        tipoReclamo: claim.tipo_reclamo,
        tipoServicioReembolso: claim.tipo_servicio_reembolso,
        tipoServicioProgramacion: claim.tipo_servicio_programacion,
        esCirugiaEspecializada: claim.es_cirugia_especializada,
        descripcionSiniestro: claim.descripcion_siniestro,
        fechaSiniestro: claim.fecha_siniestro,
        numeroReclamo: claim.numero_reclamo,
        numeroReclamoAseguradora: claim.numero_reclamo_aseguradora,
        status: claim.status,
        createdAt: claim.created_at,
        updatedAt: claim.updated_at,
        documentsCount: claim.documents_count || 0,
        lastEditedBy: claim.last_edited_by
      }));
    } catch (error) {
      console.error('Error fetching user claims:', error);
      return [];
    }
  },

  // Obtener todos los reclamos (admin)
  async getAllClaims() {
    try {
      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Formatear los datos para el frontend
      return data.map(claim => ({
        id: claim.id,
        contactId: claim.contact_id,
        firstName: claim.first_name,
        lastName: claim.last_name,
        email: claim.email,
        phone: claim.phone,
        relacionAsegurado: claim.relacion_asegurado,
        nombreAsegurado: claim.nombre_asegurado,
        emailAsegurado: claim.email_asegurado,
        numeroPoliza: claim.numero_poliza,
        digitoVerificador: claim.digito_verificador,
        aseguradora: claim.aseguradora,
        tipoSiniestro: claim.tipo_siniestro,
        tipoReclamo: claim.tipo_reclamo,
        tipoServicioReembolso: claim.tipo_servicio_reembolso,
        tipoServicioProgramacion: claim.tipo_servicio_programacion,
        esCirugiaEspecializada: claim.es_cirugia_especializada,
        descripcionSiniestro: claim.descripcion_siniestro,
        fechaSiniestro: claim.fecha_siniestro,
        numeroReclamo: claim.numero_reclamo,
        numeroReclamoAseguradora: claim.numero_reclamo_aseguradora,
        status: claim.status,
        createdAt: claim.created_at,
        updatedAt: claim.updated_at,
        documentsCount: claim.documents_count || 0,
        lastEditedBy: claim.last_edited_by
      }));
    } catch (error) {
      console.error('Error fetching all claims:', error);
      return [];
    }
  },

  // Actualizar un reclamo
  async updateClaim(claimId, updateData) {
    try {
      // Convertir campos del frontend al formato de la base de datos
      const dbUpdateData = {};
      
      if (updateData.firstName) dbUpdateData.first_name = updateData.firstName;
      if (updateData.lastName) dbUpdateData.last_name = updateData.lastName;
      if (updateData.email) dbUpdateData.email = updateData.email;
      if (updateData.phone) dbUpdateData.phone = updateData.phone;
      if (updateData.relacionAsegurado) dbUpdateData.relacion_asegurado = updateData.relacionAsegurado;
      if (updateData.nombreAsegurado) dbUpdateData.nombre_asegurado = updateData.nombreAsegurado;
      if (updateData.emailAsegurado) dbUpdateData.email_asegurado = updateData.emailAsegurado;
      if (updateData.numeroPoliza) dbUpdateData.numero_poliza = updateData.numeroPoliza;
      if (updateData.digitoVerificador) dbUpdateData.digito_verificador = updateData.digitoVerificador;
      if (updateData.aseguradora) dbUpdateData.aseguradora = updateData.aseguradora;
      if (updateData.numeroReclamoAseguradora) dbUpdateData.numero_reclamo_aseguradora = updateData.numeroReclamoAseguradora;
      if (updateData.numeroReclamo) dbUpdateData.numero_reclamo = updateData.numeroReclamo;
      
      // Siempre actualizar el timestamp
      dbUpdateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .update(dbUpdateData)
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating claim:', error);
      throw error;
    }
  },

  // Actualizar estado del reclamo
  async updateClaimStatus(claimId, status, comments = '') {
    try {
      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .update({ 
          status,
          updated_at: new Date().toISOString(),
          last_edited_by: 'Sistema'
        })
        .eq('id', claimId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating claim status:', error);
      throw error;
    }
  },

  // Guardar información de asegurado
  async saveAsegurado(aseguradoData) {
    try {
      const { data, error } = await supabase
        .from(ASEGURADOS_TABLE)
        .insert({
          user_id: aseguradoData.user_id,
          nombre: aseguradoData.nombre,
          email: aseguradoData.email,
          poliza: aseguradoData.poliza,
          digito_verificador: aseguradoData.digitoVerificador,
          aseguradora: aseguradoData.aseguradora
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving asegurado:', error);
      throw error;
    }
  },

  // Obtener asegurados guardados
  async getSavedAsegurados(userId) {
    try {
      const { data, error } = await supabase
        .from(ASEGURADOS_TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching saved asegurados:', error);
      return [];
    }
  },

  // Eliminar asegurado
  async deleteAsegurado(aseguradoId) {
    try {
      const { error } = await supabase
        .from(ASEGURADOS_TABLE)
        .delete()
        .eq('id', aseguradoId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting asegurado:', error);
      throw error;
    }
  },

  // Funciones de documentos (mock por ahora)
  async getClaimDocuments(claimId) {
    // Mock implementation - retorna estructura vacía
    return {};
  },

  async uploadDocument(claimId, documentType, file) {
    // Mock implementation
    console.log('Mock upload document:', { claimId, documentType, fileName: file.name });
    return { success: true };
  },

  async updateDocumentStatus(claimId, documentType, status, comments) {
    // Mock implementation
    console.log('Mock update document status:', { claimId, documentType, status, comments });
    return { success: true };
  }
};