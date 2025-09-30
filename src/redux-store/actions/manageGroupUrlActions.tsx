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
                // Create the invest-west group object with availableCourses
                const investWestGroup: GroupProperties = {
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
                        makeInvestorsContactDetailsVisibleToIssuers: false,
                        availableCourses: [
                            "History MSc",
                            "Student Showcase"
                        ]
                    }
                };

                // If courseUserName is provided, validate it exists in available courses
                if (courseUserName) {
                    const availableCourses = investWestGroup.settings.availableCourses || [];

                    // Fix for student-showcase course validation
                    if (courseUserName === "student-showcase" || courseUserName === "Student Showcase") {
                        // Always allow student-showcase for invest-west group
                        console.log(`[COURSE VALIDATION] ✅ "student-showcase" course validated for invest-west`);
                    } else {
                        // Use normal validation for other courses
                        const isValidCourse = validateCourseUrlName(courseUserName, availableCourses);

                        if (!isValidCourse) {
                            console.log(`[COURSE VALIDATION] ❌ Invalid course URL: ${courseUserName}, available courses:`, availableCourses);
                            finishedLoadingGroupUrlAction.validGroupUrl = false;
                            finishedLoadingGroupUrlAction.error = {
                                detail: `Course "${courseUserName}" not found. Available courses: ${availableCourses.join(', ')}`
                            };
                            return dispatch(finishedLoadingGroupUrlAction);
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

                // If group exists and courseUserName is provided, validate the course
                if (retrievedGroup && courseUserName) {
                    const availableCourses = retrievedGroup.settings?.availableCourses || [];
                    const isValidCourse = validateCourseUrlName(courseUserName, availableCourses);

                    if (!isValidCourse) {
                        console.log(`[COURSE VALIDATION] Invalid course URL: ${courseUserName} for group: ${groupUserName}, available courses:`, availableCourses);
                        finishedLoadingGroupUrlAction.group = retrievedGroup;
                        finishedLoadingGroupUrlAction.validGroupUrl = false;
                        finishedLoadingGroupUrlAction.error = {
                            detail: `Course "${courseUserName}" not found in ${retrievedGroup.displayName}. Available courses: ${availableCourses.join(', ')}`
                        };
                        return dispatch(finishedLoadingGroupUrlAction);
                    }

                    console.log(`[COURSE VALIDATION] Valid course URL: ${courseUserName} for group: ${groupUserName}`);
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