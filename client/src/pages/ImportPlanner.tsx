import { FileCheck2, FileUp, MapPinned, Plane, Wallet } from "lucide-react";
import { PDFCheckBox, PDFDocument, PDFRadioGroup, PDFTextField } from "pdf-lib";
import { type ChangeEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";

import { useAuth } from "../contexts/AuthContext";
import "./styles/ImportPlanner.css";

type PlannerData = {
  destination: string;
  dateDebut: string;
  dateFin: string;
  participants: string;
  envies: string;
  prenom: string;
  budget: string;
  devise: string;
  etapes: string[];
};

function convertPdfDate(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) return null;

  const [, day, month, year] = match;
  const isoDate = `${year}-${month}-${day}`;
  const date = new Date(`${isoDate}T12:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return isoDate;
}

function ImportPlanner() {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<PlannerData | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!auth) {
    return <Navigate to="/login?redirect=%2Fstart%2Fimport" replace />;
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setData(null);
    setFileName("");
    setLoading(true);

    try {
      if (
        file.type !== "application/pdf" &&
        !file.name.toLowerCase().endsWith(".pdf")
      ) {
        throw new Error("Veuillez sélectionner un fichier PDF.");
      }

      if (file.size > 30 * 1024 * 1024) {
        throw new Error("Ce PDF dépasse la limite de 30 Mo.");
      }

      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const form = pdf.getForm();

      const fields = new Map(
        form.getFields().map((field) => [field.getName(), field]),
      );

      if (
        pdf.getPageCount() !== 20 ||
        !fields.has("p02_destination") ||
        !fields.has("p04_budget_groupe") ||
        !fields.has("p05_etape_1_destination")
      ) {
        throw new Error(
          "Ce fichier ne correspond pas au carnet TripTogether attendu.",
        );
      }

      function getText(name: string): string {
        const field = fields.get(name);

        return field instanceof PDFTextField
          ? (field.getText()?.trim() ?? "")
          : "";
      }

      // Préparation des autres champs pour les prochaines étapes.
      // Les cases cochées sont représentées par true.
      const allFields: Record<string, string | boolean> = {};

      for (const [name, field] of fields) {
        if (field instanceof PDFTextField) {
          allFields[name] = field.getText() ?? "";
        } else if (field instanceof PDFCheckBox) {
          allFields[name] = field.isChecked();
        } else if (field instanceof PDFRadioGroup) {
          allFields[name] = field.getSelected() ?? "";
        }
      }

      const parsedData: PlannerData = {
        destination: getText("p02_destination"),
        dateDebut: getText("p02_date_debut"),
        dateFin: getText("p02_date_fin"),
        participants: getText("p02_participants"),
        envies: getText("p02_envies_attentes"),
        prenom: getText("p03_prenom"),
        budget: getText("p04_budget_groupe"),
        devise: getText("p04_devise"),
        etapes: [1, 2, 3].map((number) =>
          getText(`p05_etape_${number}_destination`),
        ),
      };

      const hasAnswers = Object.values(allFields).some(
        (value) =>
          value === true || (typeof value === "string" && value.trim() !== ""),
      );

      if (!hasAnswers) {
        throw new Error(
          "Aucune réponse n'a été trouvée. Vérifiez que vous avez enregistré votre PDF après l'avoir rempli.",
        );
      }

      setData(parsedData);
      setFileName(file.name);
    } catch (err) {
      console.error("Erreur import PDF :", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de lire ce carnet PDF.",
      );
    } finally {
      setLoading(false);
      event.target.value = "";
    }
  }

  function updateField(field: keyof PlannerData, value: string) {
    setData((previous) =>
      previous ? { ...previous, [field]: value } : previous,
    );
  }

  function handleContinue() {
    if (!data) return;

    setError("");

    if (!data.destination.trim()) {
      setError("Veuillez renseigner une destination.");
      return;
    }

    const startDate = convertPdfDate(data.dateDebut);
    const endDate = convertPdfDate(data.dateFin);

    if (!startDate || !endDate) {
      setError("Veuillez saisir des dates valides au format JJ/MM/AAAA.");
      return;
    }

    if (endDate <= startDate) {
      setError("La date de retour doit être après le départ.");
      return;
    }

    const today = new Date();
    const localToday = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (startDate < localToday) {
      setError("La date de départ ne peut pas être dans le passé.");
      return;
    }

    navigate("/create-trip", {
      state: {
        source: "etsy-planner",
        planner: {
          ...data,
          dateDebut: startDate,
          dateFin: endDate,
        },
      },
    });
  }

  return (
    <div className="planner-import-page">
      <div className="planner-import-container">
        <Link to="/start" className="planner-back">
          ← Retour
        </Link>

        <div className="planner-import-heading">
          <FileUp size={36} />
          <h1>Importez votre carnet de voyage</h1>
          <p>
            Sélectionnez votre PDF TripTogether rempli et enregistré. Nous
            récupérerons vos informations pour préparer votre voyage.
          </p>
        </div>

        <div className="planner-upload">
          <label htmlFor="planner-file" className="planner-upload-label">
            <FileUp size={28} />
            {loading ? "Lecture du carnet..." : "Sélectionner mon PDF"}
          </label>

          <input
            id="planner-file"
            className="planner-file-input"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={loading}
          />

          <p>Le fichier est lu dans votre navigateur, sans envoi au serveur.</p>
        </div>

        {error && (
          <p className="planner-error" role="alert">
            {error}
          </p>
        )}

        {data && (
          <section className="planner-results">
            <div className="planner-success">
              <FileCheck2 size={24} />
              <span>Carnet lu : {fileName}</span>
            </div>

            <h2>Vérifiez les informations récupérées</h2>
            <p>Vous pouvez corriger les réponses avant la prochaine étape.</p>

            <div className="planner-sections">
              {/* INFORMATIONS DU VOYAGE */}
              <div className="planner-section">
                <div className="planner-section-heading">
                  <Plane size={25} />
                  <div>
                    <h3>Informations du voyage</h3>
                    <p>Destination, dates et voyageurs</p>
                  </div>
                </div>

                <div className="planner-fields">
                  {(
                    [
                      ["destination", "Destination"],
                      ["dateDebut", "Date de départ"],
                      ["dateFin", "Date de retour"],
                      ["participants", "Participants"],
                    ] as const
                  ).map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input
                        type="text"
                        value={data[field]}
                        onChange={(event) =>
                          updateField(field, event.target.value)
                        }
                      />
                    </label>
                  ))}

                  <label>
                    Prénom
                    <input
                      type="text"
                      value={data.prenom}
                      onChange={(event) =>
                        updateField("prenom", event.target.value)
                      }
                    />
                  </label>

                  <label className="planner-full-width">
                    Nos envies et attentes
                    <textarea
                      rows={3}
                      value={data.envies}
                      onChange={(event) =>
                        updateField("envies", event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              {/* BUDGET */}
              <div className="planner-section">
                <div className="planner-section-heading">
                  <Wallet size={25} />
                  <div>
                    <h3>Budget prévisionnel</h3>
                    <p>Montant et devise du voyage</p>
                  </div>
                </div>

                <div className="planner-fields">
                  <label>
                    Budget du groupe
                    <input
                      type="text"
                      value={data.budget}
                      onChange={(event) =>
                        updateField("budget", event.target.value)
                      }
                    />
                  </label>

                  <label>
                    Devise
                    <input
                      type="text"
                      value={data.devise}
                      placeholder="Ex. EUR, JPY, USD"
                      onChange={(event) =>
                        updateField("devise", event.target.value)
                      }
                    />
                  </label>
                </div>
              </div>

              {/* ITINÉRAIRE */}
              <div className="planner-section">
                <div className="planner-section-heading">
                  <MapPinned size={25} />
                  <div>
                    <h3>Les étapes du voyage</h3>
                    <p>Votre itinéraire initial</p>
                  </div>
                </div>

                <div className="planner-fields">
                  {data.etapes.map((etape, index) => (
                    <label key={`p05_etape_${index + 1}_destination`}>
                      Étape {index + 1}
                      <input
                        type="text"
                        value={etape}
                        placeholder="Destination facultative"
                        onChange={(event) =>
                          setData((previous) => {
                            if (!previous) return previous;

                            const etapes = [...previous.etapes];
                            etapes[index] = event.target.value;

                            return { ...previous, etapes };
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              className="planner-create-button"
              onClick={handleContinue}
            >
              Continuer vers la création du voyage →
            </button>
          </section>
        )}
      </div>
    </div>
  );
}

export default ImportPlanner;
