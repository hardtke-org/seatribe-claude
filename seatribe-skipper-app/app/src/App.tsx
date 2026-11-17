import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Login from './pages/Login';
import NewPassword from './pages/NewPassword';
import Start from './pages/Start';
import Konto from './pages/Konto';
import Liste from './pages/Liste';
import DeliveryForm from './pages/DeliveryForm';
import DeliveryPage from './pages/DeliveryPage';
import Auftraege from './pages/Auftraege';
import Dokumente from './pages/Dokumente';
import Agentur from './pages/Agentur';
import AgenturSkipper from './pages/AgenturSkipper';

export default function App() {
  const { session, profile, loading, recovery } = useAuth();
  if (loading) return <div className="center">Lädt …</div>;
  if (!session) return <Login />;
  if (recovery) return <NewPassword />;
  // Eigene Überführungen sind vorerst nur für die Agentur sichtbar; Skipper bekommen Aufträge zugewiesen.
  const agentur = profile?.role === 'agentur';
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/konto" element={<Konto />} />
      <Route path="/agentur" element={<Agentur />} />
      {agentur ? (
        <>
          <Route path="/agentur/skipper/:id" element={<AgenturSkipper />} />
          <Route path="/ueberfuehrungen" element={<Liste />} />
          <Route path="/ueberfuehrungen/neu" element={<DeliveryForm />} />
          <Route path="/ueberfuehrungen/:id" element={<DeliveryPage />} />
          <Route path="/ueberfuehrungen/:id/bearbeiten" element={<DeliveryForm />} />
        </>
      ) : (
        <>
          <Route path="/auftraege" element={<Auftraege />} />
          <Route path="/dokumente" element={<Dokumente />} />
        </>
      )}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
