import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as feedbackSnackbarActions from './feedbackSnackbarActions';
import * as DB_CONST from '../../firebase/databaseConsts';

export const LOADING_MARKETING_PREFERENCES = 'LOADING_MARKETING_PREFERENCES';
export const FINISHED_LOADING_MARKETING_PREFERENCES = 'FINISHED_LOADING_MARKETING_PREFERENCES';
export const loadMarketingPreferences = () => {
    return (dispatch, getState) => {

        const currentUser = getState().auth.user;

        if (currentUser.type === DB_CONST.TYPE_ADMIN) {
            // do not allow course admins to load marketing preferences
            if (!currentUser.superAdmin) {
                return;
            }
        }

        dispatch({
            type: LOADING_MARKETING_PREFERENCES
        });

        realtimeDBUtils
            .loadMarketingPreferences(
                currentUser.type === DB_CONST.TYPE_ADMIN
                    ?
                    null
                    :
                    currentUser.id
            )
            .then(marketingPreferences => {
                dispatch({
                    type: FINISHED_LOADING_MARKETING_PREFERENCES,
                    marketingPreferences
                });
            })
            .catch(error => {
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. Could not load marketing preferences.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
}