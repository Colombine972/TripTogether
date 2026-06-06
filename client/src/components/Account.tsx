import ProfileCard from "./ProfileCard";
import SecurityCard from "./SecurityCard";
import PreferencesCard from "./PreferencesCard";
import DeleteAccountCard from "./DeleteAccountCard";
import "../pages/styles/Account.css";

export default function Account() {
  return (
    <main className="account-page">
      <div className="account-cards">
        <section className="account-card">
          <h2>Informations personnelles</h2>
          <ProfileCard />
        </section>

        <section className="account-card security-card">
          <h2>Sécurité</h2>
          <div className="card-content">
            <SecurityCard />
          </div>
        </section>

        <section className="account-card preference-card">
          <h2>Mes Préférences</h2>
          <PreferencesCard />
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