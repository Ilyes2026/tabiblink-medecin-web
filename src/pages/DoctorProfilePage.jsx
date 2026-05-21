import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ latitude, longitude, onChange }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });

  if (!latitude || !longitude) return null;

  return (
    <Marker
      position={[Number(latitude), Number(longitude)]}
      icon={markerIcon}
    />
  );
}

function DoctorProfilePage() {
  const navigate = useNavigate();
  const medecinEmail = localStorage.getItem("medecinEmail");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [villes, setVilles] = useState([]);
  const [delegations, setDelegations] = useState([]);

  const [profil, setProfil] = useState({
    nom: "",
    prenom: "",
    email: "",
    matricule: "",
    titre: "",
    telephoneFixe: "",
    telephoneMobile: "",
    adresseCabinet: "",
    bio: "",
    conventionneCnam: false,
    dureeConsultation: 20,
    diplomesFormations: "",
    specialiteNomFr: "",
    specialiteNomAr: "",
    villeId: "",
    villeNom: "",
    delegationId: "",
    delegationNom: "",
    latitude: 36.8065,
    longitude: 10.1815,
    statutCompte: "",
  });

  useEffect(() => {
    if (!medecinEmail) {
      navigate("/connexion");
      return;
    }

    chargerProfil();
    chargerVilles();
  }, []);

  useEffect(() => {
    if (profil.villeId) {
      chargerDelegations(profil.villeId);
    }
  }, [profil.villeId]);

  const chargerProfil = async () => {
    setLoading(true);
   

    try {
      const response = await fetch(
        `http://localhost:8081/api/medecins/profil/${medecinEmail}`
      );

      if (!response.ok) {
        setMessage("Impossible de charger le profil.");
        return;
      }

      const data = await response.json();

      setProfil((prev) => ({
        ...prev,
        nom: data.nom ?? "",
        prenom: data.prenom ?? "",
        email: data.email ?? "",
        matricule: data.matricule ?? "",
        titre: data.titre ?? "",
        telephoneFixe: data.telephoneFixe ?? "",
        telephoneMobile: data.telephoneMobile ?? "",
        adresseCabinet: data.adresseCabinet ?? "",
        bio: data.bio ?? "",
        conventionneCnam: data.conventionneCnam ?? false,
        dureeConsultation: data.dureeConsultation ?? 20,
        diplomesFormations: data.diplomesFormations ?? "",
        specialiteNomFr: data.specialiteNomFr ?? "",
        specialiteNomAr: data.specialiteNomAr ?? "",
        villeId: data.villeId ?? "",
        villeNom: data.villeNom ?? "",
        delegationId: data.delegationId ?? "",
        delegationNom: data.delegationNom ?? "",
        latitude: data.latitude ?? 36.8065,
        longitude: data.longitude ?? 10.1815,
        statutCompte: data.statutCompte ?? "",
      }));
    } catch (e) {
      setMessage("Erreur lors du chargement du profil.");
    } finally {
      setLoading(false);
    }
  };

  const chargerVilles = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/villes");
      if (response.ok) {
        const data = await response.json();
        setVilles(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const chargerDelegations = async (villeId) => {
    try {
      const response = await fetch(
        `https://tabiblink-backend.onrender.com/api/delegations/ville/${villeId}`
      );

      if (response.ok) {
        const data = await response.json();
        setDelegations(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (field, value) => {
    setProfil((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toNumberOrNull = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    return Number(value);
  };

  const enregistrerProfil = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("Profil professionnel mis à jour avec succès.");
setTimeout(() => {
  setMessage("");
}, 3000);


    const body = {
      nom: profil.nom,
      prenom: profil.prenom,
      titre: profil.titre,
      telephoneFixe: profil.telephoneFixe,
      telephoneMobile: profil.telephoneMobile,
      adresseCabinet: profil.adresseCabinet,
      bio: profil.bio,
      conventionneCnam: profil.conventionneCnam,
      dureeConsultation: toNumberOrNull(profil.dureeConsultation),
      diplomesFormations: profil.diplomesFormations,
      villeId: toNumberOrNull(profil.villeId),
      delegationId: toNumberOrNull(profil.delegationId),
      latitude: toNumberOrNull(profil.latitude),
      longitude: toNumberOrNull(profil.longitude),
    };

    try {
      const response = await fetch(
        `https://tabiblink-backend.onrender.com/api/medecins/profil/${medecinEmail}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        setMessage(error || "Impossible de modifier le profil.");
        return;
      }

      setMessage("Profil professionnel mis à jour avec succès.");
      await chargerProfil();
    } catch (e) {
      setMessage("Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("medecinEmail");
    navigate("/connexion");
  };

  if (loading) {
    return (
      <div style={loadingPageStyle}>
        <div style={loaderCardStyle}>Chargement du profil...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={backgroundCircleOne}></div>
      <div style={backgroundCircleTwo}></div>

      <div style={containerStyle}>
        <header style={topBarStyle}>
          <button style={backButtonStyle} onClick={() => navigate("/espace-medecin")}>
            ← Retour au dashboard
          </button>

          <button style={logoutButtonStyle} onClick={handleLogout}>
            Déconnexion
          </button>
        </header>

        {message && (
          <div
            style={{
              ...messageStyle,
              background: message.includes("succès") ? "#ECFDF5" : "#FFF7ED",
              color: message.includes("succès") ? "#047857" : "#C2410C",
              borderColor: message.includes("succès") ? "#A7F3D0" : "#FDBA74",
            }}
          >
            {message}
          </div>
        )}

        <div style={mainLayoutStyle}>
          <aside style={profileCardStyle}>
            <div style={avatarStyle}>
              {(profil.prenom?.charAt(0) || "M").toUpperCase()}
              {(profil.nom?.charAt(0) || "D").toUpperCase()}
            </div>

            <p style={doctorBadgeStyle}>Profil médecin</p>

            <h1 style={doctorNameStyle}>
              Dr {profil.prenom} {profil.nom}
            </h1>

            <p style={specialityStyle}>
              {profil.specialiteNomFr || "Spécialité non précisée"}
              {profil.specialiteNomAr ? ` / ${profil.specialiteNomAr}` : ""}
            </p>

            <div style={statusCardStyle}>
              <span>Statut du compte</span>
              <strong>{profil.statutCompte || "Non précisé"}</strong>
            </div>

            <div style={miniInfoListStyle}>
              <MiniInfo label="Email" value={profil.email} />
              <MiniInfo label="Matricule" value={profil.matricule} />
              <MiniInfo label="Ville" value={profil.villeNom || "Non précisée"} />
              <MiniInfo label="Délégation" value={profil.delegationNom || "Non précisée"} />
              <MiniInfo
                label="CNAM"
                value={profil.conventionneCnam ? "Conventionné" : "Non conventionné"}
              />
            </div>
          </aside>

          <form style={formPanelStyle} onSubmit={enregistrerProfil}>
            <div style={heroStyle}>
              <div>
                <p style={heroBadgeStyle}>Espace professionnel</p>
                <h2 style={heroTitleStyle}>Modifier mon profil</h2>
                <p style={heroSubtitleStyle}>
                  Ces informations seront visibles par les patients lors de la recherche
                  et de la prise de rendez-vous.
                </p>
              </div>
            </div>

            <Section title="Informations personnelles" icon="👨‍⚕️">
              <div style={twoColumnsStyle}>
                <InputField label="Nom" value={profil.nom} onChange={(v) => handleChange("nom", v)} />
                <InputField label="Prénom" value={profil.prenom} onChange={(v) => handleChange("prenom", v)} />
              </div>

              <div style={twoColumnsStyle}>
                <ReadOnlyField label="Email" value={profil.email} />
                <ReadOnlyField label="Matricule" value={profil.matricule} />
              </div>

              <InputField
                label="Titre"
                value={profil.titre}
                onChange={(v) => handleChange("titre", v)}
                placeholder="Ex : Dr."
              />

              <ReadOnlyBox
                label="Spécialité"
                value={`${profil.specialiteNomFr || "Non précisée"}${
                  profil.specialiteNomAr ? ` / ${profil.specialiteNomAr}` : ""
                }`}
              />
            </Section>

            <Section title="Coordonnées du cabinet" icon="🏥">
              <div style={twoColumnsStyle}>
                <InputField
                  label="Téléphone fixe"
                  value={profil.telephoneFixe}
                  onChange={(v) => handleChange("telephoneFixe", v)}
                />

                <InputField
                  label="Téléphone mobile"
                  value={profil.telephoneMobile}
                  onChange={(v) => handleChange("telephoneMobile", v)}
                />
              </div>

              <InputField
                label="Adresse du cabinet"
                value={profil.adresseCabinet}
                onChange={(v) => handleChange("adresseCabinet", v)}
              />

              <div style={twoColumnsStyle}>
                <SelectField
                  label="Ville"
                  value={profil.villeId ?? ""}
                  onChange={(v) => {
                    handleChange("villeId", v);
                    handleChange("delegationId", "");
                  }}
                  options={villes.map((ville) => ({
                    value: ville.id,
                    label: ville.nomVille || ville.nom,
                  }))}
                  placeholder="Choisir une ville"
                />

                <SelectField
                  label="Délégation"
                  value={profil.delegationId ?? ""}
                  onChange={(v) => handleChange("delegationId", v)}
                  options={delegations.map((delegation) => ({
                    value: delegation.id,
                    label: delegation.nomDelegation || delegation.nom,
                  }))}
                  placeholder="Choisir une délégation"
                />
              </div>
            </Section>

            <Section title="Présentation professionnelle" icon="📋">
              <TextAreaField
                label="Bio"
                value={profil.bio}
                onChange={(v) => handleChange("bio", v)}
                placeholder="Présentez brièvement votre expérience, votre approche et vos services."
              />

              <TextAreaField
                label="Diplômes et formations"
                value={profil.diplomesFormations}
                onChange={(v) => handleChange("diplomesFormations", v)}
                placeholder="Ex : Doctorat en médecine, formations, certifications..."
              />

              <div style={twoColumnsStyle}>
                <InputField
                  label="Durée consultation en minutes"
                  type="number"
                  value={profil.dureeConsultation}
                  onChange={(v) => handleChange("dureeConsultation", v)}
                />

                <SelectField
                  label="Conventionné CNAM"
                  value={profil.conventionneCnam ? "true" : "false"}
                  onChange={(v) => handleChange("conventionneCnam", v === "true")}
                  options={[
                    { value: "true", label: "Oui" },
                    { value: "false", label: "Non" },
                  ]}
                />
              </div>
            </Section>

            <Section title="Localisation du cabinet" icon="📍">
              <p style={hintStyle}>
                Cliquez directement sur la carte pour choisir la position exacte du cabinet.
              </p>

              <div style={mapBoxStyle}>
                <MapContainer
                  center={[Number(profil.latitude), Number(profil.longitude)]}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    attribution="&copy; OpenStreetMap"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationPicker
                    latitude={profil.latitude}
                    longitude={profil.longitude}
                    onChange={(lat, lng) => {
                      handleChange("latitude", lat);
                      handleChange("longitude", lng);
                    }}
                  />
                </MapContainer>
              </div>

              <div style={twoColumnsStyle}>
                <InputField
                  label="Latitude"
                  type="number"
                  value={profil.latitude}
                  onChange={(v) => handleChange("latitude", v)}
                />
                <InputField
                  label="Longitude"
                  type="number"
                  value={profil.longitude}
                  onChange={(v) => handleChange("longitude", v)}
                />
              </div>
            </Section>

            <div style={saveBarStyle}>
              <button type="button" style={cancelButtonStyle} onClick={chargerProfil}>
                Annuler
              </button>

              <button type="submit" disabled={saving} style={saveButtonStyle}>
                {saving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section style={sectionStyle}>
      <div style={sectionHeaderStyle}>
        <div style={sectionIconStyle}>{icon}</div>
        <h3 style={sectionTitleStyle}>{title}</h3>
      </div>
      {children}
    </section>
  );
}

function MiniInfo({ label, value }) {
  return (
    <div style={miniInfoStyle}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} style={inputStyle}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <input value={value ?? ""} readOnly style={{ ...inputStyle, background: "#F1F5F9" }} />
    </div>
  );
}

function ReadOnlyBox({ label, value }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <div style={readOnlyBoxStyle}>{value}</div>
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }}
      />
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  width: "100vw",
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(135deg, #F8FAFC 0%, #E6F6F4 45%, #EFF6FF 100%)",
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
  padding: "28px",
  boxSizing: "border-box",
};

const backgroundCircleOne = {
  position: "fixed",
  width: "420px",
  height: "420px",
  borderRadius: "50%",
  background: "rgba(20, 184, 166, 0.18)",
  top: "-120px",
  left: "-120px",
  filter: "blur(2px)",
};

const backgroundCircleTwo = {
  position: "fixed",
  width: "460px",
  height: "460px",
  borderRadius: "50%",
  background: "rgba(59, 130, 246, 0.14)",
  bottom: "-150px",
  right: "-130px",
  filter: "blur(2px)",
};

const containerStyle = {
  position: "relative",
  zIndex: 2,
  maxWidth: "1320px",
  margin: "0 auto",
};

const topBarStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "22px",
};

const backButtonStyle = {
  background: "#FFFFFF",
  color: "#0F172A",
  border: "1px solid #E2E8F0",
  borderRadius: "16px",
  padding: "13px 18px",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(15,23,42,0.07)",
};

const logoutButtonStyle = {
  background: "#FFF1F2",
  color: "#BE123C",
  border: "1px solid #FECDD3",
  borderRadius: "16px",
  padding: "13px 18px",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(190,18,60,0.08)",
};

const mainLayoutStyle = {
  display: "grid",
  gridTemplateColumns: "340px 1fr",
  gap: "24px",
  alignItems: "start",
};

const profileCardStyle = {
  position: "sticky",
  top: "24px",
  background: "linear-gradient(180deg, #0F766E 0%, #0F4C81 100%)",
  color: "#FFFFFF",
  borderRadius: "34px",
  padding: "30px",
  minHeight: "620px",
  boxShadow: "0 28px 60px rgba(15, 76, 129, 0.28)",
};

const avatarStyle = {
  width: "92px",
  height: "92px",
  borderRadius: "28px",
  background: "rgba(255,255,255,0.18)",
  border: "1px solid rgba(255,255,255,0.35)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "30px",
  fontWeight: "900",
  marginBottom: "22px",
};

const doctorBadgeStyle = {
  display: "inline-block",
  padding: "8px 13px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.16)",
  color: "#E0F2FE",
  fontSize: "12px",
  fontWeight: "900",
  letterSpacing: "0.7px",
  textTransform: "uppercase",
  margin: "0 0 14px 0",
};

const doctorNameStyle = {
  fontSize: "31px",
  lineHeight: "1.15",
  margin: "0 0 12px 0",
  fontWeight: "900",
};

const specialityStyle = {
  margin: "0 0 24px 0",
  color: "rgba(255,255,255,0.86)",
  fontSize: "15px",
  lineHeight: "1.6",
};

const statusCardStyle = {
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.24)",
  borderRadius: "22px",
  padding: "16px",
  marginBottom: "20px",
};

const miniInfoListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const miniInfoStyle = {
  background: "rgba(255,255,255,0.11)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "18px",
  padding: "13px 14px",
  display: "flex",
  flexDirection: "column",
  gap: "5px",
  fontSize: "13px",
};

const formPanelStyle = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.9)",
  borderRadius: "34px",
  padding: "28px",
  boxShadow: "0 26px 60px rgba(15,23,42,0.10)",
};

const heroStyle = {
  background: "linear-gradient(135deg, #FFFFFF 0%, #F0FDFA 100%)",
  border: "1px solid #CCFBF1",
  borderRadius: "28px",
  padding: "26px",
  marginBottom: "22px",
};

const heroBadgeStyle = {
  margin: "0 0 10px 0",
  color: "#0F766E",
  fontSize: "13px",
  fontWeight: "900",
  textTransform: "uppercase",
  letterSpacing: "0.7px",
};

const heroTitleStyle = {
  margin: "0 0 10px 0",
  fontSize: "32px",
  color: "#0F172A",
  fontWeight: "950",
};

const heroSubtitleStyle = {
  margin: 0,
  fontSize: "15px",
  color: "#64748B",
  lineHeight: "1.7",
};

const sectionStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "28px",
  padding: "24px",
  marginBottom: "20px",
  boxShadow: "0 16px 34px rgba(15,23,42,0.06)",
};

const sectionHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  marginBottom: "20px",
};

const sectionIconStyle = {
  width: "42px",
  height: "42px",
  borderRadius: "15px",
  background: "#ECFEFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
};

const sectionTitleStyle = {
  margin: 0,
  color: "#0F172A",
  fontSize: "21px",
  fontWeight: "900",
};

const twoColumnsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
};

const fieldStyle = {
  marginBottom: "16px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#475569",
  fontSize: "13px",
  fontWeight: "850",
};

const inputStyle = {
  width: "100%",
  padding: "15px 15px",
  borderRadius: "17px",
  border: "1px solid #DDE7EE",
  fontSize: "14px",
  color: "#0F172A",
  outline: "none",
  boxSizing: "border-box",
  background: "#F8FAFC",
};

const readOnlyBoxStyle = {
  background: "#F1F5F9",
  border: "1px solid #DDE7EE",
  borderRadius: "17px",
  padding: "15px",
  color: "#334155",
  fontSize: "14px",
  fontWeight: "750",
};

const hintStyle = {
  color: "#64748B",
  fontSize: "14px",
  lineHeight: "1.6",
  marginTop: 0,
};

const mapBoxStyle = {
  height: "350px",
  borderRadius: "26px",
  overflow: "hidden",
  border: "1px solid #CBD5E1",
  marginBottom: "18px",
  boxShadow: "0 18px 36px rgba(15,23,42,0.12)",
};

const saveBarStyle = {
  marginTop: "10px",
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "26px",
  padding: "18px",
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  boxShadow: "0 18px 36px rgba(15,23,42,0.08)",
};

const cancelButtonStyle = {
  background: "#F8FAFC",
  color: "#334155",
  border: "1px solid #CBD5E1",
  borderRadius: "16px",
  padding: "14px 22px",
  fontSize: "14px",
  fontWeight: "900",
  cursor: "pointer",
};

const saveButtonStyle = {
  background: "linear-gradient(135deg, #0F766E 0%, #0284C7 100%)",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "16px",
  padding: "14px 26px",
  fontSize: "14px",
  fontWeight: "950",
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(2,132,199,0.30)",
};

const messageStyle = {
  marginBottom: "18px",
  padding: "15px 18px",
  borderRadius: "18px",
  border: "1px solid",
  fontSize: "14px",
  fontWeight: "800",
};

const loadingPageStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #F8FAFC 0%, #E0F2FE 100%)",
};

const loaderCardStyle = {
  background: "#FFFFFF",
  color: "#0284C7",
  padding: "24px 32px",
  borderRadius: "22px",
  fontWeight: "900",
  boxShadow: "0 18px 40px rgba(15,23,42,0.10)",
};

export default DoctorProfilePage;