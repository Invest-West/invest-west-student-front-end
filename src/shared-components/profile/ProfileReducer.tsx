import {ProfileAction, ProfileEvents, SetCopiedUserAction} from "./ProfileActions";
import User, {BusinessProfile} from "../../models/user";
import Error from "../../models/error";
import {
    ChangeModeAction,
    DeletingImageAction,
    EditImageDialogEvents,
    SavingImageAction,
    SetEditorAction,
    SliderChangedAction,
    SuccessfullySelectedImageAction,
    ToggleDialogAction
} from "./components/edit-image-dialog/EditImageDialogActions";
import {
    BusinessProfileCheckBoxChangedAction,
    BusinessProfileEvents,
    ChangeAddressFindingStateAction,
    FindingAddressAction,
    FinishedFindingAddressAction
} from "./components/business-profile/BusinessProfileActions";
import Address from "../../models/address";

// State for Personal details section
export interface PersonalDetailsState {

}

export enum AddressStates {
    EnterPostcode = "AddressFindingStates.EnterPostcode",
    FindingAddresses = "AddressFindingStates.FindingAddresses",
    DisplayFoundAddresses = "AddressFindingStates.DisplayFoundAddresses"
}

// State for Business profile section
export interface BusinessProfileState {
    // this state is used to keeping track of the changes in Business profile
    editedBusinessProfile: BusinessProfile;
    // find address by postcode state for Registered office section
    registeredOfficeState: AddressStates;
    // find address by postcode state for Registered office section
    tradingAddressState: AddressStates;
    // list of addresses found by postcode from Registered office section
    foundAddressesForRegisteredOffice?: Address[];
    // list of addresses found by postcode from Trading address section
    foundAddressesForTradingAddress?: Address[];
    // error finding addresses for Registered office
    errorFindingAddressesForRegisteredOffice?: Error;
    // error finding addresses for Trading address
    errorFindingAddressesForTradingAddress?: Error;
    tradingAddressSameAsRegisteredOffice: boolean;
}

export enum EditImageDialogModes {
    AddPhoto = "EditImageDialogModes.AddPhoto",
    EditPhoto = "EditImageDialogModes.EditPhoto",
    DisplayPhoto = "EditImageDialogModes.DisplayPhoto"
}

// State for Edit Image dialog
export interface EditImageDialogState {
    dialogOpen: boolean;
    mode: EditImageDialogModes;
    // reference to the editor
    editor?: any;
    rawImage?: File | string;
    editedImage?: Blob;

    scale: number;
    rotate: number;

    savingImage: boolean;
    deletingImage: boolean;
}

// State for the whole Profile page
export interface ProfileState {
    copiedUser?: User;
    hasInitiallySetCopiedUser: boolean;
    PersonalDetailsState: PersonalDetailsState;
    BusinessProfileState: BusinessProfileState;
    EditImageDialogState: EditImageDialogState;
}

// initial state for Personal details section
const initialPersonalDetailsState: PersonalDetailsState = {}

// initial state for Business profile section
const initialBusinessProfileState: BusinessProfileState = {
    editedBusinessProfile: {
        companyName: "",
        companyWebsite: "",
        registrationNo: "",
        sector: "none",
        directors: [""],
        registeredOffice: {
            address1: "none",
            address2: "",
            address3: "",
            postcode: "",
            townCity: ""
        },
        tradingAddress: {
            address1: "none",
            address2: "",
            address3: "",
            postcode: "",
            townCity: ""
        },
        logo: [
            {
                storageID: -1,
                url: ""
            }
        ]
    },
    registeredOfficeState: AddressStates.EnterPostcode,
    tradingAddressState: AddressStates.EnterPostcode,
    tradingAddressSameAsRegisteredOffice: true
}

// initial state for Edit Image dialog
const initialEditImageDialogState: EditImageDialogState = {
    dialogOpen: false,
    mode: EditImageDialogModes.AddPhoto,

    scale: 1,
    rotate: 0,

    savingImage: false,
    deletingImage: false
}

// initial state for the whole Profile page
const initialState: ProfileState = {
    hasInitiallySetCopiedUser: false,
    PersonalDetailsState: initialPersonalDetailsState,
    BusinessProfileState: initialBusinessProfileState,
    EditImageDialogState: initialEditImageDialogState
}

export const hasInitiallySetCopiedUser = (state: ProfileState) => {
    return state.hasInitiallySetCopiedUser;
}

export const isSavingProfilePicture = (state: EditImageDialogState) => {
    return state.savingImage;
}

export const isDeletingProfilePicture = (state: EditImageDialogState) => {
    return state.deletingImage;
}

export const hasErrorFindingAddressForRegisteredOffice = (state: BusinessProfileState) => {
    return state.errorFindingAddressesForRegisteredOffice !== undefined;
}

export const hasErrorFindingAddressForTradingAddress = (state: BusinessProfileState) => {
    return state.errorFindingAddressesForTradingAddress !== undefined;
}

const profileReducer = (state = initialState, action: ProfileAction) => {
    switch (action.type) {
        case ProfileEvents.SetCopiedUser:
            const setCopiedUserAction: SetCopiedUserAction = action as SetCopiedUserAction;
            return {
                ...state,
                copiedUser: setCopiedUserAction.copiedUser,
                hasInitiallySetCopiedUser: setCopiedUserAction.firstTimeSetCopiedUser === true ? true : state.hasInitiallySetCopiedUser
            }
        case EditImageDialogEvents.ToggleDialog:
            const toggleDialogAction: ToggleDialogAction = action as ToggleDialogAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...initialEditImageDialogState,
                    dialogOpen: !state.EditImageDialogState.dialogOpen,
                    rawImage: toggleDialogAction.image
                }
            }
        case EditImageDialogEvents.SetEditor:
            const setEditorAction: SetEditorAction = action as SetEditorAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    editor: setEditorAction.editor
                }
            }
        case EditImageDialogEvents.ChangeMode:
            const changeModeAction: ChangeModeAction = action as ChangeModeAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    mode: changeModeAction.mode
                }
            }
        case EditImageDialogEvents.SuccessfullySelectedImage:
            const successfullySelectedImageAction: SuccessfullySelectedImageAction = action as SuccessfullySelectedImageAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    rawImage: successfullySelectedImageAction.selectedImage
                }
            }
        case EditImageDialogEvents.SliderChanged:
            const sliderChangedAction: SliderChangedAction = action as SliderChangedAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    [sliderChangedAction.name]: sliderChangedAction.value
                }
            }
        case EditImageDialogEvents.SavingImage:
            const savingImageAction: SavingImageAction = action as SavingImageAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    savingImage: savingImageAction.saving
                }
            }
        case EditImageDialogEvents.DeletingImage:
            const deletingImageAction: DeletingImageAction = action as DeletingImageAction;
            return {
                ...state,
                EditImageDialogState: {
                    ...state.EditImageDialogState,
                    deletingImage: deletingImageAction.deleting
                }
            }
        // case BusinessProfileEvents.NewBusinessProfileChanged:
        //     const updateNewBusinessProfileAction: UpdateNewBusinessProfileAction = action as UpdateNewBusinessProfileAction;
        //     return {
        //         ...state,
        //         BusinessProfileState: {
        //             ...state.BusinessProfileState,
        //             newBusinessProfile: updateNewBusinessProfileAction.updatedNewBusinessProfile
        //         }
        //     }
        case BusinessProfileEvents.CheckBoxChanged:
            const businessProfileCheckBoxChangedAction: BusinessProfileCheckBoxChangedAction = action as BusinessProfileCheckBoxChangedAction;
            return {
                ...state,
                BusinessProfileState: {
                    ...state.BusinessProfileState,
                    [businessProfileCheckBoxChangedAction.name]: businessProfileCheckBoxChangedAction.value
                }
            }
        case BusinessProfileEvents.FindingAddress:
            const findingAddressAction: FindingAddressAction = action as FindingAddressAction;
            return {
                ...state,
                BusinessProfileState: {
                    ...state.BusinessProfileState,
                    registeredOfficeState: findingAddressAction.mode === "registeredOffice"
                        ? AddressStates.FindingAddresses : state.BusinessProfileState.registeredOfficeState,
                    tradingAddressState: findingAddressAction.mode === "tradingAddress"
                        ? AddressStates.FindingAddresses : state.BusinessProfileState.tradingAddressState
                }
            }
        case BusinessProfileEvents.FinishedFindingAddress:
            const finishedFindingAddressAction: FinishedFindingAddressAction = action as FinishedFindingAddressAction;
            return {
                ...state,
                BusinessProfileState: {
                    ...state.BusinessProfileState,
                    foundAddressesForRegisteredOffice: finishedFindingAddressAction.mode === "registeredOffice"
                        ? finishedFindingAddressAction.foundAddresses : state.BusinessProfileState.foundAddressesForRegisteredOffice,
                    foundAddressesForTradingAddress: finishedFindingAddressAction.mode === "tradingAddress"
                        ? finishedFindingAddressAction.foundAddresses : state.BusinessProfileState.foundAddressesForTradingAddress,
                    errorFindingAddressesForRegisteredOffice: finishedFindingAddressAction.mode === "registeredOffice" && finishedFindingAddressAction.error !== undefined
                        ? {detail: finishedFindingAddressAction.error} : state.BusinessProfileState.errorFindingAddressesForRegisteredOffice,
                    errorFindingAddressesForTradingAddress: finishedFindingAddressAction.mode === "tradingAddress" && finishedFindingAddressAction.error !== undefined
                        ? {detail: finishedFindingAddressAction.error} : state.BusinessProfileState.errorFindingAddressesForTradingAddress
                }
            }
        case BusinessProfileEvents.ChangeAddressState:
            const changeAddressStateAction: ChangeAddressFindingStateAction = action as ChangeAddressFindingStateAction;
            return {
                ...state,
                BusinessProfileState: {
                    ...state.BusinessProfileState,
                    registeredOfficeState: changeAddressStateAction.mode === "registeredOffice"
                        ? changeAddressStateAction.addressState : state.BusinessProfileState.registeredOfficeState,
                    tradingAddressState: changeAddressStateAction.mode === "tradingAddress"
                        ? changeAddressStateAction.addressState : state.BusinessProfileState.tradingAddressState,
                    // if addressState is set to EnterPostcode, reset other states to initial values
                    foundAddressesForRegisteredOffice: changeAddressStateAction.mode === "registeredOffice"
                    && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                        ? undefined : state.BusinessProfileState.foundAddressesForRegisteredOffice,
                    foundAddressesForTradingAddress: changeAddressStateAction.mode === "tradingAddress"
                    && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                        ? undefined : state.BusinessProfileState.foundAddressesForTradingAddress,
                    errorFindingAddressesForRegisteredOffice: changeAddressStateAction.mode === "registeredOffice"
                    && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                        ? undefined : state.BusinessProfileState.errorFindingAddressesForRegisteredOffice,
                    errorFindingAddressesForTradingAddress: changeAddressStateAction.mode === "tradingAddress"
                    && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                        ? undefined : state.BusinessProfileState.errorFindingAddressesForTradingAddress,
                    editedBusinessProfile: {
                        ...state.BusinessProfileState.editedBusinessProfile,
                        registeredOffice: changeAddressStateAction.mode === "registeredOffice"
                        && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                            ? initialBusinessProfileState.editedBusinessProfile.registeredOffice
                            : state.BusinessProfileState.editedBusinessProfile.registeredOffice,
                        tradingAddress: changeAddressStateAction.mode === "tradingAddress"
                        && changeAddressStateAction.addressState === AddressStates.EnterPostcode
                            ? initialBusinessProfileState.editedBusinessProfile.tradingAddress
                            : state.BusinessProfileState.editedBusinessProfile.tradingAddress
                    }
                }
            }
        default:
            return state;
    }
}

export default profileReducer;