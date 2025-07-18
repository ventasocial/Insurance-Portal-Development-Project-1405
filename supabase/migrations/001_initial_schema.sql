-- Create claims table
CREATE TABLE IF NOT EXISTS claims_fortex (
    id TEXT PRIMARY KEY,
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
CREATE TABLE IF NOT EXISTS claim_documents_fortex (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    claim_id TEXT REFERENCES claims_fortex(id) ON DELETE CASCADE,
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

-- Enable RLS
ALTER TABLE claims_fortex ENABLE ROW LEVEL SECURITY;
ALTER TABLE claim_documents_fortex ENABLE ROW LEVEL SECURITY;

-- RLS Policies for claims_fortex
CREATE POLICY "Users can view own claims" ON claims_fortex
    FOR SELECT USING (auth.uid()::text = contact_id OR auth.jwt() ->> 'role' IN ('admin', 'operator'));

CREATE POLICY "Users can insert own claims" ON claims_fortex
    FOR INSERT WITH CHECK (auth.uid()::text = contact_id);

CREATE POLICY "Users can update own claims" ON claims_fortex
    FOR UPDATE USING (auth.uid()::text = contact_id OR auth.jwt() ->> 'role' IN ('admin', 'operator'));

CREATE POLICY "Admins can manage all claims" ON claims_fortex
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'operator'));

-- RLS Policies for claim_documents_fortex
CREATE POLICY "Users can view own documents" ON claim_documents_fortex
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM claims_fortex 
            WHERE claims_fortex.id = claim_documents_fortex.claim_id 
            AND (claims_fortex.contact_id = auth.uid()::text OR auth.jwt() ->> 'role' IN ('admin', 'operator'))
        )
    );

CREATE POLICY "Users can insert own documents" ON claim_documents_fortex
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM claims_fortex 
            WHERE claims_fortex.id = claim_documents_fortex.claim_id 
            AND claims_fortex.contact_id = auth.uid()::text
        )
    );

CREATE POLICY "Admins can manage all documents" ON claim_documents_fortex
    FOR ALL USING (auth.jwt() ->> 'role' IN ('admin', 'operator'));

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) VALUES ('claim-documents', 'claim-documents', false) ON CONFLICT DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'claim-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Users can view own documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'claim-documents' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage all documents" ON storage.objects
    FOR ALL USING (bucket_id = 'claim-documents' AND auth.jwt() ->> 'role' IN ('admin', 'operator'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_claims_contact_id ON claims_fortex(contact_id);
CREATE INDEX IF NOT EXISTS idx_claims_status ON claims_fortex(status);
CREATE INDEX IF NOT EXISTS idx_claims_created_at ON claims_fortex(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_claim_id ON claim_documents_fortex(claim_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON claim_documents_fortex(document_type);