import {
  Building2,
  Copyright,
  Database,
  FileText,
  Globe2,
  Mail,
  Scale,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import "../pages/styles/MentionsLegales.css";

function MentionsLegales() {
  const sections = [
    {
      id: "editeur",
      label: "Éditeur du site",
    },
    {
      id: "publication",
      label: "Direction de publication",
    },
    {
      id: "hebergement",
      label: "Hébergement",
    },
    {
      id: "objet",
      label: "Objet du service",
    },
    {
      id: "propriete",
      label: "Propriété intellectuelle",
    },
    {
      id: "contenus-tiers",
      label: "Contenus de tiers",
    },
    {
      id: "responsabilite",
      label: "Responsabilité",
    },
    {
      id: "donnees",
      label: "Données personnelles",
    },
    {
      id: "cookies",
      label: "Cookies",
    },
    {
      id: "liens",
      label: "Liens externes",
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
    <main className="legal-page">
      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="legal-hero">
        <div className="legal-hero__icon">
          <Scale size={32} />
        </div>

        <div className="legal-hero__content">
          <span className="legal-hero__eyebrow">
            Informations légales
          </span>

          <h1>Mentions légales</h1>

          <p>
            Retrouvez les informations relatives à l&apos;édition,
            l&apos;hébergement et aux conditions juridiques applicables à
            TripTogether.
          </p>

          <span className="legal-hero__date">
            Dernière mise à jour : 16 août 2026
          </span>
        </div>
      </section>

      <div className="legal-layout">
        {/* =====================================================
            SOMMAIRE
        ====================================================== */}

        <aside className="legal-sidebar">
          <div className="legal-sidebar__inner">
            <span className="legal-sidebar__title">
              Sommaire
            </span>

            <nav aria-label="Sommaire des mentions légales">
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

        <div className="legal-content">
          <section className="legal-intro">
            <p>
              Conformément aux dispositions légales applicables, les présentes
              mentions légales ont pour objet d&apos;informer les utilisateurs
              de TripTogether sur l&apos;identité de l&apos;éditeur, les
              modalités d&apos;hébergement du service ainsi que les principales
              règles applicables à son utilisation.
            </p>

            <p>
              Certaines informations devront être complétées au moment de la
              mise en production définitive de TripTogether.
            </p>
          </section>

          {/* 01 */}

          <section
            className="legal-section"
            id="editeur"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <Building2 size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  01
                </span>

                <h2>Éditeur du site et de l&apos;application</h2>
              </div>
            </div>

            <p>
              Le site et l&apos;application TripTogether sont édités par :
            </p>

            <div className="legal-highlight">
              <strong>TripTogether</strong>

              <span>
                Éditeur : [À COMPLÉTER]
              </span>

              <span>
                Forme juridique : [À COMPLÉTER]
              </span>

              <span>
                Adresse : [À COMPLÉTER]
              </span>

              <span>
                E-mail : contact@triptogether.com
              </span>

              <span>
                Numéro d&apos;immatriculation : [À COMPLÉTER SI APPLICABLE]
              </span>
            </div>

            <p>
              Les informations figurant dans cette section devront être adaptées
              à la situation juridique réelle de l&apos;éditeur lors de la mise
              en production du service.
            </p>
          </section>

          {/* 02 */}

          <section
            className="legal-section"
            id="publication"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <UserRound size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  02
                </span>

                <h2>Direction de la publication</h2>
              </div>
            </div>

            <p>
              Le directeur ou la directrice de la publication de TripTogether
              est :
            </p>

            <div className="legal-highlight">
              <strong>[NOM ET PRÉNOM À COMPLÉTER]</strong>

              <span>
                Fonction : [À COMPLÉTER]
              </span>

              <span>
                Contact : contact@triptogether.com
              </span>
            </div>
          </section>

          {/* 03 */}

          <section
            className="legal-section"
            id="hebergement"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <Server size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  03
                </span>

                <h2>Hébergement</h2>
              </div>
            </div>

            <p>
              TripTogether est hébergé par :
            </p>

            <div className="legal-highlight">
              <strong>[NOM DE L&apos;HÉBERGEUR]</strong>

              <span>
                Société : [À COMPLÉTER]
              </span>

              <span>
                Adresse : [À COMPLÉTER]
              </span>

              <span>
                Site Internet : [À COMPLÉTER]
              </span>

              <span>
                Téléphone : [À COMPLÉTER SI APPLICABLE]
              </span>
            </div>

            <div className="legal-note">
              Cette section devra être complétée lorsque l&apos;hébergement de
              production de TripTogether aura été définitivement choisi.
            </div>
          </section>

          {/* 04 */}

          <section
            className="legal-section"
            id="objet"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <Globe2 size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  04
                </span>

                <h2>Objet du service</h2>
              </div>
            </div>

            <p>
              TripTogether est une application destinée à faciliter
              l&apos;organisation de voyages en groupe.
            </p>

            <p>
              Elle permet notamment aux utilisateurs de :
            </p>

            <ul>
              <li>Créer et organiser des voyages</li>
              <li>Inviter et gérer des participants</li>
              <li>Proposer et voter pour des étapes</li>
              <li>Enregistrer des dépenses</li>
              <li>Répartir les dépenses entre les participants</li>
              <li>Suivre les remboursements</li>
              <li>Consulter les activités du voyage</li>
            </ul>

            <p>
              TripTogether agit comme un outil d&apos;organisation et de
              collaboration et ne constitue pas une agence de voyages ou un
              établissement financier.
            </p>
          </section>

          {/* 05 */}

          <section
            className="legal-section"
            id="propriete"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <Copyright size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  05
                </span>

                <h2>Propriété intellectuelle</h2>
              </div>
            </div>

            <p>
              Sauf mention contraire, les éléments propres à TripTogether sont
              protégés par la législation applicable en matière de propriété
              intellectuelle.
            </p>

            <p>
              Cela concerne notamment :
            </p>

            <ul>
              <li>L&apos;identité visuelle de TripTogether</li>
              <li>Le logo</li>
              <li>L&apos;interface graphique</li>
              <li>Les textes propres au service</li>
              <li>Les éléments graphiques</li>
              <li>Le code source de l&apos;application</li>
              <li>L&apos;organisation fonctionnelle du service</li>
            </ul>

            <p>
              Toute reproduction ou exploitation non autorisée de ces éléments
              est interdite, sauf autorisation préalable ou exception prévue
              par la loi.
            </p>
          </section>

          {/* 06 */}

          <section
            className="legal-section"
            id="contenus-tiers"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <Database size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  06
                </span>

                <h2>Contenus et services de tiers</h2>
              </div>
            </div>

            <p>
              Certaines fonctionnalités de TripTogether peuvent utiliser des
              contenus, données ou services fournis par des prestataires tiers.
            </p>

            <p>
              Cela peut notamment concerner :
            </p>

            <ul>
              <li>Les photographies de destinations</li>
              <li>Les informations géographiques</li>
              <li>Les services de recherche de lieux</li>
              <li>Les données de conversion monétaire</li>
              <li>Les services d&apos;envoi d&apos;e-mails</li>
            </ul>

            <p>
              Les marques, photographies, données et autres contenus appartenant
              à des tiers restent la propriété de leurs titulaires respectifs.
            </p>
          </section>

          {/* 07 */}

          <section
            className="legal-section"
            id="responsabilite"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <Scale size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  07
                </span>

                <h2>Responsabilité</h2>
              </div>
            </div>

            <p>
              TripTogether met tout en œuvre pour fournir un service fiable et
              accessible.
            </p>

            <p>
              Toutefois, TripTogether ne peut garantir :
            </p>

            <ul>
              <li>Une disponibilité permanente et sans interruption</li>
              <li>L&apos;absence totale d&apos;erreurs techniques</li>
              <li>
                L&apos;exactitude des informations saisies par les utilisateurs
              </li>
              <li>
                L&apos;exactitude permanente des données fournies par des
                services tiers
              </li>
            </ul>

            <div className="legal-warning">
              Les utilisateurs restent responsables des informations qu&apos;ils
              saisissent, des décisions prises dans le cadre de leurs voyages,
              ainsi que des paiements et remboursements réalisés entre eux.
            </div>
          </section>

          {/* 08 */}

          <section
            className="legal-section"
            id="donnees"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  08
                </span>

                <h2>Données personnelles</h2>
              </div>
            </div>

            <p>
              TripTogether collecte et traite certaines données personnelles
              nécessaires au fonctionnement du service.
            </p>

            <p>
              Les modalités relatives à la collecte, l&apos;utilisation, la
              conservation et la protection de ces données sont détaillées dans
              la <strong>Politique de confidentialité</strong> de TripTogether.
            </p>

            <p>
              Les utilisateurs peuvent notamment disposer de droits
              d&apos;accès, de rectification, d&apos;effacement, de limitation,
              de portabilité ou d&apos;opposition dans les conditions prévues
              par la réglementation applicable.
            </p>
          </section>

          {/* 09 */}

          <section
            className="legal-section"
            id="cookies"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <ShieldCheck size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  09
                </span>

                <h2>Cookies et technologies similaires</h2>
              </div>
            </div>

            <p>
              TripTogether n&apos;utilise pas de cookies publicitaires destinés
              au profilage des utilisateurs.
            </p>

            <p>
              Des cookies ou technologies similaires peuvent néanmoins être
              utilisés lorsqu&apos;ils sont strictement nécessaires :
            </p>

            <ul>
              <li>Au fonctionnement de l&apos;application</li>
              <li>À l&apos;authentification des utilisateurs</li>
              <li>À la gestion sécurisée des sessions</li>
              <li>À la sécurité du service</li>
            </ul>

            <p>
              Des informations complémentaires sont disponibles dans la
              Politique de confidentialité de TripTogether.
            </p>
          </section>

          {/* 10 */}

          <section
            className="legal-section"
            id="liens"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <Globe2 size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  10
                </span>

                <h2>Liens et services externes</h2>
              </div>
            </div>

            <p>
              TripTogether peut contenir des liens ou permettre l&apos;accès à
              des services exploités par des tiers.
            </p>

            <p>
              TripTogether n&apos;exerce pas de contrôle sur ces services
              externes et ne peut être tenu responsable de leur contenu, de
              leur disponibilité ou de leurs propres pratiques en matière de
              protection des données.
            </p>

            <p>
              Les utilisateurs sont invités à consulter les conditions et
              politiques propres aux services tiers qu&apos;ils utilisent.
            </p>
          </section>

          {/* 11 */}

          <section
            className="legal-section"
            id="droit"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <FileText size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  11
                </span>

                <h2>Droit applicable</h2>
              </div>
            </div>

            <p>
              Les présentes mentions légales sont soumises au
              <strong> droit français</strong>.
            </p>

            <p>
              En cas de difficulté, les utilisateurs sont invités à contacter
              TripTogether afin de rechercher une solution amiable avant toute
              autre démarche.
            </p>

            <p>
              Les règles légales impératives relatives à la compétence des
              juridictions restent applicables.
            </p>
          </section>

          {/* 12 */}

          <section
            className="legal-section legal-section--last"
            id="contact"
          >
            <div className="legal-section__heading">
              <div className="legal-section__icon">
                <Mail size={21} />
              </div>

              <div>
                <span className="legal-section__number">
                  12
                </span>

                <h2>Contact</h2>
              </div>
            </div>

            <p>
              Pour toute question concernant les présentes mentions légales ou
              le fonctionnement de TripTogether, vous pouvez nous contacter à :
            </p>

            <a
              className="legal-contact"
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

export default MentionsLegales;