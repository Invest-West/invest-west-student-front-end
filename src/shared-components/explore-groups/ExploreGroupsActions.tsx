import {Action, ActionCreator, Dispatch} from "redux";
import GroupProperties from "../../models/group_properties";
import {AppState} from "../../redux-store/reducers";
import GroupRepository from "../../api/repositories/GroupRepository";
import AccessRequest, {AccessRequestInstance} from "../../models/access_request";
import AccessRequestRepository from "../../api/repositories/AccessRequestRepository";
import Admin, {isAdmin} from "../../models/admin";
import React from "react";

export enum ExploreGroupsEvents {
    FetchingGroups = "ExploreGroupsEvents.FetchingGroups",
    CompleteFetchingGroups = "ExploreGroupsEvents.CompleteFetchingGroups",
    FilterChanged = "ExploreGroupsEvents.FilterChanged",
    FilterGroupsByName = "ExploreGroupsEvents.FilterGroupsByName",
    CancelFilterGroupsByName = "ExploreGroupsEvents.CancelFilterGroupsByName",
    FilterGroupsByGroupFilter = "ExploreGroupsEvents.FilterGroupsByGroupFilter",
    PaginationChanged = "ExploreGroupsEvents.PaginationChanged",
    SendingAccessRequest = "ExploreGroupsEvents.SendingAccessRequest",
    CompleteSendingAccessRequest = "ExploreGroupsEvents.CompleteSendingAccessRequest",
    RemovingAccessRequest = "ExploreGroupsEvents.RemovingAccessRequest",
    CompleteRemovingAccessRequest = "ExploreGroupsEvents.CompleteRemovingAccessRequest"
}

export interface ExploreGroupsAction extends Action {

}

export interface CompleteFetchingGroupsAction extends ExploreGroupsAction {
    groups: GroupProperties[];
    accessRequestInstances?: AccessRequestInstance[];
    error?: string;
}

export interface FilterChangedAction extends ExploreGroupsAction {
    name: string;
    value: any;
}

export interface FilterGroupsByGroupFilterAction extends ExploreGroupsAction {
    groupsFiltered: GroupProperties[];
}

export interface PaginationChangedAction extends ExploreGroupsAction {
    page: number;
}

export interface SendingAccessRequestAction extends ExploreGroupsAction {
    groupID: string;
}

export interface CompleteSendingAccessRequestAction extends ExploreGroupsAction {
    error?: string;
    updatedAccessRequestInstances?: AccessRequestInstance[]
}

export interface RemovingAccessRequestAction extends ExploreGroupsAction {
    groupID: string;
}

export interface CompleteRemovingAccessRequestAction extends ExploreGroupsAction {
    error?: string;
    updatedAccessRequestInstances?: AccessRequestInstance[]
}

export const fetchGroups: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            accessRequestsInstances,
            nameFilter
        } = getState().ExploreGroupsLocalState;

        dispatch({
            type: ExploreGroupsEvents.FetchingGroups
        });

        const currentUser = getState().AuthenticationState.currentUser;

        const completeAction: CompleteFetchingGroupsAction = {
            type: ExploreGroupsEvents.CompleteFetchingGroups,
            groups: []
        };

        if (!currentUser) {
            completeAction.error = "Unauthenticated user.";
            return dispatch(completeAction);
        }

        try {
            const groupsResponse = await new GroupRepository().fetchGroups(
                nameFilter.trim().length === 0 ? undefined : {name: nameFilter}
            );
            completeAction.groups = groupsResponse.data;

            const admin: Admin | null = isAdmin(currentUser);
            if (!admin || (admin && !admin.superAdmin)) {
                // user is an issuer, investor, or group admin
                // and access requests have not been fetched
                if (!accessRequestsInstances) {
                    const accessRequestInstancesResponse = await new AccessRequestRepository().fetchAccessRequests({
                        user: currentUser.id,
                        orderBy: "user"
                    });
                    completeAction.accessRequestInstances = accessRequestInstancesResponse.data;
                }
            }
            dispatch(completeAction);
            return dispatch(filterGroupsByGroupFilter());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const filterChanged: ActionCreator<any> = (event: any) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const name = event.target.name;
        const value = event.target.value;

        const action: FilterChangedAction = {
            type: ExploreGroupsEvents.FilterChanged,
            name: name,
            value: value
        }

        dispatch(action);

        if (name === "groupFilter") {
            dispatch(filterGroupsByGroupFilter());
        }
    }
}

export const filterGroupsByName: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ExploreGroupsEvents.FilterGroupsByName
        });
        return dispatch(fetchGroups());
    }
}

export const cancelFilteringGroupsByName: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ExploreGroupsEvents.CancelFilterGroupsByName
        });
        return dispatch(fetchGroups());
    }
}

const filterGroupsByGroupFilter: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            groupFilter,
            accessRequestsInstances,
            groups
        } = getState().ExploreGroupsLocalState;

        const AuthenticationState = getState().AuthenticationState;
        const currentUser = AuthenticationState.currentUser;

        if (!currentUser) {
            return;
        }

        const groupsFiltered: GroupProperties[] = [];

        groups.map(group => {
            let satisfiedFilter = false;
            switch (groupFilter) {
                case "all":
                    const admin: Admin | null = isAdmin(currentUser);
                    if (admin && admin.superAdmin) {
                        satisfiedFilter = true;
                    } else {
                        satisfiedFilter = AuthenticationState.groupsOfMembership.findIndex(
                            groupOfMembership => groupOfMembership.group.anid === group.anid) === -1
                            && accessRequestsInstances !== undefined
                            && accessRequestsInstances.findIndex(
                                accessRequestInstance => accessRequestInstance.group.anid === group.anid) === -1;
                    }
                    break;
                case "groupsOfMembership":
                    satisfiedFilter = AuthenticationState.groupsOfMembership.findIndex(
                        groupOfMembership => groupOfMembership.group.anid === group.anid) !== -1;
                    break;
                case "groupsOfPendingRequest":
                    satisfiedFilter = accessRequestsInstances !== undefined
                        && accessRequestsInstances.findIndex(
                            accessRequestInstance => accessRequestInstance.group.anid === group.anid) !== -1;
                    break;
                default:
                    break;
            }
            if (satisfiedFilter) {
                groupsFiltered.push(group);
            }
            return null;
        });

        const action: FilterGroupsByGroupFilterAction = {
            type: ExploreGroupsEvents.FilterGroupsByGroupFilter,
            groupsFiltered: groupsFiltered
        }
        return dispatch(action);
    }
}

export const paginationChanged: ActionCreator<any> = (event: React.ChangeEvent<unknown>, page: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: PaginationChangedAction = {
            type: ExploreGroupsEvents.PaginationChanged,
            page: page
        }
        return dispatch(action);
    }
}

export const sendAccessRequest: ActionCreator<any> = (groupID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentUser = getState().AuthenticationState.currentUser;
        if (!currentUser) {
            return;
        }

        const sendingAction: SendingAccessRequestAction = {
            type: ExploreGroupsEvents.SendingAccessRequest,
            groupID
        };
        dispatch(sendingAction);

        const completeAction: CompleteSendingAccessRequestAction = {
            type: ExploreGroupsEvents.CompleteSendingAccessRequest
        };

        try {
            const response = await new AccessRequestRepository().createAccessRequest(currentUser.id, groupID);
            const accessRequestInstance: AccessRequestInstance = response.data;
            const currentAccessRequestInstances: AccessRequestInstance[] | undefined = getState().ExploreGroupsLocalState.accessRequestsInstances;
            if (currentAccessRequestInstances !== undefined) {
                completeAction.updatedAccessRequestInstances = [
                    ...currentAccessRequestInstances,
                    accessRequestInstance
                ];
            } else {
                completeAction.updatedAccessRequestInstances = [accessRequestInstance];
            }
            dispatch(completeAction);
            return dispatch(filterGroupsByGroupFilter());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const removeAccessRequest: ActionCreator<any> = (groupID: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentUser = getState().AuthenticationState.currentUser;
        if (!currentUser) {
            return;
        }

        const removingAction: RemovingAccessRequestAction = {
            type: ExploreGroupsEvents.RemovingAccessRequest,
            groupID
        };
        dispatch(removingAction);

        const completeAction: CompleteRemovingAccessRequestAction = {
            type: ExploreGroupsEvents.CompleteRemovingAccessRequest
        };

        try {
            const currentAccessRequestInstances: AccessRequestInstance[] | undefined = getState().ExploreGroupsLocalState.accessRequestsInstances;
            if (!currentAccessRequestInstances) {
                return dispatch(completeAction);
            }
            const accessRequestIndex = currentAccessRequestInstances.findIndex(
                accessRequestInstance => accessRequestInstance.group.anid === groupID && accessRequestInstance.user.id === currentUser.id);
            if (accessRequestIndex === -1) {
                return dispatch(completeAction);
            }
            let updatedAccessRequestInstances: AccessRequestInstance[] = [...currentAccessRequestInstances];
            const accessRequest: AccessRequest = updatedAccessRequestInstances[accessRequestIndex].request;
            await new AccessRequestRepository().removeAccessRequest(accessRequest.id);
            updatedAccessRequestInstances.splice(accessRequestIndex, 1);

            completeAction.updatedAccessRequestInstances = updatedAccessRequestInstances;
            dispatch(completeAction);
            return dispatch(filterGroupsByGroupFilter());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}