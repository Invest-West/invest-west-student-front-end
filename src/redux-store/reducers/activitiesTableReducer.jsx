import * as activitiesTableActions from '../actions/activitiesTableActions';
import * as authActions from '../actions/authActions';

const initState = {
    tableUser: null,

    activities: [],
    activitiesLoaded: false,
    loadingActivities: false,

    page: 0,
    rowsPerPage: 10
};

const activitiesTableReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case activitiesTableActions.ACTIVITIES_TABLE_SET_TABLE_USER:
            return {
                ...initState,
                tableUser: JSON.parse(JSON.stringify(action.user))
            };
        case activitiesTableActions.ACTIVITIES_TABLE_LOADING_ACTIVITIES:
            return {
                ...state,
                activities: [],
                activitiesLoaded: false,
                loadingActivities: true
            };
        case activitiesTableActions.ACTIVITIES_TABLE_FINISHED_LOADING_ACTIVITIES:
            return {
                ...state,
                activities: [...action.activities],
                activitiesLoaded: true,
                loadingActivities: false
            };
        case activitiesTableActions.ACTIVITIES_IN_TABLE_CHANGED:
            return {
                ...state,
                activities: [...action.activities]
            };
        case activitiesTableActions.ACTIVITIES_TABLE_PAGE_CHANGED:
            return {
                ...state,
                page: action.newPage
            };
        case activitiesTableActions.ACTIVITIES_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value
            };
        default:
            return state;
    }
};

export default activitiesTableReducer;