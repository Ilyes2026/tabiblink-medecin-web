import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function DoctorLoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!email || !motDePasse) {
      setMessage("Veuillez remplir tous les champs.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("https://tabiblink-backend.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          motDePasse,
        }),
      });

      const text = await response.text();

let data = null;
try {
  data = JSON.parse(text);
} catch {
  data = null;
}

const backendMessage = data?.message || text || "Erreur lors de la connexion.";
console.log("Réponse login médecin :", data);
setMessage(backendMessage);

if (response.ok && data?.role === "MEDECIN") {
  const idMedecin = data?.medecinId || data?.id || data?.userId;

  localStorage.setItem("medecinId", idMedecin);
  localStorage.setItem("medecinEmail", data?.email);
  localStorage.setItem("medecinRole", data?.role);

  navigate("/espace-medecin");
} else {
  setMessage("Accès refusé : ce compte n’est pas un compte médecin.");
}
    } catch (error) {
      console.error(error);
      setMessage("Erreur lors de la connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f8fb",
        fontFamily: "Arial",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "#ffffff",
          padding: "32px",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ marginBottom: "8px", color: "#0F4C81" }}>
          Connexion médecin
        </h1>

        <p style={{ marginBottom: "24px", color: "#555" }}>
          Accédez à votre espace professionnel.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="exemple@gmail.com"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d0d7de",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "8px" }}>
              Mot de passe
            </label>
            <input
              type="password"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              placeholder="********"
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #d0d7de",
                fontSize: "14px",
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              background: "#0F4C81",
              color: "white",
              fontSize: "15px",
              fontWeight: "bold",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: "16px", color: "#d35400" }}>{message}</p>
        )}

        <p style={{ marginTop: "22px", fontSize: "14px" }}>
          Vous n’avez pas de compte ?{" "}
          <Link to="/inscription" style={{ color: "#0F4C81", fontWeight: "bold" }}>
            Créer un compte
          </Link>
        </p>

        <p style={{ marginTop: "10px", fontSize: "14px" }}>
          <Link to="/" style={{ color: "#0F4C81" }}>
            Retour à l’accueil
          </Link>
        </p>
      </div>
    </div>
  );
}

export default DoctorLoginPage;