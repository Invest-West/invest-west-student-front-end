import {ManageSystemIdleTimeAction, ManageSystemIdleTimeEvents} from "../actions/manageSystemIdleTimeActions";
import {AuthenticationAction, AuthenticationEvents} from "../actions/authenticationActions";

// active timeout: 1 hour
export const activeTimeOut = 1000 * 60 * 60;

export interface ManageSystemIdleTimeState {
    nowIdle: boolean;
    nowActive: boolean;
}

const initialState: ManageSystemIdleTimeState = {
    nowIdle: false,
    nowActive: true
}

export const isUserNowIdle = (state: ManageSystemIdleTimeState) => {
    return state.nowIdle && !state.nowActive;
}

export const isUserNowActive = (state: ManageSystemIdleTimeState) => {
    return state.nowActive && !state.nowIdle;
}

const manageSystemIdleTimeReducer = (state = initialState, action: ManageSystemIdleTimeAction | AuthenticationAction) => {
    switch (action.type) {
        case AuthenticationEvents.SignOut:
            return initialState;
        case ManageSystemIdleTimeEvents.OnActive:
            return {
                ...state,
                nowActive: true,
                nowIdle: false
            }
        case ManageSystemIdleTimeEvents.OnIdle:
            return {
                ...state,
                nowActive: false,
                nowIdle: true
            }
        default:
            return state;
    }
}

export default manageSystemIdleTimeReducer;