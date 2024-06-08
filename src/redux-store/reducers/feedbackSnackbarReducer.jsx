import * as feedbackSnackbarActions from '../actions/feedbackSnackbarActions';

const initState = {
    open: false,
    message: '',
    color: '', // primary or error
    position: '' // top or bottom
};

const feedbackSnackbarReducer = (state = initState, action) => {
    switch (action.type) {
        case feedbackSnackbarActions.CLOSE_FEEDBACK_SNACKBAR:
            return {
                ...state,
                open: false
            };
        case feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT:
            return {
                ...state,
                open: true,
                message: action.message,
                color: action.color,
                position: action.position
            };
        case feedbackSnackbarActions.RESET_STATES_WHEN_SNACKBAR_CLOSED:
            return {
                ...initState
            };
        default:
            return state;
    }
};

export default feedbackSnackbarReducer;