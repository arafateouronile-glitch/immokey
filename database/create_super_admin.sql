-- ==========================================
-- Script pour créer un super administrateur
-- ==========================================

-- INSTRUCTIONS IMPORTANTES :
-- 1. AVANT D'EXÉCUTER CE SCRIPT, exécutez d'abord : database/list_users.sql
--    pour voir la liste de vos emails disponibles
-- 2. Remplacez 'votre@email.com' ci-dessous par VOTRE EMAIL (celui utilisé pour vous connecter)
-- 3. Exécutez ce script dans Supabase Dashboard > SQL Editor

-- ==========================================
-- Méthode 1 : Par email (RECOMMANDÉ)
-- ==========================================

DO $$
DECLARE
    -- ⚠️ IMPORTANT : Remplacez 'votre@email.com' par votre email réel
    -- Pour trouver votre email, exécutez d'abord : database/list_users.sql
    user_email TEXT := 'arafateouronile@gmail.com'; -- ⚠️ REMPLACEZ PAR VOTRE EMAIL
    user_uuid UUID;
    super_admin_role_id UUID;
    existing_role_id UUID;
BEGIN
    -- Vérifier que l'email n'est pas le placeholder
    IF user_email = 'votre@email.com' THEN
        RAISE EXCEPTION 'ERREUR : Vous devez remplacer "votre@email.com" par votre email réel. Exécutez d''abord database/list_users.sql pour voir vos emails disponibles.';
    END IF;
    
    -- Récupérer l'ID de l'utilisateur par email
    SELECT id INTO user_uuid
    FROM auth.users
    WHERE email = user_email;
    
    IF user_uuid IS NULL THEN
        RAISE EXCEPTION 'Aucun utilisateur trouvé avec l''email: %. Vérifiez que vous avez bien copié votre email depuis database/list_users.sql', user_email;
    END IF;
    
    -- Récupérer l'ID du rôle super_admin
    SELECT id INTO super_admin_role_id
    FROM system_roles
    WHERE name = 'super_admin';
    
    IF super_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Le rôle super_admin n''existe pas. Exécutez d''abord migration_to_saas.sql';
    END IF;
    
    -- Vérifier si le rôle existe déjà
    SELECT id INTO existing_role_id
    FROM user_system_roles
    WHERE user_id = user_uuid
    AND role_id = super_admin_role_id
    AND module = 'all';
    
    IF existing_role_id IS NOT NULL THEN
        -- Activer le rôle s'il existe déjà mais est désactivé
        UPDATE user_system_roles
        SET is_active = true
        WHERE id = existing_role_id;
        
        RAISE NOTICE '✓ Rôle super_admin réactivé pour l''utilisateur %', user_email;
    ELSE
        -- Créer le rôle super_admin
        INSERT INTO user_system_roles (
            user_id,
            role_id,
            module,
            is_active,
            granted_by
        )
        VALUES (
            user_uuid,
            super_admin_role_id,
            'all',
            true,
            user_uuid  -- S'auto-attribuer le rôle
        );
        
        RAISE NOTICE '✓ Rôle super_admin créé avec succès pour l''utilisateur %', user_email;
    END IF;
    
    RAISE NOTICE '✓ Vous pouvez maintenant accéder à /admin';
END $$;

-- ==========================================
-- Méthode 2 : Par ID utilisateur (alternative)
-- ==========================================

-- Si vous connaissez votre user_id (visible dans database/list_users.sql), utilisez cette méthode :
/*
DO $$
DECLARE
    user_uuid UUID := 'VOTRE_USER_ID_ICI'::UUID;  -- ⚠️ REMPLACEZ PAR VOTRE USER_ID (depuis list_users.sql)
    super_admin_role_id UUID;
BEGIN
    -- Récupérer l'ID du rôle super_admin
    SELECT id INTO super_admin_role_id
    FROM system_roles
    WHERE name = 'super_admin';
    
    IF super_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Le rôle super_admin n''existe pas. Exécutez d''abord migration_to_saas.sql';
    END IF;
    
    -- Créer ou activer le rôle
    INSERT INTO user_system_roles (user_id, role_id, module, is_active, granted_by)
    VALUES (user_uuid, super_admin_role_id, 'all', true, user_uuid)
    ON CONFLICT (user_id, role_id, module, organization_id) 
    DO UPDATE SET is_active = true;
    
    RAISE NOTICE '✓ Rôle super_admin créé/activé avec succès pour l''utilisateur ID: %', user_uuid;
END $$;
*/

-- ==========================================
-- Vérification
-- ==========================================

-- Pour vérifier que votre rôle a été créé :
SELECT 
    u.email,
    sr.name as role_name,
    usr.module,
    usr.is_active,
    usr.created_at
FROM auth.users u
JOIN user_system_roles usr ON usr.user_id = u.id
JOIN system_roles sr ON sr.id = usr.role_id
WHERE sr.name = 'super_admin'
ORDER BY usr.created_at DESC;

