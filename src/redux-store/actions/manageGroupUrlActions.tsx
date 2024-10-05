import {Action, ActionCreator, Dispatch} from "redux";
import GroupProperties from "../../models/group_properties";
import Error from "../../models/error";
import {AppState} from "../reducers";
import GroupRepository from "../../api/repositories/GroupRepository";

export enum ManageGroupUrlEvents {
    SetGroupUrl = "ManageGroupUrlEvents.SetGroupUrl",
    ValidatingGroupUrl = "ManageGroupUrlEvents.ValidatingGroupUrl",
    FinishedValidatingGroupUrl = "ManageGroupUrlEvents.FinishedValidatingGroupUrl"
}

export interface ManageGroupUrlAction extends Action {
    path?: string;
    groupUserName?: string | null;
    group?: GroupProperties | null;
    validGroupUrl?: boolean;
    error?: Error
}

export interface SetGroupUrlAction extends ManageGroupUrlAction {
    path: string;
    groupUserName: string | null;
}

export interface ValidatingGroupUrlAction extends ManageGroupUrlAction {
}

export interface FinishedValidatingGroupUrlAction extends ManageGroupUrlAction {
    group: GroupProperties | null;
    validGroupUrl: boolean;
    error?: Error
}

export const validateGroupUrl: ActionCreator<any> = (path: string, groupUserName: string | null) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            routePath,
            groupNameFromUrl,
            group,
            loadingGroup,
            groupLoaded
        } = getState().ManageGroupUrlState;

        const setGroupUrlAction: SetGroupUrlAction = {
            type: ManageGroupUrlEvents.SetGroupUrl,
            path,
            groupUserName
        };

        let shouldValidateGroupUrl = false;

        // Determine if validation is needed
        if (routePath !== path || groupNameFromUrl !== groupUserName) {
            shouldValidateGroupUrl = true;
        }

        if (shouldValidateGroupUrl) {
            dispatch(setGroupUrlAction);

            const validatingGroupUrlAction: ValidatingGroupUrlAction = {
                type: ManageGroupUrlEvents.ValidatingGroupUrl
            };

            dispatch(validatingGroupUrlAction);

            const finishedLoadingGroupUrlAction: FinishedValidatingGroupUrlAction = {
                type: ManageGroupUrlEvents.FinishedValidatingGroupUrl,
                group: null,
                validGroupUrl: false
            };

            // Group name is not specified in the URL
            if (!groupUserName) {
                finishedLoadingGroupUrlAction.validGroupUrl = true;
                return dispatch(finishedLoadingGroupUrlAction);
            }

            try {
                const response = await new GroupRepository().getGroup(groupUserName);
                const retrievedGroup: GroupProperties | null = response.data;
                dispatch({
                    type: ManageGroupUrlEvents.FinishedValidatingGroupUrl,
                    group: retrievedGroup,
                    validGroupUrl: retrievedGroup !== null,
                });
            } catch (error) {
                console.error('Error in validateGroupUrl:', error);
    
                dispatch({
                    type: ManageGroupUrlEvents.FinishedValidatingGroupUrl,
                    group: null,
                    validGroupUrl: false,
                    error: {
                        detail: error.message,
                    },
                });
            }
        };
    };
};