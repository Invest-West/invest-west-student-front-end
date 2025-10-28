import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import React from "react";
import GroupProperties from "../../../../models/group_properties";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";
import firebase from "../../../../firebase/firebaseApp";
import * as DB_CONST from "../../../../firebase/databaseConsts";
import {ANGEL_NETWORK_LOADED} from "../../../../redux-store/actions/manageGroupFromParamsActions";
import * as realtimeDBUtils from "../../../../firebase/realtimeDBUtils";
import InvitedUser, { InvitedUserWithProfile } from "../../../../models/invited_user";
import {CourseStatistics} from "./ManageCoursesReducer";

export enum ManageCoursesEvents {
    SetCourses = "ManageCoursesEvents.SetCourses",
    ToggleAddNewCourse = "ManageCoursesEvents.ToggleAddNewCourse",
    AddNewCourseTextChanged = "ManageCoursesEvents.AddNewCourseTextChanged",
    SavingCoursesChanges = "ManageCoursesEvents.SavingCoursesChanges",
    CompletedSavingCoursesChanges = "ManageCoursesEvents.CompletedSavingCoursesChanges",
    LoadCoursesFromGroup = "ManageCoursesEvents.LoadCoursesFromGroup",
    LoadingCourseStatistics = "ManageCoursesEvents.LoadingCourseStatistics",
    SetCourseStatistics = "ManageCoursesEvents.SetCourseStatistics",
    UpdateCourseStatistic = "ManageCoursesEvents.UpdateCourseStatistic"
}

export interface ManageCoursesAction extends Action {

}

export interface SetCoursesAction extends ManageCoursesAction {
    courses: string[];
}

export interface AddNewCourseTextChangedAction extends ManageCoursesAction {
    value: string;
}

export interface CompletedSavingCoursesChangesAction extends ManageCoursesAction {
    error?: string;
}

export interface SetCourseStatisticsAction extends ManageCoursesAction {
    courseStatistics: CourseStatistics[];
}

export interface UpdateCourseStatisticAction extends ManageCoursesAction {
    courseName: string;
    studentCount: number;
    adminCount: number;
}

export const setCourses: ActionCreator<any> = (courses: string[]) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SetCoursesAction = {
            type: ManageCoursesEvents.SetCourses,
            courses: [...courses]
        };
        return dispatch(action);
    }
}

export const loadCoursesFromGroup: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const groupProperties: GroupProperties | null = getState().manageGroupFromParams.groupProperties;
        if (!groupProperties || !groupProperties.settings) {
            return dispatch(setCourses([]));
        }
        const availableCourses = groupProperties.settings.availableCourses || [];
        return dispatch(setCourses([...availableCourses]));
    }
}

export const toggleAddNewCourse: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: ManageCoursesEvents.ToggleAddNewCourse
        });
    }
}

export const onTextChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: AddNewCourseTextChangedAction = {
            type: ManageCoursesEvents.AddNewCourseTextChanged,
            value: event.target.value
        };
        return dispatch(action);
    }
}

export const addNewCourse: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const courses: string[] = [...getState().ManageCoursesLocalState.courses];
        const newCourse: string = getState().ManageCoursesLocalState.newCourse;
        courses.push(newCourse);
        dispatch(setCourses(courses));
        return dispatch(toggleAddNewCourse());
    }
}

export const deleteCourse: ActionCreator<any> = (course: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const courses: string[] = [...getState().ManageCoursesLocalState.courses];
        const index = courses.findIndex(eCourse => eCourse === course);
        if (index !== -1) {
            courses.splice(index, 1);
        }
        return dispatch(setCourses(courses));
    }
}

export const cancelCoursesChanges: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const groupProperties: GroupProperties | null = getState().manageGroupFromParams.groupProperties;
        if (!groupProperties || !groupProperties.settings) {
            return;
        }
        const availableCourses = groupProperties.settings.availableCourses || [];
        return dispatch(setCourses([...availableCourses]));
    }
}

export const saveCoursesChanges: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const groupProperties: GroupProperties | null = getState().manageGroupFromParams.groupProperties;
        if (!groupProperties || !groupProperties.settings) {
            return;
        }
        const newCourses: string[] = [...getState().ManageCoursesLocalState.courses];
        const oldCourses: string[] = groupProperties.settings.availableCourses || [];
        const completeAction: CompletedSavingCoursesChangesAction = {
            type: ManageCoursesEvents.CompletedSavingCoursesChanges
        };
        try {
            dispatch({
                type: ManageCoursesEvents.SavingCoursesChanges
            });

            // Find courses to add and remove
            const coursesToAdd = newCourses.filter(course => !oldCourses.includes(course));
            const coursesToRemove = oldCourses.filter(course => !newCourses.includes(course));

            // Create group entities for new courses
            for (const courseName of coursesToAdd) {
                const courseId = firebase
                    .database()
                    .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                    .push()
                    .key;

                if (!courseId) continue;

                const courseUserName = `${groupProperties.groupUserName}-${courseName.toLowerCase().replace(/\s+/g, '-')}`;

                // Create the course group properties
                const courseGroupProperties: GroupProperties = {
                    anid: courseId,
                    displayName: courseName,
                    displayNameLower: courseName.toLowerCase(),
                    groupUserName: courseUserName,
                    description: `${courseName} - Part of ${groupProperties.displayName}`,
                    website: groupProperties.website || '',
                    dateAdded: Date.now(),
                    status: DB_CONST.GROUP_STATUS_ACTIVE,
                    isInvestWest: false,
                    plainLogo: groupProperties.plainLogo || [],
                    logoWithText: groupProperties.logoWithText,
                    settings: {
                        primaryColor: groupProperties.settings.primaryColor,
                        secondaryColor: groupProperties.settings.secondaryColor,
                        projectVisibility: groupProperties.settings.projectVisibility,
                        makeInvestorsContactDetailsVisibleToIssuers: groupProperties.settings.makeInvestorsContactDetailsVisibleToIssuers
                    },
                    groupType: 'course' as any,
                    parentGroupId: groupProperties.anid
                };

                // Save the course group to Firebase
                await firebase
                    .database()
                    .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                    .child(courseId)
                    .set(courseGroupProperties);
            }

            // Delete group entities for removed courses
            for (const courseName of coursesToRemove) {
                // Find the course group by matching parentGroupId and displayName
                const coursesSnapshot = await firebase
                    .database()
                    .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                    .orderByChild('parentGroupId')
                    .equalTo(groupProperties.anid)
                    .once('value');

                if (coursesSnapshot.exists()) {
                    const courses = coursesSnapshot.val();
                    for (const courseId in courses) {
                        if (courses[courseId].displayName === courseName) {
                            await firebase
                                .database()
                                .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                                .child(courseId)
                                .remove();
                        }
                    }
                }
            }

            // Update the availableCourses in the group's settings using Firebase
            await firebase
                .database()
                .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
                .child(groupProperties.anid)
                .child('settings')
                .child('availableCourses')
                .set(newCourses);

            // Update the local group properties state to reflect the changes
            const updatedGroupProperties = {
                ...groupProperties,
                settings: {
                    ...groupProperties.settings,
                    availableCourses: newCourses
                }
            };

            dispatch({
                type: ANGEL_NETWORK_LOADED,
                angelNetwork: updatedGroupProperties,
                shouldLoadOtherData: true
            });

            dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Success, 'Courses updated successfully!'));

            // Reload course statistics after saving changes
            dispatch(loadCourseStatistics());

            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, completeAction.error));
            return dispatch(completeAction);
        }
    }
}

export const setCourseStatistics: ActionCreator<any> = (courseStatistics: CourseStatistics[]) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SetCourseStatisticsAction = {
            type: ManageCoursesEvents.SetCourseStatistics,
            courseStatistics
        };
        return dispatch(action);
    }
}

export const updateCourseStatistic: ActionCreator<any> = (courseName: string, studentCount: number, adminCount: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: UpdateCourseStatisticAction = {
            type: ManageCoursesEvents.UpdateCourseStatistic,
            courseName,
            studentCount,
            adminCount
        };
        return dispatch(action);
    }
}

/**
 * Load course statistics showing student and admin counts per course
 * 
 * NOTE: This is a temporary implementation that distributes users evenly across courses
 * for demonstration purposes. To implement proper course-specific counting:
 * 
 * 1. Extend InvitedUser model to include courseAssignment field
 * 2. Update user invitation/upgrade processes to set course assignments
 * 3. Modify this function to filter users by actual course assignments
 * 4. Consider adding course assignment UI in user management
 */
export const loadCourseStatistics: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const groupProperties: GroupProperties | null = getState().manageGroupFromParams.groupProperties;
        if (!groupProperties || !groupProperties.settings) {
            return;
        }

        const courses: string[] = [...getState().ManageCoursesLocalState.courses];
        if (courses.length === 0) {
            return dispatch(setCourseStatistics([]));
        }

        dispatch({
            type: ManageCoursesEvents.LoadingCourseStatistics
        });

        try {
            // Initialize course statistics with loading state
            const initialStatistics: CourseStatistics[] = courses.map(courseName => ({
                courseName,
                studentCount: 0,
                adminCount: 0,
                loading: true
            }));
            
            dispatch(setCourseStatistics(initialStatistics));

            // Load all invited users for this group
            const invitedUsers = await realtimeDBUtils.loadInvitedUsers(groupProperties.anid) as (InvitedUser | InvitedUserWithProfile)[];
            
            // Load all admins for this group  
            const groupAdmins = await realtimeDBUtils.loadGroupAdminsBasedOnGroupID(groupProperties.anid) as any[];

            // Calculate statistics for each course using actual course assignments
            const updatedStatistics: CourseStatistics[] = courses.map(courseName => {
                // Create the virtual course ID to match against
                const virtualCourseId = `virtual-course-${groupProperties.anid}-${courseName.toLowerCase().replace(/\s+/g, '-')}`;
                
                // Count students actually assigned to this course
                const courseStudents = invitedUsers.filter(user => {
                    // Check if user has courseId matching this course
                    if (user.courseId === virtualCourseId) {
                        return true;
                    }
                    
                    // Also check legacy profile-based course assignment for backward compatibility
                    const userWithProfile = user as InvitedUserWithProfile;
                    if (userWithProfile.profile?.course) {
                        const profileCourseName = userWithProfile.profile.course.toLowerCase().replace(/\s+/g, '-');
                        const currentCourseName = courseName.toLowerCase().replace(/\s+/g, '-');
                        return profileCourseName === currentCourseName;
                    }
                    
                    return false;
                });
                
                // Count admins (for now, we'll show all admins for each course)
                // In the future, you might want to implement course-specific admin assignments
                const totalAdmins = groupAdmins.length;

                return {
                    courseName,
                    studentCount: courseStudents.length,
                    adminCount: totalAdmins,
                    loading: false
                };
            });

            dispatch(setCourseStatistics(updatedStatistics));

        } catch (error) {
            console.error('Error loading course statistics:', error);
            dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, 'Failed to load course statistics'));
            
            // Set error state for all courses
            const errorStatistics: CourseStatistics[] = courses.map(courseName => ({
                courseName,
                studentCount: 0,
                adminCount: 0,
                loading: false
            }));
            
            dispatch(setCourseStatistics(errorStatistics));
        }
    }
}