import { configureStore } from '@reduxjs/toolkit';
import turnosReducer from './slices/turnosSlice';
import configuracionReducer from './slices/configuracionSlice';

export const store = configureStore({
  reducer: {
    turnos: turnosReducer,
    configuracion: configuracionReducer,
    // Aquí se pueden agregar más reducers en el futuro
  },
});

// Tipos para TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
