import * as manageANIDFromParamsActions from '../actions/manageGroupFromParamsActions';

const initState = {
    groupUserName: null,
    anid: null,

    groupProperties: null,
    groupPropertiesLoaded: false,
    angelNetworkBeingLoaded: false,

    expectedPath: null,
    currentPath: null,
    shouldLoadOtherData: false
};

const manageGroupFromParamsReducer = (state = initState, action) => {
    switch (action.type) {
        case manageANIDFromParamsActions.SET_GROUP_USER_NAME_FROM_PARAMS:
            return {
                ...state,
                groupUserName: action.groupUserName,
                groupProperties: null,
                groupPropertiesLoaded: false,
                angelNetworkBeingLoaded: false
            };
        case manageANIDFromParamsActions.SET_EXPECTED_AND_CURRENT_PATHS_FOR_CHECKING:
            return {
                ...state,
                expectedPath: action.expectedPath,
                currentPath: action.currentPath
            };
        case manageANIDFromParamsActions.LOADING_ANGEL_NETWORK:
            return {
                ...state,
                groupProperties: null,
                groupPropertiesLoaded: false,
                angelNetworkBeingLoaded: true,
                shouldLoadOtherData: false
            };
        case manageANIDFromParamsActions.ANGEL_NETWORK_LOADED:
            return {
                ...state,
                groupProperties: JSON.parse(JSON.stringify(action.angelNetwork)),
                groupPropertiesLoaded: true,
                angelNetworkBeingLoaded: false,
                shouldLoadOtherData: action.shouldLoadOtherData
            };
        case manageANIDFromParamsActions.ANGEL_NETWORK_PROPERTIES_CHANGED:
            return {
                ...state,
                groupProperties: {
                    ...state.groupProperties,
                    [action.key]: action.value
                }
            };
        default:
            return state;
    }
};

export default manageGroupFromParamsReducer;

