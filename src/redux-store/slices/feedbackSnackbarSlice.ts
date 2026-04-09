import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface FeedbackSnackbarState {
  open: boolean;
  message: string;
  color: string;
  position: string;
}

const initialState: FeedbackSnackbarState = {
  open: false,
  message: '',
  color: '',
  position: '',
};

const feedbackSnackbarSlice = createSlice({
  name: 'manageFeedbackSnackbar',
  initialState,
  reducers: {
    closeFeedbackSnackbar(state) {
      state.open = false;
    },
    setFeedbackSnackbarContent(
      state,
      action: PayloadAction<{ message: string; color: string; position: string }>
    ) {
      state.open = true;
      state.message = action.payload.message;
      state.color = action.payload.color;
      state.position = action.payload.position;
    },
    resetStatesWhenSnackbarClosed() {
      return initialState;
    },
  },
});

export const { closeFeedbackSnackbar, setFeedbackSnackbarContent, resetStatesWhenSnackbarClosed } =
  feedbackSnackbarSlice.actions;

export default feedbackSnackbarSlice.reducer;
