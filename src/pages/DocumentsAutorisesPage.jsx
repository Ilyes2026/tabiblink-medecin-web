import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";

const API_URL = "https://tabiblink-backend.onrender.com";

function DocumentsAutorisesPage() {
  const navigate = useNavigate();
  const { patientEmail } = useParams();
  const medecinEmail = localStorage.getItem("medecinEmail");

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!medecinEmail) {
      navigate("/connexion");
      return;
    }

    chargerDocuments();
  }, []);

  const chargerDocuments = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${API_URL}/api/documents/autorises/medecin/${encodeURIComponent(
          medecinEmail
        )}/patient/${encodeURIComponent(patientEmail)}`
      );

      if (!res.ok) {
        setMessage("Impossible de charger les documents autorisés.");
        return;
      }

      const data = await res.json();
      setDocuments(data);
    } catch (e) {
      setMessage("Erreur lors du chargement des documents.");
    } finally {
      setLoading(false);
    }
  };

  const ouvrirDocument = (cheminFichier) => {
    if (!cheminFichier) return;

    if (cheminFichier.startsWith("http")) {
      window.open(cheminFichier, "_blank");
    } else {
      window.open(`${API_URL}/${cheminFichier}`, "_blank");
    }
  };

  if (loading) {
    return (
      <div style={loadingPageStyle}>
        <div style={loaderCardStyle}>Chargement des documents...</div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div>
            <p style={badgeStyle}>Documents médicaux</p>
            <h1 style={titleStyle}>Documents autorisés</h1>
            <p style={subtitleStyle}>
              Consultez uniquement les documents que le patient vous a autorisés.
            </p>
          </div>

          <button style={backButtonStyle} onClick={() => navigate(-1)}>
            ← Retour
          </button>
        </header>

        {message && <div style={messageStyle}>{message}</div>}

        {documents.length === 0 ? (
          <div style={emptyCardStyle}>
            <div style={emptyIconStyle}>📄</div>
            <h2>Aucun document autorisé</h2>
            <p>
              Ce patient n’a pas encore autorisé de documents pour votre compte.
            </p>
          </div>
        ) : (
          <section style={documentsGridStyle}>
            {documents.map((doc) => (
              <article key={doc.id} style={documentCardStyle}>
                <div style={docIconStyle}>📄</div>

                <div style={{ flex: 1 }}>
                  <p style={typeStyle}>{doc.typeDocument || "Document"}</p>
                  <h2 style={docTitleStyle}>{doc.titre}</h2>

                  <p style={docInfoStyle}>
                    Patient : {doc.patientNomComplet || "Non précisé"}
                  </p>

                  <p style={docInfoStyle}>
                    Date ajout : {formatDate(doc.dateAjout)}
                  </p>

                  <button
                    style={openButtonStyle}
                    onClick={() => ouvrirDocument(doc.cheminFichier)}
                  >
                    Ouvrir le document
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) return "Non précisée";

  try {
    return new Date(date).toLocaleString("fr-FR");
  } catch (e) {
    return date;
  }
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

const containerStyle = {
  maxWidth: "1180px",
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
  background: "#FFF7ED",
  color: "#C2410C",
  border: "1px solid #FDBA74",
  borderRadius: "18px",
  padding: "15px 18px",
  marginBottom: "20px",
  fontWeight: "800",
};

const documentsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
  gap: "20px",
};

const documentCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "28px",
  padding: "22px",
  display: "flex",
  gap: "16px",
  alignItems: "flex-start",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};

const docIconStyle = {
  width: "58px",
  height: "58px",
  borderRadius: "18px",
  background: "#ECFDF5",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
};

const typeStyle = {
  margin: 0,
  color: "#0F766E",
  fontSize: "13px",
  fontWeight: "900",
  textTransform: "uppercase",
};

const docTitleStyle = {
  margin: "7px 0 12px",
  color: "#0F172A",
  fontSize: "22px",
  fontWeight: "950",
};

const docInfoStyle = {
  margin: "6px 0",
  color: "#64748B",
  fontSize: "14px",
  fontWeight: "700",
};

const openButtonStyle = {
  marginTop: "16px",
  width: "100%",
  background: "linear-gradient(135deg, #0F766E 0%, #0284C7 100%)",
  color: "#FFFFFF",
  border: "none",
  borderRadius: "16px",
  padding: "13px 18px",
  fontSize: "14px",
  fontWeight: "900",
  cursor: "pointer",
  boxShadow: "0 12px 26px rgba(2,132,199,0.24)",
};

const emptyCardStyle = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "30px",
  padding: "42px",
  textAlign: "center",
  color: "#64748B",
  boxShadow: "0 18px 42px rgba(15,23,42,0.08)",
};

const emptyIconStyle = {
  fontSize: "54px",
  marginBottom: "14px",
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

export default DocumentsAutorisesPage;