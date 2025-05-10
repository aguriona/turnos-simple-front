
import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Calendar, Clock, Edit, Mail, Phone, Trash2, User, AlertCircle, Settings } from "lucide-react";
import { EstadoTurno } from "@/services/apiService";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchTurnoDetalle, actualizarEstadoTurno } from "@/store/slices/turnosSlice";
import { fetchConfiguracionHorario } from "@/store/slices/configuracionSlice";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DetalleTurno = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const dispatch = useAppDispatch();
  
  // Obtener el estado de Redux
  const { turno, loading, error } = useAppSelector(state => ({
    turno: state.turnos.turnoSeleccionado,
    loading: state.turnos.loading.turnoSeleccionado,
    error: state.turnos.error.turnoSeleccionado
  }));
  
  // Obtener la configuración desde Redux
  const configuracion = useAppSelector(state => state.configuracion);
  const { diasDisponibles, horaInicio, horaFin } = configuracion.horario;
  const loadingConfig = configuracion.loading.horario;
  
  useEffect(() => {
    if (!id) return;
    
    // Cargar el detalle del turno usando Redux
    dispatch(fetchTurnoDetalle(id));
    
    // Cargar la configuración de horarios
    dispatch(fetchConfiguracionHorario());
  }, [dispatch, id]);
  
  // Mostrar error si algo sale mal
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del turno",
        variant: "destructive"
      });
    }
  }, [error, toast]);
  
  const getEstadoColor = (estado: EstadoTurno) => {
    switch (estado) {
      case "pendiente": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmado": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completado": return "bg-green-100 text-green-800 border-green-200";
      case "cancelado": return "bg-red-100 text-red-800 border-red-200";
      case "ausente": return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  const handleEliminar = () => {
    toast({
      title: "Turno eliminado",
      description: "El turno ha sido eliminado correctamente",
    });
    navigate('/');
  };
  
  const handleCambiarEstado = (nuevoEstado: EstadoTurno) => {
    if (!turno || !id) return;
    
    // Actualizar el estado usando Redux
    dispatch(actualizarEstadoTurno({ id, nuevoEstado }));
    
    toast({
      title: "Estado actualizado",
      description: `El turno ha cambiado a estado: ${nuevoEstado}`,
    });
  };
  
  return (
    <div className="py-4">
      <Button 
        variant="ghost" 
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Volver
      </Button>
      
      {loading ? (
        <Card>
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ) : !turno ? (
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Turno no encontrado</h3>
            <p className="text-muted-foreground mb-4">
              El turno que buscas no existe o ha sido eliminado.
            </p>
            <Button onClick={() => navigate('/')}>Volver a la lista</Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{turno.cliente.nombre}</h2>
                  <p className="text-gray-500">
                    {format(new Date(turno.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })}
                  </p>
                </div>
                <Badge 
                  className={cn(
                    "text-sm font-medium border px-3 py-1",
                    getEstadoColor(turno.estado)
                  )}
                  variant="outline"
                >
                  {turno.estado.charAt(0).toUpperCase() + turno.estado.slice(1)}
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Horario: {turno.horaInicio} - {turno.horaFin}</span>
                </div>
                
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(turno.fecha), "EEEE d 'de' MMMM, yyyy", { locale: es })}</span>
                    
                    {/* Indicador si el día es no hábil según la configuración */}
                    {diasDisponibles.length > 0 && !diasDisponibles.includes(new Date(turno.fecha).getDay()) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge variant="outline" className="ml-1 bg-yellow-100 text-yellow-800 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              No hábil
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-xs">
                            Día fuera del horario de atención configurado
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{turno.horaInicio} - {turno.horaFin}</span>
                    
                    {/* Indicador si el horario está fuera del rango configurado */}
                    {horaInicio && horaFin && (
                      turno.horaInicio < horaInicio || turno.horaFin > horaFin ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="ml-1 bg-yellow-100 text-yellow-800 text-xs">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Fuera de horario
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="text-xs">
                              Este turno está fuera del horario de atención configurado: {horaInicio} - {horaFin}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : null
                    )}
                  </div>
                </div>
                
                {turno.servicio && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span>Servicio: {turno.servicio}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{turno.cliente.telefono}</span>
                </div>
                
                {turno.cliente.email && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span>{turno.cliente.email}</span>
                  </div>
                )}
              </div>
              
              {turno.notas && (
                <div className="mt-4 p-3 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Notas:</h4>
                  <p className="text-sm text-gray-600">{turno.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => navigate(`/editar-turno/${turno.id}`)}
            >
              <Edit className="h-4 w-4" />
              <span>Editar</span>
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta acción eliminará permanentemente el turno de {turno.cliente.nombre}.
                    Esta acción no puede deshacerse.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleEliminar}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-medium">Cambiar estado</h3>
                
                {/* Información de configuración */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center text-xs text-muted-foreground bg-muted p-1 rounded">
                        <Settings className="h-3 w-3 mr-1" />
                        <span>Horario: {horaInicio} - {horaFin}</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      Horario configurado actual
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                <Button 
                  variant="outline" 
                  className={cn(
                    "text-xs h-auto py-2 border",
                    turno.estado === "pendiente" && "bg-yellow-100 text-yellow-800 border-yellow-200"
                  )}
                  onClick={() => handleCambiarEstado("pendiente")}
                >
                  Pendiente
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "text-xs h-auto py-2 border",
                    turno.estado === "confirmado" && "bg-blue-100 text-blue-800 border-blue-200"
                  )}
                  onClick={() => handleCambiarEstado("confirmado")}
                >
                  Confirmado
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "text-xs h-auto py-2 border",
                    turno.estado === "completado" && "bg-green-100 text-green-800 border-green-200"
                  )}
                  onClick={() => handleCambiarEstado("completado")}
                >
                  Completado
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "text-xs h-auto py-2 border",
                    turno.estado === "cancelado" && "bg-red-100 text-red-800 border-red-200"
                  )}
                  onClick={() => handleCambiarEstado("cancelado")}
                >
                  Cancelado
                </Button>
                <Button 
                  variant="outline" 
                  className={cn(
                    "text-xs h-auto py-2 border",
                    turno.estado === "ausente" && "bg-gray-100 text-gray-800 border-gray-200"
                  )}
                  onClick={() => handleCambiarEstado("ausente")}
                >
                  Ausente
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DetalleTurno;
