import React, {Component} from "react";
import FlexView from "react-flexview/lib/index";
import {css} from "aphrodite";
import {Divider, List, ListItem, ListItemIcon, ListItemText, Link} from "@material-ui/core";
import {Image} from "react-bootstrap";
import HomeIcon from "@material-ui/icons/Home";
import WorkIcon from "@material-ui/icons/Work";
import SettingsIcon from "@material-ui/icons/Settings";
import ContactSupportIcon from "@material-ui/icons/ContactSupport";
import ArrowLeft from "@material-ui/icons/SubdirectoryArrowLeft";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import BubbleChartIcon from "@material-ui/icons/BubbleChart";
import ProjectIcon from "@material-ui/icons/CardGiftcard";
import InfoIcon from "@material-ui/icons/Info";
import HistoryIcon from "@material-ui/icons/History";
import {NavLink} from "react-router-dom";

import {connect} from "react-redux";
import * as authActions from "../../redux-store/actions/authActions";
import * as dashboardSidebarActions from "../../redux-store/actions/dashboardSidebarActions";
import * as forumsActions from "../../redux-store/actions/forumsActions";

import * as DB_CONST from "../../firebase/databaseConsts";
import * as ROUTES from "../../router/routes";
import Routes from "../../router/routes";
import * as utils from "../../utils/utils";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {signOut} from "../../redux-store/actions/authenticationActions";
import {School} from "@material-ui/icons";
import {safeRemoveItem, safeSetItem} from "../../utils/browser";

export const HOME_TAB = "Home";
export const PROFILE_TAB = "Profile";
export const FORUMS_TAB = "Forums";
export const MY_OFFERS_TAB = "My projects";
// export const MY_PLEDGES_TAB = "My pledges";
export const SETTINGS_TAB = "Settings";
export const CHANGE_PASSWORD_TAB = "Change password";
export const CONTACT_US_TAB = "Contact us";
export const GUIDELINE_TAB = "Help";
export const RESOURCES_TAB = "Resources";
export const EXPLORE_GROUPS_TAB = "Explore Universities";
export const EXPLORE_COURSES_TAB = "Explore Courses";
export const EXPLORE_OFFERS_TAB = "Explore student projects";
export const MY_ACTIVITIES_TAB = "My activities";
export const GROUP_ACTIVITIES_TAB = "Audit Log";

const mapStateToProps = state => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,

        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,

        user: state.auth.user
    };
};

const mapDispatchToProps = dispatch => {
    return {
        signOutNew: async () => dispatch(signOut()),

        logout: () => dispatch(authActions.logout()),
        toggleSidebar: (checkSidebarDocked) => dispatch(dashboardSidebarActions.toggleSidebar(checkSidebarDocked)),

        goBackToForumsMain: () => dispatch(forumsActions.goBackToForumsMain())
    };
};

class SidebarContent extends Component {

    onLogoutClick = async () => {
        const {
            dashboardProps,
            logout,

            ManageGroupUrlState,
            AuthenticationState,
            signOutNew
        } = this.props;

        // CRITICAL: Set a logout flag FIRST to prevent GroupRoute from saving redirect URLs
        safeSetItem('isLoggingOut', 'true');

        // Clear any existing redirect URL immediately
        safeRemoveItem('redirectToAfterAuth');

        // Navigate to home BEFORE signing out to prevent race condition
        // where GroupRoute saves the current protected route as redirectToAfterAuth
        const homeRoute = Routes.constructHomeRoute(dashboardProps.match.params, ManageGroupUrlState, AuthenticationState);
        dashboardProps.history.push(homeRoute);

        // Small delay to ensure navigation happens before sign out
        await new Promise(resolve => setTimeout(resolve, 100));

        await signOutNew();
        logout(); // logout old

        // Clear the logout flag and redirect URL one final time
        safeRemoveItem('isLoggingOut');
        safeRemoveItem('redirectToAfterAuth');
    };

    onForumsTabClick = () => {
        this.props.toggleSidebar(false);
        this.props.goBackToForumsMain();
    };

    render() {
        const {
            groupUserName,
            groupPropertiesLoaded,
            groupProperties,

            user,
            dashboardProps,

            toggleSidebar
        } = this.props;

        if (!groupPropertiesLoaded) {
            return null;
        }

        return (
            <FlexView
                column
                width={240}
                height="100%"
            >
                {/** Sidebar header */}
                <FlexView column height={65} vAlignContent="center" hAlignContent="center" style={{ padding: 8 }} >
                    <Link href={groupProperties?.website ?? ""} target="_blank">
                        <Image
                            style={{ width: "auto", height: 65, margin: 0, padding: 10, objectFit: "scale-down" }}
                            src={
                                !groupProperties
                                    ?
                                    require('../../img/logo.png').default
                                    :
                                    utils.getLogoFromGroup(utils.GET_PLAIN_LOGO, groupProperties)
                            }
                        />
                    </Link>
                </FlexView>

                <Divider/>

                {/** Main navigation */}
                <FlexView column marginTop={10} >
                    {/** Home tab */}
                    <List>
                        <NavLink
                            to={{ pathname: dashboardProps.match.pathname, search: `?tab=${HOME_TAB}` }}
                            className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                        >
                            <ListItem button onClick={() => toggleSidebar(false)} >
                                <ListItemIcon>
                                    <HomeIcon/>
                                </ListItemIcon>
                                <ListItemText className={css(sharedStyles.black_text)}>{HOME_TAB}</ListItemText>
                            </ListItem>
                        </NavLink>

                        {/** Offers table */}
                        {
                            !user
                                ?
                                null
                                :
                                // user.type === DB_CONST.TYPE_INVESTOR
                                //     ?
                                //     <NavLink
                                //         to={{
                                //             pathname: dashboardProps.match.pathname,
                                //             search: `?tab=${MY_PLEDGES_TAB}`
                                //         }}
                                //         className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                //     >
                                //         <ListItem
                                //             button
                                //             onClick={() => toggleSidebar(false)}
                                //         >
                                //             <ListItemIcon>
                                //                 <HowToVoteIcon/>
                                //             </ListItemIcon>
                                //             <ListItemText
                                //                 className={css(sharedStyles.black_text)}
                                //             >
                                //                 {MY_PLEDGES_TAB}
                                //             </ListItemText>
                                //         </ListItem>
                                //     </NavLink>
                                //     :
                                user.type === DB_CONST.TYPE_ISSUER
                                    ?
                                    <NavLink
                                        to={{ pathname: dashboardProps.match.pathname, search: `?tab=${MY_OFFERS_TAB}` }}
                                        className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                    >
                                        <ListItem
                                            button
                                            onClick={() => toggleSidebar(false)}
                                        >
                                            <ListItemIcon>
                                                <ProjectIcon/>
                                            </ListItemIcon>
                                            <ListItemText className={css(sharedStyles.black_text)}>{MY_OFFERS_TAB}</ListItemText>
                                        </ListItem>
                                    </NavLink>
                                    :
                                    null
                        }

                        {/** Explore offers tab */}
                        {
                            user.type !== DB_CONST.TYPE_ADMIN
                                ?
                                null
                                :
                                <NavLink
                                    to={{
                                        pathname: dashboardProps.match.pathname,
                                        search: `?tab=${EXPLORE_OFFERS_TAB}`
                                    }}
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <ProjectIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)}>{EXPLORE_OFFERS_TAB}</ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Explore courses tab - Show different tabs based on user type */}
                        {
                            // Super admins see "Explore Universities" with full hierarchy
                            user && user.type === DB_CONST.TYPE_ADMIN && (user.superAdmin || user.superGroupAdmin)
                                ? (
                                    <NavLink
                                        to={{
                                            pathname: dashboardProps.match.pathname,
                                            search: `?tab=${EXPLORE_GROUPS_TAB}`
                                        }}
                                        className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                    >
                                        <ListItem button onClick={() => toggleSidebar(false)} >
                                            <ListItemIcon>
                                                <BubbleChartIcon/>
                                            </ListItemIcon>
                                            <ListItemText className={css(sharedStyles.black_text)}>{EXPLORE_GROUPS_TAB}</ListItemText>
                                        </ListItem>
                                    </NavLink>
                                )
                                : (
                                    // Non-super admins see "Explore Courses" with only their university's courses
                                    <NavLink
                                        to={{
                                            pathname: dashboardProps.match.pathname,
                                            search: `?tab=${EXPLORE_COURSES_TAB}`
                                        }}
                                        className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                    >
                                        <ListItem button onClick={() => toggleSidebar(false)} >
                                            <ListItemIcon>
                                                <BubbleChartIcon/>
                                            </ListItemIcon>
                                            <ListItemText className={css(sharedStyles.black_text)}>{EXPLORE_COURSES_TAB}</ListItemText>
                                        </ListItem>
                                    </NavLink>
                                )
                        } 

                        {/** Resources 
                        <NavLink
                            to={{
                                pathname: dashboardProps.match.pathname,
                                search: `?tab=${RESOURCES_TAB}`
                            }}
                            className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                        >
                            <ListItem button onClick={() => toggleSidebar(false)} >
                                <ListItemIcon>
                                    <School/>
                                </ListItemIcon>
                                <ListItemText className={css(sharedStyles.black_text)}>{RESOURCES_TAB}</ListItemText>
                            </ListItem>
                        </NavLink>
                        */
                    }
                    </List>
                
                </FlexView>

                {/** Footer navigation */}
                <FlexView column height='100%' vAlignContent="bottom" >
                    <List>
                        {/** Profile tab (for normal users) || Settings tab (for admins) */}
                        {
                            !user
                                ?
                                null
                                :
                                user.type !== DB_CONST.TYPE_ADMIN
                                    ?
                                    <NavLink
                                        to={{
                                            pathname: dashboardProps.match.pathname,
                                            search: `?tab=${PROFILE_TAB}`
                                        }}
                                        className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                    >
                                        <ListItem button onClick={() => toggleSidebar(false)} >
                                            <ListItemIcon>
                                                <WorkIcon/>
                                            </ListItemIcon>
                                            <ListItemText className={css(sharedStyles.black_text)}>{PROFILE_TAB}</ListItemText>
                                        </ListItem>
                                    </NavLink>
                                    :
                                    <NavLink
                                        to={{
                                            pathname: dashboardProps.match.pathname,
                                            search: `?tab=${SETTINGS_TAB}`
                                        }}
                                        className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                    >
                                        <ListItem button onClick={() => toggleSidebar(false)} >
                                            <ListItemIcon>
                                                <SettingsIcon/>
                                            </ListItemIcon>
                                            <ListItemText className={css(sharedStyles.black_text)}>{SETTINGS_TAB}</ListItemText>
                                        </ListItem>
                                    </NavLink>
                        }

                        {/** My/Course activities tab */}
                        {
                            user.type !== DB_CONST.TYPE_ADMIN
                                ?
                                null
                                :
                                <NavLink
                                    to={{
                                        pathname: dashboardProps.match.pathname,
                                        search: `?tab=${(user.type === DB_CONST.TYPE_ADMIN && !user.superAdmin) ? GROUP_ACTIVITIES_TAB : MY_ACTIVITIES_TAB}`
                                    }}
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <HistoryIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)} >
                                            {
                                                GROUP_ACTIVITIES_TAB
                                            }
                                        </ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Change password tab */}
                        {
                            !user
                                ?
                                null
                                :
                                <NavLink
                                    to={{
                                        pathname: dashboardProps.match.pathname,
                                        search: `?tab=${CHANGE_PASSWORD_TAB}`
                                    }}
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <VerifiedUserIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)}>{CHANGE_PASSWORD_TAB}</ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Forums tab */}
                        {/*<NavLink*/}
                        {/*    to={{*/}
                        {/*        pathname: dashboardProps.match.pathname,*/}
                        {/*        search: `?tab=${FORUMS_TAB}`*/}
                        {/*    }}*/}
                        {/*    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}*/}
                        {/*>*/}
                        {/*    <ListItem*/}
                        {/*        button*/}
                        {/*        onClick={this.onForumsTabClick}*/}
                        {/*    >*/}
                        {/*        <ListItemIcon>*/}
                        {/*            <ChatIcon/>*/}
                        {/*        </ListItemIcon>*/}
                        {/*        <ListItemText*/}
                        {/*            className={css(sharedStyles.black_text)}*/}
                        {/*        >*/}
                        {/*            {FORUMS_TAB}*/}
                        {/*        </ListItemText>*/}
                        {/*    </ListItem>*/}
                        {/*</NavLink>*/}
                        {
                            user.type === DB_CONST.TYPE_ADMIN
                                ?
                                null
                                :
                                <NavLink
                                    to={Routes.constructContactUsRoute(dashboardProps.match.params)}
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <ContactSupportIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)}>{CONTACT_US_TAB}</ListItemText>
                                    </ListItem>
                                </NavLink>
                        }

                        {/** Help tab */}
                        {/* COMMENTED OUT - Help menu removed from all accounts
                        {
                            // don't need to show this tab to super admin
                            user.type === DB_CONST.TYPE_ADMIN
                            && user.superAdmin
                                ?
                                null
                                :
                                <NavLink
                                    to={
                                        groupUserName
                                            ?
                                            ROUTES.HELP.replace(':groupUserName', groupUserName)
                                            :
                                            ROUTES.HELP_INVEST_WEST_SUPER
                                    }
                                    className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                                >
                                    <ListItem button onClick={() => toggleSidebar(false)} >
                                        <ListItemIcon>
                                            <InfoIcon/>
                                        </ListItemIcon>
                                        <ListItemText className={css(sharedStyles.black_text)}>{GUIDELINE_TAB}</ListItemText>
                                    </ListItem>
                                </NavLink>
                        }
                        */}

                        {/** Logout tab */}
                        <ListItem button onClick={this.onLogoutClick} >
                            <ListItemIcon>
                                <ArrowLeft/>
                            </ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </ListItem>
                    </List>
                </FlexView>
            </FlexView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarContent);