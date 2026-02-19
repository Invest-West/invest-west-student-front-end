import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppState } from './reducers';

export const useAppDispatch = () => useDispatch<any>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
