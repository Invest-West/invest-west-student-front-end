import {
    FinishedLoadingSystemAttributesAction,
    ManageSystemAttributesAction,
    ManageSystemAttributesEvents
} from "../actions/manageSystemAttributesActions";
import Error from "../../models/error";
import {SystemAttributes} from "../../models/system_attributes";

export interface ManageSystemAttributesState {
    systemAttributes: SystemAttributes | null;
    systemAttributesLoaded: boolean;
    loadingSystemAttributes: boolean;
    error?: Error;
}

const initialState: ManageSystemAttributesState = {
    systemAttributes: null,
    systemAttributesLoaded: false,
    loadingSystemAttributes: false
}

export const isLoadingSystemAttributes = (state: ManageSystemAttributesState) => {
    return state.loadingSystemAttributes;
}

export const successfullyLoadedSystemAttributes = (state: ManageSystemAttributesState) => {
    return state.systemAttributes && state.error === undefined;
}

export const hasErrorLoadingSystemAttributes = (state: ManageSystemAttributesState) => {
    return state.error !== undefined;
}

const manageSystemAttributesReducer = (state = initialState, action: ManageSystemAttributesAction) => {
    switch (action.type) {
        case ManageSystemAttributesEvents.LoadingSystemAttributes:
            return {
                ...state,
                systemAttributes: null,
                systemAttributesLoaded: false,
                loadingSystemAttributes: true
            }
        case  ManageSystemAttributesEvents.FinishedLoadingSystemAttributes:
            const finishedAction: FinishedLoadingSystemAttributesAction = (action as FinishedLoadingSystemAttributesAction);
            return {
                ...state,
                systemAttributes: finishedAction.systemAttributes,
                systemAttributesLoaded: true,
                loadingSystemAttributes: false,
                error: finishedAction.error
            }
        default:
            return state;
    }
}

export default manageSystemAttributesReducer;