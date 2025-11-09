-- ==========================================
-- Script pour lister tous les utilisateurs
-- ==========================================
-- Exécutez ce script pour voir la liste de vos emails disponibles
-- Utilisez ensuite l'un de ces emails dans create_super_admin.sql

SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;







