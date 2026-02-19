import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import Error from '../../models/error';
import { SystemAttributes } from '../../models/system_attributes';

export interface ManageSystemAttributesState {
  systemAttributes: SystemAttributes | null;
  systemAttributesLoaded: boolean;
  loadingSystemAttributes: boolean;
  error?: Error;
}

const initialState: ManageSystemAttributesState = {
  systemAttributes: null,
  systemAttributesLoaded: false,
  loadingSystemAttributes: false,
};

export const isLoadingSystemAttributes = (state: ManageSystemAttributesState) => {
  return state.loadingSystemAttributes;
};

export const successfullyLoadedSystemAttributes = (state: ManageSystemAttributesState) => {
  return state.systemAttributes && state.error === undefined;
};

export const hasErrorLoadingSystemAttributes = (state: ManageSystemAttributesState) => {
  return state.error !== undefined;
};

const systemAttributesSlice = createSlice({
  name: 'ManageSystemAttributesState',
  initialState,
  reducers: {
    setLoadingSystemAttributes(state) {
      state.systemAttributes = null;
      state.systemAttributesLoaded = false;
      state.loadingSystemAttributes = true;
    },
    setSystemAttributesLoaded(
      state,
      action: PayloadAction<{ systemAttributes: SystemAttributes | null; error?: Error }>
    ) {
      state.systemAttributes = action.payload.systemAttributes;
      state.systemAttributesLoaded = true;
      state.loadingSystemAttributes = false;
      state.error = action.payload.error;
    },
  },
});

export const { setLoadingSystemAttributes, setSystemAttributesLoaded } =
  systemAttributesSlice.actions;

export default systemAttributesSlice.reducer;
