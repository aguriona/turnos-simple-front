
import { useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Clock, Plus, X } from "lucide-react";
import { Turno, EstadoTurno } from "@/services/apiService";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchTurnosPorFecha } from "@/store/slices/turnosSlice";

interface ListaTurnosProps {
  fecha: Date;
}

const ListaTurnos = ({ fecha }: ListaTurnosProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const fechaStr = format(fecha, 'yyyy-MM-dd');
  const { turnos, loading } = useAppSelector(state => ({
    turnos: state.turnos.turnosPorDia[fechaStr] || [],
    loading: state.turnos.loading.turnosPorDia
  }));

  useEffect(() => {
    // Cargar turnos del día seleccionado usando Redux
    dispatch(fetchTurnosPorFecha(fecha));
  }, [dispatch, fecha]);
  
  const getEstadoColor = (estado: EstadoTurno) => {
    switch (estado) {
      case "pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completado": return "bg-green-100 text-green-800 border-green-200";
      case "cancelado": return "bg-red-100 text-red-800 border-red-200";
      case "ausente": return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const getEstadoIcon = (estado: EstadoTurno) => {
    switch (estado) {
      case "pendiente": return <Clock className="h-3.5 w-3.5" />;
      case "confirmado": return <Check className="h-3.5 w-3.5" />;
      case "completado": return <Check className="h-3.5 w-3.5" />;
      case "cancelado": return <X className="h-3.5 w-3.5" />;
      case "ausente": return <AlertTriangle className="h-3.5 w-3.5" />;
    }
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  return (
    <Card className="overflow-hidden cita-card">
      <CardHeader className="p-4 flex flex-row items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">
          Turnos del {format(fecha, "EEEE d 'de' MMMM", { locale: es })}
        </h2>
        <Button 
          variant="default" 
          size="sm"
          onClick={() => navigate("/crear-turno", { state: { fecha } })}
          className="text-xs md:text-sm flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Nuevo Turno</span>
        </Button>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-4">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                    <div className="mt-3">
                      <Skeleton className="h-4 w-2/3" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : turnos.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">No hay turnos agendados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No hay turnos para este día. Puedes crear uno nuevo usando el botón de arriba.
            </p>
            <Button 
              onClick={() => navigate("/crear-turno", { state: { fecha } })}
              className="cita-btn-primary"
            >
              Crear Turno
            </Button>
          </div>
        ) : (
          <motion.div 
            className="space-y-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {turnos.map((turno) => (
              <motion.div key={turno.id} variants={item}>
                <Card 
                  className={cn(
                    "overflow-hidden border-l-4 hover:shadow-md transition-shadow cursor-pointer",
                    turno.estado === "cancelado" ? "border-l-red-500" : 
                    turno.estado === "completado" ? "border-l-green-500" : 
                    turno.estado === "confirmado" ? "border-l-blue-500" : 
                    turno.estado === "ausente" ? "border-l-gray-500" : 
                    "border-l-yellow-500"
                  )}
                  onClick={() => navigate(`/turnos/${turno.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{turno.cliente.nombre}</p>
                        <p className="text-sm text-gray-500">{turno.horaInicio} - {turno.horaFin}</p>
                      </div>
                      <Badge 
                        className={cn(
                          "flex items-center gap-1 text-xs border",
                          getEstadoColor(turno.estado)
                        )}
                        variant="outline"
                      >
                        {getEstadoIcon(turno.estado)}
                        <span className="capitalize">{turno.estado}</span>
                      </Badge>
                    </div>
                    
                    {turno.servicio && (
                      <p className="text-sm text-gray-700 mt-2">
                        <span className="font-medium">Servicio:</span> {turno.servicio}
                      </p>
                    )}
                    
                    {turno.notas && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                        <span className="font-medium">Nota:</span> {turno.notas}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ListaTurnos;
