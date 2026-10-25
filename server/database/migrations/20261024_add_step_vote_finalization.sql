
-- TripTogether : finalisation des votes
-- Migration à exécuter ultérieurement

ALTER TABLE step
  ADD COLUMN vote_status
    ENUM('pending', 'validated', 'rejected', 'no_decision')
    NULL DEFAULT NULL,

  ADD COLUMN vote_finalized_at
    DATETIME NULL DEFAULT NULL,

  ADD COLUMN final_yes_votes
    INT UNSIGNED NULL DEFAULT NULL,

  ADD COLUMN final_no_votes
    INT UNSIGNED NULL DEFAULT NULL;

-- =====================================================
-- INITIALISATION DES DESTINATIONS EXISTANTES
-- =====================================================
-- Initialiser les propositions non finalisées.
-- Les destinations principales restent inchangées.
-- Les propositions arrivées à échéance seront finalisées
-- par le service backend après son activation.

UPDATE step
SET vote_status = 'pending'
WHERE is_initial = 0
  AND vote_status IS NULL
  AND vote_finalized_at IS NULL;