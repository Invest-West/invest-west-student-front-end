import React, {Component} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from '@material-ui/core';
import FlexView from 'react-flexview';
import {ProgressBar} from 'react-bootstrap';
import {connect} from 'react-redux';
import * as uploadingStatusActions from '../../redux-store/actions/uploadingStatusActions';

// Upload states
export const UPLOAD_NONE = 0;
export const UPLOAD_LOGO_FIRST_TIME_MODE = 1; // upload logo first time together with business profile information
export const UPLOAD_LOGO_MODE = 2; // upload logo separately later times
export const UPLOAD_PROFILE_PICTURE_MODE = 3;
export const UPLOAD_VIDEO_FIRST_TIME_MODE = 4;
export const UPLOAD_VIDEO_MODE = 5;
export const UPLOAD_LEGAL_DOCUMENTS_MODE = 6;
export const UPLOAD_BUSINESS_PROFILE_GENERAL_INFORMATION = 7;
export const UPLOAD_PITCH_COVER_MODE = 8;
export const UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE = 9;
export const UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE = 10;
export const UPLOAD_DONE_MODE = 11;
export const UPLOAD_ERROR = 12;
//--------------------------------------------------------------------

const mapStateToProps = state => {
    return {
        mode: state.uploadingStatus.mode,
        progress: state.uploadingStatus.progress
    }
};

const mapDispatchToProps = dispatch => {
    return {
        dismiss: () => dispatch(uploadingStatusActions.dismissUploadingStatus())
    }
};

class UploadingDialog extends Component {

    render() {

        const {
            forwardRef,

            mode,
            progress,

            dismiss
        } = this.props;

        return (
            <Dialog
                ref={forwardRef}
                open={mode !== UPLOAD_NONE}
                fullWidth
            >
                <DialogTitle>
                    {
                        mode === UPLOAD_LOGO_MODE || mode === UPLOAD_LOGO_FIRST_TIME_MODE
                            ?
                            "Uploading logo"
                            :
                            (
                                mode === UPLOAD_PROFILE_PICTURE_MODE
                                    ?
                                    "Uploading profile picture"
                                    :
                                    (
                                        mode === UPLOAD_VIDEO_MODE || mode === UPLOAD_VIDEO_FIRST_TIME_MODE
                                            ?
                                            "Uploading video"
                                            :
                                            (
                                                mode === UPLOAD_LEGAL_DOCUMENTS_MODE
                                                    ?
                                                    "Uploading documents"
                                                    :
                                                    (
                                                        mode === UPLOAD_BUSINESS_PROFILE_GENERAL_INFORMATION
                                                            ?
                                                            "Uploading business profile"
                                                            :
                                                            (
                                                                mode === UPLOAD_ERROR
                                                                    ?
                                                                    "Error uploading"
                                                                    :
                                                                    (
                                                                        mode === UPLOAD_DONE_MODE
                                                                            ?
                                                                            "Upload done"
                                                                            :
                                                                            ""
                                                                    )
                                                            )
                                                    )
                                            )
                                    )
                            )
                    }
                </DialogTitle>
                <DialogContent>
                    <FlexView column>
                        <ProgressBar variant="success" striped now={progress} label={`${progress}%`} />
                        <Typography variant="body2" style={{ marginTop: 10 }} >
                            {
                                mode !== UPLOAD_DONE_MODE
                                    ?
                                    "Please wait while we're uploading your files..."
                                    :
                                    "Your files have successfully uploaded."
                            }
                        </Typography>
                    </FlexView>
                </DialogContent>
                <DialogActions>
                    <Button variant="outlined" color="primary" size="small" disabled={mode !== UPLOAD_DONE_MODE && mode !== UPLOAD_ERROR} onClick={dismiss} style={{ margin: 8 }}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    React.forwardRef((props, ref) => <UploadingDialog {...props} forwardedRef={ref}/>)
);