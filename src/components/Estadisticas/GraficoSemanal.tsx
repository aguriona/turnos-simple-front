
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { obtenerDatosGraficoSemanal } from "@/services/apiService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const GraficoSemanal = () => {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const datosGrafico = await obtenerDatosGraficoSemanal();
        setDatos(datosGrafico);
      } catch (error) {
        console.error("Error al cargar datos del gráfico:", error);
      } finally {
        setCargando(false);
      }
    };
    
    cargarDatos();
  }, []);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200 text-sm">
          <p className="font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="flex items-center justify-between">
              <span>{entry.name}:</span>
              <span className="font-semibold ml-3">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
  
    return null;
  };
  
  return (
    <Card className={cn("overflow-hidden", cargando ? "min-h-[350px]" : "")}>
      <CardHeader className="pb-0">
        <CardTitle className="text-lg">Actividad Semanal</CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-4">
        {cargando ? (
          <div className="p-6 flex flex-col items-center space-y-4">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={datos}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 5,
              }}
              barGap={2}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dia" axisLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar dataKey="agendados" name="Agendados" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completados" name="Completados" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cancelados" name="Cancelados" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default GraficoSemanal;
