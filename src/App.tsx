import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import DetalleTurnoPage from "./pages/DetalleTurnoPage";
import ConfiguracionPage from "./pages/ConfiguracionPage";
import EstadisticasPage from "./pages/EstadisticasPage";
import CrearTurnoPage from "./pages/CrearTurnoPage";
import NotFound from "./pages/NotFound";
import { DarkModeProvider } from './context/DarkModeContext';

function App() {
  return (
    <DarkModeProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/turnos/:id" element={<DetalleTurnoPage />} />
          <Route path="/crear-turno" element={<CrearTurnoPage />} />
          <Route path="/configuracion" element={<ConfiguracionPage />} />
          <Route path="/estadisticas" element={<EstadisticasPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>
    </DarkModeProvider>
  );
}

export default App;
