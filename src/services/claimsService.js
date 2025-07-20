import supabase from '../lib/supabase';

const CLAIMS_TABLE = 'claims_fortex_xyz123';
const DOCUMENTS_TABLE = 'documents_fortex_xyz123';
const ASEGURADOS_TABLE = 'saved_asegurados_fortex_xyz123';

export const claimsService = {
  // Obtener reclamos del usuario
  async getUserClaims(userId) {
    try {
      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .select('*')
        .eq('contact_id', userId)
        .neq('status', 'archived')
        .order('created_at', { ascending: false });

      if (error) throw error;

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

  // Obtener todos los reclamos (para admin)
  async getAllClaims() {
    try {
      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

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

      // IMPORTANTE: NO incluir el campo 'id' - dejar que Supabase genere el UUID automáticamente
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
        tipo_servicio_reembolso: Array.isArray(claimData.servicios) ? claimData.servicios.join(',') : (claimData.tipoServicioReembolso || ''),
        tipo_servicio_programacion: Array.isArray(claimData.servicios) ? claimData.servicios.join(',') : (claimData.tipoServicioProgramacion || ''),
        es_cirugia_especializada: claimData.esCirugiaEspecializada || false,
        descripcion_siniestro: claimData.descripcionSiniestro || '',
        fecha_siniestro: claimData.fechaSiniestro || null,
        numero_reclamo: claimData.numeroReclamo || '',
        status: 'pending'
      };

      // Log para debug
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

  // Actualizar un reclamo existente
  async updateClaim(claimId, updates) {
    try {
      // Convertir las claves en formato camelCase a snake_case para Supabase
      const snakeCaseUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        acc[snakeKey] = value;
        return acc;
      }, {});

      // Añadir timestamp de actualización
      snakeCaseUpdates.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from(CLAIMS_TABLE)
        .update(snakeCaseUpdates)
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

  // Actualizar el estado de un reclamo
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

  // Guardar información de un asegurado para reutilizar
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
          aseguradora: aseguradoData.aseguradora,
          relacion_asegurado: aseguradoData.relacionAsegurado
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

  // Obtener asegurados guardados de un usuario
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

  // Eliminar un asegurado guardado
  async deleteAsegurado(aseguradoId) {
    try {
      const { error } = await supabase
        .from(ASEGURADOS_TABLE)
        .delete()
        .eq('id', aseguradoId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting asegurado:', error);
      throw error;
    }
  },

  // Funciones de documentos
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
      console.log('Uploading document:', documentType, 'for claim:', claimId);
      
      // 1. Subir el archivo al bucket de Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${claimId}/${documentType}/${Date.now()}.${fileExt}`;
      
      // Crear un objeto Blob desde el archivo para asegurar compatibilidad
      const blob = new Blob([file], { type: file.type });
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, blob);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw uploadError;
      }

      // 2. Obtener la URL pública del archivo
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      console.log('File uploaded successfully, public URL:', publicUrl);

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

      if (docError) {
        console.error('Document DB insert error:', docError);
        throw docError;
      }

      console.log('Document record created:', docData);

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
      
      console.log(`Updated document count for claim ${claimId} to ${count}`);
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