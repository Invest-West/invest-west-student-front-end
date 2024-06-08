import {ProfileAction} from "../../ProfileActions";
import {ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import Address from "../../../../models/address";
import AddressRepository from "../../../../api/repositories/AddressRepository";
import {AddressStates} from "../../ProfileReducer";

export enum BusinessProfileEvents {
    NewBusinessProfileChanged = "BusinessProfileEvents.NewBusinessProfileChanged",
    CheckBoxChanged = "BusinessProfileEvents.CheckBoxChanged",
    FindingAddress = "BusinessProfileEvents.FindingAddress",
    FinishedFindingAddress = "BusinessProfileEvents.FinishedFindingAddress",
    ChangeAddressState = "BusinessProfileEvents.ChangeAddressState"
}

export interface BusinessProfileAction extends ProfileAction {

}

export interface ToggleEnterAddressManuallyAction extends BusinessProfileAction {
    mode: "registeredOffice" | "tradingAddress"
}

export interface FindingAddressAction extends BusinessProfileAction {
    mode: "registeredOffice" | "tradingAddress";
}

export interface FinishedFindingAddressAction extends BusinessProfileAction {
    mode: "registeredOffice" | "tradingAddress";
    foundAddresses: Address[] | undefined;
    error?: string;
}

export interface ChangeAddressFindingStateAction extends BusinessProfileAction {
    mode: "registeredOffice" | "tradingAddress";
    addressState: AddressStates;
}

export interface BusinessProfileCheckBoxChangedAction extends BusinessProfileAction {
    name: string;
    value: boolean;
}

export const findAddress: ActionCreator<any> = (mode: "registeredOffice" | "tradingAddress") => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            copiedUser
        } = getState().ProfileLocalState;

        if (!copiedUser) {
            return;
        }

        // if (hasBusinessProfile(copiedUser)) {
        //     if (mode === "registeredOffice") {
        //         postcode = copiedUser.BusinessProfile?.registeredOffice.postcode ?? "";
        //     } else {
        //         postcode = copiedUser.BusinessProfile?.tradingAddress.postcode ?? "";
        //     }
        // } else {
        //     if (mode === "registeredOffice") {
        //         postcode = BusinessProfileState.newBusinessProfile.registeredOffice.postcode;
        //     } else {
        //         postcode = BusinessProfileState.newBusinessProfile.tradingAddress.postcode;
        //     }
        // }

        const finishedFindingAddressAction: FinishedFindingAddressAction = {
            type: BusinessProfileEvents.FinishedFindingAddress,
            mode,
            foundAddresses: undefined
        };

        try {
            const findingAddressAction: FindingAddressAction = {
                type: BusinessProfileEvents.FindingAddress,
                mode
            };
            dispatch(findingAddressAction);

            const results: Address[] = await new AddressRepository().findAddress("dummy postcode");
            finishedFindingAddressAction.foundAddresses = [...results];
            dispatch(finishedFindingAddressAction);
            return dispatch(changeAddressFindingState(mode, AddressStates.DisplayFoundAddresses));
        } catch (error) {
            finishedFindingAddressAction.error = error.toString();
            dispatch(finishedFindingAddressAction);
            return dispatch(changeAddressFindingState(mode, AddressStates.EnterPostcode));
        }
    }
}

export const changeAddressFindingState: ActionCreator<any> = (mode: "registeredOffice" | "tradingAddress", addressState: AddressStates) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ChangeAddressFindingStateAction = {
            type: BusinessProfileEvents.ChangeAddressState,
            mode,
            addressState
        };
        return dispatch(action);
    }
}