import {
    AddNewSectorTextChangedAction,
    CompletedSavingSectorsChangesAction,
    ManageSectorsAction,
    ManageSectorsEvents,
    SetSectorsAction
} from "./ManageSectorsActions";
import Error from "../../../../models/error";

export interface ManageSectorsState {
    addingNewSector: boolean;
    newSector: string;
    sectors: string[];
    savingSectors: boolean;
    errorSavingSectors?: Error;
}

const initialState: ManageSectorsState = {
    addingNewSector: false,
    newSector: "",
    sectors: [],
    savingSectors: false
}

export const isSavingSectorsChanges = (state: ManageSectorsState) => {
    return state.savingSectors;
}

export const manageSectorsReducer = (state = initialState, action: ManageSectorsAction) => {
    switch (action.type) {
        case ManageSectorsEvents.SetSectors:
            const setSectorsAction: SetSectorsAction = action as SetSectorsAction;
            return {
                ...state,
                sectors: setSectorsAction.sectors
            }
        case ManageSectorsEvents.ToggleAddNewSector:
            return {
                ...state,
                addingNewSector: !state.addingNewSector,
                newSector: ""
            }
        case ManageSectorsEvents.AddNewSectorTextChanged:
            const addNewSectorTextChangedAction: AddNewSectorTextChangedAction = action as AddNewSectorTextChangedAction;
            return {
                ...state,
                newSector: addNewSectorTextChangedAction.value
            }
        case ManageSectorsEvents.SavingSectorsChanges:
            return {
                ...state,
                savingSectors: true,
                errorSavingSectors: undefined
            }
        case ManageSectorsEvents.CompletedSavingSectorsChanges:
            const completedSavingSectorsChanges: CompletedSavingSectorsChangesAction = action as CompletedSavingSectorsChangesAction;
            return {
                ...state,
                savingSectors: false,
                errorSavingSectors: completedSavingSectorsChanges.error !== undefined
                    ? {detail: completedSavingSectorsChanges.error} : state.errorSavingSectors
            }
        default:
            return state;
    }
}

export default manageSectorsReducer;