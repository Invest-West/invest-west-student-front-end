import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as myUtils from '../../utils/utils';
import * as emailUtils from '../../utils/emailUtils';
import {
    SEND_INVITATION_ERROR_HAPPENED,
    SEND_INVITATION_INVITED_BEFORE,
    SEND_INVITATION_PROCESSING,
    SEND_INVITATION_SUCCESS,
    SEND_INVITATION_USER_CANNOT_BE_INVITED
} from '../../pages/admin/components/InvitationDialog';
import * as ROUTES from '../../router/routes';
import * as feedbackSnackbarActions from './feedbackSnackbarActions';
import * as utils from "../../utils/utils";

export const TOGGLE_INVITATION_DIALOG = 'TOGGLE_INVITATION_DIALOG';
export const toggleInvitationDialog = () => {
    return {
        type: TOGGLE_INVITATION_DIALOG
    }
};

export const INVITATION_DIALOG_INPUT_CHANGED = 'INVITATION_DIALOG_INPUT_CHANGED';
export const handleInputChanged = event => {
    return {
        type: INVITATION_DIALOG_INPUT_CHANGED,
        event
    }
};

export const INVITATION_DIALOG_SEND_BUTTON_CLICKED = 'INVITATION_DIALOG_SEND_BUTTON_CLICKED';
export const INVITATION_DIALOG_SEND_RESULT_CHANGED = 'INVITATION_DIALOG_SEND_RESULT_CHANGED';
export const sendInvitation = () => {
    return (dispatch, getState) => {
        dispatch({
            type: INVITATION_DIALOG_SEND_BUTTON_CLICKED
        });

        const {
            title,
            firstName,
            lastName,
            email,
            userType
        } = getState().manageInvitationDialog;

        if (title === DB_CONST.USER_TITLES[0]
            || firstName.trim().length === 0
            || lastName.trim().length === 0
            || email.trim().length === 0
            || userType.trim().length === 0) {
            return;
        }

        dispatch({
            type: INVITATION_DIALOG_SEND_RESULT_CHANGED,
            result: SEND_INVITATION_PROCESSING
        });

        //TODO: If the invitation has been sent to this user, check if this user belongs to this course
        // If yes, display a message saying this user is already an investor/issuer in this course
        // Otherwise, display a message saying this user is an investor/issuer in ABC course.
        // Then, ask if the admin wants to invite this user to his course?
        // Yes --> Send a notification to the user
        // No --> Dismiss

        const currentGroupAdmin = getState().auth.user;
        const groupUserName = getState().manageGroupFromParams.groupUserName;
        const groupProperties = getState().manageGroupFromParams.groupProperties;
        const clubAttributes = getState().manageClubAttributes.clubAttributes;

        realtimeDBUtils
            .loadAngelNetworksInvitedAUser(email)
            .then(angelNetworksInvitedUser => {

                let invitedBefore = false;
                let userIsAnIssuerOfAnotherGroup = false;

                for (let angelNetworkInvitedUser of angelNetworksInvitedUser) {
                    // user has been invited by this group before
                    if (angelNetworkInvitedUser.Invitor.anid === groupProperties.anid) {
                        invitedBefore = true;
                        dispatch({
                            type: INVITATION_DIALOG_SEND_RESULT_CHANGED,
                            result: SEND_INVITATION_INVITED_BEFORE,
                            extraInfo: angelNetworkInvitedUser.Invitee
                        });
                        break;
                    }

                    // user is an issuer of another course
                    if (angelNetworkInvitedUser.Invitee.type === DB_CONST.TYPE_ISSUER && angelNetworkInvitedUser.Invitor.anid !== groupProperties.anid) {
                        userIsAnIssuerOfAnotherGroup = true;
                        dispatch({
                            type: INVITATION_DIALOG_SEND_RESULT_CHANGED,
                            result: SEND_INVITATION_USER_CANNOT_BE_INVITED,
                            extraInfo: null
                        });
                        break;
                    }
                }

                if (invitedBefore) {
                    return;
                }

                if (userIsAnIssuerOfAnotherGroup) {
                    return;
                }

                // the user has not been invited before by this course
                if (!invitedBefore) {
                    // check if user is an admin
                    realtimeDBUtils
                        .doesUserExist(email)
                        .then(result => {
                            // user is an admin
                            if (result.userExists && result.hasOwnProperty('userIsAnAdmin') && result.userIsAnAdmin) {
                                dispatch({
                                    type: INVITATION_DIALOG_SEND_RESULT_CHANGED,
                                    result: SEND_INVITATION_USER_CANNOT_BE_INVITED,
                                    extraInfo: null
                                });
                                return;
                            }

                            const invitedID = firebase
                                .database()
                                .ref(DB_CONST.INVITED_USERS_CHILD)
                                .push()
                                .key;

                            const invitedUser = {
                                title: title,
                                firstName: firstName,
                                lastName: lastName,
                                email: email.toLowerCase(),
                                type: parseInt(userType),
                                // registered or not registered
                                status: DB_CONST.INVITED_USER_NOT_REGISTERED,
                                // id of this invited user
                                id: invitedID,
                                // date invited
                                invitedDate: myUtils.getCurrentDate(),
                                invitedBy: groupProperties.anid
                            };

                            // send invitation email via server
                            emailUtils
                                .sendEmail({
                                    serverURL: clubAttributes.serverURL,
                                    emailType: emailUtils.EMAIL_INVITATION,
                                    data: {
                                        groupName: groupProperties.displayName,
                                        groupLogo: utils.getLogoFromGroup(utils.GET_PLAIN_LOGO, groupProperties),
                                        groupWebsite: groupProperties.website,
                                        groupContactUs: `${clubAttributes.websiteURL}/groups/${groupProperties.groupUserName}/contact-us`,
                                        sender: currentGroupAdmin.email,
                                        receiver: invitedUser.email,
                                        receiverName: `${invitedUser.title} ${invitedUser.firstName} ${invitedUser.lastName}`,
                                        userType:
                                            invitedUser.type === DB_CONST.TYPE_ISSUER
                                                ?
                                                "Issuer"
                                                :
                                                "Investor"
                                        ,
                                        signupURL:
                                            groupUserName
                                                ?
                                                `${clubAttributes.websiteURL}/groups/${groupUserName}/signup/${invitedUser.id}`
                                                :
                                                `${clubAttributes.websiteURL}/signup/${invitedUser.id}`
                                    }
                                })
                                .then(() => {
                                    // add invited user to firebase when the email has been successfully sent
                                    firebase
                                        .database()
                                        .ref(DB_CONST.INVITED_USERS_CHILD)
                                        .child(invitedID)
                                        .set(invitedUser)
                                        .then(() => {

                                            // track invitation sent activity
                                            realtimeDBUtils
                                                .trackActivity({
                                                    userID: currentGroupAdmin.id,
                                                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                                                    interactedObjectLocation: DB_CONST.INVITED_USERS_CHILD,
                                                    interactedObjectID: invitedUser.id,
                                                    activitySummary:
                                                        realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_SENT_A_USER_INVITATION
                                                            .replace("%userName%", `${invitedUser.firstName} ${invitedUser.lastName}`)
                                                            .replace("%group%", groupProperties.displayName)
                                                            .replace("%userType%", invitedUser.type === DB_CONST.TYPE_ISSUER ? "Issuer" : "Investor")
                                                    ,
                                                    action: ROUTES.USER_PROFILE_INVEST_WEST_SUPER
                                                        .replace(":userID", invitedUser.id)
                                                    ,
                                                    value: invitedUser
                                                });

                                            dispatch({
                                                type: INVITATION_DIALOG_SEND_RESULT_CHANGED,
                                                result: SEND_INVITATION_SUCCESS,
                                                extraInfo: null
                                            });

                                            dispatch({
                                                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                                                message: "Email has been sent.",
                                                color: "primary",
                                                position: "bottom"
                                            });
                                        });
                                })
                                .catch(error => {
                                    dispatch({
                                        type: INVITATION_DIALOG_SEND_RESULT_CHANGED,
                                        result: SEND_INVITATION_ERROR_HAPPENED,
                                        extraInfo: null
                                    });

                                    dispatch({
                                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                                        message: "Error happened.",
                                        color: "error",
                                        position: "bottom"
                                    });
                                });
                        })
                        .catch(error => {
                            dispatch({
                                type: INVITATION_DIALOG_SEND_RESULT_CHANGED,
                                result: SEND_INVITATION_ERROR_HAPPENED,
                                extraInfo: null
                            });

                            dispatch({
                                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                                message: "Error happened.",
                                color: "error",
                                position: "bottom"
                            });
                        });
                }
            })
            .catch(error => {
                dispatch({
                    type: INVITATION_DIALOG_SEND_RESULT_CHANGED,
                    result: SEND_INVITATION_ERROR_HAPPENED,
                    extraInfo: null
                });
            });
    }
};