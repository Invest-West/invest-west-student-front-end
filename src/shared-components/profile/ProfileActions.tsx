import {Action, ActionCreator, Dispatch} from "redux";
import User from "../../models/user";
import {AppState} from "../../redux-store/reducers";
import React from "react";

export enum ProfileEvents {
    SetCopiedUser = "PersonalDetailsEvents.SetCopiedUser"
}

export interface ProfileAction extends Action {

}

export interface SetCopiedUserAction extends ProfileAction {
    copiedUser?: User;
    firstTimeSetCopiedUser?: true; // true or undefined
}

export const setCopiedUser: ActionCreator<any> = (user: User | null, firstTimeSetCopiedUser?: true) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SetCopiedUserAction = {
            type: ProfileEvents.SetCopiedUser,
            copiedUser: user ? JSON.parse(JSON.stringify(user)) : undefined,
            firstTimeSetCopiedUser
        };
        return dispatch(action);
    }
}

// These are the input field categories corresponding to different groups of input fields in the Profile page
export enum InputCategories {
    // includes text fields in the Personal details section
    PersonalDetails = "InputCategories.PersonalDetails",
    // includes text fields in the Business profile section
    BusinessProfile = "InputCategories.BusinessProfile",
    // includes text fields in the Registered office section (subsection of Business profile)
    // includes text fields in the Trading address section (subsection of Business profile)
    // includes text fields in the Director section (subsection of Business profile)
    Director = "InputCategories.Director",
    // includes all checkboxes in Business profile section
    BusinessProfileCheckBox = "InputCategories.BusinessProfileCheckBox"
}

export const handleInputFieldChanged: ActionCreator<any> = (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        let currentCopiedUser: User | undefined = JSON.parse(JSON.stringify(getState().ProfileLocalState.copiedUser));
        if (!currentCopiedUser) {
            return;
        }

        // let newBusinessProfile: BusinessProfile = getState().ProfileLocalState.BusinessProfileState.newBusinessProfile;
        //
        // const inputFieldName: string = event.target.name;
        // const inputFieldValue: string = event.target.value;
        // const inputFieldChecked: boolean = event.target.checked;
        //
        // switch (inputCategory) {
        //     case InputCategories.PersonalDetails:
        //         currentCopiedUser = {
        //             ...currentCopiedUser,
        //             [inputFieldName]: inputFieldValue
        //         }
        //         return dispatch(setCopiedUser(currentCopiedUser));
        //     case InputCategories.BusinessProfile:
        //         if (hasBusinessProfile(currentCopiedUser)) {
        //             currentCopiedUser = {
        //                 ...currentCopiedUser,
        //                 // @ts-ignore
        //                 BusinessProfile: {
        //                     ...currentCopiedUser.BusinessProfile,
        //                     [inputFieldName]: inputFieldValue
        //                 }
        //             }
        //             return dispatch(setCopiedUser(currentCopiedUser));
        //         } else {
        //             newBusinessProfile = {
        //                 ...newBusinessProfile,
        //                 [inputFieldName]: inputFieldValue
        //             }
        //             const updateNewBusinessProfileAction: UpdateNewBusinessProfileAction = {
        //                 type: BusinessProfileEvents.NewBusinessProfileChanged,
        //                 updatedNewBusinessProfile: newBusinessProfile
        //             };
        //             return dispatch(updateNewBusinessProfileAction);
        //         }
        //     case InputCategories.RegisteredOffice: {
        //         if (inputFieldValue === "none") {
        //             return;
        //         }
        //         const foundAddresses: Address[] | undefined = getState().ProfileLocalState.BusinessProfileState.foundAddressesForRegisteredOffice;
        //         if (!foundAddresses) {
        //             return;
        //         }
        //         const index = foundAddresses.findIndex(address => getFormattedAddress(address) === inputFieldValue);
        //         if (index === -1) {
        //             return;
        //         }
        //         if (hasBusinessProfile(currentCopiedUser)) {
        //             currentCopiedUser = {
        //                 ...currentCopiedUser,
        //                 // @ts-ignore
        //                 BusinessProfile: {
        //                     ...currentCopiedUser.BusinessProfile,
        //                     registeredOffice: foundAddresses[index]
        //                 }
        //             }
        //             return dispatch(setCopiedUser(currentCopiedUser));
        //         } else {
        //             newBusinessProfile = {
        //                 ...newBusinessProfile,
        //                 registeredOffice: foundAddresses[index]
        //             };
        //             const updateNewBusinessProfileAction: UpdateNewBusinessProfileAction = {
        //                 type: BusinessProfileEvents.NewBusinessProfileChanged,
        //                 updatedNewBusinessProfile: newBusinessProfile
        //             };
        //             return dispatch(updateNewBusinessProfileAction);
        //         }
        //     }
        //     case InputCategories.TradingAddress: {
        //         if (inputFieldValue === "none") {
        //             return;
        //         }
        //         const foundAddresses: Address[] | undefined = getState().ProfileLocalState.BusinessProfileState.foundAddressesForRegisteredOffice;
        //         if (!foundAddresses) {
        //             return;
        //         }
        //         const index = foundAddresses.findIndex(address => getFormattedAddress(address) === inputFieldValue);
        //         if (index === -1) {
        //             return;
        //         }
        //         if (hasBusinessProfile(currentCopiedUser)) {
        //             currentCopiedUser = {
        //                 ...currentCopiedUser,
        //                 // @ts-ignore
        //                 BusinessProfile: {
        //                     ...currentCopiedUser.BusinessProfile,
        //                     tradingAddress: foundAddresses[index]
        //                 }
        //             }
        //             return dispatch(setCopiedUser(currentCopiedUser));
        //         } else {
        //             newBusinessProfile = {
        //                 ...newBusinessProfile,
        //                 tradingAddress: foundAddresses[index]
        //             };
        //             const updateNewBusinessProfileAction: UpdateNewBusinessProfileAction = {
        //                 type: BusinessProfileEvents.NewBusinessProfileChanged,
        //                 updatedNewBusinessProfile: newBusinessProfile
        //             };
        //             return dispatch(updateNewBusinessProfileAction);
        //         }
        //     }
        //     case InputCategories.BusinessProfileCheckBox:
        //         const businessProfileCheckBoxChangedAction: BusinessProfileCheckBoxChangedAction = {
        //             type: BusinessProfileEvents.CheckBoxChanged,
        //             name: inputFieldName,
        //             value: inputFieldChecked
        //         };
        //         return dispatch(businessProfileCheckBoxChangedAction);
        //     default:
        //         return;
        // }
    }
}