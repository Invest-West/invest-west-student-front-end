import React from 'react';
import { StyleSheet } from 'aphrodite';
import {
    TableCell,
    Slide
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import * as appColors from '../values/colors';

const sharedStyles = StyleSheet.create({
    nav_link_hover: {
        ':hover': {
            color: appColors.blue_gray_700,
            textDecoration: 'none',
            cursor: 'pointer'
        }
    },

    nav_link_white_text_hover_without_changing_text_color: {
        color: appColors.white,
        ':hover': {
            textDecoration: 'none'
        }
    },

    nav_link_hover_without_changing_text_color: {
        ':hover': {
            textDecoration: 'none'
        }
    },

    page_title: {
        marginLeft: 20,
        color: appColors.white
    },

    hamburger_button: {
        color: appColors.white,
        marginLeft: 10
    },

    tab_title: {
        textTransform: "none",
        fontSize: "0.9em"
    },

    kick_starter_border_box: {
        border: `1px solid ${appColors.kick_starter_gray_box_border}`,
        boxShadow: 'none'
    },

    no_text_transform: {
        textTransform: "none"
    },

    error_text: {
        color: appColors.errorColor
    },

    white_text: {
        color: appColors.white
    },

    black_text: {
        color: appColors.black
    }
});
export default sharedStyles;

/**
 * Styled table cell
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export function StyledTableCell(props) {
    const useStyles = makeStyles({
        root: {
            background: props => props.cellColor,
            color: props.textColor
        }
    });
    const classes = useStyles(props);
    return (
        <TableCell
            className={classes.root}
            colSpan={props.colSpan}
        >
            {props.component}
        </TableCell>
    );
}

/**
 * Slide transition - direction up
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export const SlideTransitionUp = React.forwardRef((props, ref) => <Slide {...props} ref={ref} direction="up" />);

/**
 * Slide transition - direction down
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export const SlideTransitionDown = React.forwardRef((props, ref) => <Slide {...props} ref={ref} direction="down" />);