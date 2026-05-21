import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function DoctorDashboardPage() {
  const navigate = useNavigate();

  const medecinEmail =
    localStorage.getItem("medecinEmail") || "medecin@tabiblink.tn";

  const medecinId =
    localStorage.getItem("medecinId") ||
    localStorage.getItem("id") ||
    localStorage.getItem("userId") ||
    localStorage.getItem("utilisateurId");

  const [stats, setStats] = useState({
    demandesEnAttente: 0,
    rendezVousConfirmes: 0,
    evaluationsRecues: 0,
  });

  useEffect(() => {
    chargerStats();
  }, []);

  const chargerStats = async () => {
    try {
      if (!medecinId) return;

      const response = await fetch(
        `https://tabiblink-backend.onrender.com/api/rendez-vous/medecin/${medecinId}/stats`
      );

      if (!response.ok) return;

      const data = await response.json();

      setStats({
        demandesEnAttente: data.demandesEnAttente ?? 0,
        rendezVousConfirmes: data.rendezVousConfirmes ?? 0,
        evaluationsRecues: data.evaluationsRecues ?? 0,
      });
    } catch (error) {
      console.error("Erreur chargement stats médecin :", error);
    }
  };

  const cards = [
    {
      title: "Mon profil professionnel",
      description:
        "Consulter et modifier vos informations professionnelles, votre bio et vos coordonnées.",
      icon: "🩺",
      action: () => navigate("/profil-professionnel"),
    },
    {
      title: "Mes disponibilités",
      description:
        "Définir les jours et horaires disponibles pour les consultations.",
      icon: "🗓️",
      action: () => navigate("/mes-disponibilites"),
    },
    {
      title: "Demandes de rendez-vous",
      description:
        "Consulter les demandes reçues, puis confirmer ou refuser un rendez-vous.",
      icon: "📨",
      action: () => navigate("/demandes-rendez-vous"),
    },
    {
      title: "Mes évaluations",
      description:
        "Consulter les évaluations et avis laissés par vos patients après les rendez-vous.",
      icon: "⭐",
      action: () => navigate("/medecin/evaluations"),
    },
  ];

  const statsCards = [
    {
      label: "Demandes en attente",
      value: stats.demandesEnAttente,
      color: "#F59E0B",
      bg: "#FFF7E8",
    },
    {
      label: "Rendez-vous confirmés",
      value: stats.rendezVousConfirmes,
      color: "#10B981",
      bg: "#ECFDF5",
    },
    {
      label: "Évaluations reçues",
      value: stats.evaluationsRecues,
      color: "#2563EB",
      bg: "#EFF6FF",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("medecinEmail");
    localStorage.removeItem("medecinId");
    localStorage.removeItem("id");
    localStorage.removeItem("userId");
    localStorage.removeItem("utilisateurId");
    navigate("/connexion");
  };

  return (
    <div style={pageStyle}>
      <div style={decorCircleOne}></div>
      <div style={decorCircleTwo}></div>
      <div style={decorCircleThree}></div>

      <div style={containerStyle}>
        <section style={heroStyle}>
          <div style={heroLeftStyle}>
            <div style={badgeStyle}>ESPACE MÉDECIN</div>
            <h1 style={heroTitleStyle}>
              Bienvenue dans votre espace professionnel
            </h1>
            <p style={heroTextStyle}>
              Gérez votre activité médicale sur une interface moderne, claire et
              professionnelle.
            </p>
          </div>

          <div style={heroRightStyle}>
            <div style={emailPillStyle}>{medecinEmail}</div>
            <button style={logoutButtonStyle} onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </section>

        <section style={statsGridStyle}>
          {statsCards.map((item) => (
            <div
              key={item.label}
              style={{ ...statCardStyle, background: item.bg }}
            >
              <div style={{ ...statIconStyle, background: item.color }}></div>

              <div>
                <p style={statLabelStyle}>{item.label}</p>
                <h3 style={{ ...statValueStyle, color: item.color }}>
                  {item.value}
                </h3>
              </div>
            </div>
          ))}
        </section>

        <section style={sectionHeaderStyle}>
          <div>
            <h2 style={sectionTitleStyle}>Fonctionnalités principales</h2>
            <p style={sectionTextStyle}>
              Accédez rapidement aux différents modules de votre espace médecin.
            </p>
          </div>
        </section>

        <section style={cardsGridStyle}>
          {cards.map((card) => (
            <div key={card.title} style={cardStyle}>
              <div style={cardIconBoxStyle}>{card.icon}</div>

              <h3 style={cardTitleStyle}>{card.title}</h3>
              <p style={cardDescriptionStyle}>{card.description}</p>

              <button style={openButtonStyle} onClick={card.action}>
                Ouvrir
              </button>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  width: "100vw",
  margin: 0,
  padding: 0,
  position: "relative",
  overflow: "hidden",
  background:
    "linear-gradient(180deg, #F3F8FF 0%, #EEF6FF 35%, #F9FCFF 70%, #FFFFFF 100%)",
};

const containerStyle = {
  position: "relative",
  zIndex: 2,
  maxWidth: "1280px",
  margin: "0 auto",
  padding: "32px 24px 40px",
};

const heroStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
  padding: "30px",
  borderRadius: "30px",
  background: "linear-gradient(135deg, #0F4C81 0%, #2A6F6B 100%)",
  boxShadow: "0 24px 60px rgba(15, 76, 129, 0.20)",
  color: "#ffffff",
};

const heroLeftStyle = { flex: "1 1 560px" };

const heroRightStyle = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap",
  alignItems: "center",
};

const badgeStyle = {
  display: "inline-block",
  padding: "8px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.16)",
  color: "#EAF4FF",
  fontSize: "12px",
  fontWeight: "800",
  letterSpacing: "1px",
  marginBottom: "14px",
};

const heroTitleStyle = {
  margin: "0 0 12px 0",
  fontSize: "42px",
  lineHeight: "1.15",
  fontWeight: "800",
};

const heroTextStyle = {
  margin: 0,
  maxWidth: "700px",
  fontSize: "17px",
  lineHeight: "1.7",
  color: "rgba(255,255,255,0.92)",
};

const emailPillStyle = {
  padding: "12px 18px",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.14)",
  border: "1px solid rgba(255,255,255,0.20)",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700",
};

const logoutButtonStyle = {
  padding: "12px 18px",
  borderRadius: "14px",
  border: "none",
  background: "#ffffff",
  color: "#0F4C81",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
};

const statsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "18px",
  marginTop: "24px",
};

const statCardStyle = {
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 16px 38px rgba(15, 76, 129, 0.08)",
  display: "flex",
  alignItems: "center",
  gap: "16px",
  border: "1px solid rgba(15, 76, 129, 0.06)",
};

const statIconStyle = {
  width: "16px",
  height: "52px",
  borderRadius: "999px",
};

const statLabelStyle = {
  margin: "0 0 10px 0",
  fontSize: "14px",
  color: "#64748B",
  fontWeight: "600",
};

const statValueStyle = {
  margin: 0,
  fontSize: "38px",
  fontWeight: "800",
};

const sectionHeaderStyle = {
  marginTop: "34px",
  marginBottom: "18px",
};

const sectionTitleStyle = {
  margin: "0 0 8px 0",
  fontSize: "28px",
  color: "#0F172A",
  fontWeight: "800",
};

const sectionTextStyle = {
  margin: 0,
  fontSize: "15px",
  color: "#64748B",
  lineHeight: "1.6",
};

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
};

const cardStyle = {
  background: "#ffffff",
  borderRadius: "26px",
  padding: "24px",
  boxShadow: "0 18px 42px rgba(15, 76, 129, 0.09)",
  border: "1px solid rgba(15, 76, 129, 0.05)",
  display: "flex",
  flexDirection: "column",
  minHeight: "255px",
};

const cardIconBoxStyle = {
  width: "58px",
  height: "58px",
  borderRadius: "18px",
  background: "linear-gradient(135deg, #E8F2FF 0%, #E8FFFA 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  marginBottom: "18px",
};

const cardTitleStyle = {
  margin: "0 0 12px 0",
  color: "#0F172A",
  fontSize: "28px",
  fontWeight: "800",
  lineHeight: "1.25",
};

const cardDescriptionStyle = {
  margin: 0,
  color: "#64748B",
  fontSize: "15px",
  lineHeight: "1.8",
  flexGrow: 1,
};

const openButtonStyle = {
  marginTop: "22px",
  alignSelf: "flex-start",
  padding: "12px 20px",
  borderRadius: "14px",
  border: "none",
  background: "linear-gradient(135deg, #0F4C81 0%, #2A6F6B 100%)",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "800",
  cursor: "pointer",
  boxShadow: "0 12px 22px rgba(15, 76, 129, 0.18)",
};

const decorCircleOne = {
  position: "absolute",
  top: "-120px",
  right: "-80px",
  width: "280px",
  height: "280px",
  borderRadius: "50%",
  background: "rgba(37, 99, 235, 0.10)",
  filter: "blur(10px)",
};

const decorCircleTwo = {
  position: "absolute",
  top: "220px",
  left: "-90px",
  width: "220px",
  height: "220px",
  borderRadius: "50%",
  background: "rgba(16, 185, 129, 0.10)",
  filter: "blur(8px)",
};

const decorCircleThree = {
  position: "absolute",
  bottom: "-80px",
  right: "14%",
  width: "240px",
  height: "240px",
  borderRadius: "50%",
  background: "rgba(15, 76, 129, 0.08)",
  filter: "blur(10px)",
};

export default DoctorDashboardPage;