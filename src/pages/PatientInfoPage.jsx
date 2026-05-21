import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const API_URL = "https://tabiblink-backend.onrender.com";

function PatientInfoPage() {
  const navigate = useNavigate();
  const { email } = useParams();

  const [patient, setPatient] = useState(null);
  const [scoreFiabilite, setScoreFiabilite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingScore, setLoadingScore] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    chargerPatient();
    chargerScoreFiabilite();
  }, [email]);

  const chargerPatient = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/patient/info/${encodeURIComponent(email)}`
      );

      if (!res.ok) {
        setMessage("Impossible de charger les informations du patient.");
        return;
      }

      const data = await res.json();
      setPatient(data);
    } catch (e) {
      setMessage("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const chargerScoreFiabilite = async () => {
    if (!email) return;

    try {
      setLoadingScore(true);

      const res = await fetch(
        `${API_URL}/api/rendez-vous/patient/${encodeURIComponent(
          email
        )}/score-fiabilite`
      );

      if (!res.ok) {
        setScoreFiabilite(null);
        return;
      }

      const data = await res.json();
      setScoreFiabilite(data);
    } catch (e) {
      setScoreFiabilite(null);
    } finally {
      setLoadingScore(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#0F766E";
    if (score >= 60) return "#0284C7";
    if (score >= 40) return "#F59E0B";
    return "#DC2626";
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={loadingCardStyle}>Chargement du patient...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={bgCircleOne}></div>
      <div style={bgCircleTwo}></div>

      <div style={containerStyle}>
        <button style={backButtonStyle} onClick={() => navigate(-1)}>
          ← Retour
        </button>

        <div style={mainCardStyle}>
          <div style={leftPanelStyle}>
            <div style={avatarStyle}>
              {patient?.prenom?.charAt(0) || "P"}
              {patient?.nom?.charAt(0) || ""}
            </div>

            <p style={badgeStyle}>Fiche patient</p>

            <h1 style={titleStyle}>
              {patient?.prenom} {patient?.nom}
            </h1>

            <p style={subtitleStyle}>
              Informations personnelles consultables par le médecin dans le
              cadre du rendez-vous.
            </p>

            <button
              style={documentsButtonStyle}
              disabled={!patient}
              onClick={() =>
                navigate(
                  `/documents-autorises/${encodeURIComponent(patient.email)}`
                )
              }
            >
              📄 Consulter les documents autorisés
            </button>
          </div>

          <div style={rightPanelStyle}>
            <div style={sectionHeaderStyle}>
              <div>
                <p style={sectionSmallStyle}>Dossier patient</p>
                <h2 style={sectionTitleStyle}>Informations générales</h2>
              </div>
              <div style={iconBoxStyle}>👤</div>
            </div>

            {message && <div style={messageStyle}>{message}</div>}

            {patient && (
              <div style={infoGridStyle}>
                <Info icon="🧾" label="Nom" value={patient.nom} />
                <Info icon="🧾" label="Prénom" value={patient.prenom} />
                <Info icon="✉️" label="Email" value={patient.email} />
                <Info
                  icon="📞"
                  label="Téléphone"
                  value={patient.telephone || "Non précisé"}
                />
                <Info
                  icon="⚧"
                  label="Sexe"
                  value={patient.sexe || "Non précisé"}
                />
              </div>
            )}

            <div style={scoreCardStyle}>
              <div style={scoreHeaderStyle}>
                <div>
                  <p style={sectionSmallStyle}>Fiabilité</p>
                  <h3 style={scoreTitleStyle}>Score de fiabilité du patient</h3>
                </div>
                <div style={scoreIconStyle}>⭐</div>
              </div>

              {loadingScore ? (
                <div style={scoreLoadingStyle}>Chargement du score...</div>
              ) : scoreFiabilite ? (
                <div style={scoreContentStyle}>
                  <div
                    style={{
                      ...scoreCircleStyle,
                      borderColor: getScoreColor(scoreFiabilite.score),
                      color: getScoreColor(scoreFiabilite.score),
                    }}
                  >
                    {scoreFiabilite.score}%
                  </div>

                  <div style={scoreTextBlockStyle}>
                    <strong
                      style={{
                        ...scoreLevelStyle,
                        color: getScoreColor(scoreFiabilite.score),
                      }}
                    >
                      {scoreFiabilite.niveau}
                    </strong>

                    <p style={scoreDescriptionStyle}>
                      Ce score est calculé selon l’historique des rendez-vous du
                      patient. Les annulations faites moins de 24 heures avant
                      le rendez-vous diminuent le score.
                    </p>

                    <div style={scoreStatsStyle}>
                      <span>Total RDV : {scoreFiabilite.totalRendezVous}</span>
                      <span>
                        RDV terminés : {scoreFiabilite.rendezVousTermines}
                      </span>
                      <span>
                        Annulations tardives :{" "}
                        {scoreFiabilite.annulationsTardives}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={messageStyle}>
                  Score de fiabilité non disponible.
                </div>
              )}
            </div>

            <div style={noteBoxStyle}>
              <strong>Note :</strong> ces informations sont affichées en lecture
              seule. Le médecin ne peut pas modifier les données du patient.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ icon, label, value }) {
  return (
    <div style={infoBoxStyle}>
      <div style={infoIconStyle}>{icon}</div>
      <div>
        <span style={infoLabelStyle}>{label}</span>
        <strong style={infoValueStyle}>{value}</strong>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  width: "100vw",
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(135deg, #F8FAFC 0%, #E6F6F4 45%, #EFF6FF 100%)",
  padding: "32px",
  boxSizing: "border-box",
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
};

const bgCircleOne = {
  position: "fixed",
  width: "420px",
  height: "420px",
  borderRadius: "50%",
  background: "rgba(20,184,166,0.16)",
  top: "-140px",
  left: "-120px",
};

const bgCircleTwo = {
  position: "fixed",
  width: "460px",
  height: "460px",
  borderRadius: "50%",
  background: "rgba(2,132,199,0.12)",
  bottom: "-160px",
  right: "-120px",
};

const containerStyle = {
  position: "relative",
  zIndex: 2,
  maxWidth: "1120px",
  margin: "0 auto",
};

const backButtonStyle = {
  background: "#FFFFFF",
  color: "#0F172A",
  border: "1px solid #E2E8F0",
  borderRadius: "16px",
  padding: "13px 20px",
  fontWeight: "900",
  cursor: "pointer",
  marginBottom: "22px",
  boxShadow: "0 10px 24px rgba(15,23,42,0.07)",
};

const mainCardStyle = {
  display: "grid",
  gridTemplateColumns: "360px 1fr",
  gap: "24px",
  alignItems: "stretch",
};

const leftPanelStyle = {
  background: "linear-gradient(180deg, #0F766E 0%, #0F4C81 100%)",
  color: "#FFFFFF",
  borderRadius: "34px",
  padding: "34px",
  boxShadow: "0 28px 60px rgba(15,76,129,0.28)",
};

const rightPanelStyle = {
  background: "rgba(255,255,255,0.92)",
  border: "1px solid rgba(226,232,240,0.95)",
  borderRadius: "34px",
  padding: "34px",
  boxShadow: "0 26px 60px rgba(15,23,42,0.10)",
};

const avatarStyle = {
  width: "96px",
  height: "96px",
  borderRadius: "30px",
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.35)",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "34px",
  fontWeight: "950",
  marginBottom: "24px",
};

const badgeStyle = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.16)",
  color: "#E0F2FE",
  fontSize: "12px",
  fontWeight: "950",
  textTransform: "uppercase",
  letterSpacing: "0.8px",
  margin: "0 0 16px 0",
};

const titleStyle = {
  margin: "0 0 12px 0",
  fontSize: "33px",
  lineHeight: "1.15",
  fontWeight: "950",
};

const subtitleStyle = {
  margin: "0 0 28px 0",
  color: "rgba(255,255,255,0.86)",
  fontSize: "15px",
  lineHeight: "1.7",
};

const documentsButtonStyle = {
  width: "100%",
  background: "#FFFFFF",
  color: "#0F766E",
  border: "none",
  borderRadius: "18px",
  padding: "15px 20px",
  fontSize: "14px",
  fontWeight: "950",
  cursor: "pointer",
  boxShadow: "0 14px 28px rgba(0,0,0,0.16)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "18px",
  marginBottom: "24px",
};

const sectionSmallStyle = {
  margin: "0 0 8px 0",
  color: "#0F766E",
  fontSize: "13px",
  fontWeight: "950",
  textTransform: "uppercase",
  letterSpacing: "0.7px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#0F172A",
  fontSize: "30px",
  fontWeight: "950",
};

const iconBoxStyle = {
  width: "58px",
  height: "58px",
  borderRadius: "20px",
  background: "#ECFDF5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
};

const infoGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "16px",
};

const infoBoxStyle = {
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: "22px",
  padding: "18px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const infoIconStyle = {
  width: "44px",
  height: "44px",
  borderRadius: "16px",
  background: "#E0F2FE",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "21px",
};

const infoLabelStyle = {
  display: "block",
  color: "#64748B",
  fontSize: "13px",
  fontWeight: "850",
  marginBottom: "5px",
};

const infoValueStyle = {
  display: "block",
  color: "#0F172A",
  fontSize: "15px",
  fontWeight: "950",
};

const scoreCardStyle = {
  marginTop: "24px",
  background: "#FFFFFF",
  border: "1px solid #D1FAE5",
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 14px 32px rgba(15,118,110,0.10)",
};

const scoreHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "16px",
  marginBottom: "18px",
};

const scoreTitleStyle = {
  margin: 0,
  color: "#0F172A",
  fontSize: "21px",
  fontWeight: "950",
};

const scoreIconStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "18px",
  background: "#FEF3C7",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "25px",
};

const scoreLoadingStyle = {
  color: "#64748B",
  fontWeight: "850",
};

const scoreContentStyle = {
  display: "flex",
  gap: "22px",
  alignItems: "center",
};

const scoreCircleStyle = {
  minWidth: "96px",
  height: "96px",
  borderRadius: "50%",
  border: "7px solid #0F766E",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  fontWeight: "950",
  background: "#F8FAFC",
};

const scoreTextBlockStyle = {
  flex: 1,
};

const scoreLevelStyle = {
  display: "block",
  fontSize: "20px",
  fontWeight: "950",
  marginBottom: "8px",
};

const scoreDescriptionStyle = {
  margin: "0 0 14px 0",
  color: "#475569",
  lineHeight: "1.6",
  fontSize: "14px",
};

const scoreStatsStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  color: "#334155",
  fontSize: "13px",
  fontWeight: "850",
};

const noteBoxStyle = {
  marginTop: "24px",
  background: "#F0FDFA",
  border: "1px solid #CCFBF1",
  color: "#334155",
  borderRadius: "20px",
  padding: "16px 18px",
  lineHeight: "1.6",
  fontSize: "14px",
};

const messageStyle = {
  background: "#FFF7ED",
  color: "#C2410C",
  border: "1px solid #FDBA74",
  borderRadius: "18px",
  padding: "15px 18px",
  marginBottom: "20px",
  fontWeight: "850",
};

const loadingCardStyle = {
  background: "#FFFFFF",
  color: "#0284C7",
  padding: "24px 34px",
  borderRadius: "22px",
  fontWeight: "900",
  boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
};

export default PatientInfoPage;