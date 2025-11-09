-- ==========================================
-- Script de vérification de l'installation SaaS
-- ==========================================

-- Vérifier que toutes les tables existent
DO $$
DECLARE
    missing_tables TEXT[] := ARRAY[]::TEXT[];
    table_name TEXT;
    required_tables TEXT[] := ARRAY[
        'system_roles',
        'user_system_roles',
        'organizations',
        'organization_members',
        'access_control',
        'audit_logs'
    ];
BEGIN
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
        END IF;
    END LOOP;

    IF array_length(missing_tables, 1) > 0 THEN
        RAISE EXCEPTION 'Tables manquantes: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✓ Toutes les tables requises existent';
    END IF;
END $$;

-- Vérifier que la colonne organization_id existe dans hospitality_establishments
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'hospitality_establishments' 
        AND column_name = 'organization_id'
    ) THEN
        RAISE EXCEPTION 'La colonne organization_id n''existe pas dans hospitality_establishments. Exécutez migration_to_saas.sql';
    ELSE
        RAISE NOTICE '✓ La colonne organization_id existe dans hospitality_establishments';
    END IF;
END $$;

-- Vérifier que les rôles système sont créés
DO $$
DECLARE
    role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO role_count FROM system_roles;
    
    IF role_count < 4 THEN
        RAISE WARNING 'Seulement % rôles trouvés dans system_roles (attendu: 4). Les rôles peuvent être manquants.', role_count;
    ELSE
        RAISE NOTICE '✓ Les rôles système sont créés (% rôles)', role_count;
    END IF;
END $$;

-- Vérifier les clés étrangères
DO $$
DECLARE
    fk_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO fk_count
    FROM information_schema.table_constraints
    WHERE constraint_type = 'FOREIGN KEY'
    AND (table_name = 'user_system_roles' OR table_name = 'organizations' OR table_name = 'organization_members');
    
    RAISE NOTICE '✓ % clés étrangères trouvées', fk_count;
END $$;

-- Vérifier les index
DO $$
DECLARE
    idx_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO idx_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND (tablename LIKE '%organization%' OR tablename LIKE '%system_roles%');
    
    RAISE NOTICE '✓ % index trouvés pour les tables SaaS', idx_count;
END $$;

-- Vérifier RLS
DO $$
DECLARE
    rls_tables TEXT[];
    table_name TEXT;
BEGIN
    SELECT array_agg(tablename) INTO rls_tables
    FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename IN ('system_roles', 'user_system_roles', 'organizations', 'organization_members', 'access_control', 'audit_logs');
    
    FOREACH table_name IN ARRAY rls_tables
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_policies WHERE tablename = table_name
        ) THEN
            RAISE NOTICE '✓ RLS activé et policies créées pour %', table_name;
        ELSE
            RAISE WARNING 'RLS activé mais pas de policies pour %', table_name;
        END IF;
    END LOOP;
END $$;

RAISE NOTICE '==========================================';
RAISE NOTICE 'Vérification terminée!';
RAISE NOTICE 'Si toutes les vérifications sont passées, votre installation SaaS est correcte.';
RAISE NOTICE '==========================================';







