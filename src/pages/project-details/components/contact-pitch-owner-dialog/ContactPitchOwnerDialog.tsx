import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from "@material-ui/core";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import {ContactPitchOwnerDialogState, isSendingContactEmail} from "./ContactPitchOwnerDialogReducer";
import {AnyAction} from "redux";
import {sendContactEmail, toggleContactPitchOwnerDialog} from "./ContactPitchOwnerDialogActions";

interface ContactPitchOwnerDialogProps {
    ContactPitchOwnerDialogLocalState: ContactPitchOwnerDialogState;
    toggleContactDialog: () => any;
    sendContactEmail: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ContactPitchOwnerDialogLocalState: state.ContactPitchOwnerDialogLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleContactDialog: () => dispatch(toggleContactPitchOwnerDialog()),
        sendContactEmail: () => dispatch(sendContactEmail())
    }
}

class ContactPitchOwnerDialog extends Component<ContactPitchOwnerDialogProps, any> {
    render() {
        const {
            ContactPitchOwnerDialogLocalState,
            toggleContactDialog,
            sendContactEmail
        } = this.props;

        return <Dialog
            open={ContactPitchOwnerDialogLocalState.contactDialogOpen}
            onClose={() => toggleContactDialog()}
        >
            <DialogContent>
                <Box display="flex" flexDirection="column">
                    <Typography variant="body1" align="left">{`We will let the pitch owner know that you would like to find out more.`}</Typography>
                    <Box height="20px"/>
                    <Typography variant="body1" align="left">{`Are you happy for us to share your email address?`}</Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                {
                    isSendingContactEmail(ContactPitchOwnerDialogLocalState)
                        ? null
                        : <Button
                            onClick={() => toggleContactDialog()}
                            className={css(sharedStyles.no_text_transform)}
                        >Cancel</Button>
                }
                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} disabled={isSendingContactEmail(ContactPitchOwnerDialogLocalState)} onClick={() => sendContactEmail()}>
                    {
                        isSendingContactEmail(ContactPitchOwnerDialogLocalState)
                            ? `Sending email to ${ContactPitchOwnerDialogLocalState.projectOwnerEmail} ...`
                            : "Yes"
                    }
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactPitchOwnerDialog);