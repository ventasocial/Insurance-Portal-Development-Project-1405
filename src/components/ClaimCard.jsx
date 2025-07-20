// ... (código anterior sin cambios)

const formatClaimNumber = (id) => {
  if (!id) return '';
  // Para UUID, tomar solo los primeros 8 caracteres
  const uuidPart = id.split('-')[0];
  return uuidPart.toUpperCase();
};

// ... (resto del código sin cambios)