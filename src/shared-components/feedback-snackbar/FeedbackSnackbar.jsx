import React, {Component} from 'react';
import {
    IconButton,
    Snackbar,
    SnackbarContent
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CloseIcon from '@material-ui/icons/Close';

import {connect} from 'react-redux';
import * as feedbackSnackbarActions from '../../redux-store/actions/feedbackSnackbarActions';

import * as colors from '../../values/colors';
import {SlideTransitionDown, SlideTransitionUp} from '../../shared-js-css-styles/SharedStyles';

const mapStateToProps = state => {
    return {
        group: state.manageGroupFromParams.groupProperties,

        open: state.manageFeedbackSnackbar.open,
        message: state.manageFeedbackSnackbar.message,
        color: state.manageFeedbackSnackbar.color,
        position: state.manageFeedbackSnackbar.position
    }
};

const mapDispatchToProps = dispatch => {
    return {
        closeFeedbackSnackbar: () => dispatch(feedbackSnackbarActions.closeFeedbackSnackbar()),
        resetStatesWhenSnackbarClosed: () => dispatch(feedbackSnackbarActions.resetStatesWhenSnackbarClosed())
    }
};

class FeedbackSnackbar extends Component {

    render() {
        const {
            group,

            open,
            message,
            color,
            position,

            closeFeedbackSnackbar,
            resetStatesWhenSnackbarClosed
        } = this.props;

        return (
            <Snackbar
                open={open}
                anchorOrigin={{
                    vertical: position === "" ? "bottom" : position, // default vertical anchor is bottom
                    horizontal: 'center',
                }}
                autoHideDuration={2500}
                onClose={closeFeedbackSnackbar}
                onExited={resetStatesWhenSnackbarClosed}
                TransitionComponent={
                    position === "bottom"
                        ?
                        SlideTransitionUp
                        :
                        position === "top"
                            ?
                            SlideTransitionDown
                            :
                            null
                }
                transitionDuration={{
                    enter: 130,
                    exit: 130
                }}
            >
                <SnackbarContent
                    style={{
                        backgroundColor:
                            color === "primary"
                                ?
                                !group
                                    ?
                                    colors.primaryColor
                                    :
                                    group.settings.primaryColor
                                :
                                color === "error"
                                    ?
                                    colors.errorColor
                                    :
                                    ""
                    }}
                    message={
                        <span>
                            {
                                color === "error"
                                    ?
                                    null
                                    :
                                    <CheckCircleIcon style={{ marginRight: 8 }}/>
                            }
                            {message}
                        </span>
                    }
                    action={[
                        <IconButton key="close" color="inherit" onClick={closeFeedbackSnackbar}>
                            <CloseIcon/>
                        </IconButton>
                    ]}
                />
            </Snackbar>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedbackSnackbar);