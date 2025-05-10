
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parse, isValid, addHours, addMinutes, isBefore, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, Clock, User, Phone, MessageCircle, X, AlertCircle, Info } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchConfiguracionHorario } from "@/store/slices/configuracionSlice";
import { crearTurno, EstadoTurno } from "@/services/apiService";
import { motion } from "framer-motion";

const servicios = [
  "Consulta general",
  "Control de rutina",
  "Emergencia",
  "Procedimiento",
  "Revisión"
];

const CrearTurnoPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialDate = location.state?.fecha || new Date();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  // Obtener la configuración desde Redux
  const configuracion = useAppSelector(state => state.configuracion);
  const { diasDisponibles, horaInicio: horaInicioConfig, horaFin: horaFinConfig, duracionTurnoPredeterminada } = configuracion.horario;
  const loadingConfig = configuracion.loading.horario;
  
  const [fecha, setFecha] = useState<Date>(initialDate);
  const [horaInicio, setHoraInicio] = useState(horaInicioConfig || "09:00");
  const [horaFin, setHoraFin] = useState("");
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState(servicios[0]);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
  
  // Verificar si el día seleccionado está disponible
  const esDiaDisponible = diasDisponibles.includes(fecha.getDay());
  
  // Cargar la configuración al iniciar
  useEffect(() => {
    dispatch(fetchConfiguracionHorario());
  }, [dispatch]);
  
  // Actualizar hora inicio cuando cambia la configuración
  useEffect(() => {
    if (horaInicioConfig) {
      setHoraInicio(horaInicioConfig);
    }
  }, [horaInicioConfig]);
  
  // Actualizar hora fin cuando cambia hora inicio o duración
  useEffect(() => {
    if (horaInicio && duracionTurnoPredeterminada) {
      try {
        const horaInicioDate = parse(horaInicio, 'HH:mm', new Date());
        if (isValid(horaInicioDate)) {
          const horaFinDate = addMinutes(horaInicioDate, duracionTurnoPredeterminada);
          setHoraFin(format(horaFinDate, 'HH:mm'));
        }
      } catch (error) {
        console.error("Error al calcular hora de fin:", error);
      }
    }
  }, [horaInicio, duracionTurnoPredeterminada]);

  const handleHoraInicioChange = (value: string) => {
    setHoraInicio(value);
    setErrorValidacion(null);
    
    // Actualizar automáticamente la hora de fin según la duración predeterminada
    try {
      const horaInicioDate = parse(value, 'HH:mm', new Date());
      if (isValid(horaInicioDate)) {
        const horaFinDate = addMinutes(horaInicioDate, duracionTurnoPredeterminada || 60);
        setHoraFin(format(horaFinDate, 'HH:mm'));
        
        // Validar que está dentro del horario configurado
        if (horaInicioConfig && horaFinConfig) {
          const horaInicioLimite = parse(horaInicioConfig, 'HH:mm', new Date());
          const horaFinLimite = parse(horaFinConfig, 'HH:mm', new Date());
          
          if (isBefore(horaInicioDate, horaInicioLimite) || isAfter(horaFinDate, horaFinLimite)) {
            setErrorValidacion(`El horario debe estar entre ${horaInicioConfig} y ${horaFinConfig}`);  
          }
        }
      }
    } catch (error) {
      console.error("Error al calcular hora de fin:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validaciones
    if (!nombreCliente.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    if (!esDiaDisponible) {
      toast({
        title: "Error",
        description: "El día seleccionado no está disponible para agendar turnos",
        variant: "destructive",
      });
      return;
    }
    
    if (errorValidacion) {
      toast({
        title: "Error",
        description: errorValidacion,
        variant: "destructive",
      });
      return;
    }
    
    setEnviando(true);
    
    try {
      // Crear el nuevo turno usando el servicio API
      const nuevoTurno = {
        fecha: format(fecha, 'yyyy-MM-dd'),
        horaInicio,
        horaFin,
        cliente: {
          id: `cliente-${Date.now()}`, // ID temporal
          nombre: nombreCliente,
          telefono: telefono || "No proporcionado"
        },
        estado: "pendiente" as EstadoTurno,
        servicio,
        notas
      };
      
      // Usar el servicio API para crear el turno
      await crearTurno(nuevoTurno);
      
      toast({
        title: "Turno creado",
        description: `Turno para ${nombreCliente} el ${format(fecha, 'PPP', { locale: es })} a las ${horaInicio}`,
      });
      
      navigate("/");
    } catch (error) {
      console.error("Error al crear turno:", error);
      toast({
        title: "Error",
        description: "No se pudo crear el turno. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Layout title="Crear Nuevo Turno">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-2xl mx-auto"
      >
        <Card className="cita-card shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">
                  Nuevo Turno
                </h2>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate("/")}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Fecha y hora */}
              {/* Fecha y hora */}
              <div className="space-y-4">
                {/* Fecha */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fecha">Fecha</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal cita-input",
                            !fecha && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {fecha ? format(fecha, "PPP", { locale: es }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white" align="start">
                        <Calendar
                          mode="single"
                          selected={fecha}
                          onSelect={(date: Date | undefined) => {
                            if (date) {
                              setFecha(date);
                              setErrorValidacion(null);
                            }
                          }}
                          disabled={(date: Date) => {
                            const today = new Date(new Date().setHours(0, 0, 0, 0));
                            const isPastDate = date < today;
                            const isDayNotAvailable = !diasDisponibles.includes(date.getDay());
                            return isPastDate || isDayNotAvailable;
                          }}
                          initialFocus
                          className="rounded-md border border-input shadow-md bg-white"
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {/* Info de configuración */}
                    {!loadingConfig && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded mt-2">
                        <Info className="h-3 w-3" />
                        <span>Horario configurado: {horaInicioConfig} - {horaFinConfig}</span>
                        {!esDiaDisponible && (
                          <Badge variant="outline" className="ml-1 bg-yellow-100 text-yellow-800 text-xs">
                            Día no hábil
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                
                  {/* Mensaje de validación */}
                  {errorValidacion && (
                    <Alert variant="destructive" className="p-3 mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs ml-2">
                        {errorValidacion}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
                
                {/* Horas */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="horaInicio">Hora de inicio</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="horaInicio"
                        type="time"
                        value={horaInicio}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHoraInicioChange(e.target.value)}
                        className="pl-10 cita-input"
                        disabled={!esDiaDisponible}
                        min={horaInicioConfig}
                        max={horaFinConfig}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="horaFin">Hora de fin</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="horaFin"
                        type="time"
                        value={horaFin}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoraFin(e.target.value)}
                        className="pl-10 cita-input"
                        disabled={true} // Calculado automáticamente según la duración
                      />
                    </div>
                  </div>
                </div>
              </div>
                
              {/* Datos del cliente */}
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="nombreCliente">Nombre del cliente</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="nombreCliente"
                      value={nombreCliente}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombreCliente(e.target.value)}
                      className="pl-10 cita-input"
                      placeholder="Nombre completo"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telefono"
                      value={telefono}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value)}
                      className="pl-10 cita-input"
                      placeholder="Número de contacto"
                    />
                  </div>
                </div>
              </div>
              
              {/* Servicio */}
              <div className="space-y-2">
                <Label htmlFor="servicio">Servicio</Label>
                <Select
                  value={servicio}
                  onValueChange={setServicio}
                >
                  <SelectTrigger id="servicio" className="cita-input">
                    <SelectValue placeholder="Seleccionar servicio" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicios.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* Notas */}
              <div className="space-y-2">
                <Label 
                  htmlFor="notas" 
                  className="flex items-center"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Notas (opcional)
                </Label>
                <Textarea
                  id="notas"
                  value={notas}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotas(e.target.value)}
                  className="cita-input min-h-[100px]"
                  placeholder="Detalles adicionales sobre el turno..."
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/")}
                disabled={enviando}
                className="cita-btn-outline"
              >
                Cancelar
              </Button>
              
              <Button 
                type="submit"
                disabled={enviando || !esDiaDisponible || !!errorValidacion}
                className="cita-btn-primary"
              >
                {enviando ? "Guardando..." : "Guardar Turno"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </Layout>
  );
};

export default CrearTurnoPage;
