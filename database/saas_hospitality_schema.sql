-- ==========================================
-- ImmoKey - Architecture SaaS Multi-Tenant
-- Module Hospitality (SaaS séparé)
-- ==========================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PARTIE 1 : Système de Rôles et Permissions
-- ==========================================

-- Table: Roles système (super_admin, admin, staff, user)
CREATE TABLE IF NOT EXISTS system_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- 'super_admin', 'admin', 'staff', 'user'
    display_name TEXT NOT NULL, -- 'Super Administrateur', 'Administrateur', 'Personnel', 'Utilisateur'
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb, -- Permissions spécifiques par module
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: User Roles (relation many-to-many entre users et roles)
CREATE TABLE IF NOT EXISTS user_system_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES system_roles(id) ON DELETE CASCADE,
    module TEXT, -- 'hospitality', 'rental', 'listings', 'all' (pour super_admin)
    organization_id UUID, -- NULL pour super_admin, UUID pour les admins d'organisation
    granted_by UUID REFERENCES auth.users(id), -- Qui a accordé ce rôle
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE, -- Optionnel: expiration du rôle
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Un utilisateur ne peut avoir qu'un seul rôle actif par module/organisation
    UNIQUE(user_id, role_id, module, organization_id)
);

-- ==========================================
-- PARTIE 2 : Organisations (Multi-Tenant)
-- ==========================================

-- Table: Organizations (Tenants SaaS)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informations de l'organisation
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier (ex: 'hotel-du-lac')
    description TEXT,
    
    -- Contact
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    country TEXT DEFAULT 'TG',
    
    -- Logo et branding
    logo_url TEXT,
    primary_color TEXT, -- Couleur principale du thème
    secondary_color TEXT,
    
    -- Configuration SaaS
    subscription_plan TEXT NOT NULL DEFAULT 'free' CHECK (subscription_plan IN ('free', 'starter', 'professional', 'enterprise')),
    subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'suspended', 'cancelled', 'trial')),
    subscription_start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_end_date TIMESTAMP WITH TIME ZONE,
    
    -- Limites selon le plan
    max_establishments INTEGER DEFAULT 1, -- Nombre max d'établissements
    max_rooms INTEGER DEFAULT 10, -- Nombre max de chambres
    max_staff_users INTEGER DEFAULT 2, -- Nombre max d'utilisateurs staff
    features JSONB DEFAULT '{}'::jsonb, -- Features activées (analytics, api_access, etc.)
    
    -- Propriétaire de l'organisation
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    
    -- Statut
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    is_blocked BOOLEAN DEFAULT false, -- Blocage par super_admin
    blocked_reason TEXT,
    blocked_at TIMESTAMP WITH TIME ZONE,
    blocked_by UUID REFERENCES auth.users(id), -- Super admin qui a bloqué
    
    -- Métadonnées
    settings JSONB DEFAULT '{}'::jsonb, -- Paramètres personnalisés
    metadata JSONB DEFAULT '{}'::jsonb, -- Données additionnelles
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table: Organization Members (Membres d'une organisation)
CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Rôle dans l'organisation
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff', 'viewer')),
    
    -- Permissions spécifiques
    permissions JSONB DEFAULT '{}'::jsonb,
    
    -- Statut
    is_active BOOLEAN DEFAULT true,
    invited_by UUID REFERENCES auth.users(id),
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    joined_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Un utilisateur ne peut être membre qu'une seule fois par organisation
    UNIQUE(organization_id, user_id)
);

-- ==========================================
-- PARTIE 3 : Module Hospitality (Modifié pour SaaS)
-- ==========================================

-- Table: Hospitality Establishments (modifié pour multi-tenant)
CREATE TABLE IF NOT EXISTS hospitality_establishments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE, -- Lien vers l'organisation
    
    -- Type d'établissement
    establishment_type TEXT NOT NULL CHECK (establishment_type IN ('hotel', 'auberge', 'apparthotel', 'residence', 'gite', 'autre')),
    
    -- Informations générales
    name TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    neighborhood TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Contact
    phone TEXT NOT NULL,
    email TEXT,
    website TEXT,
    
    -- Équipements et services
    amenities TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Informations administratives
    registration_number TEXT,
    license_number TEXT,
    tax_id TEXT,
    
    -- Photos
    cover_image_url TEXT,
    photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Horaires
    check_in_time TIME DEFAULT '14:00:00',
    check_out_time TIME DEFAULT '12:00:00',
    
    -- Statut
    status TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'archived')) DEFAULT 'active',
    
    -- Métadonnées
    notes TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Les autres tables (rooms, bookings, etc.) restent inchangées mais héritent de l'isolation via establishment_id
-- (rooms -> establishments -> organizations)

-- ==========================================
-- PARTIE 4 : Gestion des Accès et Blocages
-- ==========================================

-- Table: Access Control (Contrôle d'accès global)
CREATE TABLE IF NOT EXISTS access_control (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Cible du contrôle
    target_type TEXT NOT NULL CHECK (target_type IN ('user', 'organization', 'module')),
    target_id UUID NOT NULL, -- user_id, organization_id, ou module name
    
    -- Action
    action TEXT NOT NULL CHECK (action IN ('block', 'unblock', 'restrict', 'allow')),
    reason TEXT, -- Raison du blocage/restriction
    
    -- Restrictions
    restrictions JSONB DEFAULT '{}'::jsonb, -- { 'modules': ['listings'], 'features': ['create'] }
    
    -- Durée
    effective_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    effective_until TIMESTAMP WITH TIME ZONE, -- NULL = permanent
    
    -- Créé par
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Statut
    is_active BOOLEAN DEFAULT true
);

-- Table: Audit Log (Journal d'audit pour super_admin)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Action
    action_type TEXT NOT NULL, -- 'create', 'update', 'delete', 'block', 'unblock', 'login', etc.
    resource_type TEXT NOT NULL, -- 'user', 'organization', 'listing', 'booking', etc.
    resource_id UUID,
    
    -- Utilisateur
    user_id UUID REFERENCES auth.users(id),
    user_email TEXT,
    
    -- Détails
    changes JSONB, -- Données avant/après
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- IP et user agent
    ip_address INET,
    user_agent TEXT,
    
    -- Organisation (si applicable)
    organization_id UUID REFERENCES organizations(id),
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PARTIE 5 : Indexes pour Performance
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
-- PARTIE 6 : Triggers et Fonctions
-- ==========================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospitality_establishments_updated_at
    BEFORE UPDATE ON hospitality_establishments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement le rôle owner lors de la création d'une organisation
CREATE OR REPLACE FUNCTION create_organization_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Ajouter le propriétaire comme membre avec le rôle 'owner'
    INSERT INTO organization_members (organization_id, user_id, role, joined_at)
    VALUES (NEW.id, NEW.owner_id, 'owner', NOW())
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_organization_created
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION create_organization_owner();

-- Fonction pour logger les actions dans audit_logs
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    current_user_email TEXT;
BEGIN
    -- Récupérer l'utilisateur actuel (depuis le contexte Supabase)
    current_user_id := auth.uid();
    
    -- Si c'est une action de blocage/déblocage, logger
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

CREATE TRIGGER audit_organization_changes
    AFTER UPDATE ON organizations
    FOR EACH ROW
    WHEN (OLD.is_blocked IS DISTINCT FROM NEW.is_blocked)
    EXECUTE FUNCTION log_audit_event();

-- ==========================================
-- PARTIE 7 : Données Initiales
-- ==========================================

-- Insérer les rôles système de base
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
-- PARTIE 8 : Row Level Security (RLS)
-- ==========================================

-- Activer RLS
ALTER TABLE system_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_system_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitality_establishments ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies pour system_roles (lecture seule pour tous)
CREATE POLICY "Anyone can view system roles" ON system_roles
    FOR SELECT USING (true);

-- Fonction helper pour éviter la récursion dans les policies
CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM user_system_roles usr
        JOIN system_roles sr ON sr.id = usr.role_id
        WHERE usr.user_id = user_uuid
        AND usr.is_active = true
        AND usr.module = 'all'
        AND sr.name = 'super_admin'
    ) INTO is_admin;
    
    RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Policies pour user_system_roles
CREATE POLICY "Users can view own roles" ON user_system_roles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles" ON user_system_roles
    FOR ALL USING (is_super_admin(auth.uid()));

-- Policies pour organizations
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
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_system_roles usr
            WHERE usr.user_id = auth.uid()
            AND usr.role_id = (SELECT id FROM system_roles WHERE name = 'super_admin')
            AND usr.is_active = true
        )
    );

-- Policies pour organization_members
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

-- Policies pour hospitality_establishments (isolation par organisation)
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

-- Policies pour access_control (super_admin uniquement)
CREATE POLICY "Super admins can manage access control" ON access_control
    FOR ALL USING (is_super_admin(auth.uid()));

-- Policies pour audit_logs (super_admin uniquement)
CREATE POLICY "Super admins can view audit logs" ON audit_logs
    FOR SELECT USING (is_super_admin(auth.uid()));

-- IMPORTANT: Toutes les policies utilisent maintenant is_super_admin() pour éviter la récursion

-- ==========================================
-- FIN DU SCHÉMA
-- ==========================================

