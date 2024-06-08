import * as pledgesTableActions from '../actions/pledgesTableActions';
import * as authActions from '../actions/authActions';

const initState = {
    project: null,

    pledges: [],
    pledgesLoaded: false,
    loadingPledges: false,

    searchText: '',
    inSearchMode: false,
    matchedPledges: [],

    page: 0,
    rowsPerPage: 10
};

const pledgesTableReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case pledgesTableActions.MANAGE_PLEDGES_TABLE_SET_PROJECT:
            return {
                ...initState,
                project: JSON.parse(JSON.stringify(action.project))
            };
        case pledgesTableActions.MANAGE_PLEDGES_TABLE_LOADING_PLEDGES:
            return {
                ...state,
                pledges: [],
                pledgesLoaded: false,
                loadingPledges: true
            };
        case pledgesTableActions.MANAGE_PLEDGES_TABLE_FINISHED_LOADING_PLEDGES:
            return {
                ...state,
                pledges: [...action.pledges],
                pledgesLoaded: true,
                loadingPledges: false
            };
        case pledgesTableActions.MANAGE_PLEDGES_TABLE_PAGE_CHANGED:
            return {
                ...state,
                page: action.newPage
            };
        case pledgesTableActions.MANAGE_PLEDGES_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value,
                page: 0
            };
        case pledgesTableActions.MANAGE_PLEDGES_TABLE_INPUT_CHANGED:
            return {
                ...state,
                searchText: action.searchText,
                matchedPledges: [...action.matchedPledges]
            };
        case pledgesTableActions.MANAGE_PLEDGES_TABLE_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                inSearchMode: action.enter,
                searchText: !action.enter ? '' : state.searchText,
                matchedPledges: [...action.matchedPledges]
            };
        case pledgesTableActions.MANAGE_PLEDGES_TABLE_PLEDGES_CHANGED:
            return {
                ...state,
                pledges: [...action.pledges]
            };
        default:
            return state;
    }
};

export default pledgesTableReducer;