import React, {Component} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';
import {connect} from 'react-redux';
import * as courseRequestDialogActions from '../../../redux-store/actions/courseRequestDialogActions';
import sharedStyles from '../../../shared-js-css-styles/SharedStyles';

export const REQUEST_STATUS_NONE = 0;
export const REQUEST_STATUS_SUBMITTING = 1;
export const REQUEST_STATUS_SUCCESS = 2;
export const REQUEST_STATUS_ERROR = 3;

const mapStateToProps = state => {
    return {
        dialogOpen: state.manageCourseRequestDialog.dialogOpen,
        courseName: state.manageCourseRequestDialog.courseName,
        submitStatus: state.manageCourseRequestDialog.submitStatus,
        errorMessage: state.manageCourseRequestDialog.errorMessage,
        addButtonClicked: state.manageCourseRequestDialog.addButtonClicked
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleDialog: () => dispatch(courseRequestDialogActions.toggleCourseRequestDialog()),
        handleInputChanged: (event) => dispatch(courseRequestDialogActions.handleInputChanged(event)),
        submitCourseRequest: (onSuccessCallback) => dispatch(courseRequestDialogActions.submitCourseRequest(onSuccessCallback))
    }
};

class AddCourseRequestDialog extends Component {

    render() {
        const {
            forwardedRef,
            dialogOpen,
            courseName,
            submitStatus,
            errorMessage,
            addButtonClicked,
            toggleDialog,
            handleInputChanged,
            submitCourseRequest,
            onSuccess,
            ...other
        } = this.props;

        return (
            <Dialog
                ref={forwardedRef}
                open={dialogOpen}
                fullWidth
                maxWidth="sm"
                onClose={toggleDialog}
                {...other}
            >
                <DialogTitle disableTypography>
                    <FlexView vAlignContent="center">
                        <FlexView grow={4}>
                            <Typography variant='h6' color='primary' align="left">
                                Request New Course
                            </Typography>
                        </FlexView>
                        <FlexView grow={1} hAlignContent="right">
                            <IconButton onClick={toggleDialog}>
                                <CloseIcon/>
                            </IconButton>
                        </FlexView>
                    </FlexView>
                </DialogTitle>
                <DialogContent style={{marginTop: 10, marginBottom: 20}}>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Submit a request to create a new course under your university.
                        A super admin will review and approve your request.
                    </Typography>

                    <TextField
                        label="Course name"
                        placeholder="e.g., Computer Science, Business Management, etc."
                        name="courseName"
                        value={courseName}
                        fullWidth
                        margin="dense"
                        variant="outlined"
                        required
                        error={addButtonClicked && courseName.trim().length === 0}
                        helperText={addButtonClicked && courseName.trim().length === 0 ? "Course name is required" : ""}
                        onChange={handleInputChanged}
                    />
                </DialogContent>
                <DialogActions>
                    <FlexView width="100%" marginRight={25} marginBottom={15} marginTop={15} hAlignContent="right" vAlignContent="center">
                        {this.renderStatusMessage()}
                        <Button
                            variant="outlined"
                            color="primary"
                            onClick={() => submitCourseRequest(onSuccess)}
                            size="large"
                            className={css(sharedStyles.no_text_transform)}
                            disabled={courseName.trim().length === 0 || submitStatus === REQUEST_STATUS_SUBMITTING}
                            style={{marginLeft: 35}}
                        >
                            {submitStatus === REQUEST_STATUS_SUBMITTING ? "Submitting..." : "Submit Request"}
                            <AddIcon fontSize="small" style={{marginLeft: 8}}/>
                        </Button>
                    </FlexView>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Render status message
     */
    renderStatusMessage = () => {
        const {submitStatus, errorMessage} = this.props;

        let message = '';
        let color = 'primary';

        switch (submitStatus) {
            case REQUEST_STATUS_NONE:
                return null;
            case REQUEST_STATUS_SUBMITTING:
                message = "Submitting your course request...";
                color = "primary";
                break;
            case REQUEST_STATUS_SUCCESS:
                message = "Course request submitted successfully! A super admin will review it.";
                color = "primary";
                break;
            case REQUEST_STATUS_ERROR:
                message = errorMessage || "Error submitting request. Please try again.";
                color = "error";
                break;
            default:
                return null;
        }

        return (
            <Typography color={color} variant="subtitle1" align="left">
                {message}
            </Typography>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddCourseRequestDialog);
