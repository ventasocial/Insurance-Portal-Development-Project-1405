# Portal de Clientes Fortex Seguros

Portal web para la gestión de reclamos de gastos médicos conectado con GoHighLevel.

## 🚀 Características

### Para Clientes:
- ✅ Acceso mediante magic link enviado desde GHL
- ✅ Visualización de información del reclamo (solo lectura)
- ✅ Formulario dinámico según tipo de siniestro y reclamo
- ✅ Carga de documentos con validación
- ✅ Seguimiento del estado del reclamo
- ✅ Gestión de facturas con metadatos

### Para Administradores:
- ✅ Panel administrativo con tablero Kanban
- ✅ Revisión y aprobación/rechazo de documentos
- ✅ Gestión de estados de reclamos
- ✅ Comentarios en documentos rechazados
- ✅ Vista general de todos los reclamos

## 🛠️ Tecnologías

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Routing**: React Router DOM
- **Drag & Drop**: React Beautiful DND
- **File Upload**: React Dropzone
- **Notifications**: React Hot Toast
- **Icons**: React Icons (Feather)

## 📋 Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Header.jsx
│   ├── ClaimCard.jsx
│   ├── DocumentUploadZone.jsx
│   ├── LoadingSpinner.jsx
│   └── ProtectedRoute.jsx
├── contexts/           # Context providers
│   ├── AuthContext.jsx
│   └── ClaimsContext.jsx
├── pages/             # Páginas principales
│   ├── Login.jsx
│   ├── AdminLogin.jsx
│   ├── ClientDashboard.jsx
│   ├── ClaimForm.jsx
│   ├── DocumentUpload.jsx
│   └── AdminDashboard.jsx
├── services/          # Servicios API
│   ├── authService.js
│   ├── claimsService.js
│   └── ghlService.js
└── common/
    └── SafeIcon.jsx
```

## 🔧 Configuración

### Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
REACT_APP_GHL_API_BASE=https://rest.gohighlevel.com/v1
REACT_APP_GHL_API_KEY=tu_api_key_de_ghl
```

### Instalación

```bash
npm install
npm run dev
```

## 🔗 Integración con GoHighLevel

### Campos Personalizados Requeridos

#### Contact Fields:
- `first_name` - Nombre
- `last_name` - Apellidos  
- `email` - Email
- `phone` - WhatsApp

#### Opportunity Fields:
- `relacion_con_el_asegurado` - Relación con el asegurado
- `nombre_completo_del_asegurado` - Nombre completo del asegurado
- `email_del_asegurado` - Email del asegurado
- `numero_de_poliza` - Número de póliza
- `tipo_de_siniestro` - Tipo de siniestro
- `tipo_de_reclamo` - Tipo de reclamo
- `digito_verificador` - Dígito verificador

#### Document Fields:
- `aviso_de_accidente_o_enfermedad` - Aviso de Accidente/Enfermedad
- `informe_medico` - Informe Médico
- `formato_de_reembolso` - Formato de Reembolso
- `recetas_medicas__disponibles` - Recetas Médicas
- `estudios_de_laboratorio_e_imagenologia__disponibilidad` - Estudios

#### Review Fields:
- `informe_medico__revision` - Estado de revisión
- `informe_medico__comentarios` - Comentarios de revisión

#### Invoice Fields:
- `factura_01`, `factura_02`, etc. - Archivos de facturas
- `factura_01_numero` - Número de factura
- `factura_01_tipo_proveedor` - Tipo de proveedor
- `factura_01_monto` - Monto
- `factura_01_rfc` - RFC del emisor

### Pipeline Stages

El sistema mapea los siguientes estados:

1. **Documentación Recibida** (`pending`)
2. **Documentación Incompleta** (`incomplete`)
3. **Documentación Verificada** (`verified`)
4. **Enviado a la Aseguradora** (`sent-to-insurer`)
5. **Reclamo Finalizado** (`finalized`)

## 🔐 Autenticación

### Magic Links

Los magic links se generan desde GHL y contienen:
- Contact ID
- Opportunity ID
- Timestamp de expiración
- Firma JWT

Ejemplo de URL:
```
https://portal.fortex.com/?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Acceso Administrativo

Credenciales por defecto (cambiar en producción):
- Email: `admin@fortex.com`
- Password: `admin123`

## 📡 Endpoints API Sugeridos

### Backend Express.js + GoHighLevel

```javascript
// Validación de Magic Link
POST /api/auth/validate-magic-link
{
  "token": "jwt_token_here"
}

// Obtener reclamos del usuario
GET /api/claims/user/:contactId

// Obtener todos los reclamos (admin)
GET /api/claims

// Actualizar reclamo
PUT /api/claims/:claimId
{
  "field": "value"
}

// Subir documento
POST /api/claims/:claimId/documents
{
  "documentType": "informe_medico",
  "file": File
}

// Actualizar estado de documento
PUT /api/claims/:claimId/documents/:documentType
{
  "status": "approved|rejected|under-review",
  "comments": "Comentarios opcionales"
}

// Actualizar estado de reclamo
PUT /api/claims/:claimId/status
{
  "status": "pending|incomplete|verified|sent-to-insurer|finalized"
}
```

## 🎨 Personalización

### Colores Fortex
- Primary: `#253C80`
- Secondary: `#1e3a8a`
- Light: `#3b82f6`
- Dark: `#1e40af`

### Logo
URL: `https://images.leadconnectorhq.com/image/f_webp/q_80/r_1200/u_https://assets.cdn.filesafe.space/HWRXLf7lstECUAG07eRw/media/1d4135a0-1810-4dfd-ad67-0a7807f68a53.png`

## 🚀 Despliegue

### Producción
```bash
npm run build
```

Los archivos se generan en `/dist` y pueden desplegarse en cualquier servidor web estático.

### Consideraciones de Seguridad
- Implementar validación JWT robusta
- Configurar CORS apropiadamente
- Usar HTTPS en producción
- Implementar rate limiting
- Validar tipos de archivo en backend
- Sanitizar inputs del usuario

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo de Fortex Seguros.