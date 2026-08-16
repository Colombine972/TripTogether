import {
  Banknote,
  BookOpen,
  CircleUserRound,
  Coins,
  FileText,
  Globe2,
  Landmark,
  LockKeyhole,
  Mail,
  MapPinned,
  Scale,
  ShieldCheck,
  Trash2,
  UserRoundCheck,
  UsersRound,
  Vote,
} from "lucide-react";

import "./styles/CGU.css";

function CGU() {
  const sections = [
    {
      id: "presentation",
      label: "Présentation",
    },
    {
      id: "editeur",
      label: "Éditeur du service",
    },
    {
      id: "acceptation",
      label: "Acceptation des CGU",
    },
    {
      id: "acces",
      label: "Accès à TripTogether",
    },
    {
      id: "compte",
      label: "Création du compte",
    },
    {
      id: "voyages",
      label: "Organisation des voyages",
    },
    {
      id: "invitations",
      label: "Invitations",
    },
    {
      id: "votes",
      label: "Étapes et votes",
    },
    {
      id: "budget",
      label: "Budget et dépenses",
    },
    {
      id: "devises",
      label: "Devises",
    },
    {
      id: "remboursements",
      label: "Remboursements",
    },
    {
      id: "comportement",
      label: "Utilisation du service",
    },
    {
      id: "disponibilite",
      label: "Disponibilité",
    },
    {
      id: "responsabilite",
      label: "Responsabilité",
    },
    {
      id: "propriete",
      label: "Propriété intellectuelle",
    },
    {
      id: "donnees",
      label: "Données personnelles",
    },
    {
      id: "suppression",
      label: "Suppression du compte",
    },
    {
      id: "modifications",
      label: "Modification des CGU",
    },
    {
      id: "droit",
      label: "Droit applicable",
    },
    {
      id: "contact",
      label: "Contact",
    },
  ];

  return (
    <main className="cgu-page">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="cgu-hero">
        <div className="cgu-hero__icon">
          <BookOpen size={32} />
        </div>

        <div className="cgu-hero__content">
          <span className="cgu-hero__eyebrow">
            Utilisation de TripTogether
          </span>

          <h1>Conditions Générales d&apos;Utilisation</h1>

          <p>
            Les présentes Conditions Générales d&apos;Utilisation définissent
            les règles applicables à l&apos;accès et à l&apos;utilisation de
            TripTogether.
          </p>

          <span className="cgu-hero__date">
            Dernière mise à jour : 16 août 2026
          </span>
        </div>
      </section>

      <div className="cgu-layout">
        {/* =====================================================
            SOMMAIRE
        ====================================================== */}

        <aside className="cgu-sidebar">
          <div className="cgu-sidebar__inner">
            <span className="cgu-sidebar__title">
              Sommaire
            </span>

            <nav aria-label="Sommaire des Conditions Générales d'Utilisation">
              <ul>
                {sections.map((section) => (
                  <li key={section.id}>
                    <a href={`#${section.id}`}>
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </aside>

        {/* =====================================================
            CONTENU
        ====================================================== */}

        <div className="cgu-content">
          <section className="cgu-intro">
            <p>
              Bienvenue sur <strong>TripTogether</strong>.
            </p>

            <p>
              Les présentes Conditions Générales d&apos;Utilisation,
              ci-après désignées « CGU », définissent les conditions dans
              lesquelles les utilisateurs peuvent accéder à TripTogether et
              utiliser les fonctionnalités proposées par l&apos;application.
            </p>

            <p>
              L&apos;utilisation de TripTogether implique l&apos;acceptation
              des présentes CGU.
            </p>
          </section>

          {/* 01 */}

          <section
            className="cgu-section"
            id="presentation"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <MapPinned size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  01
                </span>

                <h2>Présentation de TripTogether</h2>
              </div>
            </div>

            <p>
              TripTogether est une application permettant d&apos;organiser
              des voyages à plusieurs et de centraliser les informations
              utiles à leur préparation et à leur suivi.
            </p>

            <p>
              L&apos;application permet notamment de :
            </p>

            <ul>
              <li>Créer et gérer un voyage</li>
              <li>Inviter des participants</li>
              <li>Proposer des destinations et des étapes</li>
              <li>Voter pour les différentes étapes proposées</li>
              <li>Suivre l&apos;organisation du voyage</li>
              <li>Enregistrer et répartir des dépenses</li>
              <li>Calculer les soldes entre participants</li>
              <li>Faciliter l&apos;organisation des remboursements</li>
              <li>Consulter les activités récentes</li>
              <li>Recevoir des notifications liées au voyage</li>
              <li>Exporter certaines informations relatives au budget</li>
            </ul>

            <p>
              TripTogether constitue un outil d&apos;organisation et de
              collaboration entre voyageurs.
            </p>
          </section>

          {/* 02 */}

          <section
            className="cgu-section"
            id="editeur"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <FileText size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  02
                </span>

                <h2>Éditeur du service</h2>
              </div>
            </div>

            <p>
              TripTogether est édité par :
            </p>

            <div className="cgu-highlight">
              <strong>TripTogether</strong>

              <span>
                Éditeur / responsable : [À COMPLÉTER]
              </span>

              <span>
                Adresse : [À COMPLÉTER]
              </span>

              <span>
                E-mail : contact@triptogether.com
              </span>
            </div>

            <p>
              Les informations complètes relatives à l&apos;éditeur et à
              l&apos;hébergement du service sont disponibles dans les
              Mentions légales de TripTogether.
            </p>
          </section>

          {/* 03 */}

          <section
            className="cgu-section"
            id="acceptation"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <UserRoundCheck size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  03
                </span>

                <h2>Acceptation des CGU</h2>
              </div>
            </div>

            <p>
              L&apos;accès et l&apos;utilisation de TripTogether impliquent
              l&apos;acceptation des présentes Conditions Générales
              d&apos;Utilisation.
            </p>

            <p>
              L&apos;utilisateur s&apos;engage à prendre connaissance des
              CGU et à les respecter pendant toute la durée d&apos;utilisation
              du service.
            </p>

            <p>
              Si l&apos;utilisateur n&apos;accepte pas les présentes
              conditions, il doit cesser d&apos;utiliser TripTogether.
            </p>
          </section>

          {/* 04 */}

          <section
            className="cgu-section"
            id="acces"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Globe2 size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  04
                </span>

                <h2>Accès à TripTogether</h2>
              </div>
            </div>

            <p>
              L&apos;utilisation de certaines fonctionnalités nécessite la
              création d&apos;un compte utilisateur.
            </p>

            <p>
              L&apos;accès au service nécessite notamment :
            </p>

            <ul>
              <li>Un appareil compatible</li>
              <li>Une connexion à Internet</li>
              <li>
                Un navigateur ou environnement compatible avec
                l&apos;application
              </li>
              <li>
                Un compte pour les fonctionnalités nécessitant une
                authentification
              </li>
            </ul>

            <p>
              Les éventuels frais liés à l&apos;accès à Internet ou à
              l&apos;utilisation de l&apos;équipement restent à la charge de
              l&apos;utilisateur.
            </p>
          </section>

          {/* 05 */}

          <section
            className="cgu-section"
            id="compte"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <CircleUserRound size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  05
                </span>

                <h2>Création et sécurité du compte</h2>
              </div>
            </div>

            <p>
              Pour utiliser les fonctionnalités nécessitant une
              authentification, l&apos;utilisateur doit créer un compte.
            </p>

            <p>
              Lors de son inscription, il s&apos;engage à fournir des
              informations exactes et à les maintenir à jour.
            </p>

            <div className="cgu-note">
              Chaque compte TripTogether est personnel. L&apos;utilisateur
              est responsable de la confidentialité de ses identifiants.
            </div>

            <p>
              En cas de suspicion d&apos;accès frauduleux, l&apos;utilisateur
              est invité à modifier son mot de passe et à contacter
              TripTogether si nécessaire.
            </p>

            <p>
              TripTogether ne demandera jamais à un utilisateur de
              communiquer son mot de passe en clair.
            </p>
          </section>

          {/* 06 */}

          <section
            className="cgu-section"
            id="voyages"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <UsersRound size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  06
                </span>

                <h2>Organisation des voyages</h2>
              </div>
            </div>

            <p>
              TripTogether permet aux utilisateurs de créer et de rejoindre
              des voyages collaboratifs.
            </p>

            <p>
              Les participants peuvent notamment :
            </p>

            <ul>
              <li>Consulter les informations du voyage</li>
              <li>Proposer des étapes</li>
              <li>Participer aux votes</li>
              <li>Consulter les participants</li>
              <li>Enregistrer des dépenses</li>
              <li>Consulter le budget</li>
              <li>Déclarer ou suivre des remboursements</li>
              <li>Consulter les activités réalisées dans le voyage</li>
            </ul>

            <p>
              Certaines informations ajoutées dans un voyage sont destinées
              à être partagées avec les autres participants de ce voyage.
            </p>
          </section>

          {/* 07 */}

          <section
            className="cgu-section"
            id="invitations"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Mail size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  07
                </span>

                <h2>Invitations</h2>
              </div>
            </div>

            <p>
              Un utilisateur peut inviter d&apos;autres personnes à rejoindre
              un voyage par e-mail ou à l&apos;aide d&apos;un lien
              d&apos;invitation lorsque cette fonctionnalité est disponible.
            </p>

            <p>
              Il est interdit d&apos;utiliser le système d&apos;invitation
              pour :
            </p>

            <ul>
              <li>Envoyer des messages non sollicités en masse</li>
              <li>Réaliser des campagnes publicitaires</li>
              <li>Harceler une personne</li>
              <li>Diffuser du contenu frauduleux ou malveillant</li>
            </ul>

            <p>
              La personne invitée reste libre d&apos;accepter ou de refuser
              l&apos;invitation.
            </p>
          </section>

          {/* 08 */}

          <section
            className="cgu-section"
            id="votes"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Vote size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  08
                </span>

                <h2>Étapes et votes</h2>
              </div>
            </div>

            <p>
              TripTogether permet aux participants de proposer des destinations
              ou étapes et de participer à des votes.
            </p>

            <p>
              Les résultats affichés dépendent des votes effectués par les
              différents participants.
            </p>

            <p>
              Les utilisateurs restent responsables des décisions prises au
              sein de leur groupe et de l&apos;organisation définitive de
              leur voyage.
            </p>
          </section>

          {/* 09 */}

          <section
            className="cgu-section"
            id="budget"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Banknote size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  09
                </span>

                <h2>Budget partagé et dépenses</h2>
              </div>
            </div>

            <p>
              TripTogether propose des fonctionnalités permettant
              d&apos;enregistrer et de répartir les dépenses réalisées dans
              le cadre d&apos;un voyage.
            </p>

            <p>
              Une dépense peut notamment comporter :
            </p>

            <ul>
              <li>Un intitulé</li>
              <li>Un montant</li>
              <li>Une devise</li>
              <li>Une catégorie</li>
              <li>Une date</li>
              <li>Le participant ayant effectué le paiement</li>
              <li>Les participants concernés</li>
            </ul>

            <div className="cgu-warning">
              Les calculs réalisés par TripTogether reposent sur les
              informations saisies par les utilisateurs. Chaque participant
              reste responsable de l&apos;exactitude des dépenses
              qu&apos;il enregistre.
            </div>
          </section>

          {/* 10 */}

          <section
            className="cgu-section"
            id="devises"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Coins size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  10
                </span>

                <h2>Devises et conversions monétaires</h2>
              </div>
            </div>

            <p>
              Certaines dépenses peuvent être enregistrées dans une devise
              différente de celle utilisée comme référence pour le voyage.
            </p>

            <p>
              TripTogether peut utiliser des taux de change fournis par un
              service tiers pour permettre la conversion des montants.
            </p>

            <div className="cgu-warning">
              Les taux de change sont fournis à titre indicatif. Ils peuvent
              différer du taux réellement appliqué par une banque, une carte
              bancaire ou un établissement de paiement.
            </div>
          </section>

          {/* 11 */}

          <section
            className="cgu-section"
            id="remboursements"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Landmark size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  11
                </span>

                <h2>Remboursements entre participants</h2>
              </div>
            </div>

            <p>
              TripTogether peut calculer les sommes dues entre les
              participants afin de faciliter l&apos;organisation des
              remboursements.
            </p>

            <div className="cgu-important">
              <strong>
                TripTogether n&apos;est pas un établissement bancaire, un
                établissement de paiement ou un intermédiaire financier.
              </strong>
            </div>

            <p>TripTogether :</p>

            <ul>
              <li>Ne détient pas l&apos;argent des utilisateurs</li>
              <li>Ne réalise pas directement les virements</li>
              <li>Ne garantit pas qu&apos;un remboursement sera effectué</li>
              <li>
                N&apos;intervient pas dans les éventuels litiges financiers
                entre participants
              </li>
            </ul>

            <p>
              Les utilisateurs restent responsables des paiements et
              remboursements réalisés entre eux.
            </p>
          </section>

          {/* 12 */}

          <section
            className="cgu-section"
            id="comportement"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  12
                </span>

                <h2>Utilisation du service</h2>
              </div>
            </div>

            <p>
              Chaque utilisateur s&apos;engage à utiliser TripTogether de
              manière loyale et conformément à la législation applicable.
            </p>

            <p>Il est notamment interdit :</p>

            <ul>
              <li>
                D&apos;utiliser TripTogether à des fins frauduleuses ou
                illégales
              </li>
              <li>
                De tenter d&apos;accéder au compte d&apos;un autre utilisateur
              </li>
              <li>De contourner les mécanismes de sécurité</li>
              <li>
                De perturber volontairement le fonctionnement du service
              </li>
              <li>
                De transmettre volontairement des informations trompeuses
              </li>
              <li>
                D&apos;utiliser les données d&apos;autres participants à des
                fins non autorisées
              </li>
              <li>D&apos;extraire massivement les données du service</li>
              <li>
                D&apos;introduire un programme ou contenu malveillant
              </li>
              <li>
                D&apos;utiliser TripTogether pour harceler ou menacer une
                personne
              </li>
            </ul>
          </section>

          {/* 13 */}

          <section
            className="cgu-section"
            id="disponibilite"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Globe2 size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  13
                </span>

                <h2>Disponibilité et évolution du service</h2>
              </div>
            </div>

            <p>
              TripTogether s&apos;efforce de maintenir le service accessible
              et fonctionnel.
            </p>

            <p>
              L&apos;accès peut néanmoins être temporairement interrompu
              notamment en raison :
            </p>

            <ul>
              <li>D&apos;une opération de maintenance</li>
              <li>D&apos;une mise à jour</li>
              <li>D&apos;un incident technique</li>
              <li>D&apos;un problème affectant un prestataire externe</li>
              <li>
                D&apos;un événement indépendant de la volonté de TripTogether
              </li>
            </ul>

            <p>
              Certaines fonctionnalités peuvent également être ajoutées,
              modifiées, remplacées ou supprimées au cours de
              l&apos;évolution de l&apos;application.
            </p>
          </section>

          {/* 14 */}

          <section
            className="cgu-section"
            id="responsabilite"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Scale size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  14
                </span>

                <h2>Responsabilité</h2>
              </div>
            </div>

            <p>
              TripTogether met à disposition un outil destiné à faciliter
              l&apos;organisation collaborative de voyages.
            </p>

            <p>Les utilisateurs restent responsables :</p>

            <ul>
              <li>Des informations qu&apos;ils saisissent</li>
              <li>Des dépenses déclarées</li>
              <li>Des décisions prises entre participants</li>
              <li>
                Des réservations effectuées auprès de prestataires externes
              </li>
              <li>Des paiements et remboursements entre participants</li>
              <li>
                De la vérification des informations nécessaires à leur voyage
              </li>
            </ul>

            <p>
              TripTogether ne saurait être tenu responsable des désaccords
              entre participants concernant l&apos;organisation du voyage,
              les dépenses ou les remboursements.
            </p>

            <div className="cgu-note">
              TripTogether est un outil d&apos;organisation. Il n&apos;agit
              pas comme une agence de voyages et ne garantit pas
              l&apos;exécution de prestations touristiques fournies par des
              tiers.
            </div>
          </section>

          {/* 15 */}

          <section
            className="cgu-section"
            id="propriete"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <FileText size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  15
                </span>

                <h2>Propriété intellectuelle</h2>
              </div>
            </div>

            <p>
              La structure générale de TripTogether ainsi que les éléments
              appartenant à l&apos;application sont protégés par les règles
              applicables en matière de propriété intellectuelle.
            </p>

            <ul>
              <li>Identité visuelle</li>
              <li>Interface</li>
              <li>Logo</li>
              <li>Éléments graphiques</li>
              <li>Textes propres à TripTogether</li>
              <li>Code et organisation fonctionnelle</li>
            </ul>

            <p>
              Les marques, photographies, données ou autres contenus
              appartenant à des services tiers restent la propriété de leurs
              titulaires respectifs.
            </p>
          </section>

          {/* 16 */}

          <section
            className="cgu-section"
            id="donnees"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <LockKeyhole size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  16
                </span>

                <h2>Protection des données personnelles</h2>
              </div>
            </div>

            <p>
              TripTogether traite certaines données personnelles nécessaires
              au fonctionnement du service.
            </p>

            <p>
              Les modalités relatives à la collecte, à l&apos;utilisation, à
              la conservation et à la protection de ces données sont
              détaillées dans la <strong>Politique de confidentialité</strong>
              de TripTogether.
            </p>

            <p>
              L&apos;utilisateur est invité à consulter cette politique avant
              d&apos;utiliser le service.
            </p>
          </section>

          {/* 17 */}

          <section
            className="cgu-section"
            id="suppression"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Trash2 size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  17
                </span>

                <h2>Suppression ou restriction du compte</h2>
              </div>
            </div>

            <p>
              L&apos;utilisateur peut demander la suppression de son compte
              depuis son espace <strong>Mon compte</strong>.
            </p>

            <p>
              La suppression du compte entraîne la suppression ou
              l&apos;anonymisation des données personnelles associées selon
              les modalités définies dans la Politique de confidentialité.
            </p>

            <p>
              TripTogether peut également suspendre ou restreindre un compte
              en cas :
            </p>

            <ul>
              <li>D&apos;utilisation frauduleuse du service</li>
              <li>De violation grave ou répétée des présentes CGU</li>
              <li>
                De tentative d&apos;atteinte à la sécurité de
                l&apos;application
              </li>
              <li>
                D&apos;utilisation portant préjudice aux autres utilisateurs
              </li>
              <li>D&apos;obligation légale ou réglementaire</li>
            </ul>
          </section>

          {/* 18 */}

          <section
            className="cgu-section"
            id="modifications"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <FileText size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  18
                </span>

                <h2>Modification des CGU</h2>
              </div>
            </div>

            <p>
              TripTogether peut modifier les présentes Conditions Générales
              d&apos;Utilisation afin de tenir compte notamment :
            </p>

            <ul>
              <li>De l&apos;évolution de l&apos;application</li>
              <li>De nouvelles fonctionnalités</li>
              <li>D&apos;évolutions techniques</li>
              <li>D&apos;évolutions légales ou réglementaires</li>
            </ul>

            <p>
              La date de dernière mise à jour affichée en haut de cette page
              permet d&apos;identifier la version actuellement applicable.
            </p>

            <p>
              En cas de modification importante, les utilisateurs pourront
              être informés par un moyen approprié.
            </p>
          </section>

          {/* 19 */}

          <section
            className="cgu-section"
            id="droit"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Scale size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  19
                </span>

                <h2>Droit applicable</h2>
              </div>
            </div>

            <p>
              Les présentes Conditions Générales d&apos;Utilisation sont
              régies par le <strong>droit français</strong>.
            </p>

            <p>
              En cas de difficulté liée à l&apos;utilisation de TripTogether,
              l&apos;utilisateur est invité à contacter TripTogether afin de
              rechercher une solution amiable.
            </p>

            <p>
              Les règles légales impératives relatives à la compétence des
              juridictions restent applicables.
            </p>
          </section>

          {/* 20 */}

          <section
            className="cgu-section cgu-section--last"
            id="contact"
          >
            <div className="cgu-section__heading">
              <div className="cgu-section__icon">
                <Mail size={21} />
              </div>

              <div>
                <span className="cgu-section__number">
                  20
                </span>

                <h2>Contact</h2>
              </div>
            </div>

            <p>
              Pour toute question concernant TripTogether ou les présentes
              Conditions Générales d&apos;Utilisation, vous pouvez nous
              contacter à :
            </p>

            <a
              className="cgu-contact"
              href="mailto:contact@triptogether.com"
            >
              <Mail size={19} />
              contact@triptogether.com
            </a>

            <p>
              Nous nous efforcerons de répondre à votre demande dans les
              meilleurs délais.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default CGU;