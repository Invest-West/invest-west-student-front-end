import {Action, ActionCreator, Dispatch} from "redux";
import {AppState} from "../reducers";

const screenSizeQueries = {
    mobile: `(min-width: 320px) and (max-width: 480px) and (orientation: portrait), (min-height: 320px) and (max-height: 480px) and (orientation: landscape)`,
    tablet: `(min-width: 768px) and (max-width: 1024px) and (orientation: portrait), (min-height: 768px) and (max-height: 1024px) and (orientation: landscape)`,
    laptop: `(min-width: 1200px) and (max-width: 1600px) and (orientation: landscape)`,
    desktop: `(min-width: 1600px) and (orientation: landscape)`,
    minHeight: `(min-height: 1200px)`
}

export const mobileScreen = window.matchMedia(screenSizeQueries.mobile);
export const tabletScreen = window.matchMedia(screenSizeQueries.tablet);
export const laptopScreen = window.matchMedia(screenSizeQueries.laptop);
export const desktopScreen = window.matchMedia(screenSizeQueries.desktop);
export const minHeightScreen = window.matchMedia(screenSizeQueries.minHeight);

export enum MediaQueryEvents {
    MediaQueryChanged = "MediaQueryEvents.MediaQueryChanged"
}

export interface MediaQueryAction extends Action {
    name: string;
    value: boolean;
}

export const addMediaQueryListeners: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        mobileScreen.addEventListener('change',
            () => listener(dispatch, 'isMobile', mobileScreen.matches));
        tabletScreen.addEventListener('change',
            () => listener(dispatch, 'isTablet', tabletScreen.matches));
        laptopScreen.addEventListener('change',
            () => listener(dispatch, 'isLaptop', laptopScreen.matches));
        desktopScreen.addEventListener('change',
            () => listener(dispatch, 'isDesktop', desktopScreen.matches));
        minHeightScreen.addEventListener('change',
            () => listener(dispatch, 'minHeightScreen', minHeightScreen.matches));
    }
};

export const removeMediaQueryListeners: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        mobileScreen.removeEventListener('change',
            () => listener(null, null, null));

        tabletScreen.removeEventListener('change',
            () => listener(null, null, null));

        laptopScreen.removeEventListener('change',
            () => listener(null, null, null));

        desktopScreen.removeEventListener('change',
            () => listener(null, null, null));

        minHeightScreen.removeEventListener('change',
            () => listener(null, null, null));
    }
};

const listener = (dispatch: Dispatch | null, name: string | null, value: boolean | null) => {
    if (dispatch) {
        return dispatch({
            type: MediaQueryEvents.MediaQueryChanged,
            name,
            value
        });
    }
};