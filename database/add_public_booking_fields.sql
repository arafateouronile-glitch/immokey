-- Ajouter les champs nécessaires pour la réservation publique
-- Exécutez ce script dans Supabase SQL Editor

-- Ajouter le champ slug pour les URLs publiques
ALTER TABLE hospitality_establishments 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Ajouter les champs de personnalisation
ALTER TABLE hospitality_establishments 
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#3B82F6',
ADD COLUMN IF NOT EXISTS secondary_color TEXT DEFAULT '#1E40AF',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS public_booking_enabled BOOLEAN DEFAULT true;

-- Créer un index pour le slug pour des recherches rapides
CREATE INDEX IF NOT EXISTS idx_hospitality_establishments_slug ON hospitality_establishments(slug) WHERE slug IS NOT NULL;

-- Générer des slugs pour les établissements existants qui n'en ont pas
UPDATE hospitality_establishments 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || SUBSTRING(id::TEXT, 1, 8)
WHERE slug IS NULL OR slug = '';

-- Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(establishment_name TEXT, establishment_id UUID)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
BEGIN
    -- Générer le slug de base
    base_slug := LOWER(REGEXP_REPLACE(establishment_name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    -- Si le slug existe déjà, ajouter un suffixe
    final_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM hospitality_establishments WHERE slug = final_slug AND id != establishment_id) LOOP
        counter := counter + 1;
        final_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement un slug lors de la création
CREATE OR REPLACE FUNCTION set_establishment_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_unique_slug(NEW.name, NEW.id);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_establishment_slug ON hospitality_establishments;
CREATE TRIGGER trigger_set_establishment_slug
    BEFORE INSERT OR UPDATE ON hospitality_establishments
    FOR EACH ROW
    WHEN (NEW.slug IS NULL OR NEW.slug = '')
    EXECUTE FUNCTION set_establishment_slug();

-- Policy pour permettre l'accès public en lecture aux établissements actifs avec réservation publique activée
DROP POLICY IF EXISTS "Public can view establishments with public booking enabled" ON hospitality_establishments;
CREATE POLICY "Public can view establishments with public booking enabled" 
ON hospitality_establishments
FOR SELECT 
USING (status = 'active' AND public_booking_enabled = true);

-- Policy pour permettre l'accès public en lecture aux chambres actives des établissements publics
DROP POLICY IF EXISTS "Public can view active rooms of public establishments" ON hospitality_rooms;
CREATE POLICY "Public can view active rooms of public establishments" 
ON hospitality_rooms
FOR SELECT 
USING (
    status = 'active' 
    AND EXISTS (
        SELECT 1 FROM hospitality_establishments 
        WHERE id = hospitality_rooms.establishment_id 
        AND status = 'active' 
        AND public_booking_enabled = true
    )
);

