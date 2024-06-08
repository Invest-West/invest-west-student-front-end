import {
    CREATE_PLEDGE_STATUS_INVALID_DATE,
    CREATE_PLEDGE_STATUS_INVALID_FUND,
    CREATE_PLEDGE_STATUS_MISSING_FIELDS,
    CREATE_PLEDGE_STATUS_VALID,
} from '../../shared-components/create-pledge-dialog/CreatePledgeDialog';
import * as utils from '../../utils/utils';
import * as DB_CONST from '../../firebase/databaseConsts';
import firebase from '../../firebase/firebaseApp';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as ROUTES from '../../router/routes';

export const TOGGLE_CREATE_PLEDGE_DIALOG = 'TOGGLE_CREATE_PLEDGE_DIALOG';
export const toggleCreatePledgeDialog = () => {
    return {
        type: TOGGLE_CREATE_PLEDGE_DIALOG
    }
};

export const CREATE_PLEDGE_DIALOG_SET_PROJECT = 'CREATE_PLEDGE_DIALOG_SET_PROJECT';
export const setProject = (project) => {
    return {
        type: CREATE_PLEDGE_DIALOG_SET_PROJECT,
        project: project
    }
};

export const CREATE_PLEDGE_DIALOG_HANDLE_INPUT_CHANGED = 'CREATE_PLEDGE_DIALOG_HANDLE_INPUT_CHANGED';
export const handleInputChanged = (event) => {
    return {
        type: CREATE_PLEDGE_DIALOG_HANDLE_INPUT_CHANGED,
        event
    }
};

export const CREATE_PLEDGE_DIALOG_HANDLE_DATE_CHANGED = 'CREATE_PLEDGE_DIALOG_HANDLE_DATE_CHANGED';
export const handleDateChanged = date => {
    return {
        type: CREATE_PLEDGE_DIALOG_HANDLE_DATE_CHANGED,
        date
    }
};

export const CREATE_PLEDGE_DIALOG_CREATE_STATUS_CHANGED = 'CREATE_PLEDGE_DIALOG_CREATE_STATUS_CHANGED';
export const createPledge = () => {
    return (dispatch, getState) => {
        const {
            project,
            postMoneyValuation,
            expiredDate,
            extraNotes
        } = getState().manageCreatePledgeDialog;

        // when a group admin creates a pledge, they will have the option to set the project visibility again
        const projectVisibilitySetting = getState().manageSelectProjectVisibility.projectVisibilitySetting;

        const currentUser = getState().auth.user;

        // check if all the fields in creating primary offer dialog have been filled
        if (expiredDate === null) {
            dispatch({
                type: CREATE_PLEDGE_DIALOG_CREATE_STATUS_CHANGED,
                status: CREATE_PLEDGE_STATUS_MISSING_FIELDS
            });
        } else {
            if (isNaN(expiredDate)
                ||
                (expiredDate && (expiredDate < utils.getDateWithDaysFurtherThanToday(0)))
            ) {
                dispatch({
                    type: CREATE_PLEDGE_DIALOG_CREATE_STATUS_CHANGED,
                    status: CREATE_PLEDGE_STATUS_INVALID_DATE
                });
                return;
            }

            if (postMoneyValuation.trim().length > 0
                && !utils.getNumberFromInputString(postMoneyValuation)
            ) {
                dispatch({
                    type: CREATE_PLEDGE_DIALOG_CREATE_STATUS_CHANGED,
                    status: CREATE_PLEDGE_STATUS_INVALID_FUND
                });
                return;
            }

            dispatch({
                type: CREATE_PLEDGE_DIALOG_CREATE_STATUS_CHANGED,
                status: CREATE_PLEDGE_STATUS_VALID
            });

            const primaryOfferObj = {
                status: DB_CONST.PRIMARY_OFFER_STATUS_ON_GOING,
                postMoneyValuation:
                    postMoneyValuation.trim().length === 0
                        ?
                        null
                        :
                        utils.getNumberFromInputString(postMoneyValuation)
                ,
                expiredDate: expiredDate,
                extraNotes: extraNotes.trim().length === 0 ? null : extraNotes
            };

            let shouldSendNotificationToIssuer = false;
            // if the issuerID returns an issuer and the offer was created by a group admin
            // and the group admin is creating a pledge for this offer
            // then we will notify the issuer that their offer has gone to the pledge phase and is ready to
            // receive pledges from investor BECAUSE the pledge will not be double checked, it will go straight to
            // live when created by a group admin.
            if (project.issuer.type === DB_CONST.TYPE_ISSUER
                && project.hasOwnProperty('createdByGroupAdmin')
                && currentUser.type === DB_CONST.TYPE_ADMIN
            ) {
                shouldSendNotificationToIssuer = true;
            }

            let projectBeforeUpdating = JSON.parse(JSON.stringify(project));
            projectBeforeUpdating.issuer = null;
            projectBeforeUpdating.group = null;
            projectBeforeUpdating.pledges = null;

            let updatedProject = JSON.parse(JSON.stringify(project));
            updatedProject.issuer = null;
            updatedProject.group = null;
            updatedProject.pledges = null;

            updatedProject.status =
                // if an admin is creating the pledge,
                // then let it go live directly
                currentUser.type === DB_CONST.TYPE_ADMIN
                    ?
                    DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE
                    :
                    // if an issuer is creating the pledge,
                    // then let the admin check first
                    DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED;
            updatedProject.Pitch.status = DB_CONST.PITCH_STATUS_ACCEPTED;
            updatedProject.PrimaryOffer = primaryOfferObj;
            // if projectVisibilitySetting = -1, then go with the previous value of visibility
            updatedProject.visibility =
                projectVisibilitySetting === -1 ? projectBeforeUpdating.visibility : projectVisibilitySetting;

            // create primary offer node in the project
            firebase
                .database()
                .ref(DB_CONST.PROJECTS_CHILD)
                .child(project.id)
                .update(updatedProject)
                .then(() => {
                    dispatch({
                        type: TOGGLE_CREATE_PLEDGE_DIALOG
                    });

                    // track issuer's activity
                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                            interactedObjectID: project.id,
                            activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_CREATED_PLEDGE.replace("%project%", updatedProject.projectName),
                            action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", updatedProject.id),
                            value: {
                                before: projectBeforeUpdating,
                                after: updatedProject
                            }
                        });

                    if (shouldSendNotificationToIssuer) {
                        realtimeDBUtils
                            .sendNotification({
                                title: project.projectName,
                                message: "Congratulations! Your investment opportunity has been published. Investors can now pledge.",
                                userID: project.issuerID,
                                action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", project.id)
                            })
                            .catch(error => {
                                // handle error
                            });
                    }
                });
        }
    }
};