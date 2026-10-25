import { finalizePendingStepVotes } from "./stepVoteFinalizationService";

/* =====================================================
   TRIPTOGETHER — PLANIFICATION DES VOTES

   Vérification toutes les heures.
   Désactivée par défaut.
===================================================== */

const CHECK_INTERVAL_MS = 60 * 60 * 1000;

let isRunning = false;

const checkVoteFinalizations = async (): Promise<void> => {
  // Éviter deux vérifications simultanées
  // dans le même processus.
  if (isRunning) return;

  isRunning = true;

  try {
    const result = await finalizePendingStepVotes();

    console.log(
      `[VoteScheduler] ${result.checked} destination(s) vérifiée(s), ` +
        `${result.finalized} finalisée(s).`,
    );
  } catch (error) {
    console.error("[VoteScheduler] Erreur de finalisation :", error);
  } finally {
    isRunning = false;
  }
};

export const startStepVoteScheduler = (): void => {
  // La tâche reste inactive tant qu'elle
  // n'est pas explicitement autorisée.
  if (process.env.ENABLE_VOTE_FINALIZATION !== "true") {
    console.log("[VoteScheduler] Désactivé.");
    return;
  }

  console.log("[VoteScheduler] Activé — vérification toutes les heures.");

  // Rattraper les finalisations manquées au démarrage.
  void checkVoteFinalizations();

  // Vérifier régulièrement les nouveaux scrutins clos.
  setInterval(() => {
    void checkVoteFinalizations();
  }, CHECK_INTERVAL_MS);
};
