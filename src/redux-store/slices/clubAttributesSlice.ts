import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ClubAttributesState {
  clubAttributes: any | null;
  clubAttributesLoaded: boolean;
  clubAttributesBeingLoaded: boolean;
}

const initialState: ClubAttributesState = {
  clubAttributes: null,
  clubAttributesLoaded: false,
  clubAttributesBeingLoaded: false,
};

const clubAttributesSlice = createSlice({
  name: 'manageClubAttributes',
  initialState,
  reducers: {
    setLoadingClubAttributes(state) {
      state.clubAttributes = null;
      state.clubAttributesLoaded = false;
      state.clubAttributesBeingLoaded = true;
    },
    setClubAttributesLoaded(state, action: PayloadAction<{ clubAttributes: any }>) {
      state.clubAttributes = action.payload.clubAttributes;
      state.clubAttributesLoaded = true;
      state.clubAttributesBeingLoaded = false;
    },
    setClubAttributeChanged(state, action: PayloadAction<{ key: string; value: any }>) {
      if (state.clubAttributes) {
        state.clubAttributes[action.payload.key] = action.payload.value;
      }
    },
  },
});

export const { setLoadingClubAttributes, setClubAttributesLoaded, setClubAttributeChanged } =
  clubAttributesSlice.actions;

export default clubAttributesSlice.reducer;
