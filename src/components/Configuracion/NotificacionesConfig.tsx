import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Bell, Mail, Send } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { ConfiguracionNotificaciones } from "@/services/apiService";
import { saveConfiguracionNotificaciones, updateNotificaciones, fetchConfiguracionNotificaciones } from "@/store/slices/configuracionSlice";

const NotificacionesConfig = () => {
  const dispatch = useAppDispatch();
  const { notificaciones, guardando, error } = useAppSelector(state => state.configuracion);
  const loadingNotificaciones = useAppSelector(state => state.configuracion.loading.notificaciones);
  const { toast } = useToast();
  
  const tiemposRecordatorio = [
    { value: "1", label: "1 hora antes" },
    { value: "2", label: "2 horas antes" },
    { value: "6", label: "6 horas antes" },
    { value: "12", label: "12 horas antes" },
    { value: "24", label: "24 horas antes (1 día)" },
    { value: "48", label: "48 horas antes (2 días)" },
    { value: "72", label: "72 horas antes (3 días)" },
  ];
  
  // Cargar la configuración de notificaciones
  useEffect(() => {
    dispatch(fetchConfiguracionNotificaciones());
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
  
  const handleChange = <K extends keyof ConfiguracionNotificaciones>(
    key: K, 
    value: ConfiguracionNotificaciones[K]
  ) => {
    dispatch(updateNotificaciones({ [key]: value }));
  };
  
  const handleGuardar = () => {
    dispatch(saveConfiguracionNotificaciones(notificaciones));
    toast({
      title: "Configuración guardada",
      description: "La configuración de notificaciones se ha actualizado correctamente",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bell className="mr-2 h-5 w-5" />
          Configuración de Notificaciones
        </CardTitle>
        <CardDescription>
          Configura cómo y cuándo se envían recordatorios a los clientes sobre sus turnos
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Estado de recordatorios */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex flex-col space-y-1">
            <Label htmlFor="recordatorio-estado">Recordatorios automáticos</Label>
            <span className="text-sm text-muted-foreground">
              Enviar recordatorios automáticos a los clientes
            </span>
          </div>
          <Switch
            id="recordatorio-estado"
            checked={notificaciones.recordatorioHabilitado}
            onCheckedChange={(checked) => handleChange('recordatorioHabilitado', checked)}
          />
        </div>
        
        {/* Tiempo de recordatorio */}
        <div className="space-y-2">
          <Label htmlFor="tiempo-recordatorio">¿Cuándo enviar el recordatorio?</Label>
          <Select
            disabled={!notificaciones.recordatorioHabilitado}
            value={notificaciones.tiempoRecordatorio.toString()}
            onValueChange={(value) => handleChange('tiempoRecordatorio', parseInt(value))}
          >
            <SelectTrigger id="tiempo-recordatorio" className="cita-input">
              <SelectValue placeholder="Seleccionar tiempo" />
            </SelectTrigger>
            <SelectContent>
              {tiemposRecordatorio.map((tiempo) => (
                <SelectItem key={tiempo.value} value={tiempo.value}>
                  {tiempo.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Métodos de recordatorio */}
        <div className="space-y-3">
          <Label>Métodos de notificación</Label>
          
          <div className="space-y-2 pl-1">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="email-recordatorio"
                disabled={!notificaciones.recordatorioHabilitado}
                checked={notificaciones.recordatorioEmail}
                onCheckedChange={(checked) => handleChange('recordatorioEmail', checked === true)}
                className="h-6 w-6"
              />
              <Label 
                htmlFor="email-recordatorio" 
                className="flex items-center cursor-pointer text-sm font-normal"
              >
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                Email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="whatsapp-recordatorio"
                disabled={!notificaciones.recordatorioHabilitado}
                checked={notificaciones.recordatorioWhatsapp}
                onCheckedChange={(checked) => handleChange('recordatorioWhatsapp', checked === true)}
                className="h-6 w-6"
              />
              <Label 
                htmlFor="whatsapp-recordatorio" 
                className="flex items-center cursor-pointer text-sm font-normal"
              >
                <Send className="mr-2 h-4 w-4 text-muted-foreground" />
                WhatsApp
              </Label>
            </div>
          </div>
        </div>
        
        {/* Mensaje personalizado */}
        <div className="space-y-2">
          <Label htmlFor="mensaje-personalizado">Mensaje personalizado</Label>
          <Textarea
            id="mensaje-personalizado"
            disabled={!notificaciones.recordatorioHabilitado}
            value={notificaciones.mensajePersonalizado}
            onChange={(e) => handleChange('mensajePersonalizado', e.target.value)}
            placeholder="Escriba aquí el mensaje que recibirán los clientes"
            className="cita-input min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            Puedes usar {"{nombre}"} para incluir el nombre del cliente, {"{fecha}"} para la fecha del turno
            y {"{hora}"} para la hora del turno.
          </p>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={handleGuardar} 
          disabled={guardando || !notificaciones.recordatorioHabilitado}
          className="cita-btn-primary w-full md:w-auto"
        >
          {guardando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {guardando ? "Guardando..." : "Guardar configuración"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default NotificacionesConfig;
