import * as invitedUsersActions from '../actions/invitedUsersActions';
import * as authActions from '../actions/authActions';
import {FILTER_GROUP_MEMBERS_ALL, FILTER_REGISTRATION_STATUS_ALL} from '../../pages/admin/components/InvitedUsers';

const initState = {
    invitedUsers: [],
    invitedUsersLoaded: false,
    invitedUsersBeingLoaded: false,

    invitedUsersPage: 0,
    invitedUsersRowsPerPage: 5,

    filterRegistrationStatus: FILTER_REGISTRATION_STATUS_ALL,
    filterUserType: 0, // all user types
    filterGroup: "null", // no group selected --> all
    filterMembers: FILTER_GROUP_MEMBERS_ALL, // display all members (including home and foreign members) for group admins

    invitedUserSearchText: '',
    invitedUsersInSearchMode: false,

    requestingCsv: false,

    addingMembersFromOneGroupToAnotherGroup: false,

    matchedInvitedUsers: []
};

const invitedUsersReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case invitedUsersActions.LOADING_INVITED_USERS:
            return {
                ...state,
                invitedUsers: [],
                invitedUsersLoaded: false,
                invitedUsersBeingLoaded: true
            };
        case invitedUsersActions.FINISHED_LOADING_INVITED_USERS:
            return {
                ...state,
                invitedUsers: [...action.invitedUsers],
                matchedInvitedUsers: [...action.invitedUsers],
                invitedUsersLoaded: true,
                invitedUsersBeingLoaded: false
            };
        case invitedUsersActions.INVITED_USERS_TOGGLE_SEARCH_MODE:
            return {
                ...state,
                invitedUsersInSearchMode: !state.invitedUsersInSearchMode,
                invitedUserSearchText: state.invitedUsersInSearchMode ? '' : state.invitedUserSearchText,
                invitedUsersPage: 0,
                matchedInvitedUsers: action.matchedInvitedUsers
            };
        case invitedUsersActions.INVITED_USERS_SEARCH_VARIABLE_CHANGED:
            return {
                ...state,
                [action.name]: action.value,
                matchedInvitedUsers: action.matchedInvitedUsers,
                invitedUsersPage: 0
            };
        case invitedUsersActions.INVITED_USERS_CHANGE_PAGE:
            return {
                ...state,
                invitedUsersPage: action.newPage
            };
        case invitedUsersActions.INVITED_USERS_CHANGE_ROWS_PER_PAGE:
            return {
                ...state,
                invitedUsersRowsPerPage: parseInt(action.rows, 10),
                invitedUsersPage: 0
            };
        case invitedUsersActions.INVITED_USERS_CHANGED:
            return {
                ...state,
                invitedUsers: action.invitedUsers,
                matchedInvitedUsers: action.matchedInvitedUsers
            };
        case invitedUsersActions.INVITED_USERS_REQUESTING_CSV_STATE_CHANGED:
            return {
                ...state,
                requestingCsv: action.value
            }
        case invitedUsersActions.INVITED_USERS_ADDING_MEMBERS_FROM_ONE_GROUP_TO_ANOTHER_GROUP_STATE_CHANGED:
            return {
                ...state,
                addingMembersFromOneGroupToAnotherGroup: action.value
            }
        default:
            return state;
    }
};

export default invitedUsersReducer;