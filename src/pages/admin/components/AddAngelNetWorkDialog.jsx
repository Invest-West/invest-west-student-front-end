import React, {Component} from 'react';
import {
    Button,
    Dialog, DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    TextField,
    Typography,
    SnackbarContent,
    Snackbar
} from '@material-ui/core';
import {Image} from 'react-bootstrap';
import CloseIcon from '@material-ui/icons/Close';
import AddIcon from '@material-ui/icons/Add';
import FlexView from 'react-flexview';
import {css, StyleSheet} from 'aphrodite';
import Files from 'react-files';

import {connect} from 'react-redux';
import * as addAngelNetworkDialogActions from '../../../redux-store/actions/addAngelNetworkDialogActions';

import sharedStyles, {SlideTransitionDown} from '../../../shared-js-css-styles/SharedStyles';
import * as DB_CONST from '../../../firebase/databaseConsts';
import * as colors from '../../../values/colors';
import * as utils from '../../../utils/utils';

export const ADD_STATUS_NONE = 0;
export const ADD_STATUS_CHECKING_FOR_EXISTING_ANGEL_NETWORK = 1;
export const ADD_STATUS_USER_NAME_EXISTS = 2;
export const ADD_STATUS_EMAIL_ALREADY_USED = 3;
export const ADD_STATUS_UPLOADING_ANGEL_NETWORK_LOGO = 4;
export const ADD_STATUS_CREATING_ANGEL_NETWORK_PROFILE = 5;
export const ADD_STATUS_SUCCESSFULLY_ADDED = 6;
export const ADD_STATUS_ERROR_HAPPENED = 7;

export const UPLOAD_NONE = 0;
export const UPLOAD_PLAIN_LOGO = 1;
export const UPLOAD_LOGO_WITH_TEXT = 2;

const mapStateToProps = state => {
    return {
        addAngelNetworkDialogOpen: state.manageAddAngelNetworkDialog.addAngelNetworkDialogOpen,

        angelNetworkName: state.manageAddAngelNetworkDialog.angelNetworkName,
        angelNetworkUsername: state.manageAddAngelNetworkDialog.angelNetworkUsername,
        email: state.manageAddAngelNetworkDialog.email,
        website: state.manageAddAngelNetworkDialog.website,
        primaryColor: state.manageAddAngelNetworkDialog.primaryColor,
        secondaryColor: state.manageAddAngelNetworkDialog.secondaryColor,

        plainLogo: state.manageAddAngelNetworkDialog.plainLogo,
        loadingPlainLogo: state.manageAddAngelNetworkDialog.loadingPlainLogo,
        logoWithText: state.manageAddAngelNetworkDialog.logoWithText,
        loadingLogoWithText: state.manageAddAngelNetworkDialog.loadingLogoWithText,

        uploadMode: state.manageAddAngelNetworkDialog.uploadMode,
        uploadProgress: state.manageAddAngelNetworkDialog.uploadProgress,

        imgUploadError: state.manageAddAngelNetworkDialog.imgUploadError,
        imgUploadErrorSnackbarOpen: state.manageAddAngelNetworkDialog.imgUploadErrorSnackbarOpen,

        addButtonClicked: state.manageAddAngelNetworkDialog.addButtonClicked,
        response: state.manageAddAngelNetworkDialog.addResult
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleAddAngelNetworkDialog: () => dispatch(addAngelNetworkDialogActions.toggleAddAngelNetworkDialog()),
        handleInputChanged: (event) => dispatch(addAngelNetworkDialogActions.handleAddAngelNetworkInputChanged(event)),
        addNewAngelNetwork: () => dispatch(addAngelNetworkDialogActions.addNewAngelNetwork()),

        handleImageFilesChanged: (mode, files) => dispatch(addAngelNetworkDialogActions.handleImageFilesChanged(mode, files)),
        handleImageFileError: (mode, error, file) => dispatch(addAngelNetworkDialogActions.handleImageFileError(mode, error, file)),
        closeErrorSnackbar: () => dispatch(addAngelNetworkDialogActions.closeImageFileErrorSnackbar()),
        resetImageFileErrorMessageWhenSnackbarExited: () => dispatch(addAngelNetworkDialogActions.resetImageFileErrorMessageWhenSnackbarExited())
    }
};

class AddAngelNetworkDialog extends Component {

    handleImageFilesChanged = mode => files => {
        this.props.handleImageFilesChanged(mode, files);
    };

    handleImageFileError = mode => (error, file) => {
        this.props.handleImageFileError(mode, error, file);
    };

    render() {
        const {
            forwardedRef,
            addAngelNetworkDialogOpen,

            angelNetworkName,
            angelNetworkUsername,
            email,
            website,
            primaryColor,
            secondaryColor,

            plainLogo,
            loadingPlainLogo,
            logoWithText,
            loadingLogoWithText,

            imgUploadError,
            imgUploadErrorSnackbarOpen,

            addButtonClicked,

            uploadMode,
            uploadProgress,

            handleImageFilesChanged,
            handleImageFileError,
            toggleAddAngelNetworkDialog,
            handleInputChanged,
            addNewAngelNetwork,
            closeErrorSnackbar,
            resetImageFileErrorMessageWhenSnackbarExited,

            ...other
        } = this.props;

        return (
            <Dialog ref={forwardedRef} open={addAngelNetworkDialogOpen} fullWidth maxWidth="md" onClose={toggleAddAngelNetworkDialog} {...other}>
                <DialogTitle disableTypography>
                    <FlexView vAlignContent="center">
                        <FlexView grow={4}>
                            <Typography variant='h6' color='primary' align="left">
                                Add new group
                            </Typography>
                        </FlexView>
                        <FlexView grow={1} hAlignContent="right">
                            <IconButton onClick={toggleAddAngelNetworkDialog}>
                                <CloseIcon/>
                            </IconButton>
                        </FlexView>
                    </FlexView>
                </DialogTitle>
                <DialogContent style={{marginTop: 10}}>
                    <TextField
                        label="Group name"
                        placeholder="Write group's full name here ..."
                        name="angelNetworkName"
                        value={angelNetworkName}
                        fullWidth
                        margin="dense"
                        variant="outlined"
                        required
                        error={addButtonClicked && angelNetworkName.length === 0}
                        onChange={handleInputChanged}
                    />

                    <TextField
                        label="Group username"
                        placeholder="Write group's username here. E.g. aba, or qtec"
                        helperText="Note: Username must be unique. For convention, use lowercase letters and use - to connect words. E.g. future-space"
                        name="angelNetworkUsername"
                        value={angelNetworkUsername}
                        fullWidth
                        margin="dense"
                        variant="outlined"
                        required
                        error={addButtonClicked && angelNetworkUsername.trim().length === 0}
                        onChange={handleInputChanged}
                    />

                    <FormControl fullWidth style={{marginTop: 25, marginBottom: 25}}>
                        <TextField
                            label="Registered email"
                            placeholder="Write email here ..."
                            helperText="This email will be used to login to group's admin page. Once added, an email with auto-generated password will be sent to this email address."
                            name="email"
                            value={email}
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            required
                            error={addButtonClicked && email.trim().length === 0}
                            onChange={handleInputChanged}
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <TextField
                            label="Website"
                            placeholder="Group's official website"
                            name="website"
                            value={website}
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            required
                            error={addButtonClicked && website.trim().length === 0}
                            onChange={handleInputChanged}
                        />
                        {
                            website.trim().length === 0 || utils.isValidWebURL(website)
                                ?
                                null
                                :
                                <Typography
                                    variant="body2"
                                    color="error"
                                    align="left"
                                >
                                    Invalid website URL
                                </Typography>
                        }
                    </FormControl>

                    <FormControl fullWidth style={{marginTop: 25}}>
                        <TextField
                            label="Primary color"
                            placeholder="E.g. #FFFFFF"
                            name="primaryColor"
                            value={primaryColor.toUpperCase()}
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            required
                            error={addButtonClicked && primaryColor.trim().length === 0}
                            onChange={handleInputChanged}
                        />
                        {
                            primaryColor.trim().length === 0 || utils.isValidHexColorCode(primaryColor)
                                ?
                                null
                                :
                                <Typography variant="body2" color="error"  align="left">Invalid color</Typography>
                        }
                    </FormControl>

                    <FormControl fullWidth style={{marginBottom: 25}}>
                        <TextField
                            label="Secondary color"
                            placeholder="E.g. #FFFFFF"
                            name="secondaryColor"
                            value={secondaryColor.toUpperCase()}
                            fullWidth
                            margin="dense"
                            variant="outlined"
                            required
                            error={addButtonClicked && secondaryColor.trim().length === 0}
                            onChange={handleInputChanged}
                        />

                        {
                            secondaryColor.trim().length === 0 || utils.isValidHexColorCode(secondaryColor)
                                ?
                                null
                                :
                                <Typography variant="body2" color="error" align="left">Invalid color</Typography>
                        }
                    </FormControl>

                    {/** Upload plain (main) logo (compulsory) */}
                    <FlexView column>
                        <Files
                            className={css(styles.img_drop_zone)}
                            onChange={this.handleImageFilesChanged(UPLOAD_PLAIN_LOGO)}
                            onError={this.handleImageFileError(UPLOAD_PLAIN_LOGO)}
                            accepts={['image/png', 'image/jpg', 'image/jpeg']}
                            maxFileSize={DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_BYTES}
                            minFileSize={0}
                            multiple
                            clickable
                            style={{marginTop: 25}}
                        >
                            <FlexView vAlignContent="center" hAlignContent="center">
                                <AddIcon fontSize="small" style={{marginRight: 8}}/>Upload plain logo (with no text)</FlexView>
                            </Files>

                        {
                            !plainLogo
                                ?
                                null
                                :
                                (
                                    <FlexView marginTop={20} width={270} height={270}>
                                        <Image src={window.URL.createObjectURL(plainLogo)} roundedCircle thumbnail style={{width: "100%", height: "auto", objectFit: "fill"}}/>
                                    </FlexView>
                                )
                        }
                    </FlexView>

                    {/** Upload logo with text (optional) */}
                    <FlexView column marginTop={25}>
                        <Files
                            className={css(styles.img_drop_zone)}
                            onChange={this.handleImageFilesChanged(UPLOAD_LOGO_WITH_TEXT)}
                            onError={this.handleImageFileError(UPLOAD_LOGO_WITH_TEXT)}
                            accepts={['image/png', 'image/jpg', 'image/jpeg']}
                            maxFileSize={DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_BYTES}
                            minFileSize={0}
                            multiple
                            clickable
                        >
                            <FlexView vAlignContent="center" hAlignContent="center">
                                <AddIcon fontSize="small" style={{marginRight: 8}}/>Upload logo with text (optional)</FlexView>
                            </Files>

                        {
                            !logoWithText
                                ?
                                null
                                :
                                (
                                    <FlexView marginTop={20} width={540} height={270}>
                                        <Image src={window.URL.createObjectURL(logoWithText)} thumbnail style={{width: "100%", height: "auto", objectFit: "fill"}}/>
                                    </FlexView>
                                )
                        }
                    </FlexView>
                </DialogContent>
                <DialogActions>
                    <FlexView width="100%" marginRight={25} marginBottom={15} marginTop={15} hAlignContent="right" vAlignContent="center">
                        {
                            this.renderRespondCode()
                        }
                        <Button variant="outlined" color="primary" onClick={addNewAngelNetwork} size="large" className={css(sharedStyles.no_text_transform)}
                            disabled={
                                angelNetworkName.trim().length === 0
                                || angelNetworkUsername.trim().length === 0
                                || email.trim().length === 0
                                || website.trim().length === 0
                                || (website.trim().length > 0 && !utils.isValidWebURL(website))
                                || primaryColor.trim().length === 0
                                || secondaryColor.trim().length === 0
                                || (primaryColor.trim().length > 0 && !utils.isValidHexColorCode(primaryColor))
                                || (secondaryColor.trim().length > 0 && !utils.isValidHexColorCode(secondaryColor))
                                || !plainLogo
                            }
                            style={{ marginLeft: 35}}>
                            Add
                            <AddIcon fontSize="small" style={{marginLeft: 8}}/>
                        </Button>
                    </FlexView>
                </DialogActions>

                <Snackbar
                    open={imgUploadErrorSnackbarOpen}
                    anchorOrigin={{ vertical: 'top', horizontal: 'center',}}
                    autoHideDuration={3000}
                    onClose={closeErrorSnackbar}
                    onExited={resetImageFileErrorMessageWhenSnackbarExited}
                    TransitionComponent={SlideTransitionDown}
                    transitionDuration={{ enter: 130, exit: 130}}>
                    <SnackbarContent style={{backgroundColor: colors.red_700}}
                        message={imgUploadError}
                        action={[
                            <IconButton key="close" color="inherit" onClick={closeErrorSnackbar}>
                                <CloseIcon/>
                            </IconButton>
                        ]}
                    />
                </Snackbar>
            </Dialog>
        );
    }

    /**
     * Render add angel network result
     *
     * @returns {null|*}
     */
    renderRespondCode = () => {
        const {
            response,
            uploadMode,
            uploadProgress
        } = this.props;

        let res = {
            msg: '',
            color: ''
        };

        switch (response) {
            case ADD_STATUS_NONE:
                return null;
            case ADD_STATUS_CHECKING_FOR_EXISTING_ANGEL_NETWORK:
                res.msg = "Checking if the angel network has been added before ...";
                res.color = "primary";
                break;
            case ADD_STATUS_USER_NAME_EXISTS:
                res.msg = "This username has already been used.";
                res.color = "error";
                break;
            case ADD_STATUS_UPLOADING_ANGEL_NETWORK_LOGO:
                res.msg = `Uploading ${uploadMode === UPLOAD_PLAIN_LOGO ? "plain logo" : "logo with text"}, ${parseInt(uploadProgress)}% completed`;
                res.color = "primary";
                break;
            case ADD_STATUS_CREATING_ANGEL_NETWORK_PROFILE:
                res.msg = "Creating angel network's profile ...";
                res.color = "primary";
                break;
            case ADD_STATUS_EMAIL_ALREADY_USED:
                res.msg = "This email has already been used.";
                res.color = "error";
                break;
            case ADD_STATUS_SUCCESSFULLY_ADDED:
                res.msg = "Added successfully. An email has been sent to the angel network for login information.";
                res.color = "primary";
                break;
            case ADD_STATUS_ERROR_HAPPENED:
                res.msg = "Error happened. Couldn't add the angel network.";
                res.color = "error";
                break;
            default:
                break;
        }

        return (
            <Typography color={res.color} variant="subtitle1" align="left">
                {res.msg}
            </Typography>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(AddAngelNetworkDialog);

const styles = StyleSheet.create({

    img_drop_zone: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 30,
        paddingRight: 30,
        textAlign: 'center',
        border: `1px solid ${colors.gray_400}`,

        ':hover': {
            backgroundColor: colors.gray_100,
            cursor: 'pointer'
        }
    }
});