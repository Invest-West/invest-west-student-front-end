import {Action, ActionCreator, Dispatch} from "redux";
import {FeedbackSnackbarTypes} from "./FeedbackSnackbarReducer";
import {AppState} from "../../redux-store/reducers";

export enum FeedbackSnackbarEvents {
    Open = "FeedbackSnackbarEvents.Open",
    Close = "FeedbackSnackbarEvents.Close"
}

export interface FeedbackSnackbarAction extends Action {

}

export interface OpenFeedbackSnackbarAction extends Action {
    snackbarType: FeedbackSnackbarTypes;
    message: string;
}

export const openFeedbackSnackbar: ActionCreator<any> = (type: FeedbackSnackbarTypes, message: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: OpenFeedbackSnackbarAction = {
            type: FeedbackSnackbarEvents.Open,
            snackbarType: type,
            message: message
        };
        return dispatch(action);
    }
}

export const closeFeedbackSnackbar: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: FeedbackSnackbarEvents.Close
        });
    }
}