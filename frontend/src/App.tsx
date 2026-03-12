import './index.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
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

function App() {
  return (
    <BrowserRouter>
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
      </Routes>
      <footer>
        <p>© 2026 TFG Torneos de Fútbol · Osentida Nguema Rodríguez · DAW</p>
      </footer>
    </BrowserRouter>
  );
}

export default App;
