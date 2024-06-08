import React, {Component} from 'react';
import {Col, Container, Image, Row} from 'react-bootstrap';
import {Divider, Typography} from '@material-ui/core';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';

import {connect} from 'react-redux';

import * as ROUTES from '../../router/routes';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        MediaQueryState: state.MediaQueryState
    }
};

class Footer extends Component {
    render() {

        const {
            MediaQueryState
        } = this.props;

        return (
            <Container fluid style={{ padding: 0, position: MediaQueryState.isMobile || !MediaQueryState.minHeightScreen ? "relative" : "fixed", marginTop: 200, bottom: 0 }} >
                <Row noGutters style={{ marginTop: 40 }} >
                    <Col xs={12} sm={12} md={12} lg={12} style={{ marginBottom: 11 }} >
                        <Divider/>
                    </Col>
                    <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 8, offset: 2}} style={{ paddingBottom: 11 }} >
                        <Row noGutters style={{ width: "100%" }} >
                            <Col xs={12} sm={12} md={3} lg={2} >
                                <a href={ROUTES.ORIGINAL_WEB_URL} className={css(sharedStyles.nav_link_hover_without_changing_text_color)} >
                                    <FlexView width="100%" hAlignContent={MediaQueryState.isMobile ? "center" : "left"} >
                                        <Image src={require('../../img/logo.png').default} style={{ width: "auto", height: 45, margin: 8 }} />
                                    </FlexView>
                                </a>
                            </Col>
                            <Col xs={12} sm={12} md={9} lg={10} >
                                <FlexView width="100%" height="100%" vAlignContent="center" >
                                    <Typography variant="body1" align={MediaQueryState.isMobile ? "center" : "left"} >Copyright © 2020 Invest West Ltd - All Rights Reserved.</Typography>
                                </FlexView>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default connect(mapStateToProps)(Footer);