export const SELECT_PROJECT_VISIBILITY_SET_PROJECT = 'SELECT_PROJECT_VISIBILITY_SET_PROJECT';
export const setProject = project => {
    return {
        type: SELECT_PROJECT_VISIBILITY_SET_PROJECT,
        project
    }
};

export const HANDLE_PROJECT_VISIBILITY_SETTING_CHANGED = 'HANDLE_PROJECT_VISIBILITY_SETTING_CHANGED';
export const handleProjectVisibilityChanged = (event) => {
    return {
        type: HANDLE_PROJECT_VISIBILITY_SETTING_CHANGED,
        event
    }
};