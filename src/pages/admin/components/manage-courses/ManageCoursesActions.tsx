import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import React from "react";
import {SystemAttributes} from "../../../../models/system_attributes";
import SystemAttributesRepository from "../../../../api/repositories/SystemAttributesRepository";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

export enum ManageCoursesEvents {
    SetCourses = "ManageCoursesEvents.SetCourses",
    ToggleAddNewCourse = "ManageCoursesEvents.ToggleAddNewCourse",
    AddNewCourseTextChanged = "ManageCoursesEvents.AddNewCourseTextChanged",
    SavingCoursesChanges = "ManageCoursesEvents.SavingCoursesChanges",
    CompletedSavingCoursesChanges = "ManageCoursesEvents.CompletedSavingCoursesChanges"
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

export const setCourses: ActionCreator<any> = (courses: string[]) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SetCoursesAction = {
            type: ManageCoursesEvents.SetCourses,
            courses: [...courses]
        };
        return dispatch(action);
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
        const systemAttributes: SystemAttributes | null = getState().ManageSystemAttributesState.systemAttributes;
        if (!systemAttributes) {
            return;
        }
        return dispatch(setCourses([...systemAttributes.Courses]));
    }
}

export const saveCoursesChanges: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const systemAttributes: SystemAttributes | null = JSON.parse(JSON.stringify(getState().ManageSystemAttributesState.systemAttributes));
        if (!systemAttributes) {
            return;
        }
        const courses: string[] = [...getState().ManageCoursesLocalState.courses];
        const completeAction: CompletedSavingCoursesChangesAction = {
            type: ManageCoursesEvents.CompletedSavingCoursesChanges
        };
        try {
            systemAttributes.Courses = courses;
            dispatch({
                type: ManageCoursesEvents.SavingCoursesChanges
            });
            await new SystemAttributesRepository().updateSystemAttributes(systemAttributes);
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, completeAction.error));
            return dispatch(completeAction);
        }
    }
}