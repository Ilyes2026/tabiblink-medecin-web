import { Routes, Route } from "react-router";
import DoctorHomePage from "./pages/DoctorHomePage";
import DoctorLoginPage from "./pages/DoctorLoginPage";
import DoctorRegisterPage from "./pages/DoctorRegisterPage";
import DoctorDashboardPage from "./pages/DoctorDashboardPage";
import DoctorProfilePage from "./pages/DoctorProfilePage";
import DoctorDisponibilitesPage from "./pages/DoctorDisponibilitesPage";
import DoctorRendezVousPage from "./pages/DoctorRendezVousPage";
import PatientInfoPage from "./pages/PatientInfoPage";
import PrescrireExamenPage from "./pages/PrescrireExamenPage";
import DocumentsAutorisesPage from "./pages/DocumentsAutorisesPage";
import EvaluationsMedecin from "./pages/EvaluationsMedecin";


function App() {
  return (
    <Routes>
      <Route path="/" element={<DoctorHomePage />} />
      <Route path="/connexion" element={<DoctorLoginPage />} />
      <Route path="/inscription" element={<DoctorRegisterPage />} />
      <Route path="/espace-medecin" element={<DoctorDashboardPage />} />
      <Route path="/profil-professionnel" element={<DoctorProfilePage />} />
      <Route path="/mes-disponibilites" element={<DoctorDisponibilitesPage />} />
      <Route path="/demandes-rendez-vous" element={<DoctorRendezVousPage />} />
      <Route path="/patient-info/:email" element={<PatientInfoPage />} />
      <Route path="/prescrire-examen/:rendezVousId" element={<PrescrireExamenPage />} />
      <Route path="/documents-autorises/:patientEmail" element={<DocumentsAutorisesPage />} />
      <Route path="/medecin/evaluations" element={<EvaluationsMedecin />} />
      

    </Routes>
  );
}

export default App;