-- Table pour stocker les messages de contact
-- Exécuter ce script dans Supabase SQL Editor

-- ==========================================
-- PARTIE 1 : Création de la table
-- ==========================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
    replied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PARTIE 2 : Index
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ==========================================
-- PARTIE 3 : Trigger pour updated_at
-- ==========================================

CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- PARTIE 4 : Row Level Security (RLS)
-- ==========================================

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les policies existantes avant de les recréer
DROP POLICY IF EXISTS "Service role can manage all messages" ON contact_messages;
DROP POLICY IF EXISTS "Anyone can insert messages" ON contact_messages;

-- Policy : Service role (backend) peut tout gérer
-- Note : Les admins utiliseront le service_role_key via le backend pour gérer les messages
CREATE POLICY "Service role can manage all messages"
    ON contact_messages
    FOR ALL
    USING (auth.jwt() ->> 'role' = 'service_role');

-- Policy : N'importe qui peut insérer un message (même non authentifié)
-- Cela permet aux visiteurs du site de nous contacter sans créer de compte
CREATE POLICY "Anyone can insert messages"
    ON contact_messages
    FOR INSERT
    WITH CHECK (true);

-- ==========================================
-- PARTIE 5 : Fonction pour notifier les admins
-- ==========================================

CREATE OR REPLACE FUNCTION notify_admin_new_contact_message()
RETURNS TRIGGER AS $$
BEGIN
    -- TODO: Intégrer avec Edge Function pour envoyer une notification
    -- aux admins lorsqu'un nouveau message est reçu
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour notifier les admins
CREATE TRIGGER on_new_contact_message
    AFTER INSERT ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_admin_new_contact_message();


