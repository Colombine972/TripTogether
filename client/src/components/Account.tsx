import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import DeleteAccountCard from "./DeleteAccountCard";
import PaymentPreferencesCard from "./PaymentPreferencesCard";
import PreferencesCard from "./PreferencesCard";
import ProfileCard from "./ProfileCard";
import SecurityCard from "./SecurityCard";

import "../pages/styles/Account.css";

export default function Account() {
  const [preferencesExpanded, setPreferencesExpanded] = useState(false);
  const [paymentExpanded, setPaymentExpanded] = useState(false);

  return (
    <main className="account-page">
      <div className="account-cards">
        <section className="account-card profile-card">
          <h2>Informations personnelles</h2>

          <div className="card-content">
            <ProfileCard />
          </div>
        </section>


        <section className="account-card security-card">
          <h2>Sécurité</h2>

          <div className="card-content">
            <SecurityCard />
          </div>
        </section>

        <section
          className={`account-card expandable-account-card preference-card ${
            preferencesExpanded ? "is-expanded" : "is-collapsed"
          }`}
        >
          <h2>Mes Préférences</h2>

          <div className="expandable-card-body">
            <div className="expandable-card-content">
              <PreferencesCard />
            </div>
          </div>

          <button
            type="button"
            className="account-expand-button"
            onClick={() => setPreferencesExpanded((current) => !current)}
            aria-expanded={preferencesExpanded}
          >
            <span>
              {preferencesExpanded ? "Réduire" : "Voir toutes mes préférences"}
            </span>

            {preferencesExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </section>


        <section
          className={`account-card expandable-account-card payment-preference-card ${
            paymentExpanded ? "is-expanded" : "is-collapsed"
          }`}
        >
          <h2>Moyens de remboursement</h2>

          <div className="expandable-card-body">
            <div className="expandable-card-content">
              <PaymentPreferencesCard />
            </div>
          </div>

          <button
            type="button"
            className="account-expand-button"
            onClick={() => setPaymentExpanded((current) => !current)}
            aria-expanded={paymentExpanded}
          >
            <span>
              {paymentExpanded
                ? "Réduire"
                : "Voir mes moyens de remboursement"}
            </span>

            {paymentExpanded ? (
              <ChevronUp size={20} />
            ) : (
              <ChevronDown size={20} />
            )}
          </button>
        </section>


        <section className="account-card delete-account-card">
          <h2>Suppression du compte</h2>

          <div className="card-content">
            <DeleteAccountCard />
          </div>
        </section>
      </div>
    </main>
  );
}