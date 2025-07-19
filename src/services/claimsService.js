import supabase from '../lib/supabase';

const CLAIMS_TABLE = 'claims_fortex_xyz123';
const DOCUMENTS_TABLE = 'claim_documents_fortex_xyz123';
const ASEGURADOS_TABLE = 'saved_asegurados_fortex_xyz123';

// Resto del código se mantiene igual, solo cambiando los nombres de las tablas
export const claimsService = {
  async getUserClaims(contactId) {
    try {
      console.log('Fetching user claims for contact ID:', contactId);
      const { data: claims, error } = await supabase
        .from(CLAIMS_TABLE)
        .select('*')
        .eq('contact_id', contactId);

      if (error) throw error;
      return claims.map(claim => formatClaimData(claim));
    } catch (error) {
      console.error('Error fetching claims:', error);
      return [];
    }
  },

  async createClaim(claimData) {
    try {
      const formattedData = formatForSupabase(claimData);
      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .insert([formattedData])
        .select()
        .single();

      if (error) throw error;
      return formatClaimData(data);
    } catch (error) {
      console.error('Error creating claim:', error);
      throw error;
    }
  },

  async updateClaimStatus(claimId, status, comments = '') {
    try {
      const { error } = await supabase
        .from(CLAIMS_TABLE)
        .update({
          status,
          last_edited_by: 'Operador (Cambio de estado)',
          updated_at: new Date().toISOString()
        })
        .eq('id', claimId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error updating claim status:', error);
      throw error;
    }
  },

  async uploadDocument(claimId, documentType, file) {
    try {
      // Generate unique file name
      const fileName = `${claimId}/${documentType}/${Date.now()}-${file.name}`;
      
      // Upload to Supabase Storage
      const { data: fileData, error: uploadError } = await supabase.storage
        .from('claim-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('claim-documents')
        .getPublicUrl(fileName);

      // Create document record
      const { error: docError } = await supabase
        .from(DOCUMENTS_TABLE)
        .insert([{
          claim_id: claimId,
          document_type: documentType,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          status: 'pending'
        }]);

      if (docError) throw docError;

      // Update document count
      await this.updateClaim(claimId, {
        documents_count: await this.getDocumentsCount(claimId),
        last_edited_by: 'Cliente (Subida de documento)',
        updated_at: new Date().toISOString()
      });

      return { success: true, fileUrl: publicUrl };
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async getDocumentsCount(claimId) {
    const { count, error } = await supabase
      .from(DOCUMENTS_TABLE)
      .select('*', { count: 'exact' })
      .eq('claim_id', claimId);

    if (error) throw error;
    return count || 0;
  },

  async getSavedAsegurados(userId) {
    try {
      const { data, error } = await supabase
        .from(ASEGURADOS_TABLE)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching saved asegurados:', error);
      return [];
    }
  },

  async saveAsegurado(aseguradoData) {
    try {
      const { data, error } = await supabase
        .from(ASEGURADOS_TABLE)
        .insert([{
          user_id: aseguradoData.user_id,
          nombre: aseguradoData.nombre,
          email: aseguradoData.email,
          poliza: aseguradoData.poliza,
          digito_verificador: aseguradoData.digitoVerificador,
          aseguradora: aseguradoData.aseguradora
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving asegurado:', error);
      throw error;
    }
  },

  async deleteAsegurado(aseguradoId) {
    try {
      const { error } = await supabase
        .from(ASEGURADOS_TABLE)
        .delete()
        .eq('id', aseguradoId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error deleting asegurado:', error);
      throw error;
    }
  }
};

// Helper functions
function formatClaimData(claim) {
  if (!claim) return null;
  return {
    id: claim.id,
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
}

function formatForSupabase(claimData) {
  return {
    contact_id: claimData.contactId,
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
    numero_reclamo: claimData.numeroReclamo,
    numero_reclamo_aseguradora: claimData.numeroReclamoAseguradora,
    descripcion_siniestro: claimData.descripcionSiniestro,
    fecha_siniestro: claimData.fechaSiniestro
  };
}