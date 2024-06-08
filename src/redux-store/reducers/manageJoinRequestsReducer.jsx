import * as manageJoinRequestsActions from '../actions/manageJoinRequestsActions';
import * as authActions from '../actions/authActions';

const initState = {
    joinRequests: [],
    loadingJoinRequests: false,
    joinRequestsLoaded: false,

    searchText: '',
    inSearchMode: false,
    matchedJoinRequests: [],

    page: 0,
    rowsPerPage: 5
};

const manageJoinRequestsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case manageJoinRequestsActions.MANAGE_JOIN_REQUESTS_LOADING_JOIN_REQUESTS:
            return {
                ...state,
                joinRequests: [],
                loadingJoinRequests: true,
                joinRequestsLoaded: false
            };
        case manageJoinRequestsActions.MANAGE_JOIN_REQUESTS_FINISHED_LOADING_JOIN_REQUESTS:
            return {
                ...state,
                joinRequests: [...action.joinRequests],
                loadingJoinRequests: false,
                joinRequestsLoaded: true
            };
        case manageJoinRequestsActions.MANAGE_JOIN_REQUESTS_TABLE_PAGE_CHANGED:
            return {
                ...state,
                page: action.newPage
            };
        case manageJoinRequestsActions.MANAGE_JOIN_REQUESTS_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value
            };
        case manageJoinRequestsActions.MANAGE_JOIN_REQUESTS_TABLE_INPUT_CHANGED:
            return {
                ...state,
                searchText: action.searchText,
                matchedJoinRequests: action.matchedJoinRequests
            };
        case manageJoinRequestsActions.MANAGE_JOIN_REQUESTS_TABLE_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                inSearchMode: action.enter,
                searchText: !action.enter ? '' : state.searchText,
                matchedJoinRequests: action.matchedJoinRequests
            };
        case manageJoinRequestsActions.MANAGE_JOIN_REQUESTS_CHANGED:
            return {
                ...state,
                joinRequests: [...action.joinRequests]
            };
        default:
            return state;
    }
};

export default manageJoinRequestsReducer;