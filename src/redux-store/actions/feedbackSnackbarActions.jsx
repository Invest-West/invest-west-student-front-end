export const CLOSE_FEEDBACK_SNACKBAR = 'CLOSE_FEEDBACK_SNACKBAR';
export const closeFeedbackSnackbar = () => {
    return {
        type: CLOSE_FEEDBACK_SNACKBAR
    }
};

export const SET_FEEDBACK_SNACKBAR_CONTENT= 'SET_FEEDBACK_SNACKBAR_CONTENT';
export const setFeedbackSnackbarContent = (message, color, position) => {
    return {
        type: SET_FEEDBACK_SNACKBAR_CONTENT,
        message,
        color,
        position
    }
};

export const RESET_STATES_WHEN_SNACKBAR_CLOSED = 'RESET_STATES_WHEN_SNACKBAR_CLOSED';
export const resetStatesWhenSnackbarClosed = () => {
    return {
        type: RESET_STATES_WHEN_SNACKBAR_CLOSED
    }
};