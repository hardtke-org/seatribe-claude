import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './auth';
import Login from './pages/Login';
import NewPassword from './pages/NewPassword';
import Start from './pages/Start';
import Konto from './pages/Konto';
import Liste from './pages/Liste';
import DeliveryForm from './pages/DeliveryForm';
import DeliveryPage from './pages/DeliveryPage';

export default function App() {
  const { session, loading, recovery } = useAuth();
  if (loading) return <div className="center">Lädt …</div>;
  if (!session) return <Login />;
  if (recovery) return <NewPassword />;
  return (
    <Routes>
      <Route path="/" element={<Start />} />
      <Route path="/konto" element={<Konto />} />
      <Route path="/ueberfuehrungen" element={<Liste />} />
      <Route path="/ueberfuehrungen/neu" element={<DeliveryForm />} />
      <Route path="/ueberfuehrungen/:id" element={<DeliveryPage />} />
      <Route path="/ueberfuehrungen/:id/bearbeiten" element={<DeliveryForm />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
