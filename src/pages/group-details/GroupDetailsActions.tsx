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
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";

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
    admins?: any[];
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

            const membersResponse = await new GroupRepository().fetchGroupMembers(group.groupUserName);
            const members: InvitedUserWithProfile[] = membersResponse.data;

            const offersResponse = await new OfferRepository().fetchOffers({
                phase: "all",
                group: group.anid,
                orderBy: FetchProjectsOrderByOptions.Group
            });
            const offers: ProjectInstance[] = offersResponse.data;

            // Load group admins/lecturers using 3-scenario approach (non-blocking - don't fail if this errors)
            let groupAdmins: any[] = [];
            try {
                console.log(`📊 [GroupDetails] Loading admins for group: ${group.anid} (${group.displayName})`);

                // SCENARIO 1: Load admins where anid = group.anid (course/group-level admins)
                console.log(`    🌐 Scenario 1: Loading admins with anid = ${group.anid}`);
                const courseAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(group.anid) as any[];
                console.log(`    ✅ Found ${courseAdmins?.length || 0} course-level admins`);

                // SCENARIO 2: Load ALL admins and filter for those with courseIds containing this group's anid
                console.log(`    🌐 Scenario 2: Loading all admins to check courseIds arrays`);
                const firebase = require('../../firebase/firebaseApp').default;
                const DB_CONST = require('../../firebase/databaseConsts');

                const snapshot = await firebase
                    .database()
                    .ref(DB_CONST.ADMINISTRATORS_CHILD)
                    .once('value');

                let adminsWithCourseId: any[] = [];
                if (snapshot.exists()) {
                    const adminsObject = snapshot.val();
                    const allAdmins = Object.keys(adminsObject).map(key => adminsObject[key]);
                    adminsWithCourseId = allAdmins.filter((admin: any) =>
                        admin.courseIds && Array.isArray(admin.courseIds) && admin.courseIds.includes(group.anid)
                    );
                }
                console.log(`    ✅ Found ${adminsWithCourseId.length} admins with courseIds containing ${group.anid}`);

                // Combine course-specific admins and remove duplicates by email
                // NOTE: We do NOT include university-level admins here - only admins specifically assigned to this course
                const allCourseAdmins = [...(courseAdmins || []), ...adminsWithCourseId];
                const uniqueAdmins = allCourseAdmins.reduce((acc: any[], admin: any) => {
                    if (!acc.find((a: any) => a.email === admin.email)) {
                        acc.push(admin);
                    }
                    return acc;
                }, []);

                console.log(`    📊 Total unique admins for THIS COURSE ONLY (${group.displayName}): ${uniqueAdmins.length}`);
                groupAdmins = uniqueAdmins;
            } catch (adminError) {
                console.error("Failed to load group admins:", adminError);
                // Continue without admins - set to empty array
            }

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
            completeAction.admins = groupAdmins;
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