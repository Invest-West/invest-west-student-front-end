import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../reducers";
import Error from "../../models/error";
import {SystemAttributes} from "../../models/system_attributes";
import SystemAttributesRepository from "../../api/repositories/SystemAttributesRepository";
import {setSectors} from "../../pages/admin/components/manage-sectors/ManageSectorsActions";

export enum ManageSystemAttributesEvents {
    LoadingSystemAttributes = "ManageSystemAttributesEvents.LoadingSystemAttributes",
    FinishedLoadingSystemAttributes = "ManageSystemAttributesEvents.FinishedLoadingSystemAttributes"
}

export interface ManageSystemAttributesAction extends Action {
}

export interface FinishedLoadingSystemAttributesAction extends ManageSystemAttributesAction {
    systemAttributes: SystemAttributes | null;
    error?: Error;
}

export const loadSystemAttributes: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            systemAttributes,
            systemAttributesLoaded,
            loadingSystemAttributes
        } = getState().ManageSystemAttributesState;

        if (!systemAttributesLoaded && !loadingSystemAttributes && !systemAttributes) {
            dispatch({
                type: ManageSystemAttributesEvents.LoadingSystemAttributes
            });

            const finishedAction: FinishedLoadingSystemAttributesAction = {
                type: ManageSystemAttributesEvents.FinishedLoadingSystemAttributes,
                systemAttributes: null
            }

            try {
                const response = await new SystemAttributesRepository().getSystemAttributes();
                const systemAttributes: SystemAttributes = response.data;
                finishedAction.systemAttributes = systemAttributes;
                dispatch(setSectors(systemAttributes.Sectors))
                return dispatch(finishedAction);
            } catch (error) {
                finishedAction.error = {
                    detail: error.toString()
                };
                return dispatch(finishedAction);
            }
        }
    }
}