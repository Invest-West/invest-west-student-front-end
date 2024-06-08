export const TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR';
export const toggleSidebar = checkSidebarDocked => {
    return (dispatch, getState) => {

        if (!checkSidebarDocked) {
            dispatch({
                type: TOGGLE_SIDEBAR,
                sidebarOpen: false
            });
            return;
        }

        if (getState().MediaQueryState.isLaptop || getState().MediaQueryState.isDesktop) {
            dispatch({
                type: TOGGLE_SIDEBAR,
                sidebarDocked: !getState().dashboardSidebar.sidebarDocked,
                sidebarOpen: false
            });
        }
        else {
            dispatch({
                type: TOGGLE_SIDEBAR,
                sidebarDocked: false,
                sidebarOpen: !getState().dashboardSidebar.sidebarOpen
            });
        }
    }
};