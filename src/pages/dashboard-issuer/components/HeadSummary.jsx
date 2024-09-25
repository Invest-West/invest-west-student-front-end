import React, { Component } from 'react';
import { StyleSheet, css } from 'aphrodite';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import FlexView from 'react-flexview';

import * as colors from '../../../values/colors';

export default class HeadSummary extends Component {

    render() {
        // declare this variable in render() function
        // so that when the state changes, it can update the values
        this.summaries = [
            {
                "title": "Share holders",
                "value": this.props.shareholders,
                "faIcon": "far fa-handshake",
                "color": colors.gray_500
            },

            {
                "title": "Share percent",
                "value": this.props.sharePercent,
                "faIcon": "fas fa-balance-scale",
                "color": colors.gray_700
            },

            {
                "title": "Total projects",
                "value": this.props.totalPitches,
                "faIcon": "far fa-lightbulb",
                "color": colors.dark_green_50
            },

            {
                "title": "Successful projects",
                "value": this.props.successfulPitches,
                "faIcon": "far fa-gem",
                "color": colors.primaryColor
            }
        ];
        
        return (
            <Row>
                {
                    this.summaries.map((summary, index) => (
                        <Col xs={12} md={6} lg={3} style={{marginBottom: 30}} key={index}>
                            <FlexView className={css(styles.card, styles.no_padding)}>
                                <FlexView className={css(styles.left_corner)} basis="30%" hAlignContent="center" vAlignContent="center" style={{backgroundColor: summary.color}}>
                                    <i className={summary.faIcon} style={{fontSize: 38, color: colors.white}} />
                                </FlexView>
                                <FlexView column basis="70%" marginTop={10} marginLeft={16}>
                                    <p className={css(styles.no_margin)}>{summary.title}</p>
                                    <p className={css(styles.header_summary_statistics_text)}>{summary.value}</p>
                                </FlexView>
                            </FlexView>
                        </Col>
                    ))
                }
            </Row>
        );
    }
}

const styles = StyleSheet.create({
    no_margin: {
        margin: 0
    },

    no_padding: {
        padding: 0
    },

    card: {
        borderRadius: 4,
        padding: 20,
        boxShadow: `1px 1px 1px 1px ${colors.gray_400}`
    },

    left_corner: {
        borderTopLeftRadius: 4,
        borderBottomLeftRadius: 4
    },

    header_summary_statistics_text: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 5
    }
});
