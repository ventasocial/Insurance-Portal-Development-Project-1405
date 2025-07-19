-- Create claims table
CREATE TABLE IF NOT EXISTS claims_fortex_xyz123 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  phone TEXT,
  nombre_asegurado TEXT,
  email_asegurado TEXT,
  numero_poliza TEXT,
  digito_verificador TEXT,
  relacion_asegurado TEXT,
  tipo_siniestro TEXT,
  tipo_reclamo TEXT,
  tipo_servicio_reembolso TEXT,
  tipo_servicio_programacion TEXT,
  es_cirugia_especializada BOOLEAN DEFAULT FALSE,
  aseguradora TEXT,
  status TEXT DEFAULT 'pending',
  numero_reclamo TEXT,
  numero_reclamo_aseguradora TEXT,
  descripcion_siniestro TEXT,
  fecha_siniestro DATE,
  documents_count INTEGER DEFAULT 0,
  last_edited_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create claim documents table
CREATE TABLE IF NOT EXISTS claim_documents_fortex_xyz123 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  claim_id UUID REFERENCES claims_fortex_xyz123(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  status TEXT DEFAULT 'pending',
  comments TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by TEXT
);

-- Create saved asegurados table
CREATE TABLE IF NOT EXISTS saved_asegurados_fortex_xyz123 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  email TEXT,
  poliza TEXT NOT NULL,
  digito_verificador TEXT,
  aseguradora TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE claims_fortex_xyz123 ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_documents_fortex_xyz123 ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_asegurados_fortex_xyz123 ENABLE ROW LEVEL SECURITY;

-- RLS Policies for claims
CREATE POLICY "Allow all access to claims" ON claims_fortex_xyz123 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for documents
CREATE POLICY "Allow all access to documents" ON claim_documents_fortex_xyz123 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies for asegurados
CREATE POLICY "Allow all access to asegurados" ON saved_asegurados_fortex_xyz123 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_contact_id ON claims_fortex_xyz123(contact_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims_fortex_xyz123(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims_fortex_xyz123(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_claim_id ON claim_documents_fortex_xyz123(claim_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON claim_documents_fortex_xyz123(document_type);