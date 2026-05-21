import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const API_URL = "https://tabiblink-backend.onrender.com";

function DoctorRendezVousPage() {
  const navigate = useNavigate();
  const medecinEmail = localStorage.getItem("medecinEmail");

  const [rendezVous, setRendezVous] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [message, setMessage] = useState("");
  const [filtre, setFiltre] = useState("TOUS");

  useEffect(() => {
    if (!medecinEmail) {
      navigate("/connexion");
      return;
    }
    chargerRendezVous();
  }, []);

  const chargerRendezVous = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${API_URL}/api/rendez-vous/medecin/${medecinEmail}`
      );

      if (!res.ok) {
        setMessage("Impossible de charger les demandes de rendez-vous.");
        return;
      }

      const data = await res.json();
      setRendezVous(data);
    } catch (e) {
      setMessage("Erreur lors du chargement des rendez-vous.");
    } finally {
      setLoading(false);
    }
  };

  const changerStatut = async (id, action) => {
    setActionLoadingId(id);
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/api/rendez-vous/${id}/${action}`, {
        method: "PUT",
      });

      if (!res.ok) {
        const error = await res.text();
        setMessage(error || "Action impossible.");
        return;
      }

      if (action === "confirmer") {
        setMessage("Rendez-vous confirmé avec succès.");
      } else if (action === "annuler") {
        setMessage("Rendez-vous refusé avec succès.");
      } else {
        setMessage("Rendez-vous terminé avec succès.");
      }

      await chargerRendezVous();
    } catch (e) {
      setMessage("Erreur lors de l'action.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const rdvFiltres =
    filtre === "TOUS"
      ? rendezVous
      : rendezVous.filter((rdv) => rdv.statut === filtre);

  const countByStatus = (status) =>
    rendezVous.filter((rdv) => rdv.statut === status).length;

  if (loading) {
    return (
      <div style={loadingPageStyle}>
        <div style={loaderCardStyle}>Chargement des demandes...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <p style={badgeStyle}>Rendez-vous médecin</p>
            <h1 style={titleStyle}>Demandes de rendez-vous</h1>
            <p style={subtitleStyle}>
              Consultez les demandes reçues, confirmez les rendez-vous ou
              refusez les créneaux non disponibles.
            </p>
          </div>

          <button
            style={backButtonStyle}
            onClick={() => navigate("/espace-medecin")}
          >
            ← Retour
          </button>
        </header>

        <section style={statsGridStyle}>
          <StatCard label="En attente" value={countByStatus("EN_ATTENTE")} color="#F59E0B" bg="#FFFBEB" />
          <StatCard label="Confirmés" value={countByStatus("CONFIRME")} color="#059669" bg="#ECFDF5" />
          <StatCard label="Annulés / refusés" value={countByStatus("ANNULE")} color="#DC2626" bg="#FEF2F2" />
          <StatCard label="Terminés" value={countByStatus("TERMINE")} color="#2563EB" bg="#EFF6FF" />
        </section>

        {message && <div style={messageStyle}>{message}</div>}

        <section style={filterBarStyle}>
          {["TOUS", "EN_ATTENTE", "CONFIRME", "ANNULE", "TERMINE"].map((item) => (
            <button
              key={item}
              style={{
                ...filterButtonStyle,
                background: filtre === item ? "#0F766E" : "#FFFFFF",
                color: filtre === item ? "#FFFFFF" : "#334155",
              }}
              onClick={() => setFiltre(item)}
            >
              {labelStatut(item)}
            </button>
          ))}
        </section>

        {rdvFiltres.length === 0 ? (
          <div style={emptyCardStyle}>
            <h2>Aucune demande trouvée</h2>
            <p>Aucun rendez-vous ne correspond au filtre sélectionné.</p>
          </div>
        ) : (
          <section style={rdvGridStyle}>
            {rdvFiltres.map((rdv) => (
              <article key={rdv.id} style={rdvCardStyle}>
                <div style={rdvHeaderStyle}>
                  <div>
                    <p style={patientLabelStyle}>Patient</p>
                    <h2 style={patientNameStyle}>{rdv.patientNomComplet}</h2>
                  </div>

                  <span
                    style={{
                      ...statusBadgeStyle,
                      ...statusStyle(rdv.statut),
                    }}
                  >
                    {labelStatut(rdv.statut)}
                  </span>
                </div>

                <div style={infoGridStyle}>
                  <InfoItem icon="📅" label="Date" value={formatDate(rdv.dateRendezVous)} />
                  <InfoItem icon="⏰" label="Heure" value={rdv.heureRendezVous} />
                  <InfoItem icon="📍" label="Lieu" value={rdv.lieu || "Non précisé"} />
                  <InfoItem icon="🩺" label="Spécialité" value={rdv.specialite || "Non précisée"} />
                </div>

                <div style={motifBoxStyle}>
                  <p style={motifLabelStyle}>Motif</p>
                  <p style={motifTextStyle}>
                    {rdv.motif || "Aucun motif précisé."}
                  </p>
                </div>

                <div style={actionsStyle}>
                  <button
                    style={infoButtonStyle}
                    onClick={() =>
                      navigate(`/patient-info/${encodeURIComponent(rdv.patientEmail)}`)
                    }
                  >
                    Voir patient
                  </button>

                  {(rdv.statut === "CONFIRME" || rdv.statut === "TERMINE") && (
                    <button
                      style={prescriptionButtonStyle}
                      onClick={() => navigate(`/prescrire-examen/${rdv.id}`)}
                    >
                      Prescrire examen
                    </button>
                  )}

                  {rdv.statut === "EN_ATTENTE" && (
                    <>
                      <button
                        style={confirmButtonStyle}
                        disabled={actionLoadingId === rdv.id}
                        onClick={() => changerStatut(rdv.id, "confirmer")}
                      >
                        Confirmer
                      </button>

                      <button
                        style={rejectButtonStyle}
                        disabled={actionLoadingId === rdv.id}
                        onClick={() => changerStatut(rdv.id, "annuler")}
                      >
                        Refuser
                      </button>
                    </>
                  )}

                  {rdv.statut === "CONFIRME" && (
                    <>
                      <button
                        style={finishButtonStyle}
                        disabled={actionLoadingId === rdv.id}
                        onClick={() => changerStatut(rdv.id, "terminer")}
                      >
                        Terminer
                      </button>

                      <button
                        style={rejectButtonStyle}
                        disabled={actionLoadingId === rdv.id}
                        onClick={() => changerStatut(rdv.id, "annuler")}
                      >
                        Annuler
                      </button>
                    </>
                  )}

                  {rdv.statut === "ANNULE" && (
                    <span style={closedTextStyle}>Aucune action disponible</span>
                  )}
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{ ...statCardStyle, background: bg }}>
      <p style={statLabelStyle}>{label}</p>
      <h2 style={{ ...statValueStyle, color }}>{value}</h2>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div style={infoItemStyle}>
      <span style={infoIconStyle}>{icon}</span>
      <div>
        <p style={infoLabelStyle}>{label}</p>
        <strong style={infoValueStyle}>{value}</strong>
      </div>
    </div>
  );
}

function labelStatut(statut) {
  switch (statut) {
    case "TOUS": return "Tous";
    case "EN_ATTENTE": return "En attente";
    case "CONFIRME": return "Confirmé";
    case "ANNULE": return "Annulé / refusé";
    case "TERMINE": return "Terminé";
    default: return statut;
  }
}

function statusStyle(statut) {
  switch (statut) {
    case "EN_ATTENTE":
      return { background: "#FFFBEB", color: "#B45309", borderColor: "#FDE68A" };
    case "CONFIRME":
      return { background: "#ECFDF5", color: "#047857", borderColor: "#A7F3D0" };
    case "ANNULE":
      return { background: "#FEF2F2", color: "#B91C1C", borderColor: "#FECACA" };
    case "TERMINE":
      return { background: "#EFF6FF", color: "#1D4ED8", borderColor: "#BFDBFE" };
    default:
      return { background: "#F8FAFC", color: "#334155", borderColor: "#E2E8F0" };
  }
}

function formatDate(date) {
  if (!date) return "Non précisée";
  return new Date(date).toLocaleDateString("fr-FR");
}

const pageStyle = {
  minHeight: "100vh",
  width: "100vw",
  background:
    "radial-gradient(circle at top left, rgba(20,184,166,0.16), transparent 30%), linear-gradient(135deg, #F8FAFC 0%, #EEF6F6 45%, #EFF6FF 100%)",
  padding: "32px",
  boxSizing: "border-box",
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
};

const containerStyle = { maxWidth: "1280px", margin: "0 auto" };

const headerStyle = {
  background: "linear-gradient(135deg, #0F766E 0%, #0F4C81 100%)",
  color: "#fff",
  borderRadius: "32px",
  padding: "32px",
  marginBottom: "24px",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  flexWrap: "wrap",
  boxShadow: "0 24px 60px rgba(15, 76, 129, 0.22)",
};

const badgeStyle = {
  display: "inline-block",
  margin: "0 0 12px 0",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.17)",
  fontSize: "12px",
  fontWeight: "900",
  letterSpacing: "0.8px",
  textTransform: "uppercase",
};

const titleStyle = { margin: "0 0 10px 0", fontSize: "38px", fontWeight: "950" };

const subtitleStyle = {
  margin: 0,
  maxWidth: "760px",
  color: "rgba(255,255,255,0.9)",
  fontSize: "16px",
  lineHeight: "1.7",
};

const backButtonStyle = {
  alignSelf: "flex-start",
  background: "#FFFFFF",
  color: "#0F4C81",
  border: "none",
  borderRadius: "16px",
  padding: "14px 20px",
  fontSize: "14px",
  fontWeight: "900",
  cursor: "pointer",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "20px",
};

const statCardStyle = {
  borderRadius: "24px",
  padding: "22px",
  border: "1px solid rgba(226,232,240,0.9)",
  boxShadow: "0 16px 34px rgba(15,23,42,0.07)",
};

const statLabelStyle = { margin: 0, color: "#64748B", fontSize: "14px", fontWeight: "800" };
const statValueStyle = { margin: "8px 0 0", fontSize: "34px", fontWeight: "950" };

const messageStyle = {
  background: "#ECFDF5",
  color: "#047857",
  border: "1px solid #A7F3D0",
  borderRadius: "18px",
  padding: "15px 18px",
  marginBottom: "20px",
  fontWeight: "800",
};

const filterBarStyle = { display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "22px" };

const filterButtonStyle = {
  border: "1px solid #DDE7EE",
  borderRadius: "999px",
  padding: "11px 17px",
  fontSize: "14px",
  fontWeight: "850",
  cursor: "pointer",
  boxShadow: "0 8px 18px rgba(15,23,42,0.05)",
};

const rdvGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
  gap: "20px",
};

const rdvCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};

const rdvHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "14px",
  marginBottom: "18px",
};

const patientLabelStyle = { margin: 0, color: "#64748B", fontSize: "13px", fontWeight: "850" };
const patientNameStyle = { margin: "5px 0 0", color: "#0F172A", fontSize: "24px", fontWeight: "950" };

const statusBadgeStyle = {
  border: "1px solid",
  borderRadius: "999px",
  padding: "8px 12px",
  fontSize: "12px",
  fontWeight: "900",
  whiteSpace: "nowrap",
};

const infoGridStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" };

const infoItemStyle = {
  display: "flex",
  gap: "10px",
  alignItems: "flex-start",
  background: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  padding: "13px",
};

const infoIconStyle = { fontSize: "20px" };
const infoLabelStyle = { margin: 0, color: "#64748B", fontSize: "12px", fontWeight: "800" };
const infoValueStyle = { display: "block", marginTop: "4px", color: "#0F172A", fontSize: "14px" };

const motifBoxStyle = {
  background: "#F0FDFA",
  border: "1px solid #CCFBF1",
  borderRadius: "18px",
  padding: "14px",
  marginBottom: "18px",
};

const motifLabelStyle = { margin: 0, color: "#0F766E", fontSize: "13px", fontWeight: "900" };
const motifTextStyle = { margin: "7px 0 0", color: "#334155", fontSize: "14px", lineHeight: "1.6" };

const actionsStyle = { display: "flex", gap: "10px", flexWrap: "wrap" };

const infoButtonStyle = {
  flex: 1,
  background: "#EFF6FF",
  color: "#1D4ED8",
  border: "1px solid #BFDBFE",
  borderRadius: "15px",
  padding: "13px 16px",
  fontWeight: "900",
  cursor: "pointer",
};

const prescriptionButtonStyle = {
  flex: 1,
  background: "#ECFDF5",
  color: "#047857",
  border: "1px solid #A7F3D0",
  borderRadius: "15px",
  padding: "13px 16px",
  fontWeight: "900",
  cursor: "pointer",
};

const confirmButtonStyle = {
  flex: 1,
  background: "#0F766E",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "15px",
  padding: "13px 16px",
  fontWeight: "900",
  cursor: "pointer",
};

const rejectButtonStyle = {
  flex: 1,
  background: "#FEF2F2",
  color: "#B91C1C",
  border: "1px solid #FECACA",
  borderRadius: "15px",
  padding: "13px 16px",
  fontWeight: "900",
  cursor: "pointer",
};

const finishButtonStyle = {
  flex: 1,
  background: "#2563EB",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "15px",
  padding: "13px 16px",
  fontWeight: "900",
  cursor: "pointer",
};

const closedTextStyle = { color: "#64748B", fontSize: "14px", fontWeight: "800" };

const emptyCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "28px",
  padding: "36px",
  textAlign: "center",
  color: "#64748B",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};

const loadingPageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#F8FAFC",
};

const loaderCardStyle = {
  background: "#FFFFFF",
  color: "#0284C7",
  padding: "24px 32px",
  borderRadius: "22px",
  fontWeight: "900",
  boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
};

export default DoctorRendezVousPage;