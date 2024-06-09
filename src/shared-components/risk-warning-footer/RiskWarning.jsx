import React, {Component} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import {css, StyleSheet} from 'aphrodite';
import {Typography} from '@material-ui/core';

import * as colors from '../../values/colors';
import * as ROUTES from '../../router/routes';

import {connect} from 'react-redux';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import FlexView from "react-flexview/lib/FlexView";

const mapStateToProps = state => {
    return {
        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesLoaded: state.manageClubAttributes.clubAttributesLoaded,
        groupProperties: state.manageGroupFromParams.groupProperties
    }
};

class RiskWarning extends Component {
    render() {
        const {
            clubAttributesLoaded
        } = this.props;

        if (!clubAttributesLoaded) {
            return null;
        }

        return (
            <Container fluid style={{ width: "auto", padding: 0, backgroundColor: colors.crowdcube_risk_warning_background }} >
                <Row noGutters >
                    <Col xs={12} sm={12} md={12} lg={12} style={{ paddingTop: 45, paddingBottom: 45, paddingLeft: 28, paddingRight: 28 }} >
                        <FlexView column >
                            <Typography variant="body1" align="left" className={css(sharedStyles.white_text)} > <b>Risk warning</b> </Typography>
                            {
                                this.reformattedRiskWarningFooter()
                            }
                        </FlexView>
                    </Col>
                </Row>
            </Container>
        );
    }

    /**
     * Reformat risk warning footer
     * --> Replace %groupName% with real group name.
     * --> Replace %URL%...%URL% with the URL that links to Risk Warning page.
     *
     * @returns {*}
     */
    reformattedRiskWarningFooter = () => {
        const {
            clubAttributes,
            groupProperties
        } = this.props;

        let riskWarningFooter = clubAttributes.riskWarningFooter;
        riskWarningFooter = riskWarningFooter
            .split("%groupName%")
            .join(
                groupProperties
                    ?
                    groupProperties.displayName
                    :
                    "Default Student"
            );

        let splits = riskWarningFooter.split("%URL%");

        const urlText = splits[1];

        return (
            <Typography variant="body2" align="justify" className={css(sharedStyles.white_text)} style={{ whiteSpace: "pre-line", marginTop: 18 }} >
                {splits[0]}
                    <NavLink to={ROUTES.RISK_WARNING} target="_blank" className={css(styles.hyper_link)} > {urlText} </NavLink>
                {splits[2]}
            </Typography>
        );
    }
}

export default connect(mapStateToProps)(RiskWarning);

const styles = StyleSheet.create({
    hyper_link: {
        color: colors.crowdcube_risk_warning_link_before_cover,
        ':hover': {
            color: colors.crowdcube_risk_warning_link_after_cover,
            textDecoration: 'none'
        }
    }
});