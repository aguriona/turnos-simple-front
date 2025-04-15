import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

// Hooks personalizados para utilizar en lugar de los hooks normales de React-Redux
// Estos incluyen tipos predefinidos para el estado global y el dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
