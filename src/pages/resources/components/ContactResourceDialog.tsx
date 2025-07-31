import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box, Button, Dialog, DialogActions, DialogContent, Typography} from "@material-ui/core";
import {sendContactEmail, toggleContactResourceDialog} from "../ResourcesActions";
import {isDetailedPageSendingContactEmail, ResourcesState} from "../ResourcesReducer";
import {css} from "aphrodite";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";

interface ContactResourceDialogProps {
    // set when using the component inside the page
    resourceName: string;
    // set when using the component inside the page
    resourceEmail: string | string[];
    ResourcesLocalState: ResourcesState;
    toggle: () => any;
    sendContactEmail: (receiver: string | string[]) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ResourcesLocalState: state.ResourcesLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggle: () => dispatch(toggleContactResourceDialog()),
        sendContactEmail: (receiver: string | string[]) => dispatch(sendContactEmail(receiver))
    }
}

class ContactResourceDialog extends Component<ContactResourceDialogProps, any> {
    render() {
        const {
            resourceName,
            resourceEmail,
            ResourcesLocalState,
            toggle,
            sendContactEmail
        } = this.props;

        return <Dialog
            open={ResourcesLocalState.detailedPageContactDialogOpen}
            onClose={() => toggle()}
        >
            <DialogContent>
                <Box
                    display="flex"
                    flexDirection="column"
                >
                    <Typography
                        variant="body1"
                        align="left"
                    >
                        {`We will send an email to ${resourceName} asking them to contact you.`}
                    </Typography>
                    <Box
                        height="20px"
                    />
                    <Typography
                        variant="body1"
                        align="left"
                    >
                        {`Are you happy for Student Showcase to share your email address with ${resourceName}?`}
                    </Typography>
                </Box>
            </DialogContent>
            <DialogActions>
                {
                    isDetailedPageSendingContactEmail(ResourcesLocalState)
                        ? null
                        : <Button
                            onClick={() => toggle()}
                            className={css(sharedStyles.no_text_transform)}
                        >
                            Cancel
                        </Button>
                }
                <Button
                    color="primary"
                    variant="contained"
                    className={css(sharedStyles.no_text_transform)}
                    disabled={isDetailedPageSendingContactEmail(ResourcesLocalState)}
                    onClick={() => sendContactEmail(resourceEmail)}
                >
                    {
                        isDetailedPageSendingContactEmail(ResourcesLocalState)
                            ? `Sending email to ${resourceName} ...`
                            : "Yes"
                    }
                </Button>
            </DialogActions>
        </Dialog>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ContactResourceDialog);