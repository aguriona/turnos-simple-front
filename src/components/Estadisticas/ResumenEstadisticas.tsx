
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { obtenerEstadisticasMes, EstadisticasPeriodo } from "@/services/apiService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarClock, CheckCircle, XCircle, UserX, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const ResumenEstadisticas = () => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasPeriodo | null>(null);
  const [cargando, setCargando] = useState(true);
  const fechaActual = new Date();
  
  useEffect(() => {
    const cargarEstadisticas = async () => {
      setCargando(true);
      try {
        const mes = fechaActual.getMonth() + 1;
        const año = fechaActual.getFullYear();
        const datos = await obtenerEstadisticasMes(mes, año);
        setEstadisticas(datos);
      } catch (error) {
        console.error("Error al cargar estadísticas:", error);
      } finally {
        setCargando(false);
      }
    };
    
    cargarEstadisticas();
  }, []);
  
  const tarjetasEstadisticas = [
    {
      titulo: "Total Turnos",
      valor: estadisticas?.total || 0,
      icono: <CalendarClock className="h-5 w-5 text-primary" />,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      titulo: "Completados",
      valor: estadisticas?.completados || 0,
      icono: <CheckCircle className="h-5 w-5 text-green-600" />,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      titulo: "Cancelados",
      valor: estadisticas?.cancelados || 0,
      icono: <XCircle className="h-5 w-5 text-red-500" />,
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    {
      titulo: "Ausentes",
      valor: estadisticas?.ausentes || 0,
      icono: <UserX className="h-5 w-5 text-orange-500" />,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      titulo: "Pendientes",
      valor: estadisticas?.pendientes || 0,
      icono: <Clock className="h-5 w-5 text-blue-500" />,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    }
  ];
  
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Estadísticas de {format(fechaActual, "MMMM yyyy", { locale: es })}
      </h2>
      
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {cargando
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-5 w-24" />
                </CardContent>
              </Card>
            ))
          : tarjetasEstadisticas.map((tarjeta) => (
              <Card key={tarjeta.titulo} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between p-2 mb-3">
                    <div className={`${tarjeta.bgColor} p-2 rounded-full`}>
                      {tarjeta.icono}
                    </div>
                    <span className={`text-2xl font-bold ${tarjeta.color}`}>
                      {tarjeta.valor}
                    </span>
                  </div>
                  <h3 className="text-sm text-gray-500">{tarjeta.titulo}</h3>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
};

export default ResumenEstadisticas;
