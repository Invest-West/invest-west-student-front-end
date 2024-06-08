import {
    desktopScreen,
    laptopScreen,
    MediaQueryAction,
    MediaQueryEvents,
    minHeightScreen,
    mobileScreen,
    tabletScreen
} from "../actions/mediaQueryActions";

export interface MediaQueryState {
    isMobile: boolean;
    isTablet: boolean;
    isLaptop: boolean;
    isDesktop: boolean;
    minHeightScreen: boolean;
}

const initState: MediaQueryState = {
    isMobile: mobileScreen.matches,
    isTablet: tabletScreen.matches,
    isLaptop: laptopScreen.matches,
    isDesktop: desktopScreen.matches,
    minHeightScreen: minHeightScreen.matches
};

const mediaQueryReducer = (state = initState, action: MediaQueryAction) => {
    if (action.type === MediaQueryEvents.MediaQueryChanged) {
        return {
            ...state,
            [action.name]: action.value
        };
    } else {
        return state;
    }
};

export default mediaQueryReducer;