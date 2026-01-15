import * as editUserActions from '../actions/editUserActions';
import * as authActions from '../actions/authActions';

const initState = {
    // this variable is to ensure the user's profile won't be able to be edited
    // by the course admins if they don't belong to that course
    // if the originalUser has the "coursesUserIsIn" property
    // and the course admins do not belong to the user's home course,
    // then they won't be able to edit this user's profile.
    allowEditing: true,

    // original user object
    originalUser: null,
    // user edited object
    userEdited: null,

    // when a new director is being added
    addNewDirector: false,
    newDirectorText: ''
};

// Reducer
const editUserReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case editUserActions.SET_ORIGINAL_USER_AND_EDITED_USER:
            return {
                ...state,
                originalUser: action.user,
                userEdited: action.user,
                allowEditing: action.allowEditing
            };
        case editUserActions.EDIT_PERSONAL_INFORMATION:
            return {
                ...state,
                userEdited: {
                    ...state.userEdited,
                    [action.edit.property]: action.edit.value
                }
            };
        case editUserActions.EDIT_ORDINARY_BUSINESS_PROFILE_INFORMATION:
            return {
                ...state,
                userEdited: {
                    ...state.userEdited,
                    BusinessProfile: {
                        ...state.userEdited.BusinessProfile,
                        [action.edit.property]: action.edit.value
                    }
                }
            };
        case editUserActions.RESET_PERSONAL_INFORMATION:
            return {
                ...state,
                userEdited: {
                    ...state.userEdited,
                    title: state.originalUser.title,
                    firstName: state.originalUser.firstName,
                    lastName: state.originalUser.lastName,
                    email: state.originalUser.email,
                    linkedin: !state.originalUser.linkedin ? '' : state.originalUser.linkedin,
                    company: !state.originalUser.company ? '' : state.originalUser.company,
                    companyName: !state.originalUser.companyName ? '' : state.originalUser.companyName,
                    description: !state.originalUser.description ? '' : state.originalUser.description
                }
            };
        case editUserActions.RESET_BUSINESS_PROFILE:
            return {
                ...state,
                userEdited: {
                    ...state.userEdited,
                    BusinessProfile: JSON.parse(JSON.stringify(state.originalUser.BusinessProfile))
                }
            };
        case authActions.CURRENT_USER_PROFILE_HAS_CHANGED:
            return {
                ...state,
                originalUser: JSON.parse(JSON.stringify(action.userChanged)),
                userEdited: JSON.parse(JSON.stringify(action.userChanged))
            };
        case editUserActions.EDIT_USER_ORIGINAL_USER_CHANGED:
            return {
                ...state,
                originalUser: JSON.parse(JSON.stringify(action.userChanged)),
                userEdited: JSON.parse(JSON.stringify(action.userChanged))
            }
        default:
            return state;
    }
};

export default editUserReducer;