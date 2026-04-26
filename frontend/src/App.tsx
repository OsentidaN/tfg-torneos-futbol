import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { ThemeProvider } from './context/ThemeContext';
import Home from './pages/Home';
import Torneos from './pages/Torneos';
import TorneoDetalle from './pages/TorneoDetalle';
import Partidos from './pages/Partidos';
import PartidoDetalle from './pages/PartidoDetalle';
import Equipos from './pages/Equipos';
import EquipoDetalle from './pages/EquipoDetalle';
import Comparar from './pages/Comparar';
import Estadisticas from './pages/Estadisticas';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Favoritos from './pages/Favoritos';
import Perfil from './pages/Perfil';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-accent)',
            fontFamily: 'Outfit',
            backdropFilter: 'blur(10px)'
          },
          success: { iconTheme: { primary: 'var(--accent)', secondary: '#000' } },
        }} 
      />
      <ThemeProvider>
        <Navbar />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/torneos" element={<Torneos />} />
        <Route path="/torneos/:id" element={<TorneoDetalle />} />
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/partidos/:id" element={<PartidoDetalle />} />
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/equipos/:id" element={<EquipoDetalle />} />
        <Route path="/comparar" element={<Comparar />} />
        <Route path="/estadisticas" element={<Estadisticas />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/favoritos" element={<ProtectedRoute><Favoritos /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Routes>
      <footer>
        <p>© 2026 TFG Torneos de Fútbol · Osentida Nguema Rodríguez · DAW</p>
      </footer>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
