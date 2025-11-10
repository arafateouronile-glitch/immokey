-- Créer le bucket pour les documents de gestion locative
INSERT INTO storage.buckets (id, name, public)
VALUES ('rental-documents', 'rental-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Supprimer toutes les politiques existantes associées à ce bucket
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname ILIKE 'rental_documents%'
  LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.policyname || '" ON storage.objects';
  END LOOP;
END $$;

-- Politique : les propriétaires peuvent consulter leurs documents
CREATE POLICY "rental_documents_owner_select"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'rental-documents'
  AND auth.role() = 'authenticated'
);

-- Politique : les utilisateurs authentifiés peuvent téléverser leurs documents
CREATE POLICY "rental_documents_owner_insert"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'rental-documents'
  AND auth.role() = 'authenticated'
);

-- Politique : les utilisateurs peuvent mettre à jour leurs fichiers
CREATE POLICY "rental_documents_owner_update"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'rental-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'rental-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique : les utilisateurs peuvent supprimer leurs fichiers
CREATE POLICY "rental_documents_owner_delete"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'rental-documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
