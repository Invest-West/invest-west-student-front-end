import React, {Component} from 'react';
import FlexView from 'react-flexview/lib/index';
import {StyleSheet, css} from 'aphrodite';
import {Typography} from '@material-ui/core';
import {NavLink} from 'react-router-dom';
import {
    Container,
    Col,
    Row
} from 'react-bootstrap';
import HomeIcon from '@material-ui/icons/HomeOutlined';

import {connect} from 'react-redux';
import * as manageGroupFromParamsActions from '../../redux-store/actions/manageGroupFromParamsActions';

import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as colors from '../../values/colors';
import * as ROUTES from '../../router/routes';
import * as DB_CONST from '../../firebase/databaseConsts';
import * as utils from '../../utils/utils';
import {
    AUTH_SUCCESS
} from '../../pages/signin/Signin';

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,

        user: state.auth.user,
        authStatus: state.auth.authStatus
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName))
    }
};

class HeaderWithoutDesc extends Component {

    render() {
        const {
            groupUserName,
            groupProperties,

            user,
            authStatus
        } = this.props;

        return (
            <Container fluid style={{ padding: 0, backgroundColor: colors.white }} >
                <Row noGutters >
                    <Col xs={{span: 12, order: 2}} md={{span: 4, order: 1}} lg={{span: 4, order: 1}} >
                        {
                            !groupProperties
                                ?
                                null
                                :
                                <FlexView vAlignContent="center" height="100%" marginLeft={10} >
                                    {
                                        !user || authStatus !== AUTH_SUCCESS
                                            ?
                                            <NavLink
                                                to={groupUserName ? ROUTES.FRONT.replace(":groupUserName", groupUserName) : ROUTES.FRONT_INVEST_WEST_SUPER}
                                                className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                            >
                                                <Typography variant="body1" className={css(styles.navigation_text)} >
                                                    <HomeIcon style={{ marginBottom: 6, marginRight: 5 }} />
                                                    Home
                                                </Typography>
                                            </NavLink>
                                            :
                                            <NavLink
                                                className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                                to={
                                                    user.type === DB_CONST.TYPE_ADMIN
                                                        ?
                                                        `${groupUserName ? ROUTES.ADMIN.replace(":groupUserName", groupUserName) : ROUTES.ADMIN_INVEST_WEST_SUPER}?tab=Home`
                                                        :
                                                        (
                                                            user.type === DB_CONST.TYPE_ISSUER
                                                                ?
                                                                `${groupUserName ? ROUTES.DASHBOARD_ISSUER.replace(":groupUserName", groupUserName) : ROUTES.DASHBOARD_ISSUER_INVEST_WEST_SUPER}?tab=Home`
                                                                :
                                                                `${groupUserName ? ROUTES.DASHBOARD_INVESTOR.replace(":groupUserName", groupUserName) : ROUTES.DASHBOARD_INVESTOR_INVEST_WEST_SUPER}?tab=Home`
                                                        )
                                                }>
                                                <Typography variant="body1" className={css(styles.navigation_text)} >
                                                    <HomeIcon style={{ marginBottom: 6, marginRight: 5 }} />
                                                    My dashboard
                                                </Typography>
                                            </NavLink>
                                    }
                                </FlexView>
                        }
                    </Col>
                    <Col xs={{span: 12, order: 1}} md={{span: 4, order: 2}} lg={{span: 4, order: 1}} >
                        <FlexView style={{ padding: 8 }} column height="100%" widht="100%" hAlignContent="center" vAlignContent="center" >
                            {
                                !groupProperties
                                    ?
                                    <a href={ROUTES.ORIGINAL_WEB_URL} className={css(sharedStyles.nav_link_hover_without_changing_text_color)} >
                                        <FlexView hAlignContent="center" column className={css(styles.logo_field)} >
                                            <img
                                                className={css(styles.logo)}
                                                alt="logo"
                                                src={
                                                    !groupProperties
                                                        ?
                                                        require('../../img/logo.png').default
                                                        :
                                                        utils.getLogoFromGroup(utils.GET_PLAIN_LOGO, groupProperties)
                                                }
                                            />
                                            <Typography variant="body1" color="primary" >
                                                {
                                                    !groupProperties
                                                        ?
                                                        "Default student"
                                                        :
                                                        groupProperties.displayName
                                                }
                                            </Typography>
                                        </FlexView>
                                    </a>
                                    :
                                    <NavLink
                                        className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                        to={
                                            groupUserName
                                                ?
                                                ROUTES.FRONT.replace(":groupUserName", groupUserName)
                                                :
                                                ROUTES.FRONT_INVEST_WEST_SUPER
                                        }
                                    >
                                        <FlexView hAlignContent="center" column className={css(styles.logo_field)} >
                                            <img
                                                className={css(styles.logo)}
                                                alt="logo"
                                                src={
                                                    !groupProperties
                                                        ?
                                                        require('../../img/logo.png').default
                                                        :
                                                        utils.getLogoFromGroup(utils.GET_PLAIN_LOGO, groupProperties)
                                                }
                                            />
                                            <Typography variant="body1" color="primary" >
                                                {
                                                    !groupProperties
                                                        ?
                                                        "Default student"
                                                        :
                                                        groupProperties.displayName
                                                }
                                            </Typography>
                                        </FlexView>
                                    </NavLink>
                            }
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={{span: 12, order: 3}} md={{span: 12, order: 3}} lg={{span: 12, order: 3}} >
                        <FlexView height={1} style={{ backgroundColor: colors.gray_300 }} />
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(HeaderWithoutDesc);

const styles = StyleSheet.create({
    logo: {
        width: "auto",
        height: 38,
        marginBottom: 2
    },

    logo_field: {
        ':hover': {
            cursor: 'pointer'
        }
    },

    navigation_text: {
        margin: 15,
        padding: 8,
        color: colors.black,
        ':hover': {
            cursor: 'pointer',
            backgroundColor: colors.gray_100
        }
    }
});