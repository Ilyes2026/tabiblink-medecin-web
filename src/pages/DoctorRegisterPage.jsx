import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ position, onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });

  if (!position) return null;

  return <Marker position={position} icon={markerIcon} />;
}

function DoctorRegisterPage() {
  const navigate = useNavigate();

  const [specialites, setSpecialites] = useState([]);
  const [villes, setVilles] = useState([]);
  const [delegations, setDelegations] = useState([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    titre: "",
    nom: "",
    prenom: "",
    email: "",
    motDePasse: "",
    matricule: "",
    telephoneFixe: "",
    telephoneMobile: "",
    adresseCabinet: "",
    bio: "",
    specialiteId: "",
    villeId: "",
    delegationId: "",
    conventionneCnam: false,
    dureeConsultation: "",
    diplomesFormations: "",
    latitude: "",
    longitude: "",
    photoIdentite: null,
    carteVisite: null,
    carteProfessionnelle: null,
  });

  const defaultCenter = useMemo(() => [36.8065, 10.1815], []);

  const selectedPosition =
    formData.latitude && formData.longitude
      ? [Number(formData.latitude), Number(formData.longitude)]
      : null;

  const handleMapSelect = (latlng) => {
    setFormData((prev) => ({
      ...prev,
      latitude: latlng.lat.toFixed(6),
      longitude: latlng.lng.toFixed(6),
    }));
  };

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [specialitesRes, villesRes] = await Promise.all([
          fetch("https://tabiblink-backend.onrender.com/api/specialites"),
          fetch("https://tabiblink-backend.onrender.com/api/villes"),
        ]);

        if (!specialitesRes.ok || !villesRes.ok) {
          throw new Error("Erreur lors du chargement des listes.");
        }

        setSpecialites(await specialitesRes.json());
        setVilles(await villesRes.json());
      } catch (error) {
        console.error(error);
        setMessage("Erreur lors du chargement des spécialités et des villes.");
      } finally {
        setLoadingLists(false);
      }
    };

    fetchLists();
  }, []);

  useEffect(() => {
    const fetchDelegations = async () => {
      if (!formData.villeId) {
        setDelegations([]);
        return;
      }

      try {
        const response = await fetch(
          `https://tabiblink-backend.onrender.com/api/delegations/ville/${formData.villeId}`
        );

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des délégations.");
        }

        setDelegations(await response.json());
      } catch (error) {
        console.error(error);
        setDelegations([]);
      }
    };

    fetchDelegations();
  }, [formData.villeId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "villeId"
        ? {
            delegationId: "",
            latitude: "",
            longitude: "",
          }
        : {}),
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files && files.length > 0 ? files[0] : null,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (
      !formData.nom ||
      !formData.prenom ||
      !formData.email ||
      !formData.motDePasse ||
      !formData.matricule ||
      !formData.telephoneMobile ||
      !formData.specialiteId ||
      !formData.villeId ||
      !formData.delegationId ||
      !formData.latitude ||
      !formData.longitude
    ) {
      setMessage(
        "Veuillez remplir tous les champs obligatoires et choisir la localisation sur la carte."
      );
      return;
    }

    const data = new FormData();

    data.append("titre", formData.titre);
    data.append("nom", formData.nom);
    data.append("prenom", formData.prenom);
    data.append("email", formData.email);
    data.append("motDePasse", formData.motDePasse);
    data.append("matricule", formData.matricule);
    data.append("telephoneFixe", formData.telephoneFixe);
    data.append("telephoneMobile", formData.telephoneMobile);
    data.append("adresseCabinet", formData.adresseCabinet);
    data.append("bio", formData.bio);
    data.append("specialiteId", String(Number(formData.specialiteId)));
    data.append("villeId", String(Number(formData.villeId)));
    data.append("delegationId", String(Number(formData.delegationId)));
    data.append("conventionneCnam", String(formData.conventionneCnam));
    data.append(
      "dureeConsultation",
      formData.dureeConsultation
        ? String(Number(formData.dureeConsultation))
        : ""
    );
    data.append("diplomesFormations", formData.diplomesFormations);
    data.append("latitude", formData.latitude);
    data.append("longitude", formData.longitude);

    if (formData.photoIdentite) {
      data.append("photoIdentite", formData.photoIdentite);
    }

    if (formData.carteVisite) {
      data.append("carteVisite", formData.carteVisite);
    }

    if (formData.carteProfessionnelle) {
      data.append("carteProfessionnelle", formData.carteProfessionnelle);
    }

    try {
      const response = await fetch(
  "https://tabiblink-backend.onrender.com/api/auth/inscrireMedecin",
  {
    method: "POST",
    body: data,
  }
);

      const result = await response.text();
      setMessage(result);

      const resultNormalized = result.toLowerCase();

      if (
        response.ok &&
        (resultNormalized.includes("réussie") ||
          resultNormalized.includes("reussie"))
      ) {
        setTimeout(() => {
          navigate("/connexion");
        }, 1200);
      }
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de l'inscription médecin.");
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <h1 style={titleStyle}>Inscription médecin</h1>
            <p style={subtitleStyle}>
              Créez votre compte professionnel TabibLink
            </p>
          </div>

          <div style={{ fontSize: "14px" }}>
            <Link to="/" style={linkStyle}>
              Retour à l’accueil
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={gridStyle}>
            <div>
              <SectionTitle title="Informations personnelles" />

              <div style={cardStyle}>
                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Titre</label>
                  <input
                    type="text"
                    name="titre"
                    value={formData.titre}
                    onChange={handleChange}
                    placeholder="Dr, Pr..."
                    style={inputStyle}
                  />
                </div>

                <div style={rowStyle}>
                  <div style={fieldHalfStyle}>
                    <label style={labelStyle}>Nom *</label>
                    <input
                      type="text"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldHalfStyle}>
                    <label style={labelStyle}>Prénom *</label>
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={rowStyle}>
                  <div style={fieldHalfStyle}>
                    <label style={labelStyle}>Téléphone fixe</label>
                    <input
                      type="text"
                      name="telephoneFixe"
                      value={formData.telephoneFixe}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldHalfStyle}>
                    <label style={labelStyle}>Téléphone mobile *</label>
                    <input
                      type="text"
                      name="telephoneMobile"
                      value={formData.telephoneMobile}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={rowStyle}>
                  <div style={fieldHalfStyle}>
                    <label style={labelStyle}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>

                  <div style={fieldHalfStyle}>
                    <label style={labelStyle}>Mot de passe *</label>
                    <input
                      type="password"
                      name="motDePasse"
                      value={formData.motDePasse}
                      onChange={handleChange}
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Matricule *</label>
                  <input
                    type="text"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleChange}
                    style={inputStyle}
                  />
                </div>
              </div>

              <SectionTitle title="Diplômes et formations" />
              <div style={cardStyle}>
                <label style={labelStyle}>Diplômes / Formations</label>
                <textarea
                  name="diplomesFormations"
                  value={formData.diplomesFormations}
                  onChange={handleChange}
                  rows="6"
                  style={textareaStyle}
                />
              </div>

              <SectionTitle title="Documents" />
              <div style={cardStyle}>
                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Photo d’identité</label>
                  <input
                    type="file"
                    name="photoIdentite"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    style={inputStyle}
                  />
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Carte de visite</label>
                  <input
                    type="file"
                    name="carteVisite"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    style={inputStyle}
                  />
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Carte professionnelle</label>
                  <input
                    type="file"
                    name="carteProfessionnelle"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>

            <div>
              <SectionTitle title="Informations professionnelles" />

              <div style={cardStyle}>
                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Conventionné CNAM</label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "14px",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="conventionneCnam"
                      checked={formData.conventionneCnam}
                      onChange={handleChange}
                    />
                    Oui
                  </label>
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Durée consultation</label>
                  <select
                    name="dureeConsultation"
                    value={formData.dureeConsultation}
                    onChange={handleChange}
                    style={inputStyle}
                  >
                    <option value="">Choisir</option>
                    <option value="15">15 minutes</option>
                    <option value="20">20 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </select>
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Spécialité principale *</label>
                  <select
                    name="specialiteId"
                    value={formData.specialiteId}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={loadingLists}
                  >
                    <option value="">Choisir une spécialité</option>

                    {specialites.length === 0 ? (
                      <option disabled>Chargement...</option>
                    ) : (
                      specialites.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nomFr} {s.nomAr ? `— ${s.nomAr}` : ""}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Ville *</label>
                  <select
                    name="villeId"
                    value={formData.villeId}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={loadingLists}
                  >
                    <option value="">Choisir une ville</option>
                    {villes.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nomVille}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Délégation *</label>
                  <select
                    name="delegationId"
                    value={formData.delegationId}
                    onChange={handleChange}
                    style={inputStyle}
                    disabled={loadingLists || !formData.villeId}
                  >
                    <option value="">
                      {formData.villeId
                        ? "Choisir une délégation"
                        : "Choisir d'abord une ville"}
                    </option>

                    {delegations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nomDelegation}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Adresse du cabinet</label>
                  <textarea
                    name="adresseCabinet"
                    value={formData.adresseCabinet}
                    onChange={handleChange}
                    rows="4"
                    style={textareaStyle}
                  />
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Localisation du cabinet</label>
                  <p
                    style={{
                      marginTop: "0",
                      marginBottom: "10px",
                      color: "#5f6b7a",
                      fontSize: "13px",
                    }}
                  >
                    Cliquez directement sur la carte pour choisir l’emplacement
                    exact du cabinet.
                  </p>

                  <div
                    style={{
                      borderRadius: "12px",
                      overflow: "hidden",
                      border: "1px solid #ccd6dd",
                      marginBottom: "12px",
                    }}
                  >
                    <MapContainer
                      center={selectedPosition || defaultCenter}
                      zoom={selectedPosition ? 15 : 7}
                      style={{ height: "320px", width: "100%" }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <LocationPicker
                        position={selectedPosition}
                        onSelect={handleMapSelect}
                      />
                    </MapContainer>
                  </div>

                  <div style={rowStyle}>
                    <div style={fieldHalfStyle}>
                      <label style={labelStyle}>Latitude</label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        readOnly
                        style={{ ...inputStyle, background: "#f3f6f9" }}
                      />
                    </div>

                    <div style={fieldHalfStyle}>
                      <label style={labelStyle}>Longitude</label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        readOnly
                        style={{ ...inputStyle, background: "#f3f6f9" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={fieldBlockStyle}>
                  <label style={labelStyle}>Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="6"
                    style={textareaStyle}
                  />
                </div>
              </div>
            </div>
          </div>

          <button type="submit" style={submitButtonStyle}>
            Créer le compte médecin
          </button>
        </form>

        {message && <p style={messageStyle}>{message}</p>}

        <p style={{ marginTop: "18px", fontSize: "14px" }}>
          Vous avez déjà un compte ?{" "}
          <Link to="/connexion" style={linkStyle}>
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div
      style={{
        background: "#0d6e8a",
        color: "white",
        padding: "12px 16px",
        borderRadius: "10px 10px 0 0",
        fontWeight: "bold",
        fontSize: "14px",
        marginTop: "18px",
      }}
    >
      {title}
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f2f5f8",
  padding: "30px 20px",
  fontFamily: "Arial, sans-serif",
};

const containerStyle = {
  maxWidth: "1200px",
  margin: "0 auto",
  background: "white",
  padding: "24px",
  borderRadius: "16px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "16px",
  flexWrap: "wrap",
};

const titleStyle = {
  margin: 0,
  color: "#0F4C81",
};

const subtitleStyle = {
  marginTop: "8px",
  color: "#666",
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "24px",
};

const cardStyle = {
  background: "#f7f9fb",
  padding: "18px",
  borderRadius: "0 0 12px 12px",
  border: "1px solid #e3e8ee",
};

const rowStyle = {
  display: "flex",
  gap: "16px",
  flexWrap: "wrap",
};

const fieldHalfStyle = {
  flex: "1 1 240px",
  marginBottom: "14px",
};

const fieldBlockStyle = {
  marginBottom: "14px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "600",
  color: "#18445d",
  fontSize: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccd6dd",
  boxSizing: "border-box",
  fontSize: "14px",
  background: "white",
  color: "#102A43",
};

const textareaStyle = {
  width: "100%",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #ccd6dd",
  boxSizing: "border-box",
  fontSize: "14px",
  resize: "vertical",
  background: "white",
  color: "#102A43",
};

const submitButtonStyle = {
  marginTop: "24px",
  width: "100%",
  padding: "15px",
  border: "none",
  borderRadius: "12px",
  background: "#ff7a00",
  color: "white",
  fontSize: "16px",
  fontWeight: "bold",
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "18px",
  color: "#d35400",
  fontWeight: "600",
};

const linkStyle = {
  color: "#0F4C81",
  fontWeight: "bold",
  textDecoration: "none",
};

export default DoctorRegisterPage;