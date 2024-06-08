import * as invitationDialogActions from '../actions/invitationDialogActions';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as authActions from '../actions/authActions';
import {
    SEND_INVITATION_NONE,
    SEND_INVITATION_SUCCESS
} from '../../pages/admin/components/InvitationDialog';

const initState = {
    invitationDialogOpen: false,

    title: DB_CONST.USER_TITLES[0],
    firstName: '',
    lastName: '',
    email: '',
    userType: '',

    sendButtonClick: false,
    sendResult: SEND_INVITATION_NONE,
    sendStatusExtraInfo: null
};

const invitationDialogReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case invitationDialogActions.TOGGLE_INVITATION_DIALOG:
            return {
                ...initState,
                invitationDialogOpen: !state.invitationDialogOpen
            };
        case invitationDialogActions.INVITATION_DIALOG_INPUT_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.value
            };
        case invitationDialogActions.INVITATION_DIALOG_SEND_BUTTON_CLICKED:
            return {
                ...state,
                sendButtonClick: true
            };
        case invitationDialogActions.INVITATION_DIALOG_SEND_RESULT_CHANGED:
            return {
                ...state,
                sendResult: action.result,

                title: action.result === SEND_INVITATION_SUCCESS ? DB_CONST.USER_TITLES[0] : state.title,
                firstName: action.result === SEND_INVITATION_SUCCESS ? '' : state.firstName,
                lastName: action.result === SEND_INVITATION_SUCCESS ? '' : state.lastName,
                email: action.result === SEND_INVITATION_SUCCESS ? '' : state.email,
                userType: action.result === SEND_INVITATION_SUCCESS ? '' : state.userType,

                sendButtonClick: action.result === SEND_INVITATION_SUCCESS ? false : state.sendButtonClick,

                sendStatusExtraInfo: action.extraInfo
            };
        default:
            return state;
    }
};

export default invitationDialogReducer;