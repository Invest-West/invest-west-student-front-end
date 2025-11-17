import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as utils from '../../utils/utils';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as feedbackSnackbarActions from './feedbackSnackbarActions';

export const isCertificationExpired = (timestamp, expirationMinutes = 24 * 60) => {
    const now = new Date().getTime();
    const minutesPassed = (now - timestamp) / (1000 * 60);
    return minutesPassed >= expirationMinutes;
  };

export const INVESTOR_SELF_CERTIFICATION_AGREEMENT_SET_USER = 'INVESTOR_SELF_CERTIFICATION_AGREEMENT_SET_USER';
export const setUser = (uid) => {
    return (dispatch, getState) => {
        const prevUserID = getState().manageInvestorSelfCertificationAgreement.userID;
        // new userID is the same as the previous set one
        // do nothing
        if (prevUserID === uid) {
            return;
        }
        dispatch({
            type: INVESTOR_SELF_CERTIFICATION_AGREEMENT_SET_USER,
            uid
        });
    };
};

export const LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT = 'LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT';
export const FINISHED_LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT = 'FINISHED_LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT';
export const loadInvestorSelfCertificationAgreement = () => {
    return (dispatch, getState) => {
      const {
        userID
      } = getState().manageInvestorSelfCertificationAgreement;
  
      dispatch({
        type: LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT
      });
  
      firebase
        .database()
        .ref(DB_CONST.INVESTOR_SELF_CERTIFICATION_AGREEMENTS_CHILD)
        .orderByChild('userID')
        .equalTo(userID)
        .once('value', snapshots => {
          if (!snapshots || !snapshots.exists()) {
            dispatch({
              type: FINISHED_LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT,
              result: null
            });
          }
  
          snapshots.forEach(snapshot => {
            const agreementData = snapshot.val();
  
            if (isCertificationExpired(agreementData.selfCertificationTimestamp)) {
              // Certification has expired
              // Prompt the user to reapply for self-certification
              // You can use dispatch to update the UI, show a modal, or navigate to another screen
            }
  
            dispatch({
              type: FINISHED_LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT,
              result: agreementData
            });
          });
        });
    }
  };
  

export const INVESTOR_SELF_CERTIFICATION_AGREEMENT_TICK_BOX_CHANGED = 'INVESTOR_SELF_CERTIFICATION_AGREEMENT_TICK_BOX_CHANGED';
export const handleTickBoxChanged = event => {
    return {
        type: INVESTOR_SELF_CERTIFICATION_AGREEMENT_TICK_BOX_CHANGED,
        event
    }
};

export const UPDATE_INVESTOR_SELF_CERTIFICATION_AGREEMENT = 'UPDATE_INVESTOR_SELF_CERTIFICATION_AGREEMENT';
export const setInvestorSelfCertificationAgreement = () => {
    return (dispatch, getState) => {
      const {
        userID,
        statementType
      } = getState().manageInvestorSelfCertificationAgreement;
  
      const id = firebase
        .database()
        .ref(DB_CONST.INVESTOR_SELF_CERTIFICATION_AGREEMENTS_CHILD)
        .push()
        .key;
  
      const timestamp = new Date().getTime(); // Add this line to get the current timestamp
  
      const agreementObject = {
        id,
        userID: userID,
        agreedDate: utils.getCurrentDate(),
        selfCertificationTimestamp: timestamp, // Add this line to store the timestamp
        type: statementType
      };

        firebase
            .database()
            .ref(DB_CONST.INVESTOR_SELF_CERTIFICATION_AGREEMENTS_CHILD)
            .child(id)
            .set(agreementObject)
            .then(() => {
                // track investor's activity
                realtimeDBUtils
                    .trackActivity({
                        userID: userID,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        interactedObjectLocation: DB_CONST.INVESTOR_SELF_CERTIFICATION_AGREEMENTS_CHILD,
                        interactedObjectID: id,
                        activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_COMPLETED_SELF_CERTIFICATION
                    });

                // update states
                dispatch({
                    type: UPDATE_INVESTOR_SELF_CERTIFICATION_AGREEMENT,
                    agreement: agreementObject
                });

                // display snackbar to let the user know
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "You have now self certified.",
                    color: "primary",
                    position: "bottom"
                });
            })
            .catch(error => {
                dispatch({
                    type: UPDATE_INVESTOR_SELF_CERTIFICATION_AGREEMENT,
                    agreement: null
                });

                // display snackbar to let the user know
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. We couldn't upload your self-certification statement.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
};

export const INVESTOR_SELF_CERTIFICATION_AGREEMENT_STATEMENT_TYPE_CHANGED = 'INVESTOR_SELF_CERTIFICATION_AGREEMENT_STATEMENT_TYPE_CHANGED';
export const handleStatementTypeChanged = event => {
    return {
        type: INVESTOR_SELF_CERTIFICATION_AGREEMENT_STATEMENT_TYPE_CHANGED,
        event
    }
};