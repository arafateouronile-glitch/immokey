-- ==========================================
-- CONFIGURATION DES TÂCHES CRON - ImmoKey
-- ==========================================
-- Ce script configure les tâches automatisées (cron jobs) dans Supabase
-- Note : pg_cron doit être activé dans votre projet Supabase (inclus par défaut)

-- ==========================================
-- PARTIE 1 : Activer l'extension pg_cron
-- ==========================================

CREATE EXTENSION IF NOT EXISTS pg_cron;

-- ==========================================
-- PARTIE 2 : Nettoyage des anciennes tâches
-- ==========================================

-- Supprimer toutes les tâches existantes pour éviter les doublons
DO $$
DECLARE
    job_record RECORD;
BEGIN
    FOR job_record IN 
        SELECT jobid 
        FROM cron.job 
        WHERE jobname LIKE 'immokey_%'
    LOOP
        PERFORM cron.unschedule(job_record.jobid);
    END LOOP;
END $$;

-- ==========================================
-- PARTIE 3 : Rappels d'abonnement Hospitality
-- ==========================================

-- Vérifier les trials qui expirent dans 3 jours et envoyer des rappels
-- S'exécute tous les jours à 10h00 UTC
-- NOTE: Cette tâche sera activée plus tard quand l'Edge Function sera déployée
-- SELECT cron.schedule(
--     'immokey_hospitality_trial_reminders',
--     '0 10 * * *', -- Tous les jours à 10h00 UTC
--     $$
--     SELECT net.http_post(
--         url := 'https://VOTRE_PROJET.supabase.co/functions/v1/send-trial-reminder',
--         headers := jsonb_build_object(
--             'Content-Type', 'application/json',
--             'Authorization', 'Bearer VOTRE_SERVICE_KEY'
--         ),
--         body := jsonb_build_object('check_date', now())
--     )
--     $$
-- );

-- Vérifier les abonnements expirés et mettre à jour les statuts
-- S'exécute tous les jours à 01h00 UTC
SELECT cron.schedule(
    'immokey_check_expired_subscriptions',
    '0 1 * * *', -- Tous les jours à 01h00 UTC
    $$
    UPDATE user_profiles
    SET subscription_status = 'expired',
        updated_at = now()
    WHERE subscription_status IN ('active', 'trial')
    AND (
        (subscription_status = 'trial' AND trial_ends_at < now())
        OR
        (subscription_status = 'active' AND subscription_end_date < now())
    )
    $$
);

-- ==========================================
-- PARTIE 4 : Nettoyage des données obsolètes
-- ==========================================

-- Nettoyer les invitations de couple expirées (>30 jours)
-- S'exécute tous les dimanches à 02h00 UTC
SELECT cron.schedule(
    'immokey_cleanup_expired_invitations',
    '0 2 * * 0', -- Tous les dimanches à 02h00 UTC
    $$
    DELETE FROM couple_invitations
    WHERE status = 'pending'
    AND created_at < now() - INTERVAL '30 days'
    $$
);

-- Nettoyer les réservations annulées anciennes (>90 jours)
-- S'exécute le 1er de chaque mois à 03h00 UTC
SELECT cron.schedule(
    'immokey_cleanup_old_cancelled_bookings',
    '0 3 1 * *', -- 1er du mois à 03h00 UTC
    $$
    DELETE FROM hospitality_bookings
    WHERE status = 'cancelled'
    AND created_at < now() - INTERVAL '90 days'
    $$
);

-- Archiver les anciens messages de contact (>180 jours et déjà traités)
-- S'exécute le 1er de chaque mois à 04h00 UTC
SELECT cron.schedule(
    'immokey_archive_old_contact_messages',
    '0 4 1 * *', -- 1er du mois à 04h00 UTC
    $$
    UPDATE contact_messages
    SET status = 'archived',
        updated_at = now()
    WHERE status IN ('read', 'replied')
    AND created_at < now() - INTERVAL '180 days'
    AND status != 'archived'
    $$
);

-- ==========================================
-- PARTIE 5 : Statistiques et rapports
-- ==========================================

-- Calculer et stocker les statistiques quotidiennes
-- S'exécute tous les jours à 00h30 UTC
SELECT cron.schedule(
    'immokey_daily_statistics',
    '30 0 * * *', -- Tous les jours à 00h30 UTC
    $$
    -- Cette fonction doit être créée séparément pour calculer les stats
    -- INSERT INTO daily_statistics (date, metric_type, value, ...)
    -- SELECT now()::date, 'active_users', COUNT(*), ... FROM user_profiles WHERE ...
    SELECT 1; -- Placeholder pour l'instant
    $$
);

-- ==========================================
-- PARTIE 6 : Vérification de santé
-- ==========================================

-- Vérifier l'état de santé des services
-- S'exécute toutes les heures
SELECT cron.schedule(
    'immokey_health_check',
    '0 * * * *', -- Toutes les heures
    $$
    -- Log un heartbeat pour monitoring
    INSERT INTO system_logs (level, message, created_at)
    VALUES ('info', 'Health check completed', now())
    ON CONFLICT DO NOTHING;
    $$
);

-- ==========================================
-- PARTIE 7 : Notifications de paiement
-- ==========================================

-- Vérifier les paiements échoués et envoyer des rappels
-- S'exécute tous les jours à 09h00 UTC
-- NOTE: Cette tâche sera activée plus tard quand l'Edge Function sera déployée
-- SELECT cron.schedule(
--     'immokey_payment_reminders',
--     '0 9 * * *', -- Tous les jours à 09h00 UTC
--     $$
--     SELECT net.http_post(
--         url := 'https://VOTRE_PROJET.supabase.co/functions/v1/send-payment-reminder',
--         headers := jsonb_build_object(
--             'Content-Type', 'application/json',
--             'Authorization', 'Bearer VOTRE_SERVICE_KEY'
--         ),
--         body := jsonb_build_object('check_date', now())
--     )
--     $$
-- );

-- ==========================================
-- PARTIE 8 : Fonction utilitaire pour lister les jobs
-- ==========================================

-- Créer une vue pour faciliter le monitoring des cron jobs
CREATE OR REPLACE VIEW immokey_cron_jobs AS
SELECT 
    jobid,
    schedule,
    command,
    nodename,
    nodeport,
    database,
    username,
    active,
    jobname
FROM cron.job
WHERE jobname LIKE 'immokey_%'
ORDER BY jobname;

-- ==========================================
-- INSTRUCTIONS POST-INSTALLATION
-- ==========================================

-- Pour voir tous les jobs ImmoKey actifs :
-- SELECT * FROM immokey_cron_jobs;

-- Pour voir l'historique d'exécution d'un job :
-- SELECT * FROM cron.job_run_details 
-- WHERE jobid IN (SELECT jobid FROM cron.job WHERE jobname = 'nom_du_job')
-- ORDER BY start_time DESC LIMIT 10;

-- Pour désactiver temporairement un job :
-- SELECT cron.unschedule('nom_du_job');

-- Pour réactiver un job après l'avoir désactivé :
-- Réexécutez la commande cron.schedule correspondante

-- ==========================================
-- NOTES IMPORTANTES
-- ==========================================

-- 1. Les Edge Functions (send-trial-reminder, send-payment-reminder) 
--    doivent être déployées AVANT que ces cron jobs ne s'exécutent

-- 2. Les paramètres suivants doivent être configurés dans Supabase :
--    - app.supabase_url : L'URL de votre projet Supabase
--    - app.supabase_service_key : Votre clé service_role

-- 3. Pour configurer ces paramètres (via Dashboard Supabase > Settings > API) :
--    Ou via SQL :
--    ALTER DATABASE postgres SET app.supabase_url = 'https://votre-projet.supabase.co';
--    ALTER DATABASE postgres SET app.supabase_service_key = 'votre_service_key';

-- 4. Monitoring : Installez Sentry ou un service similaire pour être alerté
--    en cas d'échec des cron jobs

-- 5. Timezone : Tous les horaires sont en UTC. Ajustez selon votre fuseau horaire

-- ==========================================
-- VERIFICATION
-- ==========================================

-- Vérifier que tous les jobs sont créés
DO $$
DECLARE
    job_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO job_count
    FROM cron.job
    WHERE jobname LIKE 'immokey_%';
    
    RAISE NOTICE 'Nombre de jobs ImmoKey créés : %', job_count;
    
    IF job_count < 6 THEN
        RAISE WARNING 'Attention : Moins de 6 jobs trouvés. Vérifiez l''installation.';
    ELSE
        RAISE NOTICE 'Tous les jobs ont été créés avec succès ! (6 jobs de base)';
        RAISE NOTICE 'Note: Les jobs de notification par Edge Function seront activés plus tard.';
    END IF;
END $$;

-- Afficher la liste des jobs créés
SELECT 
    jobname as "Nom du Job",
    schedule as "Planification (Cron)",
    active as "Actif"
FROM cron.job
WHERE jobname LIKE 'immokey_%'
ORDER BY jobname;

