import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import { format, isValid, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from "date-fns";
import { Turno } from "@/services/apiService";
import { CardContent, Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar as CalendarIcon, List, Calendar as CalendarViewIcon } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchTurnosDelMes } from "@/store/slices/turnosSlice";

interface CalendarioTurnosProps {
  onSelectFecha: (fecha: Date) => void;
  vistaCalendario: "semana" | "mes";
  onCambiarVista: () => void;
}

const CalendarioTurnos = ({ 
  onSelectFecha,
  vistaCalendario = "semana",
  onCambiarVista
}: CalendarioTurnosProps) => {
  const [fecha, setFecha] = useState<Date>(new Date());
  const [diasSemana, setDiasSemana] = useState<Date[]>([]);
  
  // Redux
  const dispatch = useAppDispatch();
  const { turnosDelMes, loading } = useAppSelector(state => ({
    turnosDelMes: state.turnos.turnosDelMes,
    loading: state.turnos.loading.turnosDelMes
  }));
  
  // Calculamos el conteo de turnos por día
  const turnosPorDia = turnosDelMes.reduce<Record<string, number>>((conteo, turno) => {
    const fechaTurno = new Date(turno.fecha);
    if (isValid(fechaTurno)) {
      const fechaFormateada = format(fechaTurno, 'yyyy-MM-dd');
      conteo[fechaFormateada] = (conteo[fechaFormateada] || 0) + 1;
    }
    return conteo;
  }, {});

  useEffect(() => {
    // Si es vista de semana, calcula los días de la semana actual
    if (vistaCalendario === "semana") {
      const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 }); // Lunes como inicio de semana
      const finSemana = endOfWeek(fecha, { weekStartsOn: 1 }); // Domingo como fin de semana
      const diasDeLaSemana = eachDayOfInterval({ start: inicioSemana, end: finSemana });
      setDiasSemana(diasDeLaSemana);
    }
  }, [fecha, vistaCalendario]);

  useEffect(() => {
    // Cargar turnos usando Redux
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    dispatch(fetchTurnosDelMes({ mes, año }));
  }, [dispatch, fecha.getMonth(), fecha.getFullYear()]);
  
  const handleSelect = (date: Date | undefined) => {
    if (date && isValid(date)) {
      setFecha(date);
      onSelectFecha(date);
    }
  };
  
  // Renderizar los días con el conteo de turnos
  const renderDia = (date: Date, isSelected: boolean) => {
    if (!isValid(date)) {
      console.error("Invalid date in renderDia:", date);
      return <div>{date.getDate()}</div>;
    }
    
    const fechaFormateada = format(date, 'yyyy-MM-dd');
    const cantidadTurnos = turnosPorDia[fechaFormateada] || 0;
    
    return (
      <div className="relative flex items-center justify-center">
        <div 
          className={cn(
            "h-8 w-8 rounded-full flex items-center justify-center text-sm",
            isSelected && "bg-primary text-primary-foreground"
          )}
        >
          {date.getDate()}
        </div>
        {cantidadTurnos > 0 && (
          <div className={cn(
            "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-1 rounded-full",
            isSelected ? "bg-white" : "bg-primary"
          )} />
        )}
      </div>
    );
  };

  // Renderizar la vista de semana
  const renderSemanaView = () => {
    return (
      <div className="grid grid-cols-7 gap-1 mt-2">
        {["L", "M", "X", "J", "V", "S", "D"].map((dia, index) => (
          <div key={`header-${index}`} className="text-center text-xs font-medium text-gray-500">
            {dia}
          </div>
        ))}
        
        {diasSemana.map((dia, index) => {
          const fechaFormateada = format(dia, 'yyyy-MM-dd');
          const cantidadTurnos = turnosPorDia[fechaFormateada] || 0;
          const esHoy = isSameDay(dia, new Date());
          const esFechaSeleccionada = isSameDay(dia, fecha);
          
          return (
            <button
              key={`day-${index}`}
              onClick={() => handleSelect(dia)}
              className={cn(
                "aspect-square p-1 flex flex-col items-center justify-center rounded-md transition-colors",
                esFechaSeleccionada ? "bg-primary text-primary-foreground" : 
                esHoy ? "bg-muted" : "hover:bg-muted"
              )}
            >
              <span className="text-sm">{format(dia, 'd')}</span>
              {cantidadTurnos > 0 && (
                <Badge 
                  variant="outline" 
                  className={cn(
                    "mt-1 text-xs px-1.5 py-0",
                    esFechaSeleccionada ? "bg-white/20 border-white/40" : "bg-primary/10 border-primary/30"
                  )}
                >
                  {cantidadTurnos}
                </Badge>
              )}
            </button>
          );
        })}
      </div>
    );
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="cita-card md:h-full">
          <CardHeader className="p-4 pb-0 flex flex-row justify-between items-center">
            <h3 className="text-md font-medium">Calendario</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onCambiarVista}
              className="h-8 w-8 p-0"
            >
              {vistaCalendario === "semana" ? <CalendarViewIcon className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="p-4">
            <div className={cn("md:scale-110 md:transform md:origin-top-left", vistaCalendario === "mes" ? "md:mt-2" : "")}>
              {vistaCalendario === "semana" ? (
                renderSemanaView()
              ) : (
                <Calendar
                  mode="single"
                  selected={fecha}
                  onSelect={handleSelect}
                  locale={es}
                  className="rounded-md"
                  components={{ 
                    Day: ({ day, modifiers }) => day.date && isValid(day.date) ? renderDia(day.date, !!modifiers.selected) : <div />
                  }}
                />
              )}
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Fecha: <span className="font-medium">{isValid(fecha) ? format(fecha, 'PPPP', { locale: es }) : "Fecha inválida"}</span>
              </div>
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-normal",
                  loading ? "animate-pulse" : ""
                )}
              >
                {loading ? "Cargando..." : `${isValid(fecha) ? (turnosPorDia[format(fecha, 'yyyy-MM-dd')] || 0) : 0} turnos`}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default CalendarioTurnos;
