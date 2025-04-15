
import { useState } from "react";
import Layout from "@/components/Layout/Layout";
import CalendarioTurnos from "@/components/Turnos/CalendarioTurnos";
import ListaTurnos from "@/components/Turnos/ListaTurnos";
import { motion } from "framer-motion";

const Index = () => {
  const [fechaSeleccionada, setFechaSeleccionada] = useState<Date>(new Date());
  const [vistaCalendario, setVistaCalendario] = useState<"semana" | "mes">("semana");
  
  const handleFechaSeleccionada = (fecha: Date) => {
    setFechaSeleccionada(fecha);
  };
  
  const toggleVistaCalendario = () => {
    setVistaCalendario(prev => prev === "semana" ? "mes" : "semana");
  };
  
  return (
    <Layout title="Gestión de Turnos">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6"
      >
        {/* Lista de turnos (izquierda en desktop, arriba en móvil) */}
        <div className="md:col-span-7 lg:col-span-8 order-1">
          <ListaTurnos fecha={fechaSeleccionada} />
        </div>
        
        {/* Calendario (derecha en desktop, abajo en móvil) */}
        <div className="md:col-span-5 lg:col-span-4 order-2">
          <CalendarioTurnos 
            onSelectFecha={handleFechaSeleccionada} 
            vistaCalendario={vistaCalendario}
            onCambiarVista={toggleVistaCalendario}
          />
        </div>
      </motion.div>
    </Layout>
  );
};

export default Index;
