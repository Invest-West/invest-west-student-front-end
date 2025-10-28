import CourseRequestRepository from '../../api/repositories/CourseRequestRepository';
import {
    REQUEST_STATUS_ERROR,
    REQUEST_STATUS_NONE,
    REQUEST_STATUS_SUBMITTING,
    REQUEST_STATUS_SUCCESS
} from '../../pages/admin/components/AddCourseRequestDialog';

export const TOGGLE_COURSE_REQUEST_DIALOG = 'TOGGLE_COURSE_REQUEST_DIALOG';
export const toggleCourseRequestDialog = () => {
    return {
        type: TOGGLE_COURSE_REQUEST_DIALOG
    }
};

export const COURSE_REQUEST_DIALOG_INPUT_CHANGED = 'COURSE_REQUEST_DIALOG_INPUT_CHANGED';
export const handleInputChanged = event => {
    return {
        type: COURSE_REQUEST_DIALOG_INPUT_CHANGED,
        event
    }
};

export const COURSE_REQUEST_ADD_BUTTON_CLICKED = 'COURSE_REQUEST_ADD_BUTTON_CLICKED';
export const COURSE_REQUEST_STATUS_CHANGED = 'COURSE_REQUEST_STATUS_CHANGED';

export const submitCourseRequest = () => {
    return async (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const {courseName} = getState().manageCourseRequestDialog;

        // Mark button as clicked for validation
        dispatch({
            type: COURSE_REQUEST_ADD_BUTTON_CLICKED
        });

        // Validate course name
        if (courseName.trim().length === 0) {
            return;
        }

        // Set status to submitting
        dispatch({
            type: COURSE_REQUEST_STATUS_CHANGED,
            status: REQUEST_STATUS_SUBMITTING
        });

        try {
            // Get the admin's university ID (their anid)
            const universityId = currentUser.anid;

            // Submit the course request
            await new CourseRequestRepository().createCourseRequest(
                courseName.trim(),
                universityId
            );

            // Set status to success
            dispatch({
                type: COURSE_REQUEST_STATUS_CHANGED,
                status: REQUEST_STATUS_SUCCESS
            });

            // Close dialog after 2 seconds
            setTimeout(() => {
                dispatch(toggleCourseRequestDialog());
            }, 2000);

        } catch (error) {
            console.error('Error submitting course request:', error);
            dispatch({
                type: COURSE_REQUEST_STATUS_CHANGED,
                status: REQUEST_STATUS_ERROR,
                errorMessage: error.response?.data?.detail || error.message || "Failed to submit course request"
            });
        }
    }
};
