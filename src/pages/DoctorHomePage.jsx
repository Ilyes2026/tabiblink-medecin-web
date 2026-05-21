import { Link } from "react-router";

function DoctorHomePage() {
  return (
    <div style={pageStyle}>
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <img
            src="/logo_tabiblink.png"
            alt="TabibLink"
            style={logoStyle}
          />

          <p style={topTextStyle}>Espace médecin</p>

          <h1 style={titleStyle}>
            Bienvenue sur votre espace professionnel
          </h1>

          <p style={descriptionStyle}>
            Accédez à une interface simple, moderne et sécurisée pour créer
            votre compte ou vous connecter à TabibLink.
          </p>

          <div style={buttonRowStyle}>
            <Link to="/inscription" style={{ textDecoration: "none" }}>
              <button style={primaryButtonStyle}>
                Créer un compte
              </button>
            </Link>

            <Link to="/connexion" style={{ textDecoration: "none" }}>
              <button style={secondaryButtonStyle}>
                Se connecter
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  backgroundImage: "url('/doctor-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  fontFamily: "'Segoe UI', Arial, sans-serif",
};

const overlayStyle = {
  minHeight: "100vh",
  width: "100%",
  background: "rgba(8, 35, 61, 0.38)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  boxSizing: "border-box",
};

const cardStyle = {
  width: "100%",
  maxWidth: "760px",
  textAlign: "center",
  background: "rgba(255,255,255,0.16)",
  border: "1px solid rgba(255,255,255,0.22)",
  borderRadius: "28px",
  padding: "42px 32px",
  backdropFilter: "blur(10px)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.14)",
};

const logoStyle = {
  width: "400px",
  maxWidth: "100%",
  height: "auto",
  display: "block",
  margin: "0 auto 18px auto",
};

const topTextStyle = {
  margin: "0 0 10px 0",
  color: "#eabcbc",
  fontSize: "30px",
  fontWeight: "600",
  letterSpacing: "0.5px",
};

const titleStyle = {
  margin: "0 0 16px 0",
  color: "#ffffff",
  fontSize: "42px",
  fontWeight: "700",
  lineHeight: "1.2",
};

const descriptionStyle = {
  maxWidth: "580px",
  margin: "0 auto 28px auto",
  color: "rgba(255,255,255,0.95)",
  fontSize: "18px",
  lineHeight: "1.7",
};

const buttonRowStyle = {
  display: "flex",
  justifyContent: "center",
  gap: "14px",
  flexWrap: "wrap",
};

const primaryButtonStyle = {
  background: "#0F4C81",
  color: "#ffffff",
  border: "none",
  borderRadius: "14px",
  padding: "15px 24px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  minWidth: "190px",
};

const secondaryButtonStyle = {
  background: "rgba(255,255,255,0.14)",
  color: "#ffffff",
  border: "1px solid rgba(255,255,255,0.30)",
  borderRadius: "14px",
  padding: "15px 24px",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
  minWidth: "170px",
  backdropFilter: "blur(6px)",
};

export default DoctorHomePage;