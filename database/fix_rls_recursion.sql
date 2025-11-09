-- ==========================================
-- Correction de la récursion infinie dans les policies RLS
-- ==========================================

-- Le problème : La policy "Super admins can manage all roles" vérifie 
-- si l'utilisateur est super admin en interrogeant user_system_roles,
-- ce qui crée une boucle infinie.

-- Solution : Utiliser une fonction SECURITY DEFINER pour éviter la récursion

-- ==========================================
-- PARTIE 1 : Créer une fonction helper pour vérifier super admin
-- ==========================================

CREATE OR REPLACE FUNCTION is_super_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_admin BOOLEAN;
BEGIN
    -- Vérifier si l'utilisateur a le rôle super_admin
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

-- ==========================================
-- PARTIE 2 : Corriger les policies pour user_system_roles
-- ==========================================

-- Supprimer les anciennes policies qui causent la récursion
DROP POLICY IF EXISTS "Users can view own roles" ON user_system_roles;
DROP POLICY IF EXISTS "Super admins can manage all roles" ON user_system_roles;

-- Policy pour permettre aux utilisateurs de voir leurs propres rôles
-- (sans vérifier s'ils sont super admin pour éviter la récursion)
CREATE POLICY "Users can view own roles" ON user_system_roles
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Policy pour permettre aux super admins de gérer tous les rôles
-- Utilise la fonction SECURITY DEFINER pour éviter la récursion
CREATE POLICY "Super admins can manage all roles" ON user_system_roles
    FOR ALL 
    USING (is_super_admin(auth.uid()));

-- ==========================================
-- PARTIE 3 : Corriger les autres policies qui utilisent user_system_roles
-- ==========================================

-- Supprimer et recréer les policies pour organizations
DROP POLICY IF EXISTS "Super admins can manage all organizations" ON organizations;
CREATE POLICY "Super admins can manage all organizations" ON organizations
    FOR ALL 
    USING (is_super_admin(auth.uid()));

-- Supprimer et recréer les policies pour access_control
DROP POLICY IF EXISTS "Super admins can manage access control" ON access_control;
CREATE POLICY "Super admins can manage access control" ON access_control
    FOR ALL 
    USING (is_super_admin(auth.uid()));

-- Supprimer et recréer les policies pour audit_logs
DROP POLICY IF EXISTS "Super admins can view audit logs" ON audit_logs;
CREATE POLICY "Super admins can view audit logs" ON audit_logs
    FOR SELECT 
    USING (is_super_admin(auth.uid()));

-- Supprimer et recréer les policies pour hospitality_establishments
DROP POLICY IF EXISTS "Users can view establishments of their organizations" ON hospitality_establishments;
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

-- ==========================================
-- PARTIE 4 : Vérification
-- ==========================================

DO $$
BEGIN
    RAISE NOTICE '✓ Policies RLS corrigées pour éviter la récursion infinie';
    RAISE NOTICE '✓ Fonction is_super_admin() créée avec SECURITY DEFINER';
    RAISE NOTICE '✓ Toutes les policies utilisent maintenant la fonction helper';
END $$;







