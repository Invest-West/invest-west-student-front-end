import React, { Component } from 'react';
import FlexView from 'react-flexview';
import {
    Typography,
    Divider
} from "@material-ui/core";
import Image from 'react-bootstrap/Image';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

import HeaderWithoutDesc from '../../shared-components/nav-bars/HeaderWithoutDesc';
import Footer from '../../shared-components/nav-bars/Footer';

import * as colors from '../../values/colors';

const teamMembers = [
    {
        name: "Taye Thompson",
        img: require("../../img/tt.jpg").default,
        desc: "An MSc. Information Technology student at University of the West England. He is the main UI designer of this project."
    },
    {
        name: "Omarii Sims",
        img: require("../../img/oj.png").default,
        desc: "An MSc. Information Technology student at University of the West England. He is the main tester and researcher of this project."
    },
    {
        name: "Khoa Phung",
        img: require("../../img/kp.jpg").default,
        desc: "An MSc. Information Technology student at University of the West England. He is the project manager and lead developer of this project."
    },
    {
        name: "Steven Rosalie",
        img: require("../../img/sr.jpg").default,
        desc: "An MSc. Information Technology student at University of the West England. He is a developer and is responsible for security issues of the system."
    },
    {
        name: "Thomas Campbell",
        img: require("../../img/tc.jpg").default,
        desc: "An MSc. Information Technology student at University of the West England. He is the main content creator and business researcher of this project."
    },
];

const mql_700 = window.matchMedia(`(min-width: 700px)`);

export default  class AboutUs extends Component {

    constructor(props) {
        super(props);

        this.state = {
            inMobileMode: !mql_700.matches
        };

        this.mediaQueryChanged = this.mediaQueryChanged.bind(this);
    }

    mediaQueryChanged() {
        // handle screen size changes here
        this.setState({
            inMobileMode: !mql_700.matches
        });
    }

    UNSAFE_componentWillMount() {
        // add listener for screen size changes
        mql_700.addListener(this.mediaQueryChanged);
    }

    componentWillUnmount() {
        if (this.state.mql_700) {
            this.state.mql_700.removeListener(this.mediaQueryChanged);
        }
    }

    render() {

        const {
            inMobileMode
        } = this.state;

        return(
            <Container fluid style={{padding: 0}}>
                <Row noGutters>
                    <Col xs={12}sm={12} md={12} lg={12}>
                        <HeaderWithoutDesc/>
                    </Col>
                </Row>
                <Row noGutters style={{padding: 10}}>
                    <Col xs={12} md={{span: 6, offset: 3}} lg={{span: 6, offset: 3}} style={{marginTop: 40}}>
                        <Typography variant="h3" color="primary" align="center">
                            About Us
                        </Typography>
                        <Typography paragraph variant="h6" align="center" style={{ marginTop: 35}}>
                            Invest West brings together investors and founders to help grow the business community in the South West of England. Invest West requires a fully managed end to end technology platform that will facilitate the efficient and effective, low cost registration of participants, administration of offers, and communication of club members.
                        </Typography>
                    </Col>
                    <Col xs={12} md={12} lg={12}style={{marginTop: 65}}>
                        <Row>
                            <Col xs={12} md={{span: 2, offset: 2}}>
                                <FlexView column hAlignContent="center">
                                    <Image src={require('../../img/investors.jpg').default} width="215" height="215"/>
                                    <Typography variant="h6"style={{marginTop: 10, marginBottom: 10}}>
                                        <i>Investors</i>
                                    </Typography>
                                    <Divider style={{width: 80, marginBottom: 10, backgroundColor: colors.gray_300}}/>
                                    <Typography paragraph variant="body1" align="center" color="textSecondary">
                                        Gain access to unique early stage businesses from across the South West. Ask us about;
                                    </Typography>
                                    <ul style={{color: colors.blue_gray_700}}>
                                        <li>Start up and scale up </li>
                                        <li>Seed and Angel investment</li>
                                        <li>HighTech</li>
                                        <li>RegTech</li>
                                        <li>FinTech</li>
                                    </ul>
                                    <Typography paragraph variant="body1" align="center" color="textSecondary">
                                        As local experts in the start up and scale up networks, we collate the best  opportunities so you can meet the right businesses for you.
                                    </Typography>
                                </FlexView>
                            </Col>
                            <Col xs={12} md={{span: 2, offset: 1}}>
                                <FlexView column hAlignContent="center">
                                    <Image src={require('../../img/businesses.jpg').default} width="215" height="215"/>
                                    <Typography variant="h6" style={{marginTop: 10, marginBottom: 10}}>
                                        <i>Businesses</i>
                                    </Typography>
                                    <Divider style={{width: 80, marginBottom: 10, backgroundColor: colors.gray_300}}/>
                                    <Typography paragraph variant="body1" align="center" color="textSecondary">
                                        Use the Invest West platform to communicate with a huge pool of potential investors that already have an interest in working with businesses in the South West.
                                    </Typography>
                                    <Typography paragraph variant="body1" align="center" color="textSecondary">
                                        Ask us about;
                                    </Typography>
                                    <ul style={{ color: colors.blue_gray_700}}>
                                        <li>Start up and scale up </li>
                                        <li>Seed and Angel investment</li>
                                        <li>HighTech</li>
                                        <li>RegTech</li>
                                        <li>FinTech</li>
                                    </ul>
                                </FlexView>
                            </Col>
                            <Col xs={12} md={{span: 2, offset: 1}}>
                                <FlexView column hAlignContent="center">
                                    <Image src={require('../../img/local.jpg').default} width="215" height="215"/>
                                    <Typography variant="h6" style={{ marginTop: 10, marginBottom: 10}}>
                                        <i>Local</i>
                                    </Typography>
                                    <Divider style={{ width: 80, marginBottom: 10, backgroundColor: colors.gray_300}}/>
                                    <Typography paragraph variant="body1" align="center" color="textSecondary">
                                        The South West of England has a unique and vibrant entrepeunerial business community. It thrives on innovation, style and an commitment to social inclusion. As local experts we connect likeminded investors and businesses.
                                    </Typography>
                                </FlexView>
                            </Col>
                        </Row>
                    </Col>
                    <Col xs={12} md={12} lg={12} style={{marginTop: 60}}>
                        <FlexView column hAlignContent="center" marginBottom={40}>
                            <Typography paragraph variant="h3" color="primary" align="center">
                                Meet the development team
                            </Typography>
                        </FlexView>
                        <Row>
                            {
                                teamMembers.map((teamMember, index) => (
                                    <Col key={index} md={index === 0 ? {span: 2, offset: 1} : {span: 2}}>
                                        <FlexView column hAlignContent="center">
                                            <Image src={teamMember.img} thumbnail roundedCircle style={{ marginBottom: 10, width: 150, height: 150, objectFit: "cover"}}/>
                                            <Typography paragraph variant="body1">
                                                {teamMember.name}
                                            </Typography>
                                            <Typography paragraph variant="body2" align="center">
                                                {teamMember.desc}
                                            </Typography>
                                        </FlexView>
                                    </Col>
                                ))
                            }
                        </Row>
                    </Col>
                </Row>

                <Row noGutters>
                    <Footer inMobileMode={inMobileMode}/>
                </Row>
            </Container>
        );
    }
}


