import firebase from "../../firebase/firebaseApp";
import * as DB_CONST from "../../firebase/databaseConsts";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import * as myUtils from "../../utils/utils";
import * as feedbackSnackbarActions from "./feedbackSnackbarActions";

export const GROUP_ADMIN_SETTINGS_INITIALIZE_GROUP_ATTRIBUTES_EDITED = 'GROUP_ADMIN_SETTINGS_INITIALIZE_GROUP_ATTRIBUTES_EDITED';
export const initializeGroupAttributesEdited = () => {
    return (dispatch, getState) => {
        dispatch({
            type: GROUP_ADMIN_SETTINGS_INITIALIZE_GROUP_ATTRIBUTES_EDITED,
            group: getState().manageGroupFromParams.groupProperties
        });
    }
};

export const GROUP_ADMIN_SETTINGS_CHANGED = 'GROUP_ADMIN_SETTINGS_CHANGED';
export const handleInputChanged = event => {
    return (dispatch, getState) => {
        const groupProperties = getState().manageGroupFromParams.groupProperties;
        const groupAttributesEdited = getState().groupAdminSettings.groupAttributesEdited;
        const target = event.target;

        let isPropertyOfGroupAttributes = false;

        let updateValue = null;
        let shouldUpdateDatabase = false;

        switch (target.type) {
            case 'checkbox':
                if (groupAttributesEdited.hasOwnProperty(target.name)) {
                    shouldUpdateDatabase = true;
                    updateValue = target.checked;
                }
                break;
            case 'radio':
                if (groupAttributesEdited.hasOwnProperty(target.name)) {
                    shouldUpdateDatabase = true;
                    updateValue = !isNaN(target.value) ? parseInt(target.value) : target.value;
                }
                break;
            case 'text':
                if (target.name !== "primaryColor"
                    && target.name !== "secondaryColor"
                    && groupAttributesEdited.hasOwnProperty(target.name)
                ) {
                    isPropertyOfGroupAttributes = true;
                    shouldUpdateDatabase = true;
                    updateValue = target.value;
                }
                break;
            case 'textarea':
                if (groupAttributesEdited.hasOwnProperty(target.name)) {
                    isPropertyOfGroupAttributes = true;
                }
                break;
            default:
                return;
        }

        if (shouldUpdateDatabase) {
            realtimeDBUtils
                .updateGroupPropertiesSetting({
                    anid: groupProperties.anid,
                    field: target.name,
                    value: updateValue
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not update this field.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }

        dispatch({
            type: GROUP_ADMIN_SETTINGS_CHANGED,
            name: target.name,
            value: target.type === 'checkbox' ? target.checked : target.value,
            isPropertyOfGroupAttributes
        });
    }
};

export const handlePitchExpiryDateChanged = date => {
    return (dispatch, getState) => {
        if (date && date === "Invalid Date") {
            dispatch({
                type: GROUP_ADMIN_SETTINGS_CHANGED,
                isPropertyOfGroupAttributes: true,
                name: "defaultPitchExpiryDate",
                value: NaN
            });
            return;
        }

        dispatch({
            type: GROUP_ADMIN_SETTINGS_CHANGED,
            isPropertyOfGroupAttributes: true,
            name: "defaultPitchExpiryDate",
            value:
                !date
                    ?
                    null
                    :
                    date.getTime()
        });
    }
}

export const handleSavePitchExpiryDate = () => {
    return (dispatch, getState) => {

        const groupProperties = getState().manageGroupFromParams.groupProperties;
        const groupSettings = getState().groupAdminSettings.groupAttributesEdited;

        realtimeDBUtils
            .updateGroupPropertiesSetting({
                anid: groupProperties.anid,
                field: "defaultPitchExpiryDate",
                value: groupSettings.defaultPitchExpiryDate
            })
            .catch(error => {
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. Could not update this field.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
}

export const handleCancelEditingPitchExpiryDate = () => {
    return (dispatch, getState) => {
        const groupProperties = getState().manageGroupFromParams.groupProperties;

        dispatch({
            type: GROUP_ADMIN_SETTINGS_CHANGED,
            isPropertyOfGroupAttributes: true,
            name: "defaultPitchExpiryDate",
            value:
                !groupProperties.settings.hasOwnProperty('defaultPitchExpiryDate')
                    ?
                    myUtils.getDateWithDaysFurtherThanToday(1)
                    :
                    groupProperties.settings.defaultPitchExpiryDate
        });
    }
}

export const GROUP_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED = 'GROUP_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED';
export const handleExpandPledgeFAQPanel = (FAQ, isExpanded) => {
    return (dispatch, getState) => {

        const expandedPledgeFAQ = getState().groupAdminSettings.expandedPledgeFAQ;

        if (isExpanded) {
            dispatch({
                type: GROUP_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED,
                expandedPledgeFAQ: FAQ,
                editExpandedPledgeFAQ: false
            });
        } else {
            if (expandedPledgeFAQ && expandedPledgeFAQ.id === FAQ.id) {
                dispatch({
                    type: GROUP_ADMIN_SETTINGS_PLEDGE_FAQ_PANEL_EXPANSION_CHANGED,
                    expandedPledgeFAQ: null,
                    editExpandedPledgeFAQ: false
                });
            }
        }
    }
};

export const GROUP_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ = 'GROUP_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ';
export const toggleEditExpandedPledgeFAQ = () => {
    return {
        type: GROUP_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ
    }
};

export const GROUP_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ = 'GROUP_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ';
export const toggleAddNewPledgeFAQ = () => {
    return {
        type: GROUP_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ
    }
};

export const submitNewPledgeFAQ = () => {
    return (dispatch, getState) => {
        const {
            addedPledgeQuestion,
            addedPledgeAnswer
        } = getState().groupAdminSettings;

        const groupProperties = getState().manageGroupFromParams.groupProperties;

        const groupAttributesEdited = Object.assign({}, getState().groupAdminSettings.groupAttributesEdited);

        if (addedPledgeQuestion.trim().length === 0 || addedPledgeAnswer.trim().length === 0) {
            return;
        }

        const faq = {
            id: myUtils.getCurrentDate(),
            question: addedPledgeQuestion,
            answer: addedPledgeAnswer
        };

        if (groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD]) {
            groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].push(faq);
        } else {
            groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD] = [faq];
        }

        firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .child(groupProperties.anid)
            .child('settings')
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .set(groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD])
            .then(() => {
                dispatch({
                    type: GROUP_ADMIN_SETTINGS_TOGGLE_ADD_NEW_PLEDGE_FAQ
                });
            });
    }
};

export const saveEditedPledgeFAQ = () => {
    return (dispatch, getState) => {
        const {
            groupAttributesEdited,
            expandedPledgeFAQ,
            editedPledgeQuestion,
            editedPledgeAnswer
        } = getState().groupAdminSettings;

        const groupProperties = getState().manageGroupFromParams.groupProperties;

        if (editedPledgeQuestion.trim().length === 0 || editedPledgeAnswer.trim().length === 0) {
            return;
        }

        const editedFAQ = {
            id: expandedPledgeFAQ.id,
            question: editedPledgeQuestion,
            answer: editedPledgeAnswer
        };

        let index = groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(faq => faq.id === expandedPledgeFAQ.id);
        groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD][index] = editedFAQ;

        firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .child(groupProperties.anid)
            .child('settings')
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .set(groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD])
            .then(() => {
                dispatch({
                    type: GROUP_ADMIN_SETTINGS_TOGGLE_EDIT_EXPANDED_PLEDGE_FAQ
                });
            });
    }
};

export const deleteExistingPledgeFAQ = () => {
    return (dispatch, getState) => {
        const expandedPledgeFAQ = getState().groupAdminSettings.expandedPledgeFAQ;
        const groupAttributesEdited = Object.assign({}, getState().groupAdminSettings.groupAttributesEdited);

        const groupProperties = getState().manageGroupFromParams.groupProperties;

        let index = groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].findIndex(faq => faq.id === expandedPledgeFAQ.id);
        groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].splice(index, 1);

        firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .child(groupProperties.anid)
            .child('settings')
            .child(DB_CONST.PLEDGE_FAQS_CHILD)
            .set(groupAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD]);
    }
};

export const saveGroupDetails = (field, value) => {
    return (dispatch, getState) => {
        const group = getState().manageGroupFromParams.groupProperties;

        firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .child(group.anid)
            .child(field)
            .set(value);
    }
};

export const GROUP_ADMIN_SETTINGS_CANCEL_EDITING_GROUP_DETAILS = 'GROUP_ADMIN_SETTINGS_CANCEL_EDITING_GROUP_DETAILS';
export const cancelEditingGroupDetails = (field) => {
    return (dispatch, getState) => {
        const group = getState().manageGroupFromParams.groupProperties;

        dispatch({
            type: GROUP_ADMIN_SETTINGS_CANCEL_EDITING_GROUP_DETAILS,
            name: field,
            value: group[field]
        });
    }
};

export const saveColor = field => {
    return (dispatch, getState) => {
        const group = getState().manageGroupFromParams.groupProperties;
        const color = field === "primaryColor" ? getState().groupAdminSettings.primaryColor : getState().groupAdminSettings.secondaryColor;

        firebase
            .database()
            .ref(DB_CONST.GROUP_PROPERTIES_CHILD)
            .child(group.anid)
            .child('settings')
            .child(field)
            .set(color.toUpperCase());
    }
};

export const GROUP_ADMIN_SETTINGS_CANCEL_EDITING_COLOR = 'GROUP_ADMIN_SETTINGS_CANCEL_EDITING_COLOR';
export const cancelEditingColor = field => {
    return (dispatch, getState) => {
        const group = getState().manageGroupFromParams.groupProperties;
        const color = field === "primaryColor" ? group.settings.primaryColor : group.settings.secondaryColor;

        dispatch({
            type: GROUP_ADMIN_SETTINGS_CANCEL_EDITING_COLOR,
            field,
            color
        });
    }
};