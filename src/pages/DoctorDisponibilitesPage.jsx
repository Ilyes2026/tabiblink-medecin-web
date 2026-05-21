import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const API_URL = "https://tabiblink-backend.onrender.com";

const jours = [
  { key: "LUNDI", label: "Lundi" },
  { key: "MARDI", label: "Mardi" },
  { key: "MERCREDI", label: "Mercredi" },
  { key: "JEUDI", label: "Jeudi" },
  { key: "VENDREDI", label: "Vendredi" },
  { key: "SAMEDI", label: "Samedi" },
  { key: "DIMANCHE", label: "Dimanche" },
];

function DoctorDisponibilitesPage() {
  const navigate = useNavigate();
  const medecinEmail = localStorage.getItem("medecinEmail");

  const [medecinId, setMedecinId] = useState(null);
  const [disponibilites, setDisponibilites] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingDay, setSavingDay] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!medecinEmail) {
      navigate("/connexion");
      return;
    }
    chargerMedecin();
  }, []);

  const defaultDispo = (jour) => ({
    jourSemaine: jour,
    actif: false,
    actifMatin: true,
    actifApresMidi: true,
    heureDebutMatin: "09:00",
    heureFinMatin: "12:00",
    heureDebutApresMidi: "14:00",
    heureFinApresMidi: "17:00",
  });

  const chargerMedecin = async () => {
    try {
      const res = await fetch(`${API_URL}/api/medecins/profil/${medecinEmail}`);

      if (!res.ok) {
        setMessage("Impossible de charger le profil médecin.");
        return;
      }

      const data = await res.json();
      setMedecinId(data.id);
      await chargerDisponibilites(data.id);
    } catch (e) {
      setMessage("Erreur lors du chargement.");
    } finally {
      setLoading(false);
    }
  };

  const chargerDisponibilites = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/disponibilites-medecin/${id}`);
      const data = res.ok ? await res.json() : [];

      const map = {};

      jours.forEach((j) => {
        map[j.key] = defaultDispo(j.key);
      });

      data.forEach((d) => {
        map[d.jourSemaine] = {
          jourSemaine: d.jourSemaine,
          actif: d.actif ?? false,

          actifMatin: !!d.heureDebutMatin && !!d.heureFinMatin,
          actifApresMidi:
            !!d.heureDebutApresMidi && !!d.heureFinApresMidi,

          heureDebutMatin: d.heureDebutMatin || "09:00",
          heureFinMatin: d.heureFinMatin || "12:00",
          heureDebutApresMidi: d.heureDebutApresMidi || "14:00",
          heureFinApresMidi: d.heureFinApresMidi || "17:00",
        };
      });

      setDisponibilites(map);
    } catch (e) {
      setMessage("Erreur lors du chargement des disponibilités.");
    }
  };

  const updateDay = (jour, field, value) => {
    setDisponibilites((prev) => ({
      ...prev,
      [jour]: {
        ...prev[jour],
        [field]: value,
      },
    }));
  };

  const enregistrerJour = async (jour) => {
    setSavingDay(jour);
    setMessage("");

    const dispo = disponibilites[jour];

    const body = {
      medecinId,
      jourSemaine: jour,
      actif: dispo.actif,

      heureDebutMatin:
        dispo.actif && dispo.actifMatin ? dispo.heureDebutMatin : null,

      heureFinMatin:
        dispo.actif && dispo.actifMatin ? dispo.heureFinMatin : null,

      heureDebutApresMidi:
        dispo.actif && dispo.actifApresMidi
          ? dispo.heureDebutApresMidi
          : null,

      heureFinApresMidi:
        dispo.actif && dispo.actifApresMidi
          ? dispo.heureFinApresMidi
          : null,
    };

    try {
      const res = await fetch(`${API_URL}/api/disponibilites-medecin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const error = await res.text();
        setMessage(error || "Impossible d'enregistrer cette disponibilité.");
        return;
      }

      setMessage(`Disponibilité du ${labelJour(jour)} enregistrée avec succès.`);
      await chargerDisponibilites(medecinId);
    } catch (e) {
      setMessage("Erreur lors de l'enregistrement.");
    } finally {
      setSavingDay("");
    }
  };

  const labelJour = (key) => jours.find((j) => j.key === key)?.label || key;

  if (loading) {
    return (
      <div style={loadingPageStyle}>
        <div style={loaderCardStyle}>Chargement des disponibilités...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <p style={badgeStyle}>Planning médecin</p>
            <h1 style={titleStyle}>Gestion des disponibilités</h1>
            <p style={subtitleStyle}>
              Définissez les jours et les horaires pendant lesquels les patients
              peuvent prendre rendez-vous.
            </p>
          </div>

          <button
            style={backButtonStyle}
            onClick={() => navigate("/espace-medecin")}
          >
            ← Retour
          </button>
        </header>

        {message && <div style={messageStyle}>{message}</div>}

        <div style={daysGridStyle}>
          {jours.map((jour) => {
            const dispo = disponibilites[jour.key] || defaultDispo(jour.key);

            return (
              <div key={jour.key} style={dayCardStyle}>
                <div style={dayHeaderStyle}>
                  <div>
                    <h2 style={dayTitleStyle}>{jour.label}</h2>
                    <p style={daySubtitleStyle}>
                      {dispo.actif ? "Disponible ce jour" : "Non disponible"}
                    </p>
                  </div>

                  <label style={switchStyle}>
                    <input
                      type="checkbox"
                      checked={dispo.actif}
                      onChange={(e) =>
                        updateDay(jour.key, "actif", e.target.checked)
                      }
                      style={{ display: "none" }}
                    />
                    <span
                      style={{
                        ...switchTrackStyle,
                        background: dispo.actif ? "#0F766E" : "#CBD5E1",
                      }}
                    >
                      <span
                        style={{
                          ...switchThumbStyle,
                          transform: dispo.actif
                            ? "translateX(24px)"
                            : "translateX(0)",
                        }}
                      />
                    </span>
                  </label>
                </div>

                <div style={{ opacity: dispo.actif ? 1 : 0.45 }}>
                  <div style={periodHeaderStyle}>
                    <p style={periodTitleStyle}>Matin</p>

                    <label style={smallCheckStyle}>
                      <input
                        type="checkbox"
                        checked={dispo.actifMatin}
                        disabled={!dispo.actif}
                        onChange={(e) =>
                          updateDay(jour.key, "actifMatin", e.target.checked)
                        }
                      />
                      Travaille le matin
                    </label>
                  </div>

                  <div style={twoColumnsStyle}>
                    <TimeField
                      label="Début"
                      value={dispo.heureDebutMatin}
                      disabled={!dispo.actif || !dispo.actifMatin}
                      onChange={(v) =>
                        updateDay(jour.key, "heureDebutMatin", v)
                      }
                    />

                    <TimeField
                      label="Fin"
                      value={dispo.heureFinMatin}
                      disabled={!dispo.actif || !dispo.actifMatin}
                      onChange={(v) =>
                        updateDay(jour.key, "heureFinMatin", v)
                      }
                    />
                  </div>

                  <div style={periodHeaderStyle}>
                    <p style={periodTitleStyle}>Après-midi</p>

                    <label style={smallCheckStyle}>
                      <input
                        type="checkbox"
                        checked={dispo.actifApresMidi}
                        disabled={!dispo.actif}
                        onChange={(e) =>
                          updateDay(
                            jour.key,
                            "actifApresMidi",
                            e.target.checked
                          )
                        }
                      />
                      Travaille l’après-midi
                    </label>
                  </div>

                  <div style={twoColumnsStyle}>
                    <TimeField
                      label="Début"
                      value={dispo.heureDebutApresMidi}
                      disabled={!dispo.actif || !dispo.actifApresMidi}
                      onChange={(v) =>
                        updateDay(jour.key, "heureDebutApresMidi", v)
                      }
                    />

                    <TimeField
                      label="Fin"
                      value={dispo.heureFinApresMidi}
                      disabled={!dispo.actif || !dispo.actifApresMidi}
                      onChange={(v) =>
                        updateDay(jour.key, "heureFinApresMidi", v)
                      }
                    />
                  </div>
                </div>

                <button
                  style={{
                    ...saveButtonStyle,
                    opacity: savingDay === jour.key ? 0.7 : 1,
                  }}
                  onClick={() => enregistrerJour(jour.key)}
                  disabled={savingDay === jour.key}
                >
                  {savingDay === jour.key
                    ? "Enregistrement..."
                    : "Enregistrer"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TimeField({ label, value, onChange, disabled }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type="time"
        value={value || ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputStyle,
          background: disabled ? "#E2E8F0" : "#F8FAFC",
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      />
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  width: "100vw",
  background:
    "radial-gradient(circle at top left, rgba(20,184,166,0.18), transparent 32%), linear-gradient(135deg, #F8FAFC 0%, #EEF6F6 45%, #EFF6FF 100%)",
  padding: "32px",
  boxSizing: "border-box",
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1280px",
  margin: "0 auto",
};

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

const titleStyle = {
  margin: "0 0 10px 0",
  fontSize: "38px",
  fontWeight: "950",
};

const subtitleStyle = {
  margin: 0,
  maxWidth: "720px",
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

const messageStyle = {
  background: "#ECFDF5",
  color: "#047857",
  border: "1px solid #A7F3D0",
  borderRadius: "18px",
  padding: "15px 18px",
  marginBottom: "22px",
  fontWeight: "800",
};

const daysGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
  gap: "20px",
};

const dayCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "28px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)",
};

const dayHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const dayTitleStyle = {
  margin: 0,
  color: "#0F172A",
  fontSize: "23px",
  fontWeight: "950",
};

const daySubtitleStyle = {
  margin: "6px 0 0 0",
  color: "#64748B",
  fontSize: "14px",
  fontWeight: "700",
};

const switchStyle = {
  cursor: "pointer",
};

const switchTrackStyle = {
  width: "54px",
  height: "30px",
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  padding: "3px",
  transition: "0.2s",
};

const switchThumbStyle = {
  width: "24px",
  height: "24px",
  borderRadius: "50%",
  background: "#FFFFFF",
  transition: "0.2s",
  boxShadow: "0 4px 10px rgba(0,0,0,0.18)",
};

const periodHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
  marginTop: "16px",
};

const periodTitleStyle = {
  margin: "16px 0 10px",
  color: "#0F766E",
  fontSize: "14px",
  fontWeight: "900",
};

const smallCheckStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "800",
};

const twoColumnsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "800",
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "15px",
  border: "1px solid #DDE7EE",
  background: "#F8FAFC",
  color: "#0F172A",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const saveButtonStyle = {
  width: "100%",
  marginTop: "22px",
  background: "linear-gradient(135deg, #0F766E 0%, #0284C7 100%)",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "17px",
  padding: "14px 20px",
  fontSize: "14px",
  fontWeight: "950",
  cursor: "pointer",
  boxShadow: "0 14px 28px rgba(2,132,199,0.24)",
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

export default DoctorDisponibilitesPage;