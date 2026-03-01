-- ===================================
-- ORANGE Platform — Vault Schema
-- Supabase PostgreSQL with RLS
-- ===================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    storage_path TEXT NOT NULL,
    service_origin TEXT NOT NULL CHECK (service_origin IN ('ocr', 'translate', 'audiobook', 'vault')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_user_id ON public.documents(user_id);
CREATE INDEX idx_documents_service_origin ON public.documents(service_origin);
CREATE INDEX idx_documents_created_at ON public.documents(created_at DESC);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ===================================
-- ROW LEVEL SECURITY
-- Each user can only access their own documents.
-- ===================================

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Select: users see only their own documents
CREATE POLICY "Users can view own documents"
    ON public.documents FOR SELECT
    USING (auth.uid() = user_id);

-- Insert: users can only create documents for themselves
CREATE POLICY "Users can create own documents"
    ON public.documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Update: users can only update their own documents
CREATE POLICY "Users can update own documents"
    ON public.documents FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Delete: users can only delete their own documents
CREATE POLICY "Users can delete own documents"
    ON public.documents FOR DELETE
    USING (auth.uid() = user_id);

-- ===================================
-- Storage Bucket
-- ===================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'orange-vault',
    'orange-vault',
    false,
    52428800,  -- 50MB
    ARRAY[
        'image/jpeg', 'image/png', 'image/tiff', 'image/bmp', 'image/webp',
        'application/pdf',
        'audio/mpeg', 'audio/wav', 'audio/ogg',
        'text/plain', 'application/json'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Storage RLS
CREATE POLICY "Users can upload to own folder"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'orange-vault'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can read own files"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'orange-vault'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can delete own files"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'orange-vault'
        AND (storage.foldername(name))[1] = auth.uid()::text
    );