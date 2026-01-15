import {
    COURSE_REQUEST_ADD_BUTTON_CLICKED,
    COURSE_REQUEST_DIALOG_INPUT_CHANGED,
    COURSE_REQUEST_STATUS_CHANGED,
    TOGGLE_COURSE_REQUEST_DIALOG
} from '../actions/courseRequestDialogActions';
import {REQUEST_STATUS_NONE} from '../../pages/admin/components/AddCourseRequestDialog';

const initialState = {
    dialogOpen: false,
    courseName: '',
    submitStatus: REQUEST_STATUS_NONE,
    errorMessage: '',
    addButtonClicked: false
};

const courseRequestDialogReducer = (state = initialState, action) => {
    switch (action.type) {
        case TOGGLE_COURSE_REQUEST_DIALOG:
            return {
                ...initialState, // Reset to initial state when toggling
                dialogOpen: !state.dialogOpen
            };

        case COURSE_REQUEST_DIALOG_INPUT_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };

        case COURSE_REQUEST_ADD_BUTTON_CLICKED:
            return {
                ...state,
                addButtonClicked: true
            };

        case COURSE_REQUEST_STATUS_CHANGED:
            return {
                ...state,
                submitStatus: action.status,
                errorMessage: action.errorMessage || ''
            };

        default:
            return state;
    }
};

export default courseRequestDialogReducer;
