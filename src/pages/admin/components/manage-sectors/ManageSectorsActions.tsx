import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import React from "react";
import {SystemAttributes} from "../../../../models/system_attributes";
import SystemAttributesRepository from "../../../../api/repositories/SystemAttributesRepository";
import {openFeedbackSnackbar} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";

export enum ManageSectorsEvents {
    SetSectors = "ManageSectorsEvents.SetSectors",
    ToggleAddNewSector = "ManageSectorsEvents.ToggleAddNewSector",
    AddNewSectorTextChanged = "ManageSectorsEvents.AddNewSectorTextChanged",
    SavingSectorsChanges = "ManageSectorsEvents.SavingSectorsChanges",
    CompletedSavingSectorsChanges = "ManageSectorsEvents.CompletedSavingSectorsChanges"
}

export interface ManageSectorsAction extends Action {

}

export interface SetSectorsAction extends ManageSectorsAction {
    sectors: string[];
}

export interface AddNewSectorTextChangedAction extends ManageSectorsAction {
    value: string;
}

export interface CompletedSavingSectorsChangesAction extends ManageSectorsAction {
    error?: string;
}

export const setSectors: ActionCreator<any> = (sectors: string[]) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SetSectorsAction = {
            type: ManageSectorsEvents.SetSectors,
            sectors: [...sectors]
        };
        return dispatch(action);
    }
}

export const toggleAddNewSector: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: ManageSectorsEvents.ToggleAddNewSector
        });
    }
}

export const onTextChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: AddNewSectorTextChangedAction = {
            type: ManageSectorsEvents.AddNewSectorTextChanged,
            value: event.target.value
        };
        return dispatch(action);
    }
}

export const addNewSector: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const sectors: string[] = [...getState().ManageSectorsLocalState.sectors];
        const newSector: string = getState().ManageSectorsLocalState.newSector;
        sectors.push(newSector);
        dispatch(setSectors(sectors));
        return dispatch(toggleAddNewSector());
    }
}

export const deleteSector: ActionCreator<any> = (sector: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const sectors: string[] = [...getState().ManageSectorsLocalState.sectors];
        const index = sectors.findIndex(eSector => eSector === sector);
        if (index !== -1) {
            sectors.splice(index, 1);
        }
        return dispatch(setSectors(sectors));
    }
}

export const cancelSectorsChanges: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const systemAttributes: SystemAttributes | null = getState().ManageSystemAttributesState.systemAttributes;
        if (!systemAttributes) {
            return;
        }
        return dispatch(setSectors([...systemAttributes.Sectors]));
    }
}

export const saveSectorsChanges: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const systemAttributes: SystemAttributes | null = JSON.parse(JSON.stringify(getState().ManageSystemAttributesState.systemAttributes));
        if (!systemAttributes) {
            return;
        }
        const sectors: string[] = [...getState().ManageSectorsLocalState.sectors];
        const completeAction: CompletedSavingSectorsChangesAction = {
            type: ManageSectorsEvents.CompletedSavingSectorsChanges
        };
        try {
            systemAttributes.Sectors = sectors;
            dispatch({
                type: ManageSectorsEvents.SavingSectorsChanges
            });
            await new SystemAttributesRepository().updateSystemAttributes(systemAttributes);
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, completeAction.error));
            return dispatch(completeAction);
        }
    }
}