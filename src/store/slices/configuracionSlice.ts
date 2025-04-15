import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { obtenerConfiguracionHorario, guardarConfiguracionHorario, ConfiguracionHorario } from '@/services/apiService';

// Extenderemos la interfaz ConfiguracionHorario para incluir las notificaciones
export interface ConfiguracionNotificaciones {
  recordatorioHabilitado: boolean;
  tiempoRecordatorio: number; // en horas antes del turno
  recordatorioEmail: boolean;
  recordatorioSMS: boolean;
  recordatorioWhatsapp: boolean;
  mensajePersonalizado: string;
}

// Estado completo de la configuración
interface ConfiguracionState {
  horario: ConfiguracionHorario;
  notificaciones: ConfiguracionNotificaciones;
  loading: boolean;
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
    recordatorioSMS: false,
    recordatorioWhatsapp: true,
    mensajePersonalizado: 'Le recordamos su turno para mañana. Por favor, confirme su asistencia.'
  },
  loading: false,
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
      return rejectWithValue('Error al cargar la configuración de horarios');
    }
  }
);

export const saveConfiguracionHorario = createAsyncThunk(
  'configuracion/saveHorario',
  async (configuracion: ConfiguracionHorario, { rejectWithValue }) => {
    try {
      await guardarConfiguracionHorario(configuracion);
      return configuracion;
    } catch (error) {
      return rejectWithValue('Error al guardar la configuración de horarios');
    }
  }
);

// Por ahora, simulamos la API para notificaciones
export const saveConfiguracionNotificaciones = createAsyncThunk(
  'configuracion/saveNotificaciones',
  async (configuracion: ConfiguracionNotificaciones, { rejectWithValue }) => {
    try {
      // Simulamos una petición a la API
      await new Promise(resolve => setTimeout(resolve, 1000));
      return configuracion;
    } catch (error) {
      return rejectWithValue('Error al guardar la configuración de notificaciones');
    }
  }
);

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
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfiguracionHorario.fulfilled, (state, action) => {
        state.horario = action.payload;
        state.loading = false;
      })
      .addCase(fetchConfiguracionHorario.rejected, (state, action) => {
        state.loading = false;
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
