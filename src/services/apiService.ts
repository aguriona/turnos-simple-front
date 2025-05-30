
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';

// Tipos para nuestras entidades
export type EstadoTurno = 'pendiente' | 'confirmado' | 'completado' | 'cancelado' | 'ausente';

export interface Turno {
  id: string;
  cliente: {
    id: string;
    nombre: string;
    telefono: string;
    email?: string;
  };
  fecha: string; // ISO string
  horaInicio: string; // HH:MM
  horaFin: string; // HH:MM
  estado: EstadoTurno;
  notas?: string;
  servicio?: string;
}

export interface ConfiguracionHorario {
  diasDisponibles: number[]; // 0 = domingo, 6 = sábado
  horaInicio: string; // HH:MM
  horaFin: string; // HH:MM
  duracionTurnoPredeterminada: number; // minutos
  descansoEntreTurnos: number; // minutos
}

export interface ConfiguracionNotificaciones {
  recordatorioHabilitado: boolean;
  tiempoRecordatorio: number; // en horas antes del turno
  recordatorioEmail: boolean;
  recordatorioWhatsapp: boolean;
  mensajePersonalizado: string;
}

export interface EstadisticasPeriodo {
  total: number;
  confirmados: number;
  cancelados: number;
  completados: number;
  ausentes: number;
  pendientes: number;
}

// Nombre de días en español
export const nombresDias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

// Funciones para generar datos de ejemplo
const generarClientes = () => {
  return [
    { id: '1', nombre: 'Ana García', telefono: '612345678', email: 'ana@example.com' },
    { id: '2', nombre: 'Carlos López', telefono: '623456789', email: 'carlos@example.com' },
    { id: '3', nombre: 'Laura Martínez', telefono: '634567890', email: 'laura@example.com' },
    { id: '4', nombre: 'Javier Rodríguez', telefono: '645678901', email: 'javier@example.com' },
    { id: '5', nombre: 'María Sánchez', telefono: '656789012', email: 'maria@example.com' },
  ];
};

const clientes = generarClientes();

const generarTurnoAleatorio = (fecha: Date, indice: number): Turno => {
  const cliente = clientes[Math.floor(Math.random() * clientes.length)];
  const estados: EstadoTurno[] = ['pendiente', 'confirmado', 'completado', 'cancelado', 'ausente'];
  const estadoAleatorio = estados[Math.floor(Math.random() * estados.length)];
  const hora = 9 + Math.floor(indice / 3);
  const minutos = (indice % 3) * 20;
  
  return {
    id: `turno-${fecha.getTime()}-${indice}`,
    cliente,
    fecha: fecha.toISOString(),
    horaInicio: `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`,
    horaFin: `${hora.toString().padStart(2, '0')}:${(minutos + 30).toString().padStart(2, '0')}`,
    estado: estadoAleatorio,
    notas: Math.random() > 0.7 ? 'Notas importantes sobre este turno' : undefined,
    servicio: Math.random() > 0.5 ? 'Servicio Premium' : 'Servicio Estándar'
  };
};

const generarTurnosPorDia = (fecha: Date, cantidad: number): Turno[] => {
  return Array.from({ length: cantidad }).map((_, i) => 
    generarTurnoAleatorio(fecha, i)
  );
};

// Datos de ejemplo para la configuración
const configuracionHorarioEjemplo: ConfiguracionHorario = {
  diasDisponibles: [1, 2, 3, 4, 5], // Lunes a viernes
  horaInicio: '09:00',
  horaFin: '18:00',
  duracionTurnoPredeterminada: 30,
  descansoEntreTurnos: 10
};

const configuracionNotificacionesEjemplo: ConfiguracionNotificaciones = {
  recordatorioHabilitado: true,
  tiempoRecordatorio: 24, // 24 horas por defecto
  recordatorioEmail: true,
  recordatorioWhatsapp: true,
  mensajePersonalizado: 'Le recordamos su turno para mañana. Por favor, confirme su asistencia.'
};

// API mock para obtener turnos
export const obtenerTurnos = async (mes: number, año: number): Promise<Turno[]> => {
  const inicio = startOfMonth(new Date(año, mes - 1));
  const fin = endOfMonth(inicio);
  const dias = eachDayOfInterval({ start: inicio, end: fin });
  
  const turnos: Turno[] = [];
  
  dias.forEach(dia => {
    // No generamos turnos para fin de semana
    if (dia.getDay() === 0 || dia.getDay() === 6) return;
    
    // Generamos entre 0 y 8 turnos por día, más turnos hacia el medio de la semana
    const cantidadTurnos = Math.floor(Math.random() * 9);
    turnos.push(...generarTurnosPorDia(dia, cantidadTurnos));
  });
  
  return turnos;
};

export const obtenerTurnosPorFecha = async (fecha: string): Promise<Turno[]> => {
  const dia = new Date(fecha);
  // No generamos turnos para fin de semana
  if (dia.getDay() === 0 || dia.getDay() === 6) return [];
  
  // Generamos entre 3 y 8 turnos para el día específico
  const cantidadTurnos = 3 + Math.floor(Math.random() * 6);
  return generarTurnosPorDia(dia, cantidadTurnos);
};

export const obtenerTurnoDetalle = async (id: string): Promise<Turno | null> => {
  const hoy = new Date();
  const turnos = await obtenerTurnos(hoy.getMonth() + 1, hoy.getFullYear());
  return turnos.find(t => t.id === id) || null;
};

// API para crear nuevos turnos
export const crearTurno = async (turno: Omit<Turno, 'id'> & { id?: string }): Promise<Turno> => {
  // Simulamos delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En producción, aquí iría una llamada fetch real
  // const response = await fetch('/api/turnos', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(turno)
  // });
  // return await response.json();
  
  // Validaciones básicas
  if (!turno.cliente || !turno.cliente.nombre) {
    throw new Error('El nombre del cliente es obligatorio');
  }
  
  if (!turno.fecha || !turno.horaInicio || !turno.horaFin) {
    throw new Error('La fecha y hora del turno son obligatorias');
  }
  
  // Generamos un ID si no se proporciona
  const nuevoTurno: Turno = {
    ...turno,
    id: turno.id || `turno-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    estado: turno.estado || 'pendiente'
  } as Turno;
  
  // Recuperamos turnos almacenados en localStorage o creamos array vacío
  const turnosGuardados = JSON.parse(localStorage.getItem('turnos') || '[]');
  
  // Añadimos el nuevo turno
  const nuevosTurnos = [...turnosGuardados, nuevoTurno];
  
  // Guardamos en localStorage
  localStorage.setItem('turnos', JSON.stringify(nuevosTurnos));
  
  return nuevoTurno;
};

// API para configuración de horarios
export const obtenerConfiguracionHorario = async (): Promise<ConfiguracionHorario> => {
  // Simulamos delay de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // En producción, aquí iría una llamada fetch real
  // const response = await fetch('/api/configuracion/horario');
  // return await response.json();
  
  return configuracionHorarioEjemplo;
};

export const guardarConfiguracionHorario = async (config: ConfiguracionHorario): Promise<ConfiguracionHorario> => {
  // Simulamos delay de red y validación en servidor
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // En producción, aquí iría una llamada fetch real
  // const response = await fetch('/api/configuracion/horario', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(config)
  // });
  // return await response.json();
  
  // Validamos que la configuración tenga valores coherentes
  if (config.duracionTurnoPredeterminada < 5) {
    throw new Error('La duración mínima de un turno debe ser de 5 minutos');
  }
  
  if (config.horaInicio >= config.horaFin) {
    throw new Error('La hora de inicio debe ser anterior a la hora de fin');
  }
  
  // Guardamos en el localStorage para persistencia
  localStorage.setItem('configuracionHorario', JSON.stringify(config));
  
  return config;
};

// API para configuración de notificaciones
export const obtenerConfiguracionNotificaciones = async (): Promise<ConfiguracionNotificaciones> => {
  // Simulamos delay de red
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Intentamos recuperar del localStorage
  const savedConfig = localStorage.getItem('configuracionNotificaciones');
  if (savedConfig) {
    return JSON.parse(savedConfig);
  }
  
  return configuracionNotificacionesEjemplo;
};

export const guardarConfiguracionNotificaciones = async (config: ConfiguracionNotificaciones): Promise<ConfiguracionNotificaciones> => {
  // Simulamos delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Validaciones básicas
  if (config.tiempoRecordatorio < 1) {
    throw new Error('El tiempo de recordatorio debe ser al menos 1 hora');
  }
  
  // Guardamos en localStorage para persistencia
  localStorage.setItem('configuracionNotificaciones', JSON.stringify(config));
  
  return config;
};

export const obtenerEstadisticasMes = async (mes: number, año: number): Promise<EstadisticasPeriodo> => {
  const turnos = await obtenerTurnos(mes, año);
  
  return {
    total: turnos.length,
    confirmados: turnos.filter(t => t.estado === 'confirmado').length,
    cancelados: turnos.filter(t => t.estado === 'cancelado').length,
    completados: turnos.filter(t => t.estado === 'completado').length,
    ausentes: turnos.filter(t => t.estado === 'ausente').length,
    pendientes: turnos.filter(t => t.estado === 'pendiente').length
  };
};

export const obtenerDatosGraficoSemanal = async (): Promise<any[]> => {
  const hoy = new Date();
  const datos = [];
  
  for (let i = 6; i >= 0; i--) {
    const fecha = addDays(hoy, -i);
    const diaNombre = format(fecha, 'EEEE', { locale: es });
    
    datos.push({
      dia: diaNombre.charAt(0).toUpperCase() + diaNombre.slice(1, 3),
      fecha: format(fecha, 'yyyy-MM-dd'),
      agendados: Math.floor(Math.random() * 10) + 1,
      completados: Math.floor(Math.random() * 8),
      cancelados: Math.floor(Math.random() * 3)
    });
  }
  
  return datos;
};

export const obtenerDatosGraficoMensual = async (mes: number, año: number): Promise<any[]> => {
  const inicio = startOfMonth(new Date(año, mes - 1));
  const fin = endOfMonth(inicio);
  const dias = eachDayOfInterval({ start: inicio, end: fin });
  
  return dias.map(dia => ({
    dia: dia.getDate(),
    fecha: format(dia, 'yyyy-MM-dd'),
    agendados: Math.floor(Math.random() * 10),
    completados: Math.floor(Math.random() * 8),
    cancelados: Math.floor(Math.random() * 3)
  }));
};
