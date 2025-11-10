import {Action, ActionCreator, Dispatch} from "redux";
import GroupProperties from "../../models/group_properties";
import Error from "../../models/error";
import {AppState} from "../reducers";
import GroupRepository from "../../api/repositories/GroupRepository";
import { validateCourseUrlName, findCourseDisplayNameByUrl, courseDisplayNameToUrlName } from "../../utils/courseUtils";

export enum ManageGroupUrlEvents {
    SetGroupUrl = "ManageGroupUrlEvents.SetGroupUrl",
    ValidatingGroupUrl = "ManageGroupUrlEvents.ValidatingGroupUrl",
    FinishedValidatingGroupUrl = "ManageGroupUrlEvents.FinishedValidatingGroupUrl",
    ResetGroupUrlState = "ManageGroupUrlEvents.ResetGroupUrlState"
}

export interface ManageGroupUrlAction extends Action {
    path?: string;
    groupUserName?: string | null;
    courseUserName?: string | null;
    group?: GroupProperties | null;
    validGroupUrl?: boolean;
    error?: Error
}

export interface SetGroupUrlAction extends ManageGroupUrlAction {
    path: string;
    groupUserName: string | null;
    courseUserName: string | null;
}

export interface ValidatingGroupUrlAction extends ManageGroupUrlAction {
}

export interface FinishedValidatingGroupUrlAction extends ManageGroupUrlAction {
    group: GroupProperties | null;
    validGroupUrl: boolean;
    error?: Error
}

export interface ResetGroupUrlStateAction extends ManageGroupUrlAction {
}

export const validateGroupUrl: ActionCreator<any> = (path: string, groupUserName: string | null, courseUserName?: string | null) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            routePath,
            groupNameFromUrl,
            courseNameFromUrl,
            group,
            loadingGroup,
            groupLoaded
        } = getState().ManageGroupUrlState;

        const setGroupUrlAction: SetGroupUrlAction = {
            type: ManageGroupUrlEvents.SetGroupUrl,
            path,
            groupUserName,
            courseUserName: courseUserName || null
        }

        let shouldValidateGroupUrl = false;

        // routePath or groupNameFromUrl or both of them have not been defined
        if (routePath === undefined || groupNameFromUrl === undefined) {
            shouldValidateGroupUrl = true;
        }
        // routePath and groupNameFromUrl have been defined
        else {
            if (groupNameFromUrl !== groupUserName || courseNameFromUrl !== courseUserName) {
                shouldValidateGroupUrl = true;
            }
        }

        // group has not been loaded
        // or group has been loaded but a new group name is set in the url
        // --> continue validating group url
        if ((!group && !loadingGroup && !groupLoaded)
            || (!(!group && !loadingGroup && !groupLoaded) && shouldValidateGroupUrl)
        ) {
            dispatch(setGroupUrlAction);

            const validatingGroupUrlAction: ValidatingGroupUrlAction = {
                type: ManageGroupUrlEvents.ValidatingGroupUrl
            }

            dispatch(validatingGroupUrlAction);

            const finishedLoadingGroupUrlAction: FinishedValidatingGroupUrlAction = {
                type: ManageGroupUrlEvents.FinishedValidatingGroupUrl,
                group: null,
                validGroupUrl: false
            }

            // group name is not specified in the url
            if (!groupUserName) {
                finishedLoadingGroupUrlAction.validGroupUrl = true;
                return dispatch(finishedLoadingGroupUrlAction);
            }

            // Handle default "invest-west" group for course-based URLs
            if (groupUserName === 'invest-west') {
                // Fetch the actual invest-west group from the backend to get the latest data including logo
                let investWestGroup: GroupProperties;
                try {
                    const response = await new GroupRepository().getGroup('invest-west');
                    investWestGroup = response.data;
                } catch (error) {
                    console.error('[VALIDATE GROUP] Failed to fetch invest-west group, using fallback:', error);
                    // Fallback to hardcoded object if fetch fails
                    investWestGroup = {
                        anid: '-M2I40dBdzdI89yDCaAn',
                        dateAdded: Date.now(),
                        description: 'Default student showcase group',
                        displayName: 'Student Showcase',
                        displayNameLower: 'student showcase',
                        groupUserName: 'invest-west',
                        isInvestWest: true,
                        status: 1,
                        plainLogo: [],
                        settings: {
                            primaryColor: '#4F6D7A',
                            secondaryColor: '#ffffff',
                            projectVisibility: 1,
                            makeInvestorsContactDetailsVisibleToIssuers: false
                        }
                    };
                }

                // If courseUserName is provided, validate it exists in Firebase as a course entity
                if (courseUserName) {
                    try {
                        // Query Firebase for the course by groupUserName
                        const courseGroup = await new GroupRepository().getCourseByUserName(courseUserName);

                        if (!courseGroup) {
                            console.log(`[COURSE VALIDATION] ⚠️ Course not found in Firebase: ${courseUserName}`);
                            // Don't fail validation here - the course might exist but we can't read it
                            // due to Firebase security rules (not authenticated yet)
                            // Let the authentication and permission checks handle access control
                        } else {
                            // Verify the course belongs to this parent group
                            if (courseGroup.parentGroupId !== investWestGroup.anid) {
                                console.log(`[COURSE VALIDATION] ❌ Course "${courseUserName}" does not belong to parent group "${groupUserName}"`);
                                finishedLoadingGroupUrlAction.validGroupUrl = false;
                                finishedLoadingGroupUrlAction.error = {
                                    detail: `Course "${courseUserName}" is not part of ${investWestGroup.displayName}`
                                };
                                return dispatch(finishedLoadingGroupUrlAction);
                            }

                        }
                    } catch (error) {
                        console.error('[COURSE VALIDATION] Error validating course:', error);
                        // Check if this is a permission/auth error (PERMISSION_DENIED from Firebase)
                        const isPermissionError = error.toString().includes('PERMISSION_DENIED') ||
                                                 error.toString().includes('permission') ||
                                                 error.code === 'PERMISSION_DENIED';

                        if (isPermissionError) {
                            // Allow validation to pass - authentication check will handle this
                        } else {
                            // For other errors, we might want to fail validation
                            console.log(`[COURSE VALIDATION] ⚠️ Non-permission error, but allowing validation to proceed: ${error.toString()}`);
                            // Still allow it to pass - be lenient with course validation
                            // The auth/permission checks will catch any real issues
                        }
                    }
                }

                finishedLoadingGroupUrlAction.group = investWestGroup;
                finishedLoadingGroupUrlAction.validGroupUrl = true;
                return dispatch(finishedLoadingGroupUrlAction);
            }

            try {
                const response = await new GroupRepository().getGroup(groupUserName);
                const retrievedGroup: GroupProperties | null = response.data;

                // If group exists and courseUserName is provided, validate the course from Firebase
                if (retrievedGroup && courseUserName) {
                    try {
                        // Query Firebase for the course by groupUserName
                        const courseGroup = await new GroupRepository().getCourseByUserName(courseUserName);

                        if (!courseGroup) {
                            console.log(`[COURSE VALIDATION] ⚠️ Course not found in Firebase: ${courseUserName}`);
                            // Don't fail validation here - the course might exist but we can't read it
                            // due to Firebase security rules (not authenticated yet)
                            // Let the authentication and permission checks handle access control
                        } else {
                            // Verify the course belongs to this parent group
                            if (courseGroup.parentGroupId !== retrievedGroup.anid) {
                                finishedLoadingGroupUrlAction.group = retrievedGroup;
                                finishedLoadingGroupUrlAction.validGroupUrl = false;
                                finishedLoadingGroupUrlAction.error = {
                                    detail: `Course "${courseUserName}" is not part of ${retrievedGroup.displayName}`
                                };
                                return dispatch(finishedLoadingGroupUrlAction);
                            }

                            console.log(`[COURSE VALIDATION] ✅ Course validated from Firebase: "${courseUserName}" for group "${groupUserName}"`);
                        }
                    } catch (error) {
                        console.error('[COURSE VALIDATION] Error validating course:', error);
                        // Check if this is a permission/auth error (PERMISSION_DENIED from Firebase)
                        const isPermissionError = error.toString().includes('PERMISSION_DENIED') ||
                                                 error.toString().includes('permission') ||
                                                 error.code === 'PERMISSION_DENIED';

                        if (isPermissionError) {
                            console.log(`[COURSE VALIDATION] ⏭️ Permission error - user likely not authenticated. Allowing validation to proceed.`);
                            // Allow validation to pass - authentication check will handle this
                        } else {
                            // For other errors, we might want to fail validation
                            console.log(`[COURSE VALIDATION] ⚠️ Non-permission error, but allowing validation to proceed: ${error.toString()}`);
                            // Still allow it to pass - be lenient with course validation
                            // The auth/permission checks will catch any real issues
                        }
                    }
                }

                finishedLoadingGroupUrlAction.group = retrievedGroup;
                finishedLoadingGroupUrlAction.validGroupUrl = retrievedGroup !== null;
                return dispatch(finishedLoadingGroupUrlAction);
            } catch (error) {
                finishedLoadingGroupUrlAction.error = {
                    detail: error.toString()
                }
                return dispatch(finishedLoadingGroupUrlAction);
            }
        }
    }
}

export const resetGroupUrlState: ActionCreator<any> = () => {
    return (dispatch: Dispatch) => {
        const action: ResetGroupUrlStateAction = {
            type: ManageGroupUrlEvents.ResetGroupUrlState
        };
        return dispatch(action);
    }
}