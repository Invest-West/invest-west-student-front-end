import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../reducers";
import {signOut} from "./authenticationActions";
import {logout} from "./authActions";

export enum ManageSystemIdleTimeEvents {
    OnActive = "ManageSystemIdleTimeEvents.OnActive",
    OnIdle = "ManageSystemIdleTimeEvents.OnIdle"
}

export interface ManageSystemIdleTimeAction extends Action {

}

// Called when the user is no longer idle
export const onActive: ActionCreator<any> = (event: Event) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: ManageSystemIdleTimeEvents.OnActive
        });
    }
}

// Called when the user is now idle
export const onIdle: ActionCreator<any> = (event: Event) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ManageSystemIdleTimeEvents.OnIdle
        });
        // TODO: Remove this line when all the components have been migrated to the new authentication flow
        // @ts-ignore
        dispatch(logout());
        return await dispatch(signOut());
    }
}