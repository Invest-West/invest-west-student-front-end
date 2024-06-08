import {
    CompleteFetchingGroupsAction,
    CompleteRemovingAccessRequestAction,
    CompleteSendingAccessRequestAction,
    ExploreGroupsAction,
    ExploreGroupsEvents,
    FilterChangedAction,
    FilterGroupsByGroupFilterAction,
    PaginationChangedAction, RemovingAccessRequestAction, SendingAccessRequestAction
} from "./ExploreGroupsActions";
import GroupProperties from "../../models/group_properties";
import Error from "../../models/error";
import {AccessRequestInstance} from "../../models/access_request";

export const maxGroupsPerPage: number = 12;

export interface ExploreGroupsState {
    groups: GroupProperties[];
    accessRequestsInstances?: AccessRequestInstance[]; // only available for issuer or investor
    fetchingGroups: boolean;
    groupsFetched: boolean;

    filteringGroupsByName: boolean;
    nameFilter: string;
    groupFilter: "all" | "groupsOfMembership" | "groupsOfPendingRequest";
    groupsFiltered: GroupProperties[];

    currentPage: number;

    error?: Error;

    sendingAccessRequestToGroup?: string;
    errorSendingAccessRequest?: Error;

    removingAccessRequestFromGroup?: string;
    errorRemovingAccessRequest?: Error;
}

const initialState: ExploreGroupsState = {
    groups: [],
    fetchingGroups: false,
    groupsFetched: false,

    filteringGroupsByName: false,
    nameFilter: "",
    groupFilter: "all",
    groupsFiltered: [],

    currentPage: 1
}

export const hasNotFetchedGroups = (state: ExploreGroupsState) => {
    return !state.groupsFetched && !state.fetchingGroups;
}

export const isFetchingGroups = (state: ExploreGroupsState) => {
    return !state.groupsFetched && state.fetchingGroups;
}

export const successfullyFetchedGroups = (state: ExploreGroupsState) => {
    return state.groupsFetched && !state.fetchingGroups && state.error === undefined;
}

export const isFilteringGroupsByName = (state: ExploreGroupsState) => {
    return state.filteringGroupsByName;
}

export const hasGroupsForCurrentFilters = (state: ExploreGroupsState) => {
    return successfullyFetchedGroups(state) && state.groupsFiltered.length > 0;
}

export const hasAccessRequestsBeenSatisfied = (state: ExploreGroupsState) => {
    return successfullyFetchedGroups(state) && state.accessRequestsInstances !== undefined;
}

export const calculatePaginationPages = (state: ExploreGroupsState) => {
    if (state.groupsFiltered.length <= maxGroupsPerPage) {
        return 1;
    }
    if (state.groupsFiltered.length % maxGroupsPerPage === 0) {
        return (state.groupsFiltered.length / maxGroupsPerPage) | 0;
    }
    return ((state.groupsFiltered.length / maxGroupsPerPage) | 0) + 1;
}

export const calculatePaginationIndices = (state: ExploreGroupsState) => {
    let startIndex, endIndex;
    startIndex = (state.currentPage - 1) * maxGroupsPerPage;
    endIndex = startIndex + maxGroupsPerPage - 1;
    if (endIndex > state.groupsFiltered.length - 1) {
        endIndex = state.groupsFiltered.length - 1;
    }
    return {
        startIndex,
        endIndex
    };
}

export const isSendingAccessRequest = (state: ExploreGroupsState, groupID: string) => {
    return state.sendingAccessRequestToGroup !== undefined && state.sendingAccessRequestToGroup === groupID;
}

export const hasErrorSendingAccessRequest = (state: ExploreGroupsState, groupID: string) => {
    return !isSendingAccessRequest(state, groupID) && state.errorSendingAccessRequest !== undefined;
}

export const isRemovingAccessRequest = (state: ExploreGroupsState, groupID: string) => {
    return state.removingAccessRequestFromGroup !== undefined && state.removingAccessRequestFromGroup === groupID;
}

export const hasErrorRemovingAccessRequest = (state: ExploreGroupsState, groupID: string) => {
    return !isRemovingAccessRequest(state, groupID) && state.errorRemovingAccessRequest !== undefined;
}

const exploreGroupsReducer = (state = initialState, action: ExploreGroupsAction) => {
    switch (action.type) {
        case ExploreGroupsEvents.FetchingGroups:
            return {
                ...state,
                groups: [],
                fetchingGroups: true,
                groupsFetched: false,
                error: undefined
            }
        case ExploreGroupsEvents.CompleteFetchingGroups:
            const completeFetchingGroupsAction: CompleteFetchingGroupsAction = action as CompleteFetchingGroupsAction;
            return {
                ...state,
                groups: [...completeFetchingGroupsAction.groups],
                accessRequestsInstances: completeFetchingGroupsAction.accessRequestInstances !== undefined
                    ? [...completeFetchingGroupsAction.accessRequestInstances]
                    : state.accessRequestsInstances,
                fetchingGroups: false,
                groupsFetched: true,
                currentPage: 1,
                error: completeFetchingGroupsAction.error !== undefined
                    ? {detail: completeFetchingGroupsAction.error} : state.error
            }
        case ExploreGroupsEvents.FilterChanged:
            const filterChangedAction: FilterChangedAction = action as FilterChangedAction;
            return {
                ...state,
                [filterChangedAction.name]: filterChangedAction.value
            }
        case ExploreGroupsEvents.FilterGroupsByName:
            return {
                ...state,
                filteringGroupsByName: true
            }
        case ExploreGroupsEvents.CancelFilterGroupsByName:
            return {
                ...state,
                nameFilter: "",
                filteringGroupsByName: false
            }
        case ExploreGroupsEvents.FilterGroupsByGroupFilter:
            const filterGroupsByGroupFilterAction: FilterGroupsByGroupFilterAction = action as FilterGroupsByGroupFilterAction;
            return {
                ...state,
                groupsFiltered: [...filterGroupsByGroupFilterAction.groupsFiltered],
                currentPage: 1
            }
        case ExploreGroupsEvents.PaginationChanged:
            const paginationChangedAction: PaginationChangedAction = action as PaginationChangedAction;
            return {
                ...state,
                currentPage: paginationChangedAction.page
            }
        case ExploreGroupsEvents.SendingAccessRequest:
            const sendingAccessRequestAction: SendingAccessRequestAction = action as SendingAccessRequestAction;
            return {
                ...state,
                sendingAccessRequestToGroup: sendingAccessRequestAction.groupID,
                errorSendingAccessRequest: undefined
            }
        case ExploreGroupsEvents.CompleteSendingAccessRequest:
            const completeSendingAccessRequestAction: CompleteSendingAccessRequestAction = action as CompleteSendingAccessRequestAction;
            return {
                ...state,
                sendingAccessRequestToGroup: undefined,
                accessRequestsInstances: completeSendingAccessRequestAction.updatedAccessRequestInstances !== undefined
                    ? [...completeSendingAccessRequestAction.updatedAccessRequestInstances]
                    : state.accessRequestsInstances,
                errorSendingAccessRequest: completeSendingAccessRequestAction.error !== undefined
                    ? {detail: completeSendingAccessRequestAction.error} : state.errorSendingAccessRequest
            }
        case ExploreGroupsEvents.RemovingAccessRequest:
            const removingAccessRequestAction: RemovingAccessRequestAction = action as RemovingAccessRequestAction;
            return {
                ...state,
                removingAccessRequestFromGroup: removingAccessRequestAction.groupID,
                errorRemovingAccessRequest: undefined
            }
        case ExploreGroupsEvents.CompleteRemovingAccessRequest:
            const completeRemovingAccessRequestAction: CompleteRemovingAccessRequestAction = action as CompleteRemovingAccessRequestAction;
            return {
                ...state,
                removingAccessRequestFromGroup: undefined,
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

export default exploreGroupsReducer;