import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { obtenerTurnos, obtenerTurnosPorFecha, obtenerTurnoDetalle, Turno, EstadoTurno } from '@/services/apiService';
import { format, isValid } from 'date-fns';

// Tipos
interface TurnosState {
  todos: Turno[];
  turnosDelMes: Turno[];
  turnosPorDia: Record<string, Turno[]>;
  turnoSeleccionado: Turno | null;
  loading: {
    todos: boolean;
    turnosDelMes: boolean;
    turnosPorDia: boolean;
    turnoSeleccionado: boolean;
  };
  error: {
    todos: string | null;
    turnosDelMes: string | null;
    turnosPorDia: string | null;
    turnoSeleccionado: string | null;
  };
}

// Estado inicial
const initialState: TurnosState = {
  todos: [],
  turnosDelMes: [],
  turnosPorDia: {},
  turnoSeleccionado: null,
  loading: {
    todos: false,
    turnosDelMes: false,
    turnosPorDia: false,
    turnoSeleccionado: false,
  },
  error: {
    todos: null,
    turnosDelMes: null,
    turnosPorDia: null,
    turnoSeleccionado: null,
  }
};

// Thunks - Funciones asíncronas para comunicación con la API
export const fetchTurnosDelMes = createAsyncThunk(
  'turnos/fetchTurnosDelMes',
  async ({ mes, año }: { mes: number, año: number }, { rejectWithValue }) => {
    try {
      const turnos = await obtenerTurnos(mes, año);
      return turnos;
    } catch (error) {
      return rejectWithValue('Error al cargar los turnos del mes');
    }
  }
);

export const fetchTurnosPorFecha = createAsyncThunk(
  'turnos/fetchTurnosPorFecha',
  async (fecha: Date, { rejectWithValue }) => {
    try {
      if (!isValid(fecha)) {
        throw new Error('Fecha inválida');
      }
      
      const fechaStr = format(fecha, 'yyyy-MM-dd');
      const turnos = await obtenerTurnosPorFecha(fechaStr);
      
      return { fecha: fechaStr, turnos };
    } catch (error) {
      return rejectWithValue(`Error al cargar los turnos para la fecha ${fecha}`);
    }
  }
);

export const fetchTurnoDetalle = createAsyncThunk(
  'turnos/fetchTurnoDetalle',
  async (id: string, { rejectWithValue }) => {
    try {
      const turno = await obtenerTurnoDetalle(id);
      return turno;
    } catch (error) {
      return rejectWithValue(`Error al cargar el detalle del turno con ID ${id}`);
    }
  }
);

// Slice
const turnosSlice = createSlice({
  name: 'turnos',
  initialState,
  reducers: {
    resetTurnoSeleccionado: (state) => {
      state.turnoSeleccionado = null;
    },
    actualizarEstadoTurno: (state, action: PayloadAction<{ id: string, nuevoEstado: EstadoTurno }>) => {
      const { id, nuevoEstado } = action.payload;
      
      // Actualizar en todos los arrays donde pueda estar el turno
      const actualizarEnArray = (turnos: Turno[]) => {
        const index = turnos.findIndex(t => t.id === id);
        if (index !== -1) {
          turnos[index] = { ...turnos[index], estado: nuevoEstado };
        }
      };
      
      // Actualizar en todos los arrays
      actualizarEnArray(state.todos);
      actualizarEnArray(state.turnosDelMes);
      
      // Actualizar en turnosPorDia
      Object.keys(state.turnosPorDia).forEach(fecha => {
        actualizarEnArray(state.turnosPorDia[fecha]);
      });
      
      // Actualizar turno seleccionado si es el mismo
      if (state.turnoSeleccionado && state.turnoSeleccionado.id === id) {
        state.turnoSeleccionado = { ...state.turnoSeleccionado, estado: nuevoEstado };
      }
    }
  },
  extraReducers: (builder) => {
    // fetchTurnosDelMes
    builder
      .addCase(fetchTurnosDelMes.pending, (state) => {
        state.loading.turnosDelMes = true;
        state.error.turnosDelMes = null;
      })
      .addCase(fetchTurnosDelMes.fulfilled, (state, action) => {
        state.turnosDelMes = action.payload;
        state.loading.turnosDelMes = false;
      })
      .addCase(fetchTurnosDelMes.rejected, (state, action) => {
        state.loading.turnosDelMes = false;
        state.error.turnosDelMes = action.payload as string;
      });
    
    // fetchTurnosPorFecha
    builder
      .addCase(fetchTurnosPorFecha.pending, (state) => {
        state.loading.turnosPorDia = true;
        state.error.turnosPorDia = null;
      })
      .addCase(fetchTurnosPorFecha.fulfilled, (state, action) => {
        const { fecha, turnos } = action.payload;
        state.turnosPorDia[fecha] = turnos;
        state.loading.turnosPorDia = false;
      })
      .addCase(fetchTurnosPorFecha.rejected, (state, action) => {
        state.loading.turnosPorDia = false;
        state.error.turnosPorDia = action.payload as string;
      });
    
    // fetchTurnoDetalle
    builder
      .addCase(fetchTurnoDetalle.pending, (state) => {
        state.loading.turnoSeleccionado = true;
        state.error.turnoSeleccionado = null;
      })
      .addCase(fetchTurnoDetalle.fulfilled, (state, action) => {
        state.turnoSeleccionado = action.payload;
        state.loading.turnoSeleccionado = false;
      })
      .addCase(fetchTurnoDetalle.rejected, (state, action) => {
        state.loading.turnoSeleccionado = false;
        state.error.turnoSeleccionado = action.payload as string;
      });
  }
});

// Exportar acciones y reducer
export const { resetTurnoSeleccionado, actualizarEstadoTurno } = turnosSlice.actions;
export default turnosSlice.reducer;
