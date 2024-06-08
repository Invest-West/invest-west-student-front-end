export const UPLOADING = 'UPLOADING';
export const uploading = (mode, progress) => {
    return {
        type: UPLOADING,
        mode,
        progress
    }
};

export const DISMISS_UPLOADING_STATUS = 'DISMISS_UPLOADING_STATUS';
export const dismissUploadingStatus = () => {
    return {
        type: DISMISS_UPLOADING_STATUS
    }
};