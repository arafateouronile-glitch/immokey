-- ==========================================
-- Correction de la récursion infinie dans les policies RLS
-- pour organization_members
-- ==========================================

-- Le problème : La policy "Users can view members of their organizations" 
-- vérifie si l'utilisateur est membre en interrogeant organization_members,
-- ce qui crée une boucle infinie.

-- Solution : Utiliser une fonction SECURITY DEFINER pour éviter la récursion

-- ==========================================
-- PARTIE 1 : Créer des fonctions helper pour vérifier l'appartenance
-- ==========================================

-- Fonction pour vérifier si un utilisateur est membre actif d'une organisation
CREATE OR REPLACE FUNCTION is_organization_member(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_member BOOLEAN;
BEGIN
    -- Vérifier si l'utilisateur est membre actif de l'organisation
    -- SECURITY DEFINER permet de contourner RLS
    SELECT EXISTS (
        SELECT 1
        FROM organization_members om
        WHERE om.organization_id = org_uuid
        AND om.user_id = user_uuid
        AND om.is_active = true
    ) INTO is_member;
    
    RETURN COALESCE(is_member, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Fonction pour vérifier si un utilisateur a un rôle spécifique dans une organisation
CREATE OR REPLACE FUNCTION has_organization_role(user_uuid UUID, org_uuid UUID, required_roles TEXT[])
RETURNS BOOLEAN AS $$
DECLARE
    has_role BOOLEAN;
BEGIN
    -- Vérifier si l'utilisateur a un des rôles requis dans l'organisation
    -- SECURITY DEFINER permet de contourner RLS
    SELECT EXISTS (
        SELECT 1
        FROM organization_members om
        WHERE om.organization_id = org_uuid
        AND om.user_id = user_uuid
        AND om.role = ANY(required_roles)
        AND om.is_active = true
    ) INTO has_role;
    
    RETURN COALESCE(has_role, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==========================================
-- PARTIE 2 : Corriger les policies pour organization_members
-- ==========================================

-- Supprimer les anciennes policies qui causent la récursion
DROP POLICY IF EXISTS "Users can view members of their organizations" ON organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Organization owners can add themselves" ON organization_members;

-- Policy pour permettre aux utilisateurs de voir les membres de leurs organisations
-- Utilise la fonction SECURITY DEFINER pour éviter la récursion
CREATE POLICY "Users can view members of their organizations" ON organization_members
    FOR SELECT 
    USING (is_organization_member(auth.uid(), organization_id));

-- Policy pour permettre aux admins d'organisation de gérer les membres
-- Utilise la fonction helper pour éviter la récursion
CREATE POLICY "Organization admins can manage members" ON organization_members
    FOR ALL 
    USING (
        has_organization_role(auth.uid(), organization_id, ARRAY['owner', 'admin'])
        OR is_super_admin(auth.uid())
    );

-- Policy pour permettre aux propriétaires d'organisation de s'ajouter comme membre
CREATE POLICY "Organization owners can add themselves" ON organization_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM organizations o
            WHERE o.id = organization_id
            AND o.owner_id = auth.uid()
        )
        OR is_super_admin(auth.uid())
    );

-- ==========================================
-- PARTIE 3 : Corriger les policies pour hospitality_establishments
-- ==========================================

-- Supprimer et recréer les policies qui utilisent organization_members
DROP POLICY IF EXISTS "Users can view establishments of their organizations" ON hospitality_establishments;
DROP POLICY IF EXISTS "Organization members can manage establishments" ON hospitality_establishments;

-- Policy pour voir les établissements de leurs organisations
CREATE POLICY "Users can view establishments of their organizations" ON hospitality_establishments
    FOR SELECT 
    USING (
        is_organization_member(auth.uid(), organization_id)
        OR is_super_admin(auth.uid())
    );

-- Policy pour gérer les établissements
-- Utilise la fonction helper pour éviter la récursion
CREATE POLICY "Organization members can manage establishments" ON hospitality_establishments
    FOR ALL 
    USING (
        has_organization_role(auth.uid(), organization_id, ARRAY['owner', 'admin', 'manager'])
        OR is_super_admin(auth.uid())
    );

-- ==========================================
-- PARTIE 4 : Corriger les policies pour organizations
-- ==========================================

-- Supprimer toutes les anciennes policies qui utilisent organization_members
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organization" ON organizations;
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;

-- Policy pour voir les organisations
CREATE POLICY "Users can view their organizations" ON organizations
    FOR SELECT 
    USING (
        owner_id = auth.uid()
        OR is_organization_member(auth.uid(), id)
        OR is_super_admin(auth.uid())
    );

-- Policy pour mettre à jour les organisations
CREATE POLICY "Organization owners can update their organization" ON organizations
    FOR UPDATE 
    USING (owner_id = auth.uid() OR is_super_admin(auth.uid()));

-- Policy pour les super admins
CREATE POLICY "Super admins can manage all organizations" ON organizations
    FOR ALL 
    USING (is_super_admin(auth.uid()));

-- ==========================================
-- PARTIE 5 : Vérification
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✓ Policies RLS corrigées pour organization_members';
    RAISE NOTICE '✓ Fonction is_organization_member() créée avec SECURITY DEFINER';
    RAISE NOTICE '✓ Toutes les policies utilisent maintenant la fonction helper';
END $$;

