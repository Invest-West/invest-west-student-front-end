import React, {Component} from "react";
import {Col, Container, Row} from "react-bootstrap";
import {Box, Typography} from "@material-ui/core";
import * as appColors from "../../values/colors";

export default class PageNotFound extends Component<any, any> {
    render() {
        return <Container
            fluid
            style={{ padding: 0 }}
        >
            <Row noGutters >
                <Col xs={12} sm={12} md={12} lg={12} >
                    <Box display="flex" flexDirection="column" width="100%" height="100%" alignItems="center" marginTop="120px" >
                        <Box color={appColors.primaryColor} >
                            <Typography variant="h1" align="center" >404 error</Typography>
                        </Box>
                        <Box height="40px" />
                        <Typography variant="h2" align="center" >Page not found</Typography>
                        <Box height="25px" />
                        <Typography variant="h2" color="textSecondary" align="center">We're sorry, the page you requested could not be found.</Typography>
                    </Box>
                </Col>
            </Row>
        </Container>;
    }
}