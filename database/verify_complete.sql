-- Vérification complète y compris le trigger auth.users

-- Vérifier les 3 triggers (2 public + 1 auth)
SELECT 'ALL TRIGGERS' as check_type;
SELECT 
    trigger_schema || '.' || event_object_table as location,
    trigger_name
FROM information_schema.triggers
WHERE (trigger_schema = 'public' OR trigger_schema = 'auth')
  AND trigger_name IN (
    'update_user_profiles_updated_at',
    'update_listings_updated_at', 
    'on_auth_user_created'
  )
ORDER BY trigger_schema, trigger_name;

-- Devrait afficher 3 lignes







