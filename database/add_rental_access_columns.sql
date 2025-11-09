-- Ajouter les colonnes pour gérer l'accès à la gestion locative
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS rental_access BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS rental_accepted_at TIMESTAMP WITH TIME ZONE;

-- Ajouter un commentaire pour documenter ces colonnes
COMMENT ON COLUMN user_profiles.rental_access IS 'Indique si l''utilisateur a accès à la gestion locative';
COMMENT ON COLUMN user_profiles.rental_accepted_at IS 'Date et heure d''acceptation des conditions de gestion locative';

-- Index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_user_profiles_rental_access 
ON user_profiles(rental_access) 
WHERE rental_access = TRUE;

