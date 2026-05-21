import { useEffect, useState } from "react";

function EvaluationsMedecin() {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const medecinId =
    localStorage.getItem("medecinId") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("utilisateurId");

  useEffect(() => {
    chargerEvaluations();
  }, []);

  const chargerEvaluations = async () => {
    try {
      console.log("Medecin ID =", medecinId);

      if (!medecinId) {
        setMessage("Aucun identifiant médecin trouvé. Veuillez vous reconnecter.");
        setLoading(false);
        return;
      }

      const response = await fetch(
        `https://tabiblink-backend.onrender.com/api/evaluations-rendez-vous/medecin/${medecinId}`
      );

      if (!response.ok) {
        setMessage("Erreur lors du chargement des évaluations.");
        setLoading(false);
        return;
      }

      const data = await response.json();

      console.log("Evaluations reçues :", data);

      setEvaluations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement évaluations médecin :", error);
      setMessage("Erreur lors du chargement des évaluations.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (note) => {
    const n = Number(note || 0);
    return "⭐".repeat(n) + "☆".repeat(5 - n);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Mes évaluations</h1>
          <p style={styles.subtitle}>
            Consultez les retours envoyés par vos patients après leurs rendez-vous.
          </p>
        </div>

        <div style={styles.counter}>
          {evaluations.length}
          <span> avis</span>
        </div>
      </div>

      {loading ? (
        <div style={styles.empty}>Chargement des évaluations...</div>
      ) : message ? (
        <div style={styles.empty}>{message}</div>
      ) : evaluations.length === 0 ? (
        <div style={styles.empty}>
          Aucune évaluation trouvée (vérifie que des patients ont évalué).
        </div>
      ) : (
        <div style={styles.grid}>
          {evaluations.map((e) => (
            <div key={e.id} style={styles.card}>
              <h3 style={styles.patient}>{e.patientNomComplet}</h3>
              <p style={styles.specialite}>{e.specialite}</p>

              <div style={styles.notes}>
                <div style={styles.line}>
                  <span>Note globale</span>
                  <strong>{renderStars(e.noteGlobale)}</strong>
                </div>
                <div style={styles.line}>
                  <span>Ponctualité</span>
                  <strong>{renderStars(e.ponctualite)}</strong>
                </div>
                <div style={styles.line}>
                  <span>Organisation</span>
                  <strong>{renderStars(e.organisation)}</strong>
                </div>
                <div style={styles.line}>
                  <span>Clarté</span>
                  <strong>{renderStars(e.clarteInformations)}</strong>
                </div>
              </div>

              <div style={styles.commentaire}>
                💬 {e.commentaire || "Aucun commentaire."}
              </div>

              <p style={styles.date}>🕒 {e.dateEvaluation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "34px",
    background: "linear-gradient(135deg, #F4F8F7 0%, #E8F5F3 100%)",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  header: {
    background: "#ffffff",
    borderRadius: "26px",
    padding: "28px",
    marginBottom: "24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 16px 38px rgba(22,58,57,0.10)",
  },
  title: {
    margin: 0,
    color: "#163A39",
    fontSize: "32px",
    fontWeight: "900",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#6A8A88",
    fontSize: "15px",
  },
  counter: {
    background: "#E8F5F3",
    color: "#2A6F6B",
    padding: "14px 18px",
    borderRadius: "18px",
    fontSize: "24px",
    fontWeight: "900",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "22px",
  },
  card: {
    background: "#ffffff",
    borderRadius: "26px",
    padding: "24px",
    boxShadow: "0 16px 38px rgba(22,58,57,0.10)",
    border: "1px solid #DCEBE9",
  },
  patient: {
    margin: 0,
    color: "#163A39",
    fontSize: "20px",
    fontWeight: "900",
  },
  specialite: {
    margin: "7px 0 0",
    color: "#2A6F6B",
    fontWeight: "800",
  },
  notes: {
    marginTop: "20px",
    background: "#F7FBFA",
    borderRadius: "18px",
    padding: "14px",
    border: "1px solid #E1ECEB",
  },
  line: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    color: "#163A39",
    padding: "7px 0",
    fontSize: "14px",
  },
  commentaire: {
    marginTop: "16px",
    background: "#F4F8F7",
    padding: "15px",
    borderRadius: "16px",
    color: "#163A39",
  },
  date: {
    marginTop: "14px",
    fontSize: "13px",
    color: "#8BA5A3",
  },
  empty: {
    background: "white",
    padding: "30px",
    borderRadius: "22px",
    color: "#6A8A88",
    boxShadow: "0 12px 30px rgba(0,0,0,0.06)",
  },
};

export default EvaluationsMedecin;