import supabase from '../lib/supabase';

const CLAIMS_TABLE = 'claims_fortex_xyz123';
const DOCUMENTS_TABLE = 'documents_fortex_xyz123';
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

  // ... otros métodos existentes ...

  // Funciones de documentos actualizadas
  async getClaimDocuments(claimId) {
    try {
      const { data, error } = await supabase
        .from(DOCUMENTS_TABLE)
        .select('*')
        .eq('claim_id', claimId);

      if (error) throw error;

      // Organizar documentos por tipo
      const documents = {};
      data.forEach(doc => {
        if (!documents[doc.document_type]) {
          documents[doc.document_type] = {
            status: doc.status,
            comments: doc.comments,
            files: []
          };
        }
        documents[doc.document_type].files.push({
          id: doc.id,
          name: doc.file_name,
          url: doc.file_url,
          size: doc.file_size,
          uploadedAt: doc.uploaded_at
        });
      });

      return documents;
    } catch (error) {
      console.error('Error fetching documents:', error);
      return {};
    }
  },

  async uploadDocument(claimId, documentType, file) {
    try {
      // 1. Subir el archivo al bucket de Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${claimId}/${documentType}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Obtener la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      // 3. Registrar el documento en la base de datos
      const { data: docData, error: docError } = await supabase
        .from(DOCUMENTS_TABLE)
        .insert({
          claim_id: claimId,
          document_type: documentType,
          file_name: file.name,
          file_url: publicUrl,
          file_size: file.size,
          mime_type: file.type,
          status: 'pending'
        })
        .select()
        .single();

      if (docError) throw docError;

      // 4. Actualizar el contador de documentos en el reclamo
      await this.updateDocumentCount(claimId);

      return docData;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  async updateDocumentStatus(claimId, documentType, status, comments) {
    try {
      const { data, error } = await supabase
        .from(DOCUMENTS_TABLE)
        .update({
          status,
          comments,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'Sistema'
        })
        .eq('claim_id', claimId)
        .eq('document_type', documentType)
        .select();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating document status:', error);
      throw error;
    }
  },

  async updateDocumentCount(claimId) {
    try {
      // Contar documentos del reclamo
      const { count, error: countError } = await supabase
        .from(DOCUMENTS_TABLE)
        .select('*', { count: 'exact' })
        .eq('claim_id', claimId);

      if (countError) throw countError;

      // Actualizar el contador en el reclamo
      const { error: updateError } = await supabase
        .from(CLAIMS_TABLE)
        .update({ documents_count: count })
        .eq('id', claimId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error updating document count:', error);
    }
  },

  async deleteDocument(documentId) {
    try {
      const { data: doc, error: fetchError } = await supabase
        .from(DOCUMENTS_TABLE)
        .select('claim_id, file_url')
        .eq('id', documentId)
        .single();

      if (fetchError) throw fetchError;

      // Eliminar el archivo del storage
      const fileUrl = new URL(doc.file_url);
      const filePath = fileUrl.pathname.split('/').slice(-3).join('/');
      
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([filePath]);

      if (storageError) throw storageError;

      // Eliminar el registro de la base de datos
      const { error: deleteError } = await supabase
        .from(DOCUMENTS_TABLE)
        .delete()
        .eq('id', documentId);

      if (deleteError) throw deleteError;

      // Actualizar el contador de documentos
      await this.updateDocumentCount(doc.claim_id);

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};