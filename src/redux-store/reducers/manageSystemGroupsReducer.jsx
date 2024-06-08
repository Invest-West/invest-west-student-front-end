import * as manageSystemGroupsActions from '../actions/manageSystemGroupsActions';
import * as authActions from '../actions/authActions';

const initState = {
    systemGroups: [],
    loadingGroups: false,
    groupsLoaded: false
};

const manageSystemGroupsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case manageSystemGroupsActions.LOADING_SYSTEM_GROUPS:
            return {
                ...state,
                systemGroups: [],
                loadingGroups: true,
                groupsLoaded: false
            };
        case manageSystemGroupsActions.FINISHED_LOADING_SYSTEM_GROUPS:
            return {
                ...state,
                systemGroups: action.groups,
                loadingGroups: false,
                groupsLoaded: true
            };
        case manageSystemGroupsActions.SYSTEM_GROUPS_CHANGED:
            return {
                ...state,
                systemGroups: action.groups
            };
        default:
            return state;
    }
}

export default manageSystemGroupsReducer;