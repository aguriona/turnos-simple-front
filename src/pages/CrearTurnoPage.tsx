
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { format, parse, isValid, addHours } from "date-fns";
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
import { toast } from "@/components/ui/use-toast";
import { CalendarIcon, Clock, User, Phone, MessageCircle, X } from "lucide-react";
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
  
  const [fecha, setFecha] = useState<Date>(initialDate);
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("10:00");
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefono, setTelefono] = useState("");
  const [servicio, setServicio] = useState(servicios[0]);
  const [notas, setNotas] = useState("");
  const [enviando, setEnviando] = useState(false);

  const handleHoraInicioChange = (value: string) => {
    setHoraInicio(value);
    
    // Actualizar automáticamente la hora de fin a 1 hora después
    try {
      const horaInicioDate = parse(value, 'HH:mm', new Date() as any);
      if (isValid(horaInicioDate)) {
        const horaFinDate = addHours(horaInicioDate, 1);
        setHoraFin(format(horaFinDate, 'HH:mm', undefined as any));
      }
    } catch (error) {
      console.error("Error al calcular hora de fin:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!nombreCliente.trim()) {
      toast({
        title: "Error",
        description: "El nombre del cliente es obligatorio",
        variant: "destructive",
      });
      return;
    }
    
    setEnviando(true);
    
    try {
      // Aquí se implementaría la lógica para guardar el turno, luego esto debe moverse a service
      // usando una función como crearTurno de apiService
      
      // Simulamos el guardado exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Turno creado",
        description: `Turno para ${nombreCliente} el ${format(fecha, 'PPP', { locale: es } as any)} a las ${horaInicio}`,
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
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2 md:col-span-1">
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
                        {fecha ? format(fecha, "PPP", { locale: es } as any) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={fecha}
                        onSelect={(date: Date | undefined) => date && setFecha(date)}
                        disabled={(date: Date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="horaInicio">Hora inicio</Label>
                  <div className="flex">
                    <div className="relative w-full">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="horaInicio"
                        type="time"
                        value={horaInicio}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleHoraInicioChange(e.target.value)}
                        className="pl-10 cita-input"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-1">
                  <Label htmlFor="horaFin">Hora fin</Label>
                  <div className="flex">
                    <div className="relative w-full">
                      <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="horaFin"
                        type="time"
                        value={horaFin}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoraFin(e.target.value)}
                        className="pl-10 cita-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Datos del cliente */}
              <div className="grid md:grid-cols-2 gap-4">
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
                disabled={enviando}
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
