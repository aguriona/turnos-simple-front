
import Layout from "@/components/Layout/Layout";
import ResumenEstadisticas from "@/components/Estadisticas/ResumenEstadisticas";
import GraficoSemanal from "@/components/Estadisticas/GraficoSemanal";
import GraficoMensual from "@/components/Estadisticas/GraficoMensual";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const EstadisticasPage = () => {
  // Datos de ejemplo para el gráfico circular
  const datosPie = [
    { name: "Completados", value: 63, color: "#10b981" },
    { name: "Cancelados", value: 15, color: "#f43f5e" },
    { name: "Ausentes", value: 8, color: "#f59e0b" },
    { name: "Pendientes", value: 14, color: "#3b82f6" },
  ];
  
  return (
    <Layout title="Estadísticas">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <ResumenEstadisticas />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GraficoSemanal />
          
          <Card>
            <CardHeader className="pb-0">
              <CardTitle className="text-lg">Distribución de Estados</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={datosPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {datosPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [`${value} turnos`, '']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <GraficoMensual />
      </motion.div>
    </Layout>
  );
};

export default EstadisticasPage;
