import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box, Card, colors, Typography} from "@material-ui/core";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import {Image} from "react-bootstrap";
import {Resource} from "./Resources";
import {ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import Routes from "../../router/routes";

interface ResourceItemProps {
    resource: Resource;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {}
}

class ResourceItem extends Component<ResourceItemProps, any> {
    render() {
        const {
            resource,
            ManageGroupUrlState
        } = this.props;

        return <Box
            marginY="18px"
        >
            <Card>
                <CustomLink
                    url={Routes.constructViewResourceDetailRoute(
                        ManageGroupUrlState.groupNameFromUrl ?? null, ManageGroupUrlState.courseNameFromUrl ?? null, resource.name)}
                    color="black"
                    activeColor="none"
                    activeUnderline={false}
                    component="nav-link"
                    childComponent={
                        <Box>
                            <Box display="flex" height="220px" justifyContent="center" bgcolor={colors.grey["200"]}>
                                <Image alt={`${resource.name} logo`} src={resource.logo} height="auto" width="100%" style={{ padding: 40, objectFit: "scale-down" }} />
                            </Box>

                            <Box paddingX="18px" paddingY="20px">
                                <Typography variant="subtitle1" align="center" noWrap><b>{resource.name}</b></Typography>
                            </Box>
                        </Box>
                    }
                />
            </Card>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ResourceItem);