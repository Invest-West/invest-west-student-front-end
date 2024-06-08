import * as createBusinessProfileActions from '../actions/createBusinessProfileActions';
import * as editUserActions from '../actions/editUserActions';
import * as editImageActions from '../actions/editImageActions';
import * as editVideoActions from '../actions/editVideoActions';
import * as authActions from '../actions/authActions';

const initState = {
    BusinessProfile: {
        companyName: '',
        registrationNo: '',
        sector: 'None',
        companyWebsite: '',

        registeredOffice: {
            address1: '',
            address2: '',
            address3: '',
            townCity: '',
            postcode: ''
        },

        tradingAddress: {
            address1: '',
            address2: '',
            address3: '',
            townCity: '',
            postcode: ''
        },

        directors: []
    },

    logoToBeUploaded: null,
    videoToBeUploaded: null,

    registeredOfficeSearchPostcode: '', // field for user to fill in with postcode
    registeredOfficeEnterAddressManually: false,
    registeredOfficeRecommendedAddresses: null, // searched addresses from entered postcode

    tradingAddressSameAsRegisteredOffice: true,
    tradingAddressSearchPostcode: '', // field for user to fill in with postcode
    tradingAddressEnterAddressManually: false,
    tradingAddressRecommendedAddresses: null, // searched addresses from entered postcode

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
        case createBusinessProfileActions.REGISTERED_OFFICE_BUSINESS_PROFILE_FIELDS_CHANGED:
            return {
                ...state,
                BusinessProfile: {
                    ...state.BusinessProfile,
                    registeredOffice: {
                        ...state.BusinessProfile.registeredOffice,
                        [action.fieldName]: action.fieldValue
                    }
                }
            };
        case createBusinessProfileActions.TRADING_ADDRESS_BUSINESS_PROFILE_FIELDS_CHANGED:
            return {
                ...state,
                BusinessProfile: {
                    ...state.BusinessProfile,
                    tradingAddress: {
                        ...state.BusinessProfile.tradingAddress,
                        [action.fieldName]: action.fieldValue
                    }
                }
            };
        case createBusinessProfileActions.BUSINESS_PROFILE_CONTROL_FIELDS_CHANGED:
            return {
                ...state,
                [action.fieldName]: action.fieldValue,
                BusinessProfile: {
                    ...state.BusinessProfile,
                    registeredOffice:
                        action.fieldName !== "registeredOfficeSearchPostcode"
                            ?
                            state.BusinessProfile.registeredOffice
                            :
                            {
                                address1: '',
                                address2: '',
                                address3: '',
                                townCity: '',
                                postcode: ''
                            },
                    tradingAddress:
                        action.fieldName !== "tradingAddressSearchPostcode"
                            ?
                            state.BusinessProfile.tradingAddress
                            :
                            {
                                address1: '',
                                address2: '',
                                address3: '',
                                townCity: '',
                                postcode: ''
                            }
                },
                registeredOfficeEnterAddressManually:
                    action.fieldName !== "registeredOfficeSearchPostcode" ? state.registeredOfficeEnterAddressManually : false,
                registeredOfficeRecommendedAddresses:
                    action.fieldName !== "registeredOfficeSearchPostcode" ? state.registeredOfficeRecommendedAddresses : null,
                tradingAddressEnterAddressManually:
                    action.fieldName !== "tradingAddressSearchPostcode" ? state.tradingAddressEnterAddressManually : false,
                tradingAddressRecommendedAddresses:
                    action.fieldName !== "tradingAddressSearchPostcode" ? state.tradingAddressRecommendedAddresses : null,
            };
        case createBusinessProfileActions.SEARCHING_REGISTERED_OFFICE_ADDRESSES:
            return state;
        case createBusinessProfileActions.DONE_SEARCHING_REGISTERED_OFFICE_ADDRESSES:
            return {
                ...state,
                registeredOfficeRecommendedAddresses: action.results
            };
        case createBusinessProfileActions.SEARCHING_TRADING_ADDRESSES:
            return state;
        case createBusinessProfileActions.DONE_SEARCHING_TRADING_ADDRESSES:
            return {
                ...state,
                tradingAddressRecommendedAddresses: action.results
            };
        case createBusinessProfileActions.SELECT_REGISTERED_OFFICE_RECOMMENDED_ADDRESS:
            return {
                ...state,
                BusinessProfile: {
                    ...state.BusinessProfile,
                    registeredOffice: {
                        ...state.BusinessProfile.registeredOffice,
                        address1: action.selectedAddress[0],
                        address2: action.selectedAddress[1],
                        address3: action.selectedAddress[2],
                        townCity: action.selectedAddress[3],
                        postcode: state.registeredOfficeSearchPostcode.toUpperCase(),
                    }
                },
                registeredOfficeEnterAddressManually: true,
                registeredOfficeSearchPostcode: '',
                registeredOfficeRecommendedAddresses: null
            };
        case createBusinessProfileActions.SELECT_TRADING_ADDRESS_RECOMMENDED_ADDRESS:
            return {
                ...state,
                BusinessProfile: {
                    ...state.BusinessProfile,
                    tradingAddress: {
                        ...state.BusinessProfile.tradingAddress,
                        address1: action.selectedAddress[0],
                        address2: action.selectedAddress[1],
                        address3: action.selectedAddress[2],
                        townCity: action.selectedAddress[3],
                        postcode: state.tradingAddressSearchPostcode.toUpperCase(),
                    }
                },
                tradingAddressEnterAddressManually: true,
                tradingAddressSearchPostcode: '',
                tradingAddressRecommendedAddresses: null
            };
        case createBusinessProfileActions.TOGGLE_REGISTERED_OFFICE_ENTER_ADDRESS_MANUALLY:
            return {
                ...state,
                registeredOfficeEnterAddressManually: !state.registeredOfficeEnterAddressManually,
                registeredOfficeSearchPostcode: '',
                registeredOfficeRecommendedAddresses: null
            };
        case createBusinessProfileActions.TOGGLE_TRADING_ADDRESS_ENTER_ADDRESS_MANUALLY:
            return {
                ...state,
                tradingAddressEnterAddressManually: !state.tradingAddressEnterAddressManually,
                tradingAddressSearchPostcode: '',
                tradingAddressRecommendedAddresses: null
            };
        case createBusinessProfileActions.TOGGLE_TRADING_ADDRESS_SAME_AS_REGISTERED_OFFICE:
            return {
                ...state,
                tradingAddressSameAsRegisteredOffice: action.checked,
                tradingAddressSearchPostcode: '',
                tradingAddressRecommendedAddresses: null,
                tradingAddressEnterAddressManually: false,
                BusinessProfile: {
                    ...state.BusinessProfile,
                    tradingAddress: {
                        address1: '',
                        address2: '',
                        address3: '',
                        townCity: '',
                        postcode: ''
                    }
                }
            };
        case editUserActions.ADD_NEW_DIRECTOR_TEMPORARILY:
            // update this state only when creating a new business profile
            if (!action.isEditingExistingBusinessProfile) {
                return {
                    ...state,
                    BusinessProfile: {
                        ...state.BusinessProfile,
                        directors: [...state.BusinessProfile.directors, action.director]
                    }
                };
            }
            return state;
        case editUserActions.DELETE_DIRECTOR_TEMPORARILY:
            if (!action.isEditingExistingBusinessProfile) {
                let editedDirectors = JSON.parse(JSON.stringify(state.BusinessProfile.directors));
                editedDirectors.splice(action.index, 1);
                return {
                    ...state,
                    BusinessProfile: {
                        ...state.BusinessProfile,
                        directors: editedDirectors
                    }
                };
            }
            return state;
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