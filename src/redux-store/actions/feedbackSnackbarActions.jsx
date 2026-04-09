/**
 * Backwards-compatible action creators that delegate to the RTK slice.
 * Consumers can continue to import from this file without changes.
 */
import {
  closeFeedbackSnackbar as _close,
  setFeedbackSnackbarContent as _set,
  resetStatesWhenSnackbarClosed as _reset,
} from '../slices/feedbackSnackbarSlice';

// Re-export action type strings for any consumers that match on them
export const CLOSE_FEEDBACK_SNACKBAR = _close.type;
export const SET_FEEDBACK_SNACKBAR_CONTENT = _set.type;
export const RESET_STATES_WHEN_SNACKBAR_CLOSED = _reset.type;

// Adapter: convert positional args to payload object
export const closeFeedbackSnackbar = () => _close();

export const setFeedbackSnackbarContent = (message, color, position) =>
  _set({ message, color, position });

export const resetStatesWhenSnackbarClosed = () => _reset();
