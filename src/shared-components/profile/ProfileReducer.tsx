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
    // find address by postcode state for Registered office section
    // list of addresses found by postcode from Registered office section
    // list of addresses found by postcode from Trading address section
    // error finding addresses for Registered office
    // error finding addresses for Trading address
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
        sector: "none",
        university: "",
        course: "",
        logo: [
            {
                storageID: -1,
                url: ""
            }
        ]
    },
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
        default:
            return state;
    }
}

export default profileReducer;