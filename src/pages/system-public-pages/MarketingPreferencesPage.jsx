import React, {Component} from 'react';
import {Typography} from '@material-ui/core';
import {Col, Container, Row} from 'react-bootstrap';
import FlexView from 'react-flexview';
import HashLoader from 'react-spinners/HashLoader';

import {connect} from 'react-redux';

import './SystemPublicPagesSharedCSS.scss';

import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as utils from '../../utils/utils';
import * as colors from '../../values/colors';

const mapStateToProps = state => {
    return {}
};

class MarketingPreferencesPage extends Component {

    constructor(props) {
        super(props);

        this.state = {
            clubAttributes: null,
            clubAttributesLoaded: false
        }
    }

    componentDidMount() {
        realtimeDBUtils
            .loadClubAttributes()
            .then(clubAttributes => {
                this.setState({
                    clubAttributes: clubAttributes,
                    clubAttributesLoaded: true
                });
            });
    }

    render() {
        const {
            clubAttributes,
            clubAttributesLoaded
        } = this.state;

        return (
            <Container
                fluid
                style={{
                    padding: 0
                }}
            >
                {
                    !clubAttributesLoaded
                        ?
                        <Row
                            noGutters
                        >
                            <Col
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                            >
                                <FlexView
                                    width="100%"
                                    marginTop={30}
                                    hAlignContent="center"
                                >
                                    <HashLoader
                                        color={colors.primaryColor}
                                    />
                                </FlexView>
                            </Col>
                        </Row>
                        :
                        <Row
                            noGutters
                        >
                            <Col
                                xs={12}
                                sm={12}
                                md={12}
                                lg={12}
                            >
                                <Row
                                    noGutters
                                    style={{
                                        backgroundColor: colors.gray_100
                                    }}
                                >
                                    <Col
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        lg={{span: 8, offset: 2}}
                                        style={{
                                            paddingTop: 30,
                                            paddingBottom: 30,
                                            paddingLeft: 12,
                                            paddingRight: 12
                                        }}
                                    >
                                        <Typography
                                            variant="h5"
                                            align="left"
                                        >
                                            <b>{"Marketing preferences".toUpperCase()}</b>
                                        </Typography>
                                    </Col>
                                </Row>

                                <Row
                                    noGutters
                                >
                                    <Col
                                        xs={12}
                                        sm={12}
                                        md={12}
                                        lg={{span: 8, offset: 2}}
                                        style={{
                                            paddingLeft: 12,
                                            paddingRight: 12
                                        }}
                                    >
                                        {
                                            !clubAttributes.marketingPreferences
                                                ?
                                                null
                                                :
                                                <FlexView
                                                    column
                                                    dangerouslySetInnerHTML={{__html: utils.convertQuillDeltaToHTML(clubAttributes.marketingPreferences.ops)}}
                                                    marginTop={35}
                                                />
                                        }
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                }
            </Container>
        );
    }
}

export default connect(mapStateToProps)(MarketingPreferencesPage);