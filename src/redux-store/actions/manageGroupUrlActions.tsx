import {Action, ActionCreator, Dispatch} from "redux";
import GroupProperties from "../../models/group_properties";
import Error from "../../models/error";
import {AppState} from "../reducers";
import GroupRepository from "../../api/repositories/GroupRepository";
import { validateCourseUrlName, findCourseDisplayNameByUrl, courseDisplayNameToUrlName } from "../../utils/courseUtils";
import Api from "../../api/Api";

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
                        // Query by parent group ID and course slug to ensure we get the correct course
                        // (multiple universities may have courses with the same slug like "student-showcase")
                        const courseGroup = await new GroupRepository().getCourseByParentAndSlug(
                            investWestGroup.anid,
                            courseUserName
                        );

                        if (!courseGroup) {
                            console.log(`[COURSE VALIDATION] ⚠️ Course not found in Firebase: ${courseUserName} for parent ${investWestGroup.anid}`);
                            // Don't fail validation here - the course might exist but we can't read it
                            // due to Firebase security rules (not authenticated yet)
                            // Let the authentication and permission checks handle access control
                        } else {
                            console.log(`[COURSE VALIDATION] ✅ Course validated: "${courseUserName}" for group "${groupUserName}"`);
                        }
                    } catch (error: any) {
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
                        // Query by parent group ID and course slug to ensure we get the correct course
                        // (multiple universities may have courses with the same slug like "student-showcase")
                        const courseGroup = await new GroupRepository().getCourseByParentAndSlug(
                            retrievedGroup.anid,
                            courseUserName
                        );

                        if (!courseGroup) {
                            console.log(`[COURSE VALIDATION] ⚠️ Course not found in Firebase: ${courseUserName} for parent ${retrievedGroup.anid}`);
                            // Don't fail validation here - the course might exist but we can't read it
                            // due to Firebase security rules (not authenticated yet)
                            // Let the authentication and permission checks handle access control
                        } else {
                            console.log(`[COURSE VALIDATION] ✅ Course validated: "${courseUserName}" for group "${groupUserName}"`);
                        }
                    } catch (error: any) {
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
            } catch (error: any) {
                console.log(`[GROUP VALIDATION] Standard group retrieval failed for "${groupUserName}", trying public API fallback...`);

                // Fallback to public API for route validation
                // This handles cases where the university exists but isn't accessible via the standard auth-protected endpoints
                try {
                    let publicApiUrl: string;
                    if (courseUserName) {
                        publicApiUrl = `/public/uni/${groupUserName}/${courseUserName}`;
                    } else {
                        publicApiUrl = `/public/uni/${groupUserName}`;
                    }

                    console.log(`[GROUP VALIDATION] Calling public API: ${publicApiUrl}`);
                    const publicResponse = await Api.doGet(publicApiUrl);
                    const publicData = publicResponse.data;

                    if (publicData.valid || publicData.found) {
                        console.log(`[GROUP VALIDATION] ✅ Public API validation succeeded for "${groupUserName}"`);

                        // Construct a GroupProperties object from the public API response
                        const publicGroup: GroupProperties = {
                            anid: publicData.university?.id || '',
                            dateAdded: Date.now(),
                            description: publicData.university?.name || '',
                            displayName: publicData.university?.name || groupUserName,
                            displayNameLower: (publicData.university?.name || groupUserName).toLowerCase(),
                            groupUserName: publicData.university?.slug || groupUserName,
                            isInvestWest: false,
                            status: 1,
                            plainLogo: publicData.university?.logo ? [{
                                storageID: 0,
                                url: publicData.university.logo,
                                removed: false
                            }] : [],
                            settings: {
                                primaryColor: '#1976d2',
                                secondaryColor: '#dc004e',
                                projectVisibility: 1,
                                makeInvestorsContactDetailsVisibleToIssuers: false
                            }
                        };

                        finishedLoadingGroupUrlAction.group = publicGroup;
                        finishedLoadingGroupUrlAction.validGroupUrl = true;
                        return dispatch(finishedLoadingGroupUrlAction);
                    } else {
                        console.log(`[GROUP VALIDATION] ❌ Public API validation failed for "${groupUserName}": ${publicData.error}`);
                        finishedLoadingGroupUrlAction.error = {
                            detail: publicData.error || `University "${groupUserName}" not found`
                        };
                        return dispatch(finishedLoadingGroupUrlAction);
                    }
                } catch (publicError: any) {
                    console.error('[GROUP VALIDATION] Public API fallback also failed:', publicError);
                    finishedLoadingGroupUrlAction.error = {
                        detail: error.toString()
                    };
                    return dispatch(finishedLoadingGroupUrlAction);
                }
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