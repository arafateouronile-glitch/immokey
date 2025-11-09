-- ==========================================
-- Migration vers Architecture SaaS Multi-Tenant
-- Ce script migre le schéma existant vers le SaaS
-- ==========================================

-- Extension pour UUID (si pas déjà fait)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PARTIE 1 : Créer les tables SaaS si elles n'existent pas
-- ==========================================

-- Table: System Roles (si n'existe pas)
CREATE TABLE IF NOT EXISTS system_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: User System Roles (si n'existe pas)
CREATE TABLE IF NOT EXISTS user_system_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
    module TEXT,
    organization_id UUID,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id, module, organization_id)
);

-- Table: Organizations (si n'existe pas)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'TG',
    logo_url TEXT,
    primary_color TEXT,
    secondary_color TEXT,
    subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial')),
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    max_establishments INTEGER DEFAULT 1,
    max_rooms INTEGER DEFAULT 10,
    max_staff_users INTEGER DEFAULT 2,
    features JSONB DEFAULT '{}'::jsonb,
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    is_blocked BOOLEAN DEFAULT false,
    blocked_reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE,
    blocked_by UUID REFERENCES auth.users(id),
    settings JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Organization Members (si n'existe pas)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Table: Access Control (si n'existe pas)
CREATE TABLE IF NOT EXISTS access_control (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_type TEXT NOT NULL CHECK (target_type IN ('user', 'organization', 'module')),
    target_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('block', 'unblock', 'restrict', 'allow')),
    reason TEXT,
    restrictions JSONB DEFAULT '{}'::jsonb,
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_until TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Table: Audit Logs (si n'existe pas)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id UUID,
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    changes JSONB,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PARTIE 2 : Migrer hospitality_establishments
-- ==========================================

-- Étape 1 : Ajouter la colonne organization_id si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hospitality_establishments' 
        AND column_name = 'organization_id'
    ) THEN
        -- Ajouter la colonne organization_id (nullable temporairement)
        ALTER TABLE hospitality_establishments 
        ADD COLUMN organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
        
        -- Ajouter un index pour la performance
        CREATE INDEX IF NOT EXISTS idx_hospitality_establishments_org 
        ON hospitality_establishments(organization_id);
    END IF;
END $$;

-- Étape 2 : Créer une organisation par défaut pour chaque utilisateur existant
-- et associer leurs établissements à cette organisation
DO $$
DECLARE
    user_record RECORD;
    org_id UUID;
BEGIN
    -- Pour chaque utilisateur qui a des établissements
    FOR user_record IN 
        SELECT DISTINCT user_id 
        FROM hospitality_establishments 
        WHERE organization_id IS NULL
    LOOP
        -- Créer une organisation pour cet utilisateur
        INSERT INTO organizations (
            name,
            slug,
            description,
            owner_id,
            subscription_plan,
            subscription_status
        )
        VALUES (
            'Organisation de ' || (SELECT email FROM auth.users WHERE id = user_record.user_id LIMIT 1),
            'org-' || SUBSTRING(user_record.user_id::TEXT, 1, 8),
            'Organisation créée automatiquement lors de la migration',
            user_record.user_id,
            'free',
            'active'
        )
        ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
        RETURNING id INTO org_id;
        
        -- Si l'organisation existe déjà, récupérer son ID
        IF org_id IS NULL THEN
            SELECT id INTO org_id 
            FROM organizations 
            WHERE owner_id = user_record.user_id 
            LIMIT 1;
        END IF;
        
        -- Associer les établissements à cette organisation
        UPDATE hospitality_establishments
        SET organization_id = org_id
        WHERE user_id = user_record.user_id
        AND organization_id IS NULL;
        
        -- Créer le membre owner dans organization_members
        INSERT INTO organization_members (
            organization_id,
            user_id,
            role,
            joined_at,
            is_active
        )
        VALUES (
            org_id,
            user_record.user_id,
            'owner',
            NOW(),
            true
        )
        ON CONFLICT (organization_id, user_id) DO NOTHING;
    END LOOP;
END $$;

-- Étape 3 : Rendre organization_id NOT NULL maintenant que tous les établissements ont une organisation
DO $$ 
BEGIN
    -- Vérifier s'il y a encore des établissements sans organisation
    IF NOT EXISTS (
        SELECT 1 FROM hospitality_establishments WHERE organization_id IS NULL
    ) THEN
        -- Rendre la colonne NOT NULL
        ALTER TABLE hospitality_establishments 
        ALTER COLUMN organization_id SET NOT NULL;
    ELSE
        RAISE NOTICE 'Attention: Il reste des établissements sans organisation. Vérifiez les données.';
    END IF;
END $$;

-- Étape 4 : Supprimer la colonne user_id si elle existe (remplacée par organization_id)
-- ATTENTION: Ne supprimez user_id que si vous êtes sûr que tous les établissements ont été migrés
-- Décommentez cette ligne seulement après vérification :
-- ALTER TABLE hospitality_establishments DROP COLUMN IF EXISTS user_id;

-- ==========================================
-- PARTIE 3 : Insérer les rôles système de base
-- ==========================================

INSERT INTO system_roles (name, display_name, description, permissions) VALUES
    ('super_admin', 'Super Administrateur', 'Accès complet à tous les modules et organisations', 
     '{"all_modules": true, "manage_users": true, "manage_organizations": true, "view_audit_logs": true}'::jsonb),
    ('admin', 'Administrateur', 'Administrateur d''une organisation', 
     '{"manage_organization": true, "manage_staff": true, "manage_establishments": true}'::jsonb),
    ('staff', 'Personnel', 'Personnel d''une organisation', 
     '{"view_establishments": true, "manage_bookings": true, "view_reports": true}'::jsonb),
    ('user', 'Utilisateur', 'Utilisateur standard', 
     '{"view_own_data": true}'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- ==========================================
-- PARTIE 4 : Créer les fonctions et triggers nécessaires
-- ==========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at pour les nouvelles tables
DROP TRIGGER IF EXISTS update_organizations_updated_at ON organizations;
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_organization_members_updated_at ON organization_members;
CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement le rôle owner
CREATE OR REPLACE FUNCTION create_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO organization_members (organization_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW())
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_organization_created ON organizations;
CREATE TRIGGER on_organization_created
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION create_organization_owner();

-- Fonction pour logger les actions dans audit_logs
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
BEGIN
    current_user_id := auth.uid();
    
    IF TG_OP = 'UPDATE' AND (OLD.is_blocked IS DISTINCT FROM NEW.is_blocked) THEN
        INSERT INTO audit_logs (
            action_type,
            resource_type,
            resource_id,
            user_id,
            changes,
            organization_id
        ) VALUES (
            CASE WHEN NEW.is_blocked THEN 'block' ELSE 'unblock' END,
            'organization',
            NEW.id,
            current_user_id,
            jsonb_build_object(
                'old', jsonb_build_object('is_blocked', OLD.is_blocked),
                'new', jsonb_build_object('is_blocked', NEW.is_blocked, 'blocked_reason', NEW.blocked_reason)
            ),
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_organization_changes ON organizations;
CREATE TRIGGER audit_organization_changes
    AFTER UPDATE ON organizations
    FOR EACH ROW
    WHEN (OLD.is_blocked IS DISTINCT FROM NEW.is_blocked)
    EXECUTE FUNCTION log_audit_event();

-- ==========================================
-- PARTIE 5 : Créer les index pour performance
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_user_system_roles_user_id ON user_system_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_system_roles_role_id ON user_system_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_system_roles_module ON user_system_roles(module);
CREATE INDEX IF NOT EXISTS idx_user_system_roles_organization ON user_system_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_system_roles_active ON user_system_roles(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_organizations_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_organizations_owner ON organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_organizations_subscription ON organizations(subscription_status);

CREATE INDEX IF NOT EXISTS idx_organization_members_org ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_active ON organization_members(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_hospitality_establishments_org ON hospitality_establishments(organization_id);

CREATE INDEX IF NOT EXISTS idx_access_control_target ON access_control(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_access_control_active ON access_control(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ==========================================
-- PARTIE 6 : Fonction helper pour éviter la récursion RLS
-- ==========================================

-- Créer une fonction SECURITY DEFINER pour vérifier si un utilisateur est super admin
-- Cette fonction s'exécute avec les privilèges du propriétaire, contournant RLS
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Vérifier si l'utilisateur a le rôle super_admin
    -- Cette requête s'exécute sans RLS car la fonction est SECURITY DEFINER
    SELECT EXISTS (
        SELECT 1
        FROM user_system_roles usr
        JOIN system_roles sr ON sr.id = usr.role_id
        WHERE usr.user_id = user_uuid
        AND usr.is_active = true
        AND usr.module = 'all'
        AND sr.name = 'super_admin'
    ) INTO is_admin;
    
    RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==========================================
-- PARTIE 7 : Configurer Row Level Security (RLS)
-- ==========================================

-- Activer RLS sur les nouvelles tables
ALTER TABLE system_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_system_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- S'assurer que RLS est activé sur hospitality_establishments
ALTER TABLE hospitality_establishments ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes policies qui utilisaient user_id
DROP POLICY IF EXISTS "Users can view establishments of their organizations" ON hospitality_establishments;
DROP POLICY IF EXISTS "Organization members can manage establishments" ON hospitality_establishments;
DROP POLICY IF EXISTS "Users can manage own establishments" ON hospitality_establishments;

-- Créer les nouvelles policies basées sur organization_id
CREATE POLICY "Users can view establishments of their organizations" ON hospitality_establishments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = hospitality_establishments.organization_id
            AND om.user_id = auth.uid()
            AND om.is_active = true
        )
        OR is_super_admin(auth.uid())
    );

CREATE POLICY "Organization members can manage establishments" ON hospitality_establishments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = hospitality_establishments.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin', 'manager')
            AND om.is_active = true
        )
    );

-- Policies pour system_roles
DROP POLICY IF EXISTS "Anyone can view system roles" ON system_roles;
CREATE POLICY "Anyone can view system roles" ON system_roles
    FOR SELECT USING (true);

-- Policies pour user_system_roles
DROP POLICY IF EXISTS "Users can view own roles" ON user_system_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_system_roles;

-- Policy simple : les utilisateurs peuvent voir leurs propres rôles
CREATE POLICY "Users can view own roles" ON user_system_roles
    FOR SELECT USING (auth.uid() = user_id);

-- Policy pour super admins : utilise la fonction helper pour éviter la récursion
CREATE POLICY "Super admins can manage all roles" ON user_system_roles
    FOR ALL USING (is_super_admin(auth.uid()));

-- Policies pour organizations
DROP POLICY IF EXISTS "Users can view active organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can view their organization" ON organizations;
DROP POLICY IF EXISTS "Organization members can view their organization" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;

CREATE POLICY "Users can view active organizations" ON organizations
    FOR SELECT USING (status = 'active' AND is_blocked = false);

CREATE POLICY "Organization owners can view their organization" ON organizations
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Organization members can view their organization" ON organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organizations.id
            AND om.user_id = auth.uid()
            AND om.is_active = true
        )
    );

CREATE POLICY "Organization owners can update their organization" ON organizations
    FOR UPDATE USING (owner_id = auth.uid());

CREATE POLICY "Super admins can manage all organizations" ON organizations
    FOR ALL USING (is_super_admin(auth.uid()));

-- Policies pour organization_members
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON organization_members;

CREATE POLICY "Users can view members of their organizations" ON organization_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.is_active = true
        )
    );

CREATE POLICY "Organization admins can manage members" ON organization_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role IN ('owner', 'admin')
            AND om.is_active = true
        )
    );

-- Policies pour access_control
DROP POLICY IF EXISTS "Super admins can manage access control" ON access_control;
CREATE POLICY "Super admins can manage access control" ON access_control
    FOR ALL USING (is_super_admin(auth.uid()));

-- Policies pour audit_logs
DROP POLICY IF EXISTS "Super admins can view audit logs" ON audit_logs;
CREATE POLICY "Super admins can view audit logs" ON audit_logs
    FOR SELECT USING (is_super_admin(auth.uid()));

-- ==========================================
-- FIN DE LA MIGRATION
-- ==========================================

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE 'Migration terminée avec succès!';
    RAISE NOTICE 'Vérification des établissements sans organisation:';
    
    IF EXISTS (SELECT 1 FROM hospitality_establishments WHERE organization_id IS NULL) THEN
        RAISE WARNING 'ATTENTION: Il reste % établissements sans organisation', 
            (SELECT COUNT(*) FROM hospitality_establishments WHERE organization_id IS NULL);
    ELSE
        RAISE NOTICE '✓ Tous les établissements ont une organisation';
    END IF;
END $$;

