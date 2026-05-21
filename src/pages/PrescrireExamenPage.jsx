import { useState } from "react";
import { useNavigate, useParams } from "react-router";

const API_URL = "https://tabiblink-backend.onrender.com";

function PrescrireExamenPage() {
  const navigate = useNavigate();
  const { rendezVousId } = useParams();

  const [typeExamen, setTypeExamen] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const enregistrer = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!typeExamen || !description) {
      setMessage("Veuillez remplir le type d’examen et la description.");
      return;
    }

    setSaving(true);

    try {
      const res = await fetch(`${API_URL}/api/examens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rendezVousId: Number(rendezVousId),
          typeExamen,
          description,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        setMessage(error || "Impossible d’enregistrer la prescription.");
        return;
      }

      setMessage("Examen médical prescrit avec succès.");
      setTimeout(() => navigate("/demandes-rendez-vous"), 900);
    } catch (e) {
      setMessage("Erreur lors de l’enregistrement.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <button style={backButtonStyle} onClick={() => navigate(-1)}>
          ← Retour
        </button>

        <div style={iconStyle}>🧪</div>

        <p style={badgeStyle}>Prescription médicale</p>

        <h1 style={titleStyle}>Prescrire un examen médical</h1>

        <p style={subtitleStyle}>
          Ajoutez un examen demandé au patient dans le cadre de ce rendez-vous.
        </p>

        {message && <div style={messageStyle}>{message}</div>}

        <form onSubmit={enregistrer}>
          <div style={fieldStyle}>
            <label style={labelStyle}>Type d’examen</label>
            <select
              value={typeExamen}
              onChange={(e) => setTypeExamen(e.target.value)}
              style={inputStyle}
            >
              <option value="">Choisir un type d’examen</option>
              <option value="Analyse sanguine">Analyse sanguine</option>
              <option value="Analyse urinaire">Analyse urinaire</option>
              <option value="Radiographie">Radiographie</option>
              <option value="Échographie">Échographie</option>
              <option value="Scanner">Scanner</option>
              <option value="IRM">IRM</option>
              <option value="ECG">ECG</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Description / détails</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex : NFS, glycémie à jeun, bilan lipidique..."
              rows={6}
              style={{ ...inputStyle, resize: "vertical", minHeight: "150px" }}
            />
          </div>

          <div style={actionsStyle}>
            <button
              type="button"
              style={cancelButtonStyle}
              onClick={() => navigate(-1)}
            >
              Annuler
            </button>

            <button type="submit" disabled={saving} style={saveButtonStyle}>
              {saving ? "Enregistrement..." : "Enregistrer la prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  width: "100vw",
  background:
    "radial-gradient(circle at top left, rgba(20,184,166,0.18), transparent 30%), linear-gradient(135deg, #F8FAFC 0%, #EEF6F6 45%, #EFF6FF 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px",
  boxSizing: "border-box",
  fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
};

const cardStyle = {
  width: "100%",
  maxWidth: "760px",
  background: "#FFFFFF",
  borderRadius: "34px",
  padding: "34px",
  border: "1px solid #E2E8F0",
  boxShadow: "0 26px 60px rgba(15,23,42,0.12)",
};

const backButtonStyle = {
  background: "#F1F5F9",
  color: "#0F172A",
  border: "1px solid #E2E8F0",
  borderRadius: "15px",
  padding: "12px 18px",
  fontWeight: "900",
  cursor: "pointer",
};

const iconStyle = {
  width: "86px",
  height: "86px",
  borderRadius: "28px",
  background: "linear-gradient(135deg, #0F766E, #0284C7)",
  color: "#FFFFFF",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "36px",
  margin: "26px auto 16px",
  boxShadow: "0 18px 34px rgba(2,132,199,0.25)",
};

const badgeStyle = {
  textAlign: "center",
  margin: "0 0 10px 0",
  color: "#0F766E",
  fontSize: "13px",
  fontWeight: "950",
  letterSpacing: "0.8px",
  textTransform: "uppercase",
};

const titleStyle = {
  textAlign: "center",
  margin: "0 0 12px 0",
  color: "#0F172A",
  fontSize: "34px",
  fontWeight: "950",
};

const subtitleStyle = {
  textAlign: "center",
  margin: "0 auto 28px",
  color: "#64748B",
  maxWidth: "560px",
  fontSize: "15px",
  lineHeight: "1.7",
};

const fieldStyle = {
  marginBottom: "18px",
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#475569",
  fontSize: "14px",
  fontWeight: "850",
};

const inputStyle = {
  width: "100%",
  padding: "15px 16px",
  borderRadius: "17px",
  border: "1px solid #DDE7EE",
  background: "#F8FAFC",
  color: "#0F172A",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};

const messageStyle = {
  background: "#ECFDF5",
  color: "#047857",
  border: "1px solid #A7F3D0",
  borderRadius: "18px",
  padding: "15px 18px",
  marginBottom: "22px",
  fontWeight: "850",
};

const actionsStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "12px",
  flexWrap: "wrap",
  marginTop: "24px",
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
  padding: "14px 24px",
  fontSize: "14px",
  fontWeight: "950",
  cursor: "pointer",
  boxShadow: "0 14px 30px rgba(2,132,199,0.28)",
};

export default PrescrireExamenPage;