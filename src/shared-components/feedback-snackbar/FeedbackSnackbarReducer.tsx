import {FeedbackSnackbarAction, FeedbackSnackbarEvents, OpenFeedbackSnackbarAction} from "./FeedbackSnackbarActions";

export enum FeedbackSnackbarTypes {
    Success = "success",
    Information = "info",
    Error = "error",
    Warning = "warning"
}

export interface FeedbackSnackbarState {
    type: FeedbackSnackbarTypes;
    open: boolean;
    message: string;
}

const initialState: FeedbackSnackbarState = {
    type: FeedbackSnackbarTypes.Success,
    open: false,
    message: ""
};

const feedbackSnackbarReducerNew = (state = initialState, action: FeedbackSnackbarAction) => {
    switch (action.type) {
        case FeedbackSnackbarEvents.Open:
            const openFeedbackSnackbarAction: OpenFeedbackSnackbarAction = action as OpenFeedbackSnackbarAction;
            return {
                ...state,
                open: true,
                type: openFeedbackSnackbarAction.snackbarType,
                message: openFeedbackSnackbarAction.message
            }
        case FeedbackSnackbarEvents.Close:
            return {
                ...state,
                open: false
            };
        default:
            return state;
    }
}

export default feedbackSnackbarReducerNew;