-- Script de vérification de l'installation ImmoKey
-- Exécutez ce script pour vérifier que tout est bien installé

-- ==========================================
-- VÉRIFICATION 1 : Tables
-- ==========================================

SELECT '✓ TABLES' as check_type;
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name IN ('user_profiles', 'listings', 'listing_images', 'favorites', 'inquiries')
ORDER BY table_name;

-- Devrait afficher 5 tables avec leurs nombres de colonnes

-- ==========================================
-- VÉRIFICATION 2 : Politiques RLS
-- ==========================================

SELECT '✓ RLS POLICIES' as check_type;
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Devrait afficher les tables avec leurs politiques

-- ==========================================
-- VÉRIFICATION 3 : Triggers
-- ==========================================

SELECT '✓ TRIGGERS' as check_type;
SELECT 
    trigger_name,
    event_object_table as table_name
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- Devrait afficher les triggers créés

-- ==========================================
-- VÉRIFICATION 4 : Indexes
-- ==========================================

SELECT '✓ INDEXES' as check_type;
SELECT 
    tablename,
    COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'listings', 'listing_images', 'favorites', 'inquiries')
GROUP BY tablename
ORDER BY tablename;

-- Devrait afficher les tables avec leurs index

-- ==========================================
-- VÉRIFICATION 5 : Fonctions
-- ==========================================

SELECT '✓ FUNCTIONS' as check_type;
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Devrait afficher les fonctions créées

-- ==========================================
-- RÉSUMÉ
-- ==========================================

SELECT '✓ INSTALLATION SUMMARY' as check_type;
SELECT 
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name IN ('user_profiles', 'listings', 'listing_images', 'favorites', 'inquiries')) as tables_created,
    (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as rls_policies_created,
    (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public') as triggers_created,
    (SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema = 'public' AND routine_name IN ('update_updated_at_column', 'handle_new_user')) as functions_created;

-- Devrait afficher : tables=5, policies=15, triggers=3, functions=2







