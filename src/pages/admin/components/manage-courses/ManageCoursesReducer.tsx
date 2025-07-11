import {
    AddNewCourseTextChangedAction,
    CompletedSavingCoursesChangesAction,
    ManageCoursesAction,
    ManageCoursesEvents,
    SetCoursesAction
} from "./ManageCoursesActions";
import Error from "../../../../models/error";

export interface ManageCoursesState {
    addingNewCourse: boolean;
    newCourse: string;
    courses: string[];
    savingCourses: boolean;
    errorSavingCourses?: Error;
}

const initialState: ManageCoursesState = {
    addingNewCourse: false,
    newCourse: "",
    courses: [],
    savingCourses: false
}

export const isSavingCoursesChanges = (state: ManageCoursesState) => {
    return state.savingCourses;
}

export const manageCoursesReducer = (state = initialState, action: ManageCoursesAction) => {
    switch (action.type) {
        case ManageCoursesEvents.SetCourses:
            const setCoursesAction: SetCoursesAction = action as SetCoursesAction;
            return {
                ...state,
                courses: setCoursesAction.courses
            }
        case ManageCoursesEvents.ToggleAddNewCourse:
            return {
                ...state,
                addingNewCourse: !state.addingNewCourse,
                newCourse: ""
            }
        case ManageCoursesEvents.AddNewCourseTextChanged:
            const addNewCourseTextChangedAction: AddNewCourseTextChangedAction = action as AddNewCourseTextChangedAction;
            return {
                ...state,
                newCourse: addNewCourseTextChangedAction.value
            }
        case ManageCoursesEvents.SavingCoursesChanges:
            return {
                ...state,
                savingCourses: true,
                errorSavingCourses: undefined
            }
        case ManageCoursesEvents.CompletedSavingCoursesChanges:
            const completedSavingCoursesChanges: CompletedSavingCoursesChangesAction = action as CompletedSavingCoursesChangesAction;
            return {
                ...state,
                savingCourses: false,
                errorSavingCourses: completedSavingCoursesChanges.error !== undefined
                    ? {detail: completedSavingCoursesChanges.error} : state.errorSavingCourses
            }
        default:
            return state;
    }
}

export default manageCoursesReducer;