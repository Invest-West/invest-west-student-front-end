import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {Box, Button, Dialog, DialogActions, DialogContent, TextField, Typography} from "@material-ui/core";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import {ContactPitchOwnerDialogState, isSendingContactEmail} from "./ContactPitchOwnerDialogReducer";
import {AnyAction} from "redux";
import {sendContactEmail, toggleContactPitchOwnerDialog, updateSenderEmail, updateSenderName} from "./ContactPitchOwnerDialogActions";

interface ContactPitchOwnerDialogProps {
    ContactPitchOwnerDialogLocalState: ContactPitchOwnerDialogState;
    toggleContactDialog: () => any;
    sendContactEmail: () => any;
    updateSenderEmail: (email: string) => any;
    updateSenderName: (name: string) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ContactPitchOwnerDialogLocalState: state.ContactPitchOwnerDialogLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleContactDialog: () => dispatch(toggleContactPitchOwnerDialog()),
        sendContactEmail: () => dispatch(sendContactEmail()),
        updateSenderEmail: (email: string) => dispatch(updateSenderEmail(email)),
        updateSenderName: (name: string) => dispatch(updateSenderName(name))
    }
}

class ContactPitchOwnerDialog extends Component<ContactPitchOwnerDialogProps, any> {
    render() {
        const {
            ContactPitchOwnerDialogLocalState,
            toggleContactDialog,
            sendContactEmail,
            updateSenderEmail,
            updateSenderName
        } = this.props;

        return <Dialog
            open={ContactPitchOwnerDialogLocalState.contactDialogOpen}
            onClose={() => toggleContactDialog()}
        >
            <DialogContent>
                <Box display="flex" flexDirection="column">
                    <Typography variant="body1" align="left">{`We will let the project owner know that you would like to find out more.`}</Typography>
                    <Box height="20px"/>
                    <TextField
                        label="Your Name"
                        type="text"
                        value={ContactPitchOwnerDialogLocalState.senderName}
                        onChange={(e) => updateSenderName(e.target.value)}
                        variant="outlined"
                        fullWidth
                        size="small"
                        disabled={isSendingContactEmail(ContactPitchOwnerDialogLocalState)}
                        required
                    />
                    <Box height="10px"/>
                    <TextField
                        label="Your Email"
                        type="email"
                        value={ContactPitchOwnerDialogLocalState.senderEmail}
                        onChange={(e) => updateSenderEmail(e.target.value)}
                        variant="outlined"
                        fullWidth
                        size="small"
                        disabled={isSendingContactEmail(ContactPitchOwnerDialogLocalState)}
                        required
                    />
                    <Box height="10px"/>
                    <Typography variant="body2" color="textSecondary">{`This will be sent to: ${ContactPitchOwnerDialogLocalState.projectOwnerEmail}`}</Typography>
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
                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} disabled={isSendingContactEmail(ContactPitchOwnerDialogLocalState) || !ContactPitchOwnerDialogLocalState.senderEmail || !ContactPitchOwnerDialogLocalState.senderName} onClick={() => sendContactEmail()}>
                    {
                        isSendingContactEmail(ContactPitchOwnerDialogLocalState)
                            ? `Sending email to ${ContactPitchOwnerDialogLocalState.projectOwnerEmail} ...`
                            : "Send Contact Request"
                    }
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactPitchOwnerDialog);