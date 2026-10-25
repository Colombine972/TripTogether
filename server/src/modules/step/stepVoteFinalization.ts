/* =========================================================
   TRIPTOGETHER — FINALISATION DES VOTES

   Règles :
   - Aucun vote : no_decision
   - Majorité de Oui : validated
   - Majorité de Non ou égalité : rejected

   La clôture est contrôlée séparément.
========================================================= */

export type FinalVoteStatus = "validated" | "rejected" | "no_decision";

export const calculateFinalVoteStatus = (
  yesVotes: number,
  noVotes: number,
): FinalVoteStatus => {
  if (
    !Number.isInteger(yesVotes) ||
    !Number.isInteger(noVotes) ||
    yesVotes < 0 ||
    noVotes < 0
  ) {
    throw new Error("Nombre de votes invalide");
  }

  const totalVotes = yesVotes + noVotes;

  if (totalVotes === 0) {
    return "no_decision";
  }

  if (yesVotes > noVotes) {
    return "validated";
  }

  return "rejected";
};
