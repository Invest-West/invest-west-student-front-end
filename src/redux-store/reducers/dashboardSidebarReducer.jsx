import * as mediaQueryActions from '../actions/mediaQueryActions';
import * as dashboardSidebarActions from '../actions/dashboardSidebarActions';
import * as authActions from '../actions/authActions';
import {MediaQueryEvents} from "../actions/mediaQueryActions";

const initState = {
    sidebarDocked: mediaQueryActions.laptopScreen.matches || mediaQueryActions.desktopScreen.matches,
    sidebarOpen: false
};

const dashboardSidebarReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case dashboardSidebarActions.TOGGLE_SIDEBAR:
            return {
                ...state,
                sidebarDocked: action.hasOwnProperty('sidebarDocked') ? action.sidebarDocked : state.sidebarDocked,
                sidebarOpen: action.sidebarOpen
            };
        case MediaQueryEvents.MediaQueryChanged:
            return {
                ...state,
                sidebarDocked:
                    action.name === 'isLaptop' || action.name === 'isDesktop'
                        ?
                        action.value
                        :
                        state.sidebarDocked
                ,
                sidebarOpen: false
            };
        default:
            return state;
    }
};

export default dashboardSidebarReducer;