import {ProfileAction, setCopiedUser} from "../../ProfileActions";
import {ActionCreator, Dispatch} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import {openFeedbackSnackbar} from "../../../feedback-snackbar/FeedbackSnackbarActions";
import {FeedbackSnackbarTypes} from "../../../feedback-snackbar/FeedbackSnackbarReducer";
import {EditImageDialogModes, isDeletingProfilePicture, isSavingProfilePicture} from "../../ProfileReducer";
import UserRepository from "../../../../api/repositories/UserRepository";
import User from "../../../../models/user";
import {updateUserChanges} from "../../../../redux-store/actions/authenticationActions";
import FileRepository from "../../../../api/repositories/FileRepository";
import {getCurrentDate} from "../../../../utils/utils";
import {PROFILE_PICTURES_CHILD, USERS_CHILD} from "../../../../firebase/databaseConsts";

export enum EditImageDialogEvents {
    ToggleDialog = "EditImageDialogEvents.ToggleDialog",
    SetEditor = "EditImageDialogEvents.SetEditor",
    ChangeMode = "EditImageDialogEvents.ChangeMode",
    SuccessfullySelectedImage = "EditImageDialogEvents.SuccessfullySelectedImage",
    SliderChanged = "EditImageDialogEvents.SliderChanged",
    SavingImage = "EditImageDialogEvents.SavingImage",
    DeletingImage = "EditImageDialogEvents.DeletingImage"
}

export interface EditImageDialogAction extends ProfileAction {

}

export interface ToggleDialogAction extends EditImageDialogAction {
    // when set (must be a URL), the dialog will be opened in "Display photo" mode
    image?: string;
}

export interface SetEditorAction extends EditImageDialogAction {
    editor: any;
}

export interface ChangeModeAction extends EditImageDialogAction {
    mode: EditImageDialogModes;
}

export interface SuccessfullySelectedImageAction extends EditImageDialogAction {
    selectedImage: File;
}

export interface SliderChangedAction extends EditImageDialogAction {
    name: string;
    value: number;
}

export interface SavingImageAction extends EditImageDialogAction {
    saving: boolean;
}

export interface DeletingImageAction extends EditImageDialogAction {
    deleting: boolean;
}

export const toggleDialog: ActionCreator<any> = (image?: string) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ToggleDialogAction = {
            type: EditImageDialogEvents.ToggleDialog,
            image
        };
        dispatch(action);
        if (image) {
            dispatch(changeMode(EditImageDialogModes.DisplayPhoto));
        }
    }
}

export const setEditor: ActionCreator<any> = (editor: any) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SetEditorAction = {
            type: EditImageDialogEvents.SetEditor,
            editor
        };
        return dispatch(action);
    }
}

export const changeMode: ActionCreator<any> = (mode: EditImageDialogModes) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ChangeModeAction = {
            type: EditImageDialogEvents.ChangeMode,
            mode
        };
        return dispatch(action);
    }
}

/**
 * Handle when an image is successfully selected
 *
 * @param files
 */
export const handleImageChanged: ActionCreator<any> = (files: File[]) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        // error happened
        if (files.length === 0) {
            return;
        }

        const imageFile: File = files[0];
        const action: SuccessfullySelectedImageAction = {
            type: EditImageDialogEvents.SuccessfullySelectedImage,
            selectedImage: imageFile
        };
        dispatch(action);
        return dispatch(changeMode(EditImageDialogModes.EditPhoto));
    }
}

/**
 * Handle when an image is unsuccessfully selected due to oversize, etc.
 *
 * Note: when this event occur, handleImageChanged is also called with files = [].
 *
 * @param error
 * @param file
 */
export const handleImageError: ActionCreator<any> = (error: MediaError, file: File) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, error.message))
    }
}

export const handleSliderChanged: ActionCreator<any> = (sliderName: string, value: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: SliderChangedAction = {
            type: EditImageDialogEvents.SliderChanged,
            name: sliderName,
            value
        };
        return dispatch(action);
    }
}

/**
 * Save edited image as a new profile picture
 */
export const saveImage: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            copiedUser,
            EditImageDialogState
        } = getState().ProfileLocalState;

        const editor: any = EditImageDialogState.editor;

        if (!copiedUser) {
            return;
        }

        if (isSavingProfilePicture(EditImageDialogState)) {
            return;
        }

        try {
            // Note: this can only be done if cors is set.
            // To set cors on Firebase, follow this: https://stackoverflow.com/questions/37760695/firebase-storage-and-access-control-allow-origin/37765371
            const canvas: HTMLCanvasElement = editor.getImage();
            // @ts-ignore
            const editedImageAsBlob: Blob = await new Promise(resolve => canvas.toBlob(resolve));

            const savingImageAction: SavingImageAction = {
                type: EditImageDialogEvents.SavingImage,
                saving: true
            };
            dispatch(savingImageAction);

            const storageID: number = getCurrentDate();
            const imageUrl = await new FileRepository().uploadSingleFile({
                file: editedImageAsBlob,
                fileName: storageID,
                storageLocation: `${USERS_CHILD}/${copiedUser.id}/${PROFILE_PICTURES_CHILD}`
            });

            // update user
            const response = await new UserRepository().updateUser({
                updatedUser: JSON.parse(JSON.stringify(copiedUser)),
                newProfilePicture: {
                    storageID,
                    url: imageUrl
                }
            });

            const updatedUser: User = response.data;

            dispatch(toggleDialog());
            dispatch(updateUserChanges(updatedUser));
            return dispatch(setCopiedUser(updatedUser));
        } catch (error) {
            const errorSavingImageAction: SavingImageAction = {
                type: EditImageDialogEvents.SavingImage,
                saving: false
            };
            dispatch(errorSavingImageAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, "Could not save profile photo."));
        }
    }
}

/**
 * Delete current profile picture
 */
export const deleteImage: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            copiedUser,
            EditImageDialogState
        } = getState().ProfileLocalState;

        if (!copiedUser) {
            return;
        }

        if (isDeletingProfilePicture(EditImageDialogState)) {
            return;
        }

        try {
            const deletingImageAction: DeletingImageAction = {
                type: EditImageDialogEvents.DeletingImage,
                deleting: true
            };
            dispatch(deletingImageAction);

            // update user
            const response = await new UserRepository().updateUser({
                updatedUser: JSON.parse(JSON.stringify(copiedUser)),
                removeProfilePicture: true
            });

            const updatedUser: User = response.data;

            dispatch(changeMode(EditImageDialogModes.AddPhoto));
            dispatch(updateUserChanges(updatedUser));
            return dispatch(setCopiedUser(updatedUser));
        }
        catch (error) {
            const deletingImageAction: DeletingImageAction = {
                type: EditImageDialogEvents.DeletingImage,
                deleting: false
            };
            dispatch(deletingImageAction);
            return dispatch(openFeedbackSnackbar(FeedbackSnackbarTypes.Error, "Could not delete profile photo."));
        }
    }
}