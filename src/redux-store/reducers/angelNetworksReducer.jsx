import * as angelNetworksActions from '../actions/angelNetworksActions';
import * as authActions from '../actions/authActions';

const initState = {
    angelNetworks: [],
    loadingAngelNetworks: false,
    angelNetworksLoaded: false,
    page: 0,
    rowsPerPage: 5,

    searchText: '', // string typed to search angel networks by name
    inSearchMode: false, // when the search button is clicked --> show X icon to exit search mode
    matchedAngelNetworks: [], // angel networks that match

    // Delete state
    deletingUniversityId: null,
    deletingCourseId: null,
    deleteError: null
};

const angelNetworksReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case angelNetworksActions.LOADING_ANGEL_NETWORKS:
            return {
                ...state,
                loadingAngelNetworks: true,
                angelNetworksLoaded: false,
                angelNetworks: []
            };
        case angelNetworksActions.FINISHED_LOADING_ANGEL_NETWORKS:
            return {
                ...state,
                loadingAngelNetworks: false,
                angelNetworksLoaded: true,
                angelNetworks: action.hasOwnProperty('angelNetworks') ? [...action.angelNetworks] : []
            };
        case angelNetworksActions.ANGEL_NETWORKS_TABLE_PAGE_CHANGED:
            return {
                ...state,
                page: action.newPage
            };
        case angelNetworksActions.ANGEL_NETWORKS_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value
            };
        case angelNetworksActions.ANGEL_NETWORKS_TABLE_INPUT_CHANGED:
            return {
                ...state,
                searchText: action.searchText,
                matchedAngelNetworks: [...action.matchedAngelNetworks]
            };
        case angelNetworksActions.TOGGLE_SEARCH_MODE_IN_ANGEL_NETWORKS_TABLE:
            return {
                ...state,
                inSearchMode: action.enter,
                searchText: !action.enter ? '' : state.searchText,
                matchedAngelNetworks: [...action.matchedAngelNetworks]
            };
        case angelNetworksActions.ANGEL_NETWORKS_IN_TABLE_CHANGED:
            return {
                ...state,
                angelNetworks: [...action.angelNetworks]
            };
        // Delete university actions
        case angelNetworksActions.DELETING_UNIVERSITY:
            return {
                ...state,
                deletingUniversityId: action.universityId,
                deleteError: null
            };
        case angelNetworksActions.DELETED_UNIVERSITY:
            return {
                ...state,
                deletingUniversityId: null,
                angelNetworks: [...action.angelNetworks],
                deleteError: null
            };
        case angelNetworksActions.DELETE_UNIVERSITY_ERROR:
            return {
                ...state,
                deletingUniversityId: null,
                deleteError: action.error
            };
        // Delete course actions
        case angelNetworksActions.DELETING_COURSE:
            return {
                ...state,
                deletingCourseId: action.courseId,
                deleteError: null
            };
        case angelNetworksActions.DELETED_COURSE:
            return {
                ...state,
                deletingCourseId: null,
                deleteError: null
            };
        case angelNetworksActions.DELETE_COURSE_ERROR:
            return {
                ...state,
                deletingCourseId: null,
                deleteError: action.error
            };
        default:
            return state;
    }
};

export default angelNetworksReducer;