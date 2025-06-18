import * as groupAdminSettingsActions from "../actions/groupAdminSettingsActions";
import * as manageANIDFromParamsActions from "../actions/manageGroupFromParamsActions";
import * as authActions from "../actions/authActions";
import * as DB_CONST from "../../firebase/databaseConsts";
import * as utils from "../../utils/utils"

const initState = {
    groupAttributesEdited: null,
    clubAttributesEdited: {},

    website: '',
    description: '',
    primaryColor: '',
    secondaryColor: '',

    addNewPledgeFAQ: false,
    addedPledgeQuestion: '',
    addedPledgeAnswer: '',
    expandedPledgeFAQ: null,
    editExpandedPledgeFAQ: false,
    editedPledgeQuestion: '',
    editedPledgeAnswer: ''
};

const groupAdminSettingsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case groupAdminSettingsActions.GROUP_ADMIN_SETTINGS_INITIALIZE_GROUP_ATTRIBUTES_EDITED:

            let groupSettings = JSON.parse(JSON.stringify(action.group.settings));
            // if the defaultPitchExpiryDate property does not exist,
            // assign it with an initial value
            if (!groupSettings.hasOwnProperty('defaultPitchExpiryDate')) {
                groupSettings.defaultPitchExpiryDate = utils.getDateWithDaysFurtherThanToday(1);
            }

            return {
                ...state,
                groupAttributesEdited: groupSettings,
                clubAttributesEdited: action.clubAttributes,
                website:  action.group.hasOwnProperty('website') ? action.group.website : '',
                description: action.group.hasOwnProperty('description') ? action.group.description : '',
                primaryColor: action.group.settings.primaryColor,
                secondaryColor: action.group.settings.secondaryColor
            };
        case groupAdminSettingsActions.GROUP_ADMIN_SETTINGS_CHANGED:
            const isPropertyOfGroupAttributes = action.isPropertyOfGroupAttributes;

            if (isPropertyOfGroupAttributes) {
                return {
                    ...state,
                    groupAttributesEdited: {
                        ...state.groupAttributesEdited,
                        [action.name]: action.value
                    }
                };
            }
            else {
                return {
                    ...state,
                    [action.name]: action.value
                };
            }
        case manageANIDFromParamsActions.ANGEL_NETWORK_PROPERTIES_CHANGED:
            if (action.key === 'settings') {
                return {
                    ...state,
                    groupAttributesEdited: JSON.parse(JSON.stringify(action.value)),
                    primaryColor: action.value.primaryColor,
                    secondaryColor: action.value.secondaryColor,
                    expandedPledgeFAQ:
                        !action.value.hasOwnProperty(DB_CONST.PLEDGE_FAQS_CHILD)
                            ?
                            null
                            :
                            !state.expandedPledgeFAQ
                                ?
                                null
                                :
                                action.value[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(pledge => pledge.id === state.expandedPledgeFAQ.id) !== -1
                                    ?
                                    action.value[DB_CONST.PLEDGE_FAQS_CHILD][action.value[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(pledge => pledge.id === state.expandedPledgeFAQ.id)]
                                    :
                                    state.expandedPledgeFAQ
                }
            }
            else {
                return {
                    ...state,
                    [action.key]: action.value
                }
            }
        case groupAdminSettingsActions.GROUP_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED:
            return {
                ...state,
                expandedPledgeFAQ: action.expandedPledgeFAQ,
                editExpandedPledgeFAQ: action.editExpandedPledgeFAQ
            };
        case groupAdminSettingsActions.GROUP_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ:
            return {
                ...state,
                addNewPledgeFAQ: !state.addNewPledgeFAQ,
                addedPledgeQuestion: '',
                addedPledgeAnswer: ''
            };
        case groupAdminSettingsActions.GROUP_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ:
            return {
                ...state,
                editExpandedPledgeFAQ: !state.editExpandedPledgeFAQ,
                editedPledgeQuestion: !state.editExpandedPledgeFAQ ? state.expandedPledgeFAQ.question : '',
                editedPledgeAnswer: !state.editExpandedPledgeFAQ ? state.expandedPledgeFAQ.answer : ''
            };
        case groupAdminSettingsActions.GROUP_ADMIN_SETTINGS_CANCEL_EDITING_GROUP_DETAILS:
            return {
                ...state,
                [action.name]: action.value
            };
        case groupAdminSettingsActions.GROUP_ADMIN_SETTINGS_CANCEL_EDITING_COLOR:
            return {
                ...state,
                primaryColor: action.field === "primaryColor" ? action.color : state.primaryColor,
                secondaryColor: action.field === "secondaryColor" ? action.color : state.secondaryColor
            };
        case groupAdminSettingsActions.GROUP_ADMIN_SETTINGS_QUILL_EDITOR_CHANGED:
            return {
                ...state,
                clubAttributesEdited: {
                    ...state.clubAttributesEdited,
                    [action.fieldName]: action.value
                }
            };
        default:
            return state;
    }
};

export default groupAdminSettingsReducer;