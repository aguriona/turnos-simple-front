import { useState, useEffect, useMemo, useCallback } from "react";
import { Calendar } from "@/components/ui/calendar";
import { es } from "date-fns/locale";
import {
  format,
  isValid,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  getMonth,
  getYear,
  isSameMonth,
  setMonth,
  setYear
} from "date-fns";
import { Turno } from "@/services/apiService";
import { CardContent, Card, CardHeader, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Calendar as CalendarIcon,
  List,
  Calendar as CalendarViewIcon,
  AlertCircle,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Check
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchTurnosDelMes } from "@/store/slices/turnosSlice";

// Tipos
interface CalendarioTurnosProps {
  onSelectFecha: (fecha: Date) => void;
  vistaCalendario: "semana" | "mes";
  onCambiarVista: () => void;
}

// Componente para el esqueleto de carga
const CalendarioSkeleton = ({ vistaCalendario }: { vistaCalendario: "semana" | "mes" }) => (
  <div className="space-y-3">
    <div className="flex justify-between mb-2">
      <Skeleton className="h-6 w-36" />
      <Skeleton className="h-6 w-6 rounded" />
    </div>

    {vistaCalendario === "semana" ? (
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded" />
        ))}
      </div>
    ) : (
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 place-items-center">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-4 rounded" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((week) => (
          <div key={week} className="grid grid-cols-7 gap-1 place-items-center">
            {Array.from({ length: 7 }).map((_, day) => (
              <Skeleton key={`${week}-${day}`} className="h-8 w-8 rounded-full" />
            ))}
          </div>
        ))}
      </div>
    )}

    <div className="flex justify-between mt-2">
      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-5 w-20" />
    </div>
  </div>
);

// Componente para mostrar un error
const ErrorDisplay = ({
  error,
  onRetry
}: {
  error: string | null,
  onRetry: () => void
}) => (
  <Alert variant="destructive" className="mb-4">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>
      {error || "No se pudieron cargar los turnos. Por favor, inténtelo de nuevo."}
      <Button
        variant="outline"
        size="sm"
        className="mt-2 w-full"
        onClick={onRetry}
      >
        Reintentar
      </Button>
    </AlertDescription>
  </Alert>
);

// Componente para día en la vista mensual
const DiaMes = ({
  day,
  isSelected,
  cantidadTurnos,
  isCurrentMonth
}: {
  day: Date,
  isSelected: boolean,
  cantidadTurnos: number,
  isCurrentMonth: boolean
}) => (
  <div className="w-full h-full flex items-center justify-center">
    <div
      className={cn(
        "flex flex-col items-center justify-center text-sm p-0.5 w-9 h-9 rounded-full relative",
        isSelected
          ? "bg-primary text-primary-foreground"
          : isCurrentMonth
            ? "hover:bg-muted"
            : "text-muted-foreground hover:bg-muted/50"
      )}
    >
      <span>{format(day, 'd')}</span>

      {cantidadTurnos > 0 && (
        <div
          className={cn(
            "absolute bottom-0.5 w-4/5 h-0.5 rounded-full",
            isSelected
              ? "bg-primary-foreground"
              : "bg-primary"
          )}
        />
      )}
    </div>
  </div>
);

// Componente para cabecera de día en semana
const CabeceraDiaSemana = ({ dia }: { dia: string }) => (
  <div className="text-center text-xs font-medium text-muted-foreground">
    {dia}
  </div>
);

// Componente para la vista semanal
const VistaSemanal = ({
  diasSemana,
  fecha,
  turnosPorDia,
  turnosPorHora,
  onSelectDia
}: {
  diasSemana: Date[],
  fecha: Date,
  turnosPorDia: Record<string, number>,
  turnosPorHora: Record<string, Record<number, number>>,
  onSelectDia: (dia: Date) => void
}) => {
  // Obtenemos las 3 horas más utilizadas
  const horasMasUtilizadas = useMemo(() => {
    // Obtener las horas con turnos para los días de la semana actual
    const horasConTurnos: Record<number, number> = {};

    diasSemana.forEach(dia => {
      const fechaStr = format(dia, 'yyyy-MM-dd');
      const horasDia = turnosPorHora[fechaStr] || {};

      // Contar ocurrencias de cada hora
      Object.entries(horasDia).forEach(([hora, cantidad]) => {
        const horaNum = parseInt(hora);
        horasConTurnos[horaNum] = (horasConTurnos[horaNum] || 0) + cantidad;
      });
    });

    // Devolver las 3 horas más comunes
    return Object.entries(horasConTurnos)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hora]) => parseInt(hora))
      .sort((a, b) => a - b); // Ordenar ascendente
  }, [diasSemana, turnosPorHora]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["L", "M", "X", "J", "V", "S", "D"].map((diaTxt, index) => (
          <CabeceraDiaSemana key={`header-${index}`} dia={diaTxt} />
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {diasSemana.map((dia, index) => {
          const fechaFormateada = format(dia, 'yyyy-MM-dd');
          const cantidadTurnos = turnosPorDia[fechaFormateada] || 0;
          const horasDia = turnosPorHora[fechaFormateada] || {};
          const esHoy = isSameDay(dia, new Date());
          const esFechaSeleccionada = isSameDay(dia, fecha);

          // Verificar si hay turnos en las horas más comunes para este día
          const turnosPorHoraDestacada = horasMasUtilizadas.map(hora => ({
            hora,
            cantidad: horasDia[hora] || 0
          }));

          return (
            <div key={`day-${index}`} className="flex flex-col space-y-1">
              <button
                onClick={() => onSelectDia(dia)}
                className={cn(
                  "p-1.5 rounded-md transition-colors flex flex-col items-center",
                  esFechaSeleccionada
                    ? "bg-primary text-primary-foreground"
                    : esHoy
                      ? "bg-muted"
                      : "hover:bg-muted"
                )}
              >
                <span className="text-sm font-medium">{format(dia, 'd')}</span>
                {cantidadTurnos > 0 && (
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 text-xs px-1.5 py-0",
                      esFechaSeleccionada
                        ? "bg-white/20 border-white/40"
                        : "bg-primary/10 border-primary/30"
                    )}
                  >
                    {cantidadTurnos}
                  </Badge>
                )}
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
};

// Componente para la información de la fecha seleccionada
const InfoFechaSeleccionada = ({ fecha, cantidadTurnos }: { fecha: Date, cantidadTurnos: number }) => (
  <div className="mt-4 flex items-center justify-between">
    <div className="text-sm text-muted-foreground">
      <span className="font-medium">{isValid(fecha) ? format(fecha, 'PPPP', { locale: es }) : "Fecha inválida"}</span>
    </div>
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        cantidadTurnos > 0 ? "bg-primary/10 border-primary/30" : ""
      )}
    >
      {cantidadTurnos} {cantidadTurnos === 1 ? "turno" : "turnos"}
    </Badge>
  </div>
);

// Componente para la navegación de fechas
const NavegacionFechas = ({
  vistaCalendario,
  fecha,
  diasSemana,
  onAnterior,
  onSiguiente,
  loading
}: {
  vistaCalendario: "semana" | "mes",
  fecha: Date,
  diasSemana: Date[],
  onAnterior: () => void,
  onSiguiente: () => void,
  loading: boolean
}) => (
  <div className="flex items-center space-x-1">
    <Button
      variant="ghost"
      size="icon"
      onClick={onAnterior}
      className="h-7 w-7"
      disabled={loading}
    >
      <ChevronLeft className="h-4 w-4" />
    </Button>

    <span className="text-sm font-medium px-1">
      {vistaCalendario === "semana"
        ? `${format(diasSemana[0] || fecha, 'd MMM', { locale: es })} - ${format(diasSemana[6] || fecha, 'd MMM', { locale: es })}`
        : format(fecha, 'MMMM yyyy', { locale: es })
      }
    </span>

    <Button
      variant="ghost"
      size="icon"
      onClick={onSiguiente}
      className="h-7 w-7"
      disabled={loading}
    >
      <ChevronRight className="h-4 w-4" />
    </Button>
  </div>
);

// Componente principal
const CalendarioTurnos = ({
  onSelectFecha,
  vistaCalendario = "semana",
  onCambiarVista
}: CalendarioTurnosProps) => {
  // Estado local
  const [fecha, setFecha] = useState<Date>(new Date());
  const [diasSemana, setDiasSemana] = useState<Date[]>([]);
  const [mostrarError, setMostrarError] = useState(false);

  // Redux hooks
  const dispatch = useAppDispatch();
  const turnosState = useAppSelector(state => state.turnos);
  const turnosDelMes = turnosState.turnosDelMes;
  const loading = turnosState.loading.turnosDelMes;
  const error = turnosState.error.turnosDelMes;

  // Calculamos el conteo de turnos por día y agrupamos por horas
  const { turnosPorDia, turnosPorHora } = useMemo(() => {
    const porDia: Record<string, number> = {};
    const porHora: Record<string, Record<number, number>> = {};

    turnosDelMes.forEach(turno => {
      const fechaTurno = new Date(turno.fecha);
      if (isValid(fechaTurno)) {
        const fechaFormateada = format(fechaTurno, 'yyyy-MM-dd');

        // Incrementar conteo por día
        porDia[fechaFormateada] = (porDia[fechaFormateada] || 0) + 1;

        // Agrupar por hora
        if (!porHora[fechaFormateada]) {
          porHora[fechaFormateada] = {};
        }

        const hora = parseInt(turno.horaInicio.split(':')[0]);
        porHora[fechaFormateada][hora] = (porHora[fechaFormateada][hora] || 0) + 1;
      }
    });

    return { turnosPorDia: porDia, turnosPorHora: porHora };
  }, [turnosDelMes]);

  // Calcular los días de la semana
  useEffect(() => {
    if (vistaCalendario === "semana") {
      const inicioSemana = startOfWeek(fecha, { weekStartsOn: 1 }); // Lunes como inicio de semana
      const finSemana = endOfWeek(fecha, { weekStartsOn: 1 }); // Domingo como fin de semana
      const diasDeLaSemana = eachDayOfInterval({ start: inicioSemana, end: finSemana });
      setDiasSemana(diasDeLaSemana);
    }
  }, [fecha, vistaCalendario]);

  // Cargar los turnos cuando cambia el mes
  useEffect(() => {
    const mes = getMonth(fecha) + 1;
    const año = getYear(fecha);
    dispatch(fetchTurnosDelMes({ mes, año }));
  }, [dispatch, getMonth(fecha), getYear(fecha)]);

  // Manejar errores
  useEffect(() => {
    setMostrarError(!!error);
  }, [error]);

  // Handlers para navegación
  const handleAnterior = useCallback(() => {
    if (vistaCalendario === "semana") {
      setFecha(subWeeks(fecha, 1));
    } else {
      setFecha(subMonths(fecha, 1));
    }
  }, [fecha, vistaCalendario]);

  const handleSiguiente = useCallback(() => {
    if (vistaCalendario === "semana") {
      setFecha(addWeeks(fecha, 1));
    } else {
      setFecha(addMonths(fecha, 1));
    }
  }, [fecha, vistaCalendario]);

  // Manejar cambio de mes mediante selector
  const handleCambioMes = useCallback((value: string) => {
    const mes = parseInt(value);
    setFecha(setMonth(fecha, mes));
  }, [fecha]);

  // Lista de meses para el selector
  const meses = useMemo(() => [
    { value: "0", label: "Enero" },
    { value: "1", label: "Febrero" },
    { value: "2", label: "Marzo" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Mayo" },
    { value: "5", label: "Junio" },
    { value: "6", label: "Julio" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Septiembre" },
    { value: "9", label: "Octubre" },
    { value: "10", label: "Noviembre" },
    { value: "11", label: "Diciembre" }
  ], []);

  // Handler para seleccionar día
  const handleSelect = useCallback((date: Date | undefined) => {
    if (date && isValid(date)) {
      setFecha(date);
      onSelectFecha(date);
    }
  }, [onSelectFecha]);

  // Handler para reintentar
  const handleRetry = useCallback(() => {
    const mes = getMonth(fecha) + 1;
    const año = getYear(fecha);
    dispatch(fetchTurnosDelMes({ mes, año }));
  }, [dispatch, fecha]);

  // Calcular turnos en fecha seleccionada
  const turnosEnFechaSeleccionada = useMemo(() => {
    if (!isValid(fecha)) return 0;
    return turnosPorDia[format(fecha, 'yyyy-MM-dd')] || 0;
  }, [fecha, turnosPorDia]);

  // Renderizado del componente
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <Card className="flex flex-col">
          <CardHeader className="justify-between items-center p-4 pb-2 ">
          <Select
              value={getMonth(fecha).toString()}
              onValueChange={handleCambioMes}
              disabled={loading}
            >
              <SelectTrigger className="h-7 w-[110px] text-xs border-input">
                <CalendarViewIcon className="h-3.5 w-3.5 mr-1" />
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {meses.map(mes => (
                  <SelectItem
                    key={mes.value}
                    value={mes.value}
                    className="text-xs"
                  >
                    {mes.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <NavegacionFechas
              vistaCalendario={vistaCalendario}
              fecha={fecha}
              diasSemana={diasSemana}
              onAnterior={handleAnterior}
              onSiguiente={handleSiguiente}
              loading={loading}
            />
          </CardHeader>

          <CardContent className="p-4 pt-2 flex-1">
            {mostrarError && <ErrorDisplay error={error} onRetry={handleRetry} />}

            {loading && <CalendarioSkeleton vistaCalendario={vistaCalendario} />}

            {!loading && !mostrarError && (
              <div className="h-full flex flex-col">
                <div className="flex-1">
                  {vistaCalendario === "semana" ? (
                    <VistaSemanal
                      diasSemana={diasSemana}
                      fecha={fecha}
                      turnosPorDia={turnosPorDia}
                      turnosPorHora={turnosPorHora}
                      onSelectDia={handleSelect}
                    />
                  ) : (
                    <Calendar
                      mode="single"
                      selected={fecha}
                      onSelect={handleSelect}
                      month={fecha}
                      onMonthChange={setFecha}
                      locale={es}
                      weekStartsOn={1}
                      className="rounded-md border-none p-0"
                      classNames={{
                        months: "space-y-2",
                        month: "space-y-2",
                        caption: "flex justify-center pt-1 relative items-center",
                        caption_label: "hidden", // Ocultar la etiqueta del mes ya que tenemos nuestra propia navegación
                        nav: "hidden", // Ocultar la navegación del calendario ya que tenemos nuestra propia navegación
                        table: "w-full border-collapse",
                        head_row: "flex w-full",
                        head_cell: "text-muted-foreground w-9 font-normal text-[0.8rem] rounded-md",
                        row: "flex w-full mt-1",
                        cell: "w-9 h-9 p-0 relative [&:has([aria-selected])]:bg-transparent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                        day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100",
                        day_selected: "bg-primary text-primary-foreground rounded-full",
                        day_today: "bg-accent text-accent-foreground rounded-full",
                        day_outside: "text-muted-foreground opacity-50",
                        day_disabled: "text-muted-foreground opacity-30",
                        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                        day_hidden: "invisible",
                      }}
                      components={{
                        Day: ({ day, selected }) => {
                          // Solo renderizar si tenemos una fecha válida
                          if (!day.date) return null;

                          const cantidadTurnos = turnosPorDia[format(day.date, 'yyyy-MM-dd')] || 0;
                          const isCurrentMonth = isSameMonth(day.date, fecha);

                          return (
                            <DiaMes
                              day={day.date}
                              isSelected={selected}
                              cantidadTurnos={cantidadTurnos}
                              isCurrentMonth={isCurrentMonth}
                            />
                          );
                        },
                      }}
                    />
                  )}
                </div>

                <InfoFechaSeleccionada
                  fecha={fecha}
                  cantidadTurnos={turnosEnFechaSeleccionada}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default CalendarioTurnos;
