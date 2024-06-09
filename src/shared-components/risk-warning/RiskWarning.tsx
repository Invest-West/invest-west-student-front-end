import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ManageSystemAttributesState} from "../../redux-store/reducers/manageSystemAttributesReducer";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {Box, colors, Typography} from "@material-ui/core";
import Routes from "../../router/routes";
import CustomLink from "../../shared-js-css-styles/CustomLink";

interface RiskWarningProps {
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageGroupUrlState: ManageGroupUrlState;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageGroupUrlState: state.ManageGroupUrlState
    }
}

class RiskWarning extends Component<RiskWarningProps, any> {
    render() {
        const {
            ManageSystemAttributesState,
            ManageGroupUrlState
        } = this.props;

        if (!ManageSystemAttributesState.systemAttributes) {
            return null;
        }

        let riskWarningFooter = ManageSystemAttributesState.systemAttributes.riskWarningFooter;
        riskWarningFooter = riskWarningFooter
            .split("%groupName%")
            .join(ManageGroupUrlState.group
                ? ManageGroupUrlState.group.displayName
                : "Default student"
            );

        let splits = riskWarningFooter.split("%URL%");

        const urlText = splits[1];

        return <Box
            border={`1px solid ${colors.grey["600"]}`}
            borderRadius="24px"
            padding="24px"
            bgcolor={colors.grey["100"]}
        >
            <Typography variant="body1" align="left" ><u>Risk warning</u></Typography>
            <Box marginTop="18px" whiteSpace="pre-line" >
                <Typography variant="body1" align="justify" >
                    {splits[0]}
                    <CustomLink
                        url={Routes.nonGroupRiskWarning}
                        target="_blank"
                        color={getGroupRouteTheme(ManageGroupUrlState).palette.error.main}
                        activeColor="none"
                        activeUnderline={true}
                        component="nav-link"
                        childComponent={ urlText }
                    />
                    {splits[2]}
                </Typography>
            </Box>
        </Box>;
    }
}

export default connect(mapStateToProps)(RiskWarning);