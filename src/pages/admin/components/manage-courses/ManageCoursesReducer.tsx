import {
    AddNewCourseTextChangedAction,
    CompletedSavingCoursesChangesAction,
    ManageCoursesAction,
    ManageCoursesEvents,
    SetCoursesAction,
    SetCourseStatisticsAction,
    UpdateCourseStatisticAction
} from "./ManageCoursesActions";
import Error from "../../../../models/error";

export interface CourseStatistics {
    courseName: string;
    studentCount: number;
    adminCount: number;
    loading: boolean;
}

export interface ManageCoursesState {
    addingNewCourse: boolean;
    newCourse: string;
    courses: string[];
    courseStatistics: CourseStatistics[];
    savingCourses: boolean;
    errorSavingCourses?: Error;
    loadingStatistics: boolean;
}

const initialState: ManageCoursesState = {
    addingNewCourse: false,
    newCourse: "",
    courses: [],
    courseStatistics: [],
    savingCourses: false,
    loadingStatistics: false
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
        case ManageCoursesEvents.LoadingCourseStatistics:
            return {
                ...state,
                loadingStatistics: true
            }
        case ManageCoursesEvents.SetCourseStatistics:
            const setCourseStatisticsAction: SetCourseStatisticsAction = action as SetCourseStatisticsAction;
            return {
                ...state,
                courseStatistics: setCourseStatisticsAction.courseStatistics,
                loadingStatistics: false
            }
        case ManageCoursesEvents.UpdateCourseStatistic:
            const updateCourseStatisticAction: UpdateCourseStatisticAction = action as UpdateCourseStatisticAction;
            const updatedStatistics = state.courseStatistics.map(stat => 
                stat.courseName === updateCourseStatisticAction.courseName
                    ? {
                        ...stat,
                        studentCount: updateCourseStatisticAction.studentCount,
                        adminCount: updateCourseStatisticAction.adminCount,
                        loading: false
                    }
                    : stat
            );
            return {
                ...state,
                courseStatistics: updatedStatistics
            }
        default:
            return state;
    }
}

export default manageCoursesReducer;