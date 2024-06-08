import {
    CompleteLoadingDataAction,
    CompleteRemovingAccessRequestAction,
    CompleteSendingAccessRequestAction,
    GroupDetailsAction,
    GroupDetailsEvents
} from "./GroupDetailsActions";
import GroupProperties from "../../models/group_properties";
import {InvitedUserWithProfile} from "../../models/invited_user";
import {ProjectInstance} from "../../models/project";
import Error from "../../models/error";
import {AccessRequestInstance} from "../../models/access_request";

export interface GroupDetailsState {
    group?: GroupProperties;
    members?: InvitedUserWithProfile[];
    offers?: ProjectInstance[];
    accessRequestsInstances?: AccessRequestInstance[];

    loadingData: boolean;
    dataLoaded: boolean;

    error?: Error;

    sendingAccessRequest: boolean;
    errorSendingAccessRequest?: Error;

    removingAccessRequest: boolean;
    errorRemovingAccessRequest?: Error;
}

const initialState: GroupDetailsState = {
    loadingData: false,
    dataLoaded: false,

    sendingAccessRequest: false,
    removingAccessRequest: false
}

export const hasNotLoadedData = (state: GroupDetailsState) => {
    return !state.dataLoaded && !state.loadingData;
}

export const isLoadingData = (state: GroupDetailsState) => {
    return !state.dataLoaded && state.loadingData;
}

export const successfullyLoadedData = (state: GroupDetailsState) => {
    return state.dataLoaded && !state.loadingData && state.group && state.members && state.offers && state.error === undefined;
}

export const hasAccessRequestsBeenSatisfied = (state: GroupDetailsState) => {
    return successfullyLoadedData(state) && state.accessRequestsInstances !== undefined;
}

export const hasErrorLoadingData = (state: GroupDetailsState) => {
    return state.dataLoaded && !state.loadingData && state.error !== undefined;
}

export const isSendingAccessRequest = (state: GroupDetailsState) => {
    return state.sendingAccessRequest;
}

export const hasErrorSendingAccessRequest = (state: GroupDetailsState) => {
    return !isSendingAccessRequest(state) && state.errorSendingAccessRequest !== undefined;
}

export const isRemovingAccessRequest = (state: GroupDetailsState) => {
    return state.removingAccessRequest;
}

export const hasErrorRemovingAccessRequest = (state: GroupDetailsState) => {
    return !isRemovingAccessRequest(state) && state.errorRemovingAccessRequest !== undefined;
}

const groupDetailsReducer = (state = initialState, action: GroupDetailsAction) => {
    switch (action.type) {
        case GroupDetailsEvents.LoadingData:
            return {
                ...initialState,
                loadingData: true,
                dataLoaded: false
            }
        case GroupDetailsEvents.CompleteLoadingData:
            const completeLoadingDataAction: CompleteLoadingDataAction = action as CompleteLoadingDataAction;
            return {
                ...state,
                loadingData: false,
                dataLoaded: true,
                group: completeLoadingDataAction.group !== undefined
                    ? JSON.parse(JSON.stringify(completeLoadingDataAction.group))
                    : state.group,
                members: completeLoadingDataAction.members !== undefined
                    ? [...completeLoadingDataAction.members]
                    : state.members,
                offers: completeLoadingDataAction.offers !== undefined
                    ? [...completeLoadingDataAction.offers]
                    : state.offers,
                accessRequestsInstances: completeLoadingDataAction.accessRequestInstances !== undefined
                    ? [...completeLoadingDataAction.accessRequestInstances]
                    : state.accessRequestsInstances,
                error: completeLoadingDataAction.error !== undefined
                    ? {detail: completeLoadingDataAction.error}
                    : state.error
            }
        case GroupDetailsEvents.SendingAccessRequest:
            return {
                ...state,
                sendingAccessRequest: true,
                errorSendingAccessRequest: undefined
            }
        case GroupDetailsEvents.CompleteSendingAccessRequest:
            const completeSendingAccessRequestAction: CompleteSendingAccessRequestAction = action as CompleteSendingAccessRequestAction;
            return {
                ...state,
                sendingAccessRequest: false,
                accessRequestsInstances: completeSendingAccessRequestAction.updatedAccessRequestInstances !== undefined
                    ? [...completeSendingAccessRequestAction.updatedAccessRequestInstances]
                    : state.accessRequestsInstances,
                errorSendingAccessRequest: completeSendingAccessRequestAction.error !== undefined
                    ? {detail: completeSendingAccessRequestAction.error} : state.errorSendingAccessRequest
            }
        case GroupDetailsEvents.RemovingAccessRequest:
            return {
                ...state,
                removingAccessRequest: true,
                errorRemovingAccessRequest: undefined
            }
        case GroupDetailsEvents.CompleteRemovingAccessRequest:
            const completeRemovingAccessRequestAction: CompleteRemovingAccessRequestAction = action as CompleteRemovingAccessRequestAction;
            return {
                ...state,
                removingAccessRequest: false,
                accessRequestsInstances: completeRemovingAccessRequestAction.updatedAccessRequestInstances !== undefined
                    ? [...completeRemovingAccessRequestAction.updatedAccessRequestInstances]
                    : state.accessRequestsInstances,
                errorRemovingAccessRequest: completeRemovingAccessRequestAction.error !== undefined
                    ? {detail: completeRemovingAccessRequestAction.error} : state.errorRemovingAccessRequest
            }
        default:
            return state;
    }
}

export default groupDetailsReducer;