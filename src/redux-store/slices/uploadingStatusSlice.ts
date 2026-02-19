import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOG_OUT } from '../actions/authActions';

interface UploadingStatusState {
  mode: number;
  progress: number;
}

const UPLOAD_NONE = 0;

const initialState: UploadingStatusState = {
  mode: UPLOAD_NONE,
  progress: 0,
};

const uploadingStatusSlice = createSlice({
  name: 'uploadingStatus',
  initialState,
  reducers: {
    setUploading(state, action: PayloadAction<{ mode: number; progress: number }>) {
      state.mode = action.payload.mode;
      state.progress = action.payload.progress;
    },
    dismissUploadingStatus() {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(LOG_OUT, () => initialState);
  },
});

export const { setUploading, dismissUploadingStatus } = uploadingStatusSlice.actions;

export default uploadingStatusSlice.reducer;
