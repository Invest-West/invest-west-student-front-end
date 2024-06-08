import React, {Component} from 'react';
import FlexView from 'react-flexview';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import PageNotFound from './PageNotFound';

import * as colors from '../../values/colors';

export default class PageNotFoundWhole extends Component {
    render() {
        return (
            <Container fluid style={{ padding: 0 }} >
                <Row noGutters style={{ backgroundColor: colors.white }} >
                    <Col xs={12} md={12} lg={12} >
                        <FlexView height={1} style={{ backgroundColor: colors.gray_300 }} />
                    </Col>
                    <Col xs={12} md={12} lg={12} >
                        <PageNotFound/>
                    </Col>
                </Row>
            </Container>
        );
    }
}