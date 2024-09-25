import * as createBusinessProfileActions from '../actions/createBusinessProfileActions';
import * as editUserActions from '../actions/editUserActions';
import * as editImageActions from '../actions/editImageActions';
import * as editVideoActions from '../actions/editVideoActions';
import * as authActions from '../actions/authActions';

const initState = {
    BusinessProfile: {
        companyName: '',
        sector: 'None',
        companyWebsite: '',


    },

    logoToBeUploaded: null,
    videoToBeUploaded: null,

    expandBusinessProfileFilling: false // this field is only available for investor
};

const createBusinessProfileReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case createBusinessProfileActions.ORDINARY_BUSINESS_PROFILE_FIELDS_CHANGED:
            return {
                ...state,
                BusinessProfile: {
                    ...state.BusinessProfile,
                    [action.fieldName]: action.fieldValue
                }
            };
        case editImageActions.CREATE_BUSINESS_PROFILE_SAVE_EDITED_IMAGE:
            return {
                ...state,
                logoToBeUploaded: action.blob
            };
        case editVideoActions.CREATE_BUSINESS_PROFILE_SAVE_VIDEO:
            return {
                ...state,
                videoToBeUploaded: action.video
            };
        case createBusinessProfileActions.CLEAR_FILLED_BUSINESS_PROFILE_INFORMATION:
            return {
                ...initState,
                expandBusinessProfileFilling: state.expandBusinessProfileFilling
            };
        case createBusinessProfileActions.TOGGLE_EXPAND_BUSINESS_PROFILE_FILLING_FOR_INVESTOR:
            return {
                ...initState,
                expandBusinessProfileFilling: !state.expandBusinessProfileFilling
            };
        default:
            return state;
    }
};

export default createBusinessProfileReducer;