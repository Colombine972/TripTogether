import {
  Database,
  Eye,
  FileText,
  LockKeyhole,
  Mail,
  Scale,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import "../pages/styles/Confidentialite.css";

function Confidentialité() {
  const sections = [
    {
      id: "responsable",
      label: "Responsable du traitement",
    },
    {
      id: "donnees",
      label: "Données collectées",
    },
    {
      id: "finalites",
      label: "Finalités",
    },
    {
      id: "bases-legales",
      label: "Bases légales",
    },
    {
      id: "visibilite",
      label: "Données visibles",
    },
    {
      id: "partage",
      label: "Partage des données",
    },
    {
      id: "transferts",
      label: "Transferts",
    },
    {
      id: "conservation",
      label: "Conservation",
    },
    {
      id: "securite",
      label: "Sécurité",
    },
    {
      id: "droits",
      label: "Vos droits",
    },
    {
      id: "cookies",
      label: "Cookies",
    },
    {
      id: "contact",
      label: "Contact",
    },
  ];

  return (
    <main className="privacy-page">
      <section className="privacy-hero">
        <div className="privacy-hero__icon">
          <ShieldCheck size={32} />
        </div>

        <div className="privacy-hero__content">
          <span className="privacy-hero__eyebrow">
            Protection de vos données
          </span>

          <h1>Politique de confidentialité</h1>

          <p>
            TripTogether accorde une importance particulière à la protection
            de vos données personnelles et au respect de votre vie privée.
          </p>

          <span className="privacy-hero__date">
            Dernière mise à jour : 15 août 2026
          </span>
        </div>
      </section>

      <div className="privacy-layout">
        <aside className="privacy-sidebar">
          <div className="privacy-sidebar__inner">
            <span className="privacy-sidebar__title">
              Sommaire
            </span>

            <nav aria-label="Sommaire de la politique de confidentialité">
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

        <div className="privacy-content">
          <section className="privacy-intro">
            <p>
              La présente politique de confidentialité a pour objectif de vous
              expliquer de manière claire quelles données personnelles peuvent
              être collectées lorsque vous utilisez TripTogether, pourquoi
              elles sont utilisées, avec qui elles peuvent être partagées,
              pendant combien de temps elles sont conservées et quels sont vos
              droits.
            </p>

            <p>
              TripTogether s&apos;engage à traiter les données personnelles
              conformément au Règlement général sur la protection des données
              (RGPD) et à la réglementation française applicable.
            </p>
          </section>

          <section
            className="privacy-section"
            id="responsable"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <UserRound size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  01
                </span>
                <h2>Responsable du traitement</h2>
              </div>
            </div>

            <p>
              Le responsable du traitement des données personnelles effectué
              dans le cadre de l&apos;utilisation de TripTogether est :
            </p>

            <div className="privacy-highlight">
              <strong>TripTogether</strong>
              <span>
                Responsable / éditeur : [À COMPLÉTER]
              </span>
              <span>
                Adresse : [À COMPLÉTER]
              </span>
              <span>
                E-mail : contact@triptogether.com
              </span>
            </div>

            <p>
              Pour toute question relative à vos données personnelles ou à
              l&apos;exercice de vos droits, vous pouvez nous contacter à cette
              adresse.
            </p>
          </section>

          <section
            className="privacy-section"
            id="donnees"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <Database size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  02
                </span>
                <h2>Données personnelles collectées</h2>
              </div>
            </div>

            <p>
              TripTogether collecte uniquement les données nécessaires au
              fonctionnement de l&apos;application et des services proposés.
            </p>

            <div className="privacy-subsection">
              <h3>Données liées au compte</h3>
              <ul>
                <li>Prénom et nom</li>
                <li>Adresse e-mail</li>
                <li>Mot de passe sous forme hachée et non lisible</li>
                <li>Photo de profil facultative</li>
                <li>Préférences utilisateur</li>
              </ul>

              <p className="privacy-note">
                Votre mot de passe n&apos;est jamais conservé en clair.
              </p>
            </div>

            <div className="privacy-subsection">
              <h3>Données liées aux voyages</h3>
              <ul>
                <li>Voyages créés ou rejoints</li>
                <li>Destinations et étapes proposées</li>
                <li>Dates du voyage et des étapes</li>
                <li>Participants</li>
                <li>Invitations envoyées ou reçues</li>
                <li>Votes sur les étapes</li>
              </ul>
            </div>

            <div className="privacy-subsection">
              <h3>Données liées aux invitations</h3>
              <ul>
                <li>Adresse e-mail de la personne invitée</li>
                <li>Voyage concerné</li>
                <li>Message personnalisé éventuel</li>
                <li>Informations nécessaires au suivi de l&apos;invitation</li>
              </ul>
            </div>

            <div className="privacy-subsection">
              <h3>Budget et dépenses</h3>
              <ul>
                <li>Dépenses enregistrées</li>
                <li>Intitulé, catégorie, date et montant</li>
                <li>Devise utilisée</li>
                <li>Participant ayant réglé la dépense</li>
                <li>Répartition entre les participants</li>
                <li>Soldes et remboursements</li>
              </ul>

              <p className="privacy-note">
                TripTogether n&apos;est pas un établissement bancaire et
                n&apos;effectue pas directement les transferts d&apos;argent
                entre les participants.
              </p>
            </div>

            <div className="privacy-subsection">
              <h3>Préférences de remboursement</h3>
              <ul>
                <li>Méthode de remboursement préférée</li>
                <li>Numéro de téléphone associé à Wero</li>
                <li>IBAN</li>
                <li>Nom du titulaire du compte</li>
              </ul>
            </div>

            <div className="privacy-subsection">
              <h3>Notifications et activité</h3>
              <ul>
                <li>Ajout ou modification d&apos;une dépense</li>
                <li>Arrivée d&apos;un participant</li>
                <li>Invitations</li>
                <li>Votes</li>
                <li>Remboursements</li>
                <li>Validation ou rejet d&apos;une étape</li>
                <li>Modifications importantes du voyage</li>
              </ul>
            </div>

            <div className="privacy-subsection">
              <h3>Données techniques et de sécurité</h3>
              <ul>
                <li>Informations liées à l&apos;authentification</li>
                <li>Données de connexion et journaux techniques</li>
                <li>
                  Informations nécessaires à la détection d&apos;erreurs ou
                  d&apos;accès non autorisés
                </li>
              </ul>
            </div>
          </section>

          <section
            className="privacy-section"
            id="finalites"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <FileText size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  03
                </span>
                <h2>Pourquoi utilisons-nous vos données ?</h2>
              </div>
            </div>

            <ul>
              <li>Créer et gérer votre compte TripTogether</li>
              <li>Vous authentifier de manière sécurisée</li>
              <li>Créer, rejoindre et organiser des voyages</li>
              <li>Gérer les participants et les invitations</li>
              <li>Permettre les propositions et votes sur les étapes</li>
              <li>Gérer les dépenses partagées</li>
              <li>Calculer les soldes entre participants</li>
              <li>Faciliter les remboursements</li>
              <li>Afficher les activités récentes</li>
              <li>Envoyer les notifications nécessaires</li>
              <li>Permettre la récupération d&apos;un compte</li>
              <li>Assurer la sécurité et le bon fonctionnement du service</li>
            </ul>
          </section>

          <section
            className="privacy-section"
            id="bases-legales"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <Scale size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  04
                </span>
                <h2>Bases légales des traitements</h2>
              </div>
            </div>

            <div className="privacy-legal-grid">
              <article>
                <h3>Exécution du service</h3>
                <p>
                  Pour fournir les fonctionnalités essentielles de
                  TripTogether : compte, voyages, budget, dépenses et
                  remboursements.
                </p>
              </article>

              <article>
                <h3>Intérêt légitime</h3>
                <p>
                  Pour sécuriser l&apos;application, prévenir les abus et
                  améliorer le fonctionnement du service.
                </p>
              </article>

              <article>
                <h3>Consentement</h3>
                <p>
                  Lorsque la réglementation exige votre consentement pour un
                  traitement particulier.
                </p>
              </article>

              <article>
                <h3>Obligations légales</h3>
                <p>
                  Lorsque certaines données doivent être conservées ou traitées
                  afin de respecter une obligation légale.
                </p>
              </article>
            </div>
          </section>

          <section
            className="privacy-section"
            id="visibilite"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <Eye size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  05
                </span>
                <h2>Données visibles par les autres participants</h2>
              </div>
            </div>

            <p>
              TripTogether est une application collaborative. Certaines
              informations sont donc nécessairement partagées entre les membres
              participant au même voyage.
            </p>

            <ul>
              <li>Votre prénom et certaines informations de profil</li>
              <li>Votre photo de profil, lorsqu&apos;elle existe</li>
              <li>Vos votes</li>
              <li>Les dépenses enregistrées ou réglées</li>
              <li>Les montants nécessaires au calcul des soldes</li>
              <li>Les remboursements concernés</li>
              <li>Certaines activités réalisées dans le voyage</li>
            </ul>

            <div className="privacy-warning">
              Les informations de remboursement renseignées dans TripTogether
              doivent uniquement être utilisées par les participants afin de
              faciliter les remboursements liés au voyage.
            </div>
          </section>

          <section
            className="privacy-section"
            id="partage"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <Database size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  06
                </span>
                <h2>Partage des données et prestataires</h2>
              </div>
            </div>

            <p>
              <strong>
                TripTogether ne vend pas vos données personnelles.
              </strong>
            </p>

            <p>
              Certaines informations peuvent néanmoins être accessibles aux
              autres participants ou traitées par des prestataires techniques
              nécessaires au fonctionnement de l&apos;application.
            </p>

            <ul>
              <li>Hébergement de l&apos;application et de la base de données</li>
              <li>Services d&apos;envoi d&apos;e-mails</li>
              <li>Services de recherche de destinations et de photographies</li>
              <li>
                Autorités compétentes lorsqu&apos;une obligation légale
                l&apos;impose
              </li>
            </ul>
          </section>

          <section
            className="privacy-section"
            id="transferts"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  07
                </span>
                <h2>
                  Transfert de données hors de l&apos;Espace économique européen
                </h2>
              </div>
            </div>

            <p>
              Certains prestataires techniques utilisés par TripTogether
              peuvent être établis ou traiter certaines données en dehors de
              l&apos;Espace économique européen.
            </p>

            <p>
              Lorsque de tels transferts existent, TripTogether veille à ce
              qu&apos;ils soient réalisés conformément à la réglementation
              applicable et qu&apos;ils reposent, lorsque cela est nécessaire,
              sur des mécanismes reconnus par le RGPD.
            </p>
          </section>

          <section
            className="privacy-section"
            id="conservation"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <Database size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  08
                </span>
                <h2>Durée de conservation</h2>
              </div>
            </div>

            <p>
              Les données sont conservées uniquement pendant la durée
              nécessaire aux finalités pour lesquelles elles ont été
              collectées.
            </p>

            <p>
              Les données liées au compte sont généralement conservées pendant
              toute la durée d&apos;utilisation de TripTogether.
            </p>

            <p>
              Lors de la suppression d&apos;un compte, les données personnelles
              associées sont supprimées ou anonymisées, sous réserve des données
              devant être temporairement conservées pour des obligations
              légales, techniques ou de sécurité.
            </p>
          </section>

          <section
            className="privacy-section"
            id="securite"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <LockKeyhole size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  09
                </span>
                <h2>Sécurité des données</h2>
              </div>
            </div>

            <p>
              TripTogether met en œuvre des mesures techniques et
              organisationnelles destinées à protéger vos données contre les
              accès non autorisés, la perte, la modification ou la divulgation.
            </p>

            <ul>
              <li>Hachage sécurisé des mots de passe</li>
              <li>Mécanismes d&apos;authentification sécurisés</li>
              <li>Contrôle des autorisations d&apos;accès</li>
              <li>Requêtes paramétrées vers la base de données</li>
              <li>Accès limité aux utilisateurs autorisés</li>
              <li>Protection des sessions utilisateur</li>
            </ul>
          </section>

          <section
            className="privacy-section"
            id="droits"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <Scale size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  10
                </span>
                <h2>Vos droits</h2>
              </div>
            </div>

            <p>
              Conformément au RGPD, vous pouvez disposer, selon le traitement
              concerné, des droits suivants :
            </p>

            <div className="privacy-rights-grid">
              <article>
                <strong>Droit d&apos;accès</strong>
                <span>
                  Connaître les données personnelles vous concernant.
                </span>
              </article>

              <article>
                <strong>Droit de rectification</strong>
                <span>
                  Corriger des données inexactes ou incomplètes.
                </span>
              </article>

              <article>
                <strong>Droit à l&apos;effacement</strong>
                <span>
                  Demander la suppression de vos données lorsque cela est
                  applicable.
                </span>
              </article>

              <article>
                <strong>Droit à la portabilité</strong>
                <span>
                  Récupérer certaines de vos données dans un format adapté.
                </span>
              </article>

              <article>
                <strong>Droit à la limitation</strong>
                <span>
                  Demander la limitation de certains traitements.
                </span>
              </article>

              <article>
                <strong>Droit d&apos;opposition</strong>
                <span>
                  Vous opposer à certains traitements fondés sur
                  l&apos;intérêt légitime.
                </span>
              </article>
            </div>

            <p>
              Depuis votre espace <strong>Mon compte</strong>, vous pouvez
              notamment modifier vos informations, changer votre mot de passe,
              télécharger vos données et supprimer votre compte.
            </p>
          </section>

          <section
            className="privacy-section"
            id="cookies"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  11
                </span>
                <h2>Cookies et technologies similaires</h2>
              </div>
            </div>

            <p>
              TripTogether n&apos;utilise pas de cookies publicitaires destinés
              au profilage de ses utilisateurs.
            </p>

            <p>
              Des cookies ou technologies similaires peuvent néanmoins être
              utilisés lorsqu&apos;ils sont strictement nécessaires au
              fonctionnement de l&apos;application, à l&apos;authentification,
              à la gestion sécurisée des sessions ou à la sécurité du service.
            </p>
          </section>

          <section
            className="privacy-section"
            id="contact"
          >
            <div className="privacy-section__heading">
              <div className="privacy-section__icon">
                <Mail size={21} />
              </div>

              <div>
                <span className="privacy-section__number">
                  12
                </span>
                <h2>Contact et réclamation</h2>
              </div>
            </div>

            <p>
              Pour toute question concernant cette politique ou vos données
              personnelles, vous pouvez nous contacter à :
            </p>

            <a
              className="privacy-contact"
              href="mailto:contact@triptogether.com"
            >
              <Mail size={19} />
              contact@triptogether.com
            </a>

            <p>
              Si vous estimez que vos droits ne sont pas respectés, vous pouvez
              également introduire une réclamation auprès de la Commission
              nationale de l&apos;informatique et des libertés (CNIL).
            </p>
          </section>

          <section className="privacy-section privacy-section--last">
            <h2>Modification de la politique</h2>

            <p>
              TripTogether peut modifier cette politique afin de tenir compte
              des évolutions de l&apos;application, de nouvelles fonctionnalités,
              d&apos;évolutions techniques ou réglementaires.
            </p>

            <p>
              La date de dernière mise à jour affichée en haut de cette page
              permet de connaître la version actuellement applicable.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

export default Confidentialité;







