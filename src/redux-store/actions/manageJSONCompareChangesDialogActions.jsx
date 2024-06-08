export const JSON_COMPARE_CHANGES_DIALOG_SET_DATA = 'JSON_COMPARE_CHANGES_DIALOG_SET_DATA';
export const setData = (jsonBefore, jsonAfter) => {
    return {
        type: JSON_COMPARE_CHANGES_DIALOG_SET_DATA,
        jsonBefore,
        jsonAfter
    }
};

export const JSON_COMPARE_CHANGES_DIALOG_RESET_DATA = 'JSON_COMPARE_CHANGES_DIALOG_RESET_DATA';
export const resetData = () => {
    return {
        type: JSON_COMPARE_CHANGES_DIALOG_RESET_DATA
    }
};