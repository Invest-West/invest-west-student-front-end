import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {Box, Button, Card, CardActionArea, CardActions, colors, Typography} from "@material-ui/core";
import GroupProperties, {getGroupLogo} from "../../models/group_properties";
import {Image} from "react-bootstrap";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {isAdmin} from "../../models/admin";
import {
    ExploreGroupsState,
    hasAccessRequestsBeenSatisfied,
    isRemovingAccessRequest,
    isSendingAccessRequest
} from "./ExploreGroupsReducer";
import GroupOfMembership, {getHomeGroup} from "../../models/group_of_membership";
import {CheckCircle, School} from "@material-ui/icons";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {removeAccessRequest, sendAccessRequest} from "./ExploreGroupsActions";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Routes from "../../router/routes";
import {ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import * as DB_CONST from "../../firebase/databaseConsts";

interface GroupItemProps {
    group: GroupProperties;
    isSubGroup?: boolean; // New prop to render as a course (compact layout)
}

interface GroupItemConnectedProps {
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    ExploreGroupsLocalState: ExploreGroupsState;
    sendAccessRequest: (groupID: string) => any;
    removeAccessRequest: (groupID: string) => any;
}

type GroupItemFullProps = GroupItemProps & GroupItemConnectedProps;

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        ExploreGroupsLocalState: state.ExploreGroupsLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        sendAccessRequest: (groupID: string) => dispatch(sendAccessRequest(groupID)),
        removeAccessRequest: (groupID: string) => dispatch(removeAccessRequest(groupID))
    }
}

class GroupItem extends Component<GroupItemFullProps, any> {
    render() {
        const {
            group,
            ManageGroupUrlState,
            AuthenticationState,
            ExploreGroupsLocalState,
            sendAccessRequest,
            removeAccessRequest,
            isSubGroup = false
        } = this.props;

        const currentUser = AuthenticationState.currentUser;

        if (!currentUser) {
            return null;
        }

        // Check if this is a virtual course group
        const isVirtualCourse = group.anid.startsWith('virtual-course-');

        let groupMember: GroupOfMembership | undefined = AuthenticationState.groupsOfMembership.find(
            groupOfMembership => groupOfMembership.group.anid === group.anid);

        let hasRequestedToAccessGroup: boolean = false;
        if (hasAccessRequestsBeenSatisfied(ExploreGroupsLocalState)) {
            hasRequestedToAccessGroup = ExploreGroupsLocalState.accessRequestsInstances
                ?.findIndex(accessRequestInstance => accessRequestInstance.group.anid === group.anid) !== -1;
        }

        return <Box
            marginY={isSubGroup ? "8px" : "18px"}
        >
            <Card elevation={isSubGroup ? 1 : undefined} style={isSubGroup ? { backgroundColor: '#fafafa' } : undefined}>
                {isVirtualCourse ? (
                    // Render virtual courses as non-clickable display items
                    <Box padding={2}>
                        <Box display="flex" alignItems="center" style={{ gap: 8 }}>
                            <School style={{ fontSize: 20, color: '#666' }} />
                            <Typography variant="h6">{group.displayName}</Typography>
                        </Box>
                        <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                            {group.description}
                        </Typography>
                    </Box>
                ) : (
                    <CustomLink
                        url={Routes.constructGroupDetailRoute(ManageGroupUrlState.groupNameFromUrl ?? null, ManageGroupUrlState.courseNameFromUrl ?? null, group.groupUserName)}
                        color="black"
                        activeColor="none"
                        activeUnderline={false}
                        component="nav-link"
                        childComponent={
                        <CardActionArea
                            onClick={
                                () => {
                                    if (!isAdmin(currentUser)) {
                                        realtimeDBUtils.trackActivity({
                                            userID: currentUser.id,
                                            activityType: DB_CONST.ACTIVITY_TYPE_CLICK,
                                            interactedObjectLocation: DB_CONST.GROUP_PROPERTIES_CHILD,
                                            interactedObjectID: group.anid,
                                            activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_CLICKED_ON_GROUP_ITEM.replace("%group%", group.displayName),
                                            action: Routes.nonGroupViewGroup.replace(":groupID", group.anid)
                                        });
                                    }
                                }
                            }
                        >
                            <Box>
                                <Box display="flex" height="220px" justifyContent="center" bgcolor={colors.grey["200"]} >
                                    <Image
                                        alt={`${group.displayName} logo`}
                                        src={getGroupLogo(group) ?? undefined}
                                        height="auto"
                                        width="100%"
                                        style={{ padding: 40, objectFit: "scale-down" }}
                                    />
                                </Box>

                                <Box paddingX="18px" paddingY="20px" >
                                    <Typography variant="subtitle1" align="center" noWrap ><b>{group.displayName}</b></Typography>

                                    {
                                        !groupMember
                                            ? null
                                            : <Box display="flex" flexDirection="row" marginTop="15px" alignItems="center" justifyContent="center" >
                                                <CheckCircle fontSize="small" color="primary" />
                                                <Box width="6px" />
                                                <Typography variant="body1" align="center" noWrap color="textSecondary" >
                                                    {
                                                        getHomeGroup(AuthenticationState.groupsOfMembership)?.group.anid === groupMember.group.anid
                                                            ? "Home member"
                                                            : "Platform member"
                                                    }
                                                </Typography>
                                            </Box>
                                    }
                                </Box>
                            </Box>
                        </CardActionArea>
                    }
                />
                )}

                {
                    isVirtualCourse || isAdmin(currentUser)
                        ? null
                        : groupMember
                        ? null
                        : <CardActions style={{ padding: 0 }} >
                            <Box display="flex" width="100%" padding="18px" justifyContent="center" >
                                {
                                    !hasRequestedToAccessGroup
                                        ? <Button
                                            fullWidth
                                            variant="outlined"
                                            className={css(sharedStyles.no_text_transform)}
                                            onClick={() => sendAccessRequest(group.anid)}
                                            disabled={isSendingAccessRequest(ExploreGroupsLocalState, group.anid)}
                                        >
                                            {
                                                isSendingAccessRequest(ExploreGroupsLocalState, group.anid)
                                                    ? "Sending request ..."
                                                    : "Join Course"
                                            }
                                        </Button>
                                        : <Button
                                            variant="outlined"
                                            className={css(sharedStyles.no_text_transform)}
                                            onClick={() => removeAccessRequest(group.anid)}
                                            disabled={isRemovingAccessRequest(ExploreGroupsLocalState, group.anid)}
                                        >
                                            {
                                                isRemovingAccessRequest(ExploreGroupsLocalState, group.anid)
                                                    ? "Cancelling ..."
                                                    : "Cancel request"
                                            }
                                        </Button>
                                }
                            </Box>
                        </CardActions>
                }
            </Card>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupItem);