import { useEffect } from "react";
import { useSearchParams } from "react-router";

/* =========================================================
   TYPES DES ONGLETS DU VOYAGE
   ========================================================= */

export type TripTab =
  | "summary"
  | "steps"
  | "participants"
  | "budget";

/* =========================================================
   PARAMÈTRES DU HOOK
   ========================================================= */

type UseNotificationDeepLinkParams = {
  activeTab: TripTab;

  setActiveTab: (
    tab: TripTab,
  ) => void;
};

/* =========================================================
   VÉRIFIER QU'UNE VALEUR EST UN ONGLET VALIDE
   ========================================================= */

const isTripTab = (
  value: string | null,
): value is TripTab => {
  return (
    value === "summary" ||
    value === "steps" ||
    value === "participants" ||
    value === "budget"
  );
};

/* =========================================================
   HOOK
   ========================================================= */

export default function useNotificationDeepLink({
  activeTab,
  setActiveTab,
}: UseNotificationDeepLinkParams) {
  const [searchParams] =
    useSearchParams();

  /* =======================================================
     1. OUVRIR AUTOMATIQUEMENT LE BON ONGLET
     ======================================================= */

  useEffect(() => {
    const tab =
      searchParams.get("tab");

    if (!isTripTab(tab)) {
      return;
    }

    if (tab === activeTab) {
      return;
    }

    setActiveTab(tab);
  }, [
    activeTab,
    searchParams,
    setActiveTab,
  ]);

  /* =======================================================
     2. RECHERCHER L'ÉLÉMENT CIBLÉ
     ======================================================= */

  useEffect(() => {
    const tab =
      searchParams.get("tab");

    const target =
      searchParams.get("target");

    const referenceId =
      searchParams.get("ref");

    /*
     * S'il n'y a pas de navigation profonde,
     * on ne fait rien.
     */
    if (
      !tab ||
      !target ||
      !referenceId
    ) {
      return;
    }

    /*
     * On attend que le bon onglet
     * soit réellement actif.
     */
    if (activeTab !== tab) {
      return;
    }

    /*
     * Exemple :
     *
     * target = expense
     * ref = 183
     *
     * devient :
     *
     * [data-notification-ref="expense-183"]
     */
    const selector =
      `[data-notification-ref="${target}-${referenceId}"]`;

    /*
     * Certaines données sont récupérées depuis l'API.
     *
     * Le composant peut donc ne pas encore être présent
     * immédiatement après le changement d'onglet.
     *
     * On effectue quelques tentatives.
     */
    let attempts = 0;

    const maxAttempts = 20;

    let timeoutId:
      | number
      | undefined;

    const findAndFocusElement = () => {
      const element =
        document.querySelector<HTMLElement>(
          selector,
        );

      /*
       * ÉLÉMENT TROUVÉ
       */
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        /*
         * La classe sera utilisée
         * à l'étape 4 pour la mise
         * en évidence temporaire.
         */
        element.classList.add(
          "notification-target-highlight",
        );

        timeoutId =
          window.setTimeout(() => {
            element.classList.remove(
              "notification-target-highlight",
            );
          }, 2500);

        return;
      }

      /*
       * ÉLÉMENT PAS ENCORE PRÉSENT
       *
       * On réessaie pendant environ 3 secondes.
       */
      attempts += 1;

      if (
        attempts < maxAttempts
      ) {
        timeoutId =
          window.setTimeout(
            findAndFocusElement,
            150,
          );
      }
    };

    /*
     * Petit délai initial pour laisser React
     * afficher le nouvel onglet.
     */
    timeoutId =
      window.setTimeout(
        findAndFocusElement,
        100,
      );

    return () => {
      if (
        timeoutId !== undefined
      ) {
        window.clearTimeout(
          timeoutId,
        );
      }
    };
  }, [
    activeTab,
    searchParams,
  ]);
}