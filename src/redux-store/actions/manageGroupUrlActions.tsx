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
        }

        let shouldValidateGroupUrl = false;

        // routePath or groupNameFromUrl or both of them have not been defined
        if (routePath === undefined || groupNameFromUrl === undefined) {
            shouldValidateGroupUrl = true;
        }
        // routePath and groupNameFromUrl have been defined
        else {
            if (groupNameFromUrl !== groupUserName) {
                shouldValidateGroupUrl = true;
            }
        }

        // group has not been loaded
        // or group has been loaded but a new group name is set in the url
        // --> continue validating group url
        if ((!group && !loadingGroup && !groupLoaded)
            || (!(!group && !loadingGroup && !groupLoaded) && shouldValidateGroupUrl)
        ) {
            dispatch(setGroupUrlAction);

            const validatingGroupUrlAction: ValidatingGroupUrlAction = {
                type: ManageGroupUrlEvents.ValidatingGroupUrl
            }

            dispatch(validatingGroupUrlAction);

            const finishedLoadingGroupUrlAction: FinishedValidatingGroupUrlAction = {
                type: ManageGroupUrlEvents.FinishedValidatingGroupUrl,
                group: null,
                validGroupUrl: false
            }

            // group name is not specified in the url
            if (!groupUserName) {
                finishedLoadingGroupUrlAction.validGroupUrl = true;
                return dispatch(finishedLoadingGroupUrlAction);
            }

            try {
                const response = await new GroupRepository().getGroup(groupUserName);
                const retrievedGroup: GroupProperties | null = response.data;
                finishedLoadingGroupUrlAction.group = retrievedGroup;
                finishedLoadingGroupUrlAction.validGroupUrl = retrievedGroup !== null;
                return dispatch(finishedLoadingGroupUrlAction);
            } catch (error) {
                finishedLoadingGroupUrlAction.error = {
                    detail: error.toString()
                }
                return dispatch(finishedLoadingGroupUrlAction);
            }
        }
    }
}