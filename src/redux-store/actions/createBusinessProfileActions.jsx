import * as myUtils from '../../utils/utils';
import * as editImageActions from './editImageActions';
import * as editVideoActions from './editVideoActions';
import * as feedbackSnackbarActions from './feedbackSnackbarActions';
import {
    UPLOAD_BUSINESS_PROFILE_GENERAL_INFORMATION,
    UPLOAD_DONE_MODE,
    UPLOAD_ERROR
} from '../../shared-components/uploading-dialog/UploadingDialog';
import {UPLOADING} from './uploadingStatusActions';
import firebase from '../../firebase/firebaseApp';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";

export const ORDINARY_BUSINESS_PROFILE_FIELDS_CHANGED = 'ORDINARY_BUSINESS_PROFILE_FIELDS_CHANGED';
export const REGISTERED_OFFICE_BUSINESS_PROFILE_FIELDS_CHANGED = 'REGISTERED_OFFICE_BUSINESS_PROFILE_FIELDS_CHANGED';
export const TRADING_ADDRESS_BUSINESS_PROFILE_FIELDS_CHANGED = 'TRADING_ADDRESS_BUSINESS_PROFILE_FIELDS_CHANGED';
// fields that are used to derive required information for business profile such as postcode search
export const BUSINESS_PROFILE_CONTROL_FIELDS_CHANGED = 'BUSINESS_PROFILE_CONTROL_FIELDS_CHANGED';
export const handleTextChanged = (fieldType, event) => {
    return {
        type: fieldType,
        fieldName: event.target.name,
        fieldValue: event.target.value
    }
};

export const SEARCHING_REGISTERED_OFFICE_ADDRESSES = 'SEARCHING_REGISTERED_OFFICE_ADDRESSES';
export const DONE_SEARCHING_REGISTERED_OFFICE_ADDRESSES = 'DONE_SEARCHING_REGISTERED_OFFICE_ADDRESSES';
export const SEARCHING_TRADING_ADDRESSES = 'SEARCHING_TRADING_ADDRESSES';
export const DONE_SEARCHING_TRADING_ADDRESSES = 'DONE_SEARCHING_TRADING_ADDRESSES';
export const searchAddresses = mode => {
    return (dispatch, getState) => {
        if (mode === SEARCHING_REGISTERED_OFFICE_ADDRESSES) {
            const postcode = getState().createBusinessProfile.registeredOfficeSearchPostcode;
            if (postcode.trim().length === 0) {
                return;
            }
            myUtils
                .findAddress(postcode)
                .then(results => {
                    dispatch({
                        type: DONE_SEARCHING_REGISTERED_OFFICE_ADDRESSES,
                        results
                    });
                })
                .catch(error => {
                    dispatch({
                        type: DONE_SEARCHING_REGISTERED_OFFICE_ADDRESSES,
                        results: null
                    });
                });

        } else if (mode === SEARCHING_TRADING_ADDRESSES) {
            const postcode = getState().createBusinessProfile.tradingAddressSearchPostcode;
            if (postcode.trim().length === 0) {
                return;
            }
            myUtils.findAddress(postcode)
                .then(results => {
                    dispatch({
                        type: DONE_SEARCHING_TRADING_ADDRESSES,
                        results
                    });
                })
                .catch(error => {
                    dispatch({
                        type: DONE_SEARCHING_TRADING_ADDRESSES,
                        results: null
                    });
                });
        }
    }
};

export const SELECT_REGISTERED_OFFICE_RECOMMENDED_ADDRESS = 'SELECT_REGISTERED_OFFICE_RECOMMENDED_ADDRESS';
export const SELECT_TRADING_ADDRESS_RECOMMENDED_ADDRESS = 'SELECT_TRADING_ADDRESS_RECOMMENDED_ADDRESS';
export const handleRecommendedAddressSelected = (field, index) => {
    return (dispatch, getState) => {
        if (field === SELECT_REGISTERED_OFFICE_RECOMMENDED_ADDRESS) {
            const selectedAddress = getState().createBusinessProfile.registeredOfficeRecommendedAddresses.apiAddresses[index];
            dispatch({
                type: SELECT_REGISTERED_OFFICE_RECOMMENDED_ADDRESS,
                selectedAddress
            });
        } else if (field === SELECT_TRADING_ADDRESS_RECOMMENDED_ADDRESS) {
            const selectedAddress = getState().createBusinessProfile.tradingAddressRecommendedAddresses.apiAddresses[index];
            dispatch({
                type: SELECT_TRADING_ADDRESS_RECOMMENDED_ADDRESS,
                selectedAddress
            });
        }
    }
};

export const TOGGLE_REGISTERED_OFFICE_ENTER_ADDRESS_MANUALLY = 'TOGGLE_REGISTERED_OFFICE_ENTER_ADDRESS_MANUALLY';
export const TOGGLE_TRADING_ADDRESS_ENTER_ADDRESS_MANUALLY = 'TOGGLE_TRADING_ADDRESS_ENTER_ADDRESS_MANUALLY';
export const toggleEnterAddressManually = field => {
    if (field === TOGGLE_REGISTERED_OFFICE_ENTER_ADDRESS_MANUALLY) {
        return {
            type: TOGGLE_REGISTERED_OFFICE_ENTER_ADDRESS_MANUALLY
        }
    } else if (field === TOGGLE_TRADING_ADDRESS_ENTER_ADDRESS_MANUALLY) {
        return {
            type: TOGGLE_TRADING_ADDRESS_ENTER_ADDRESS_MANUALLY
        }
    }
};

export const TOGGLE_TRADING_ADDRESS_SAME_AS_REGISTERED_OFFICE = 'TOGGLE_TRADING_ADDRESS_SAME_AS_REGISTERED_OFFICE';
export const toggleTradingAddressSameAsRegisteredOffice = checked => {
    return {
        type: TOGGLE_TRADING_ADDRESS_SAME_AS_REGISTERED_OFFICE,
        checked
    }
};

export const CLEAR_FILLED_BUSINESS_PROFILE_INFORMATION = 'CLEAR_FILLED_BUSINESS_PROFILE_INFORMATION';
export const clearAllFields = () => {
    return {
        type: CLEAR_FILLED_BUSINESS_PROFILE_INFORMATION
    }
};

export const TOGGLE_EXPAND_BUSINESS_PROFILE_FILLING_FOR_INVESTOR = 'TOGGLE_EXPAND_BUSINESS_PROFILE_FILLING_FOR_INVESTOR';
export const toggleExpandBusinessProfileFillingForInvestor = () => {
    return {
        type: TOGGLE_EXPAND_BUSINESS_PROFILE_FILLING_FOR_INVESTOR
    }
};

export const uploadBusinessProfile = () => {
    return (dispatch, getState) => {
        const user = Object.assign({}, getState().auth.user);
        const logoToBeUploaded = getState().createBusinessProfile.logoToBeUploaded;
        const videoToBeUploaded = getState().createBusinessProfile.videoToBeUploaded;
        let businessProfile = Object.assign({}, getState().createBusinessProfile.BusinessProfile);

        // trading address is the same as registered office
        if (getState().createBusinessProfile.tradingAddressSameAsRegisteredOffice) {
            // set trading address to registered office
            businessProfile.tradingAddress = businessProfile.registeredOffice;
        }

        editImageActions
            .uploadImage(dispatch, user, getState().editImage, logoToBeUploaded)
            .then(() => {
                if (videoToBeUploaded) {
                    editVideoActions
                        .uploadVideo(dispatch, user, getState().editVideo, videoToBeUploaded)
                        .then(() => {
                            putBusinessProfileToFirebaseDB(dispatch, user, businessProfile);
                        })
                        .catch(error => {
                            // handle error
                            dispatch({
                                type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                                message: "Error happened. We couldn't upload your video.",
                                color: "error",
                                position: "bottom"
                            });
                        });
                } else {
                    putBusinessProfileToFirebaseDB(dispatch, user, businessProfile);
                }
            })
            .catch(error => {
                // handle error
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. We couldn't upload your logo.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
};

const putBusinessProfileToFirebaseDB = (dispatch, user, businessProfile) => {
    return new Promise((resolve, reject) => {

        dispatch({
            type: UPLOADING,
            mode: UPLOAD_BUSINESS_PROFILE_GENERAL_INFORMATION,
            progress: 0
        });

        businessProfile.registeredOffice.postcode = businessProfile.registeredOffice.postcode.toUpperCase();
        businessProfile.tradingAddress.postcode = businessProfile.tradingAddress.postcode.toUpperCase();

        firebase
            .database()
            .ref(DB_CONST.USERS_CHILD)
            .child(user.id)
            .child(DB_CONST.BUSINESS_PROFILE_CHILD)
            .update(businessProfile)
            .then(() => {
                dispatch({
                    type: UPLOADING,
                    mode: UPLOAD_DONE_MODE,
                    progress: 100
                });

                dispatch({
                    type: CLEAR_FILLED_BUSINESS_PROFILE_INFORMATION
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Your business profile has successfully been uploaded.",
                    color: "primary",
                    position: "bottom"
                });

                realtimeDBUtils
                    .trackActivity({
                        userID: user.id,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        interactedObjectLocation: DB_CONST.USERS_CHILD,
                        interactedObjectID: user.id,
                        activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_UPLOADED_BUSINESS_PROFILE,
                        value: {
                            ...user,
                            BusinessProfile: {
                                ...businessProfile
                            }
                        }
                    });

                return resolve();
            })
            .catch(error => {
                dispatch({
                    type: UPLOADING,
                    mode: UPLOAD_ERROR,
                    progress: 100
                });

                dispatch({
                    type: CLEAR_FILLED_BUSINESS_PROFILE_INFORMATION
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. We couldn't upload your business profile.",
                    color: "error",
                    position: "bottom"
                });

                return reject(error);
            });
    });
};