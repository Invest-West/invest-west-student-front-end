import * as selectProjectVisibilityActions from '../actions/selectProjectVisibilityActions';
import * as authActions from '../actions/authActions';

const initState = {
    projectVisibilitySetting: -1,
    project: null
};

const selectProjectVisibilityReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case selectProjectVisibilityActions.SELECT_PROJECT_VISIBILITY_SET_PROJECT:
            return {
                ...initState,
                project: JSON.parse(JSON.stringify(action.project))
            };
        case selectProjectVisibilityActions.HANDLE_PROJECT_VISIBILITY_SETTING_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };
        default:
            return state;
    }
}

export default selectProjectVisibilityReducer;