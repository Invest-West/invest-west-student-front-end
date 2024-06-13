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

export interface BusinessProfileCheckBoxChangedAction extends BusinessProfileAction {
    name: string;
    value: boolean;
}