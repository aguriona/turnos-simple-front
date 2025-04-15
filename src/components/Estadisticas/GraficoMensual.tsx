
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { obtenerDatosGraficoMensual } from "@/services/apiService";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const GraficoMensual = () => {
  const [datos, setDatos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const fechaActual = new Date();
  
  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const mes = fechaActual.getMonth() + 1;
        const año = fechaActual.getFullYear();
        const datosGrafico = await obtenerDatosGraficoMensual(mes, año);
        setDatos(datosGrafico);
      } catch (error) {
        console.error("Error al cargar datos del gráfico mensual:", error);
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
          <p className="font-medium mb-1">Día {label}</p>
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
        <CardTitle className="text-lg">
          Tendencia Mensual - {format(fechaActual, "MMMM yyyy", { locale: es })}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 md:p-4">
        {cargando ? (
          <div className="p-6 flex flex-col items-center space-y-4">
            <Skeleton className="h-[250px] w-full" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={datos}
              margin={{
                top: 20,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="dia" axisLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
              <Line type="monotone" dataKey="agendados" name="Agendados" stroke="#3b82f6" activeDot={{ r: 6 }} strokeWidth={2} />
              <Line type="monotone" dataKey="completados" name="Completados" stroke="#10b981" activeDot={{ r: 6 }} strokeWidth={2} />
              <Line type="monotone" dataKey="cancelados" name="Cancelados" stroke="#f43f5e" activeDot={{ r: 6 }} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default GraficoMensual;
