
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfiguracionHorario, nombresDias } from "@/services/apiService";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchConfiguracionHorario, saveConfiguracionHorario } from "@/store/slices/configuracionSlice";

const HorarioConfig = () => {
  const dispatch = useAppDispatch();
  const { horario, guardando, error } = useAppSelector(state => state.configuracion);
  const loadingHorario = useAppSelector(state => state.configuracion.loading.horario);
  const { toast } = useToast();
  
  useEffect(() => {
    // Cargar la configuración usando Redux
    dispatch(fetchConfiguracionHorario());
  }, [dispatch]);
  
  // Mostrar errores si ocurren
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const handleDiaChange = (diaIndice: number, checked: boolean) => {
    const diasActualizados = checked 
      ? [...horario.diasDisponibles, diaIndice].sort((a, b) => a - b)
      : horario.diasDisponibles.filter(d => d !== diaIndice);
    
    dispatch(saveConfiguracionHorario({
      ...horario,
      diasDisponibles: diasActualizados
    }));
  };
  
  const handleGuardar = () => {
    dispatch(saveConfiguracionHorario(horario));
    toast({
      title: "Configuración guardada",
      description: "La configuración de horarios se ha actualizado correctamente",
    });
  };
  
  if (loadingHorario) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuración de Horarios</CardTitle>
        <CardDescription>
          Define los días y horarios disponibles para los turnos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>Días disponibles</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {nombresDias.map((nombre, indice) => (
              <div key={indice} className="flex items-center space-x-2">
                <Checkbox 
                  id={`dia-${indice}`}
                  checked={horario.diasDisponibles.includes(indice)}
                  onCheckedChange={(checked) => handleDiaChange(indice, checked === true)}
                  className="h-6 w-6"
                />
                <Label htmlFor={`dia-${indice}`} className="cursor-pointer">{nombre}</Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="horaInicio">Hora de inicio</Label>
            <Input 
              id="horaInicio" 
              type="time" 
              value={horario.horaInicio}
              onChange={(e) => dispatch(saveConfiguracionHorario({ ...horario, horaInicio: e.target.value }))}
              className="cita-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="horaFin">Hora de fin</Label>
            <Input 
              id="horaFin" 
              type="time" 
              value={horario.horaFin}
              onChange={(e) => dispatch(saveConfiguracionHorario({ ...horario, horaFin: e.target.value }))}
              className="cita-input"
            />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="duracionTurno">Duración predeterminada (minutos)</Label>
            <Input 
              id="duracionTurno" 
              type="number" 
              min="5"
              max="240"
              value={horario.duracionTurnoPredeterminada}
              onChange={(e) => dispatch(saveConfiguracionHorario({
                ...horario, 
                duracionTurnoPredeterminada: parseInt(e.target.value) || 30 
              }))}
              className="cita-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="descansoEntreTurnos">Descanso entre turnos (minutos)</Label>
            <Input 
              id="descansoEntreTurnos" 
              type="number" 
              min="0"
              max="60"
              value={horario.descansoEntreTurnos}
              onChange={(e) => dispatch(saveConfiguracionHorario({
                ...horario, 
                descansoEntreTurnos: parseInt(e.target.value) || 10 
              }))}
              className="cita-input"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGuardar} 
          disabled={guardando}
          className="cita-btn-primary w-full md:w-auto"
        >
          {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {guardando ? "Guardando..." : "Guardar configuración"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default HorarioConfig;
