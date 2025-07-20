// ... (código anterior sin cambios)

async createClaim(claimData) {
  try {
    console.log('Creating claim with data:', claimData);
    
    // Asegurar que tenemos un contact_id válido
    let contactId = claimData.contactId;
    if (!contactId) {
      const { data: { user } } = await supabase.auth.getUser();
      contactId = user?.id || 'demo-user-' + Math.floor(Math.random() * 1000);
    }

    // IMPORTANTE: Remover cualquier intento de asignar ID manualmente
    const { id, ...dataWithoutId } = claimData;

    const formattedData = {
      contact_id: contactId,
      first_name: dataWithoutId.firstName || '',
      last_name: dataWithoutId.lastName || '',
      email: dataWithoutId.email || '',
      phone: dataWithoutId.phone || '',
      relacion_asegurado: dataWithoutId.relacionAsegurado || '',
      nombre_asegurado: dataWithoutId.nombreAsegurado || '',
      email_asegurado: dataWithoutId.emailAsegurado || '',
      numero_poliza: dataWithoutId.numeroPoliza || '',
      digito_verificador: dataWithoutId.digitoVerificador || '',
      aseguradora: dataWithoutId.aseguradora || '',
      tipo_siniestro: dataWithoutId.tipoSiniestro || '',
      tipo_reclamo: dataWithoutId.tipoReclamo || '',
      tipo_servicio_reembolso: Array.isArray(dataWithoutId.servicios) ? dataWithoutId.servicios.join(',') : (dataWithoutId.tipoServicioReembolso || ''),
      tipo_servicio_programacion: Array.isArray(dataWithoutId.servicios) ? dataWithoutId.servicios.join(',') : (dataWithoutId.tipoServicioProgramacion || ''),
      es_cirugia_especializada: dataWithoutId.esCirugiaEspecializada || false,
      descripcion_siniestro: dataWithoutId.descripcionSiniestro || '',
      fecha_siniestro: dataWithoutId.fechaSiniestro || null,
      numero_reclamo: dataWithoutId.numeroReclamo || '',
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
    
    return {
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
  } catch (error) {
    console.error('Error creating claim:', error);
    throw error;
  }
}

// ... (resto del código sin cambios)