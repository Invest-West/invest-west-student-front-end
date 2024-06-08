import React, { Component } from "react";
import {
    Typography
} from "@material-ui/core";
import FlexView from "react-flexview";
import { StyleSheet, css } from "aphrodite";
import * as colors from "../../values/colors";

export default class PageNotFound extends Component {
    render() {
        return (
            <FlexView column hAlignContent="center" marginTop={50} marginLeft="10%" marginRight="10%" >
                <Typography className={css(styles.error_text)} >404 Error</Typography>
                <Typography className={css(styles.page_not_found_text)} >Page not found</Typography>
                <Typography className={css(styles.explain_text)} >We are sorry, the page you requested could not be found.</Typography>
            </FlexView>
        );
    }
}

const styles = StyleSheet.create({
    error_text: {
        fontSize: 65,
        color: colors.primaryColor,
        textAlign: 'center'
    },

    page_not_found_text: {
        fontSize: 50,
        fontWeight: 'bold',
        marginTop: 30,
        marginBottom: 20,
        textAlign: 'center'
    },

    explain_text: {
        fontSize: 40,
        color: colors.gray_600,
        textAlign: 'center'
    }
});