import GroupProperties from "../../models/group_properties";
import {
    FinishedValidatingGroupUrlAction,
    ManageGroupUrlAction,
    ManageGroupUrlEvents,
    ResetGroupUrlStateAction,
    SetGroupUrlAction
} from "../actions/manageGroupUrlActions";
import Error from "../../models/error";
import {colors} from "@material-ui/core";
import {createMuiTheme, responsiveFontSizes, Theme} from "@material-ui/core/styles";
import {defaultTheme} from "../../values/defaultThemes";

export interface ManageGroupUrlState {
    routePath: string | undefined;
    groupNameFromUrl: string | null | undefined;

    group: GroupProperties | null;
    groupLoaded: boolean;
    loadingGroup: boolean;

    validGroupUrl: boolean;

    groupRouteTheme: Theme;

    error?: Error;
}

const initialState: ManageGroupUrlState = {
    routePath: undefined,
    groupNameFromUrl: undefined,

    group: null,
    groupLoaded: false,
    loadingGroup: false,

    groupRouteTheme: defaultTheme,

    validGroupUrl: false
};

export const isValidatingGroupUrl = (state: ManageGroupUrlState) => {
    return (!state.group && !state.groupLoaded && state.loadingGroup)
        || (!state.group && !state.groupLoaded && !state.loadingGroup);
}

export const routeContainsGroupName = (state: ManageGroupUrlState) => {
    return state.groupNameFromUrl !== null;
}

export const successfullyValidatedGroupUrl = (state: ManageGroupUrlState) => {
    return state.validGroupUrl && state.error === undefined;
}

export const hasGroupValidationError = (state: ManageGroupUrlState) => {
    return state.error !== undefined;
}

export const getGroupRouteTheme = (state: ManageGroupUrlState): Theme => {
    if (state.groupRouteTheme === undefined) {
        return defaultTheme;
    }
    return state.groupRouteTheme;
}

const manageGroupUrlReducer = (state: ManageGroupUrlState = initialState, action: ManageGroupUrlAction) => {
    switch (action.type) {
        case ManageGroupUrlEvents.SetGroupUrl:
            const setGroupUrlAction: SetGroupUrlAction = action as SetGroupUrlAction;
            return {
                ...state,
                routePath: setGroupUrlAction.path,
                groupNameFromUrl: setGroupUrlAction.groupUserName
            }
        case ManageGroupUrlEvents.ValidatingGroupUrl:
            return {
                ...state,
                group: null,
                groupLoaded: false,
                loadingGroup: true,
                validGroupUrl: false
            }
        case ManageGroupUrlEvents.FinishedValidatingGroupUrl:
            const finishedValidatingGroupUrlAction: FinishedValidatingGroupUrlAction = action as FinishedValidatingGroupUrlAction;
            return {
                ...state,
                group: finishedValidatingGroupUrlAction.group === null ? null : JSON.parse(JSON.stringify(action.group)),
                groupLoaded: true,
                loadingGroup: false,
                validGroupUrl: finishedValidatingGroupUrlAction.validGroupUrl,
                error: finishedValidatingGroupUrlAction.error,
                groupRouteTheme:
                    finishedValidatingGroupUrlAction.validGroupUrl && finishedValidatingGroupUrlAction.group
                        ?
                        responsiveFontSizes(
                            createMuiTheme({
                                palette: {
                                    primary: {
                                        main: finishedValidatingGroupUrlAction.group.settings.primaryColor
                                    },

                                    secondary: {
                                        main: finishedValidatingGroupUrlAction.group.settings.secondaryColor
                                    },

                                    text: {
                                        secondary: colors.blueGrey["700"],
                                    }
                                },
                                typography: {
                                    fontFamily: "Muli, sans-serif"
                                }
                            })
                        )
                        :
                        defaultTheme
            }
        case ManageGroupUrlEvents.ResetGroupUrlState:
            return {
                ...initialState
            }
        default:
            return state;
    }
}

export default manageGroupUrlReducer;