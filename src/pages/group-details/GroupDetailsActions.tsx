import {Action, ActionCreator, Dispatch} from "redux";
import GroupProperties from "../../models/group_properties";
import {InvitedUserWithProfile} from "../../models/invited_user";
import {ProjectInstance} from "../../models/project";
import {AppState} from "../../redux-store/reducers";
import GroupRepository from "../../api/repositories/GroupRepository";
import OfferRepository, {FetchProjectsOrderByOptions} from "../../api/repositories/OfferRepository";
import AccessRequest, {AccessRequestInstance} from "../../models/access_request";
import Admin, {isAdmin} from "../../models/admin";
import AccessRequestRepository from "../../api/repositories/AccessRequestRepository";

export enum GroupDetailsEvents {
    LoadingData = "GroupDetailsEvents.LoadData",
    CompleteLoadingData = "GroupDetailsEvents.CompleteLoadingData",
    SendingAccessRequest = "GroupDetailsEvents.SendingAccessRequest",
    CompleteSendingAccessRequest = "GroupDetailsEvents.CompleteSendingAccessRequest",
    RemovingAccessRequest = "GroupDetailsEvents.RemovingAccessRequest",
    CompleteRemovingAccessRequest = "GroupDetailsEvents.CompleteRemovingAccessRequest"
}

export interface GroupDetailsAction extends Action {

}

export interface CompleteLoadingDataAction extends GroupDetailsAction {
    group?: GroupProperties;
    members?: InvitedUserWithProfile[];
    offers?: ProjectInstance[];
    accessRequestInstances?: AccessRequestInstance[];
    error?: string;
}

export interface CompleteSendingAccessRequestAction extends GroupDetailsAction {
    error?: string;
    updatedAccessRequestInstances?: AccessRequestInstance[]
}

export interface CompleteRemovingAccessRequestAction extends GroupDetailsAction {
    error?: string;
    updatedAccessRequestInstances?: AccessRequestInstance[]
}

export const loadData: ActionCreator<any> = (groupUserName: string) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            accessRequestsInstances
        } = getState().GroupDetailsLocalState;

        dispatch({
            type: GroupDetailsEvents.LoadingData
        });

        const currentUser = getState().AuthenticationState.currentUser;

        const completeAction: CompleteLoadingDataAction = {
            type: GroupDetailsEvents.CompleteLoadingData
        }

        if (!currentUser) {
            completeAction.error = "Unauthenticated user.";
            return dispatch(completeAction);
        }

        if (groupUserName === undefined) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }

        try {
            const groupResponse = await new GroupRepository().getGroup(groupUserName);
            const group: GroupProperties = groupResponse.data;

            const membersResponse = await new GroupRepository().fetchGroupMembers(group.anid);
            const members: InvitedUserWithProfile[] = membersResponse.data;

            const offersResponse = await new OfferRepository().fetchOffers({
                phase: "all",
                group: group.anid,
                orderBy: FetchProjectsOrderByOptions.Group
            });
            const offers: ProjectInstance[] = offersResponse.data;

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

            completeAction.group = group;
            completeAction.members = members;
            completeAction.offers = offers;
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const sendAccessRequest: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentUser = getState().AuthenticationState.currentUser;
        if (!currentUser) {
            return;
        }

        const group = getState().GroupDetailsLocalState.group;

        dispatch({
            type: GroupDetailsEvents.SendingAccessRequest
        });

        const completeAction: CompleteSendingAccessRequestAction = {
            type: GroupDetailsEvents.CompleteSendingAccessRequest
        };

        if (!group) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }

        try {
            const response = await new AccessRequestRepository().createAccessRequest(currentUser.id, group.anid);
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
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const removeAccessRequest: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentUser = getState().AuthenticationState.currentUser;
        if (!currentUser) {
            return;
        }

        const group = getState().GroupDetailsLocalState.group;

        dispatch({
            type: GroupDetailsEvents.RemovingAccessRequest
        });

        const completeAction: CompleteRemovingAccessRequestAction = {
            type: GroupDetailsEvents.CompleteRemovingAccessRequest
        };

        if (!group) {
            completeAction.error = "Invalid request.";
            return dispatch(completeAction);
        }

        try {
            const currentAccessRequestInstances: AccessRequestInstance[] | undefined = getState().GroupDetailsLocalState.accessRequestsInstances;
            if (!currentAccessRequestInstances) {
                return dispatch(completeAction);
            }
            const accessRequestIndex = currentAccessRequestInstances.findIndex(
                accessRequestInstance => accessRequestInstance.group.anid === group.anid && accessRequestInstance.user.id === currentUser.id);
            if (accessRequestIndex === -1) {
                return dispatch(completeAction);
            }
            let updatedAccessRequestInstances: AccessRequestInstance[] = [...currentAccessRequestInstances];
            const accessRequest: AccessRequest = updatedAccessRequestInstances[accessRequestIndex].request;
            await new AccessRequestRepository().removeAccessRequest(accessRequest.id);
            updatedAccessRequestInstances.splice(accessRequestIndex, 1);

            completeAction.updatedAccessRequestInstances = updatedAccessRequestInstances;
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}