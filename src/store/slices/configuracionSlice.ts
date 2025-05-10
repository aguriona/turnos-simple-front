import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  obtenerConfiguracionHorario, 
  guardarConfiguracionHorario, 
  ConfiguracionHorario,
  obtenerConfiguracionNotificaciones,
  guardarConfiguracionNotificaciones,
  ConfiguracionNotificaciones 
} from '@/services/apiService';
import { AppThunk, AppDispatch, RootState } from '../index';
import { fetchTurnosDelMes } from './turnosSlice';

// Re-exportamos la interfaz ConfiguracionNotificaciones para uso en componentes
export type { ConfiguracionNotificaciones } from '@/services/apiService';

// Estado completo de la configuración
interface ConfiguracionState {
  horario: ConfiguracionHorario;
  notificaciones: ConfiguracionNotificaciones;
  loading: {
    horario: boolean;
    notificaciones: boolean;
  };
  error: string | null;
  guardando: boolean;
}

// Estado inicial
const initialState: ConfiguracionState = {
  horario: {
    diasDisponibles: [],
    horaInicio: '',
    horaFin: '',
    duracionTurnoPredeterminada: 30,
    descansoEntreTurnos: 10
  },
  notificaciones: {
    recordatorioHabilitado: true,
    tiempoRecordatorio: 24, // 24 horas por defecto
    recordatorioEmail: true,
    recordatorioWhatsapp: true,
    mensajePersonalizado: 'Le recordamos su turno para mañana. Por favor, confirme su asistencia.'
  },
  loading: {
    horario: false,
    notificaciones: false
  },
  error: null,
  guardando: false
};

// Thunks para cargar y guardar la configuración
export const fetchConfiguracionHorario = createAsyncThunk(
  'configuracion/fetchHorario',
  async (_, { rejectWithValue }) => {
    try {
      const config = await obtenerConfiguracionHorario();
      return config;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar la configuración de horarios';
      return rejectWithValue(errorMessage);
    }
  }
);

export const fetchConfiguracionNotificaciones = createAsyncThunk(
  'configuracion/fetchNotificaciones',
  async (_, { rejectWithValue }) => {
    try {
      const config = await obtenerConfiguracionNotificaciones();
      return config;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar la configuración de notificaciones';
      return rejectWithValue(errorMessage);
    }
  }
);

export const saveConfiguracionHorario = createAsyncThunk(
  'configuracion/saveHorario',
  async (configuracion: ConfiguracionHorario, { rejectWithValue }) => {
    try {
      const configGuardada = await guardarConfiguracionHorario(configuracion);
      return configGuardada;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la configuración de horarios';
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para guardar las notificaciones
export const saveConfiguracionNotificaciones = createAsyncThunk(
  'configuracion/saveNotificaciones',
  async (configuracion: ConfiguracionNotificaciones, { rejectWithValue }) => {
    try {
      const configGuardada = await guardarConfiguracionNotificaciones(configuracion);
      return configGuardada;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la configuración de notificaciones';
      return rejectWithValue(errorMessage);
    }
  }
);

// Thunk para actualizar la configuración y refrescar los turnos
export function actualizarConfiguracionHorario(configuracion: ConfiguracionHorario) {
  return async function(dispatch: AppDispatch) {
  try {
    // Guardar la configuración de horarios
    await dispatch(saveConfiguracionHorario(configuracion)).unwrap();
    
    // Obtener la fecha actual
    const fecha = new Date();
    const mes = fecha.getMonth() + 1;
    const año = fecha.getFullYear();
    
    // Refrescar los turnos para que reflejen la nueva configuración
    dispatch(fetchTurnosDelMes({ mes, año }));
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
  }
  };
}

// Slice de configuración
const configuracionSlice = createSlice({
  name: 'configuracion',
  initialState,
  reducers: {
    updateNotificaciones: (state, action: PayloadAction<Partial<ConfiguracionNotificaciones>>) => {
      state.notificaciones = {
        ...state.notificaciones,
        ...action.payload
      };
    }
  },
  extraReducers: (builder) => {
    // Cargar configuración de horarios
    builder
      .addCase(fetchConfiguracionHorario.pending, (state) => {
        state.loading.horario = true;
        state.error = null;
      })
      .addCase(fetchConfiguracionHorario.fulfilled, (state, action) => {
        state.horario = action.payload;
        state.loading.horario = false;
      })
      .addCase(fetchConfiguracionHorario.rejected, (state, action) => {
        state.loading.horario = false;
        state.error = action.payload as string;
      });
      
    // Cargar configuración de notificaciones
    builder
      .addCase(fetchConfiguracionNotificaciones.pending, (state) => {
        state.loading.notificaciones = true;
        state.error = null;
      })
      .addCase(fetchConfiguracionNotificaciones.fulfilled, (state, action) => {
        state.notificaciones = action.payload;
        state.loading.notificaciones = false;
      })
      .addCase(fetchConfiguracionNotificaciones.rejected, (state, action) => {
        state.loading.notificaciones = false;
        state.error = action.payload as string;
      });
    
    // Guardar configuración de horarios
    builder
      .addCase(saveConfiguracionHorario.pending, (state) => {
        state.guardando = true;
        state.error = null;
      })
      .addCase(saveConfiguracionHorario.fulfilled, (state, action) => {
        state.horario = action.payload;
        state.guardando = false;
      })
      .addCase(saveConfiguracionHorario.rejected, (state, action) => {
        state.guardando = false;
        state.error = action.payload as string;
      });
    
    // Guardar configuración de notificaciones
    builder
      .addCase(saveConfiguracionNotificaciones.pending, (state) => {
        state.guardando = true;
        state.error = null;
      })
      .addCase(saveConfiguracionNotificaciones.fulfilled, (state, action) => {
        state.notificaciones = action.payload;
        state.guardando = false;
      })
      .addCase(saveConfiguracionNotificaciones.rejected, (state, action) => {
        state.guardando = false;
        state.error = action.payload as string;
      });
  }
});

export const { updateNotificaciones } = configuracionSlice.actions;
export default configuracionSlice.reducer;
