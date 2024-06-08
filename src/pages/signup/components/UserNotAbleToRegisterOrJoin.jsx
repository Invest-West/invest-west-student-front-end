import React, {Component} from 'react';
import {
    Typography
} from '@material-ui/core';
import FlexView from 'react-flexview';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import HeaderWithoutDesc from '../../../shared-components/nav-bars/HeaderWithoutDesc';

import * as DB_CONST from '../../../firebase/databaseConsts';
import * as colors from '../../../values/colors';

export default class UserNotAbleToRegisterOrJoin extends Component {
    render() {
        const {
            invitedUser
        } = this.props;

        return (
            <Container
                fluid
            >
                <Row
                    noGutters
                    style={{
                        backgroundColor: colors.white
                    }}
                >
                    <Col
                        xs={12}
                        md={12}
                        lg={12}
                    >
                        <HeaderWithoutDesc/>
                    </Col>
                    <Col
                        xs={12}
                        md={12}
                        lg={12}
                    >
                        <FlexView
                            column
                            hAlignContent="center"
                            marginTop={50}
                            marginLeft="10%"
                            marginRight="10%"
                        >
                            <Typography
                                align="center"
                                color="primary"
                                variant="h5"
                            >
                                {
                                    invitedUser.status === DB_CONST.INVITED_USER_STATUS_ACTIVE
                                        ?
                                        `You have already joined ${invitedUser.Invitor.displayName} as an ${invitedUser.type === DB_CONST.TYPE_INVESTOR ? 'investor' : 'issuer'}`
                                        :
                                        invitedUser.status === DB_CONST.INVITED_USER_DECLINED_TO_REGISTER
                                            ?
                                            `You have decided not to join ${invitedUser.Invitor.displayName} as an ${invitedUser.type === DB_CONST.TYPE_INVESTOR ? 'investor' : 'issuer'}`
                                            :
                                            invitedUser.status === DB_CONST.INVITED_USER_STATUS_LEFT
                                                ?
                                                `You have left ${invitedUser.Invitor.displayName}`
                                                :
                                                invitedUser.status === DB_CONST.INVITED_USER_STATUS_KICKED_OUT
                                                    ?
                                                    `Unfortunately, you have been kicked out from ${invitedUser.Invitor.displayName}`
                                                    :
                                                    ''
                                }
                            </Typography>
                        </FlexView>
                    </Col>
                </Row>
            </Container>
        );
    }
}