import * as groupAdminsTableActions from '../actions/groupAdminsTableActions';
import * as authActions from '../actions/authActions';
import {ADD_NEW_GROUP_ADMIN_STATUS_NONE} from '../../pages/admin/components/GroupAdminsTable';

const initState = {
    tableGroup: null,

    groupAdmins: [],
    groupAdminsLoaded: false,
    loadingGroupAdmins: false,

    searchText: '',
    inSearchMode: false,

    filterCourse: 'all', // 'all' or specific course anid

    page: 0,
    rowsPerPage: 10,

    addNewGroupAdminDialogOpen: false,
    newGroupAdminEmail: '',
    addNewGroupAdminStatus: ADD_NEW_GROUP_ADMIN_STATUS_NONE
};

const groupAdminsTableReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_SET_GROUP:
            return {
                ...initState,
                tableGroup: JSON.parse(JSON.stringify(action.group))
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_LOADING_GROUP_ADMINS:
            return {
                ...state,
                groupAdmins: [],
                groupAdminsLoaded: false,
                loadingGroupAdmins: true
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_FINISHED_LOADING_GROUP_ADMINS:
            return {
                ...state,
                groupAdmins: [...action.groupAdmins],
                groupAdminsLoaded: true,
                loadingGroupAdmins: false
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.newPage
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                rowsPerPage: action.value
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                searchText: state.inSearchMode ? '' : state.searchText,
                inSearchMode: !state.inSearchMode
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_HANDLE_INPUT_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_TOGGLE_ADD_NEW_GROUP_ADMIN_DIALOG:
            return {
                ...state,
                addNewGroupAdminDialogOpen: !state.addNewGroupAdminDialogOpen,
                newGroupAdminEmail: '',
                addNewGroupAdminStatus: ADD_NEW_GROUP_ADMIN_STATUS_NONE
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_CHANGED:
            return {
                ...state,
                groupAdmins: [...action.groupAdmins]
            };
        case groupAdminsTableActions.GROUP_ADMINS_TABLE_ADD_NEW_GROUP_STATUS_CHANGED:
            return {
                ...state,
                addNewGroupAdminStatus: action.status
            };
        default:
            return state;
    }
};

export default groupAdminsTableReducer;