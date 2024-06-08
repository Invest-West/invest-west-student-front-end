import React, {Component} from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    Divider,
    IconButton,
    Typography,
    CircularProgress,
    Slider
} from '@material-ui/core';
import {
    Container,
    Row,
    Col,
    Image
} from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import ImageIcon from '@material-ui/icons/Image';
import FlexView from 'react-flexview';
import Files from 'react-files';
import {css, StyleSheet} from 'aphrodite';
import AvatarEditor from 'react-avatar-editor';

import {
    UPLOAD_PROFILE_PICTURE_MODE
} from '../uploading-dialog/UploadingDialog';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import * as DB_CONST from '../../firebase/databaseConsts';

import * as colors from '../../values/colors';

import {connect} from 'react-redux';
import * as editImageActions from '../../redux-store/actions/editImageActions';
import * as feedbackSnackbarActions from '../../redux-store/actions/feedbackSnackbarActions';

const mapStateToProps = state => {
    return {
        user: state.auth.user,

        open: state.editImage.editImageDialogOpen,
        mode: state.editImage.mode,
        previousPhotos: state.editImage.previousPhotos,
        imgPreEdited: state.editImage.imgPreEdited,
        imgPreEditedLoaded: state.editImage.imgPreEditedLoaded,
        imgPreIndex: state.editImage.imgPreIndex,
        imgEdited: state.editImage.imgEdited,
        imgZoom: state.editImage.imgZoom,

        isMobile: state.MediaQueryState.isMobile
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onClose: () => dispatch(editImageActions.toggleEditImageDialog(null)),
        setEditorReference: (editor) => dispatch(editImageActions.setImageEditorReference(editor)),
        handleImageFilesChanged: (files) => dispatch(editImageActions.handleImageFilesChanged(files)),
        handleImageFileError: (error, file) => dispatch(editImageActions.handleImageFileError(error, file)),
        handleSliderChanged: (event, newValue) => dispatch(editImageActions.handleZoomSliderChanged(event, newValue)),
        onPreviousImageItemClick: (index) => dispatch(editImageActions.handlePreviousImageItemClick(index)),
        cancelEditingCurrentImage: () => dispatch(editImageActions.cancelEditingCurrentImage()),
        viewEditedImagePreview: () => dispatch(editImageActions.viewEditedImagePreview()),
        saveEditedImage: () => dispatch(editImageActions.handleSaveEditedImage()),

        closeFeedbackSnackbar: () => dispatch(feedbackSnackbarActions.closeFeedbackSnackbar())
    }
};

class EditImageDialog extends Component {
    render() {
        const {
            forwardedRef,
            isMobile,

            user,

            open,
            mode,
            previousPhotos,
            imgPreEdited,
            imgPreEditedLoaded,
            imgPreIndex,
            imgEdited,
            imgZoom,

            onClose,
            setEditorReference,
            handleImageFilesChanged,
            handleImageFileError,
            handleSliderChanged,
            onPreviousImageItemClick,
            cancelEditingCurrentImage,
            viewEditedImagePreview,
            saveEditedImage,

            closeFeedbackSnackbar,

            ...other
        } = this.props;

        return (
            <Dialog
                ref={forwardedRef}
                open={open}
                maxWidth="sm"
                fullWidth
                fullScreen={isMobile}
                onClose={onClose}
                {...other}
            >
                <DialogContent style={{ padding: 0 }} >
                    <Container fluid style={{ padding: 0 }} >
                        <Row noGutters >

                            <Col xs={12} sm={12} md={12} lg={12}
                                style={{
                                    backgroundColor: colors.kick_starter_background_color_1,
                                    paddingTop: 6,
                                    paddingBottom: 6,
                                    paddingLeft: 15,
                                    paddingRight: 15
                                }}
                            >
                                <FlexView vAlignContent="center" >
                                    <FlexView grow={8} >
                                        <Typography variant="body1" >
                                            {
                                                mode === UPLOAD_PROFILE_PICTURE_MODE
                                                    ?
                                                    "Upload profile picture"
                                                    :
                                                    "Upload logo"
                                            }
                                        </Typography>
                                    </FlexView>

                                    <FlexView grow={1} hAlignContent="right" >
                                        <IconButton onClick={onClose} >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </FlexView>
                                </FlexView>
                            </Col>

                            <Col xs={12} sm={12} md={12} lg={12} >
                                <Divider/>
                            </Col>

                            <Col xs={12} sm={12} md={12} lg={12} style={{ padding: 18 }} >
                                <FlexView column width="100%" hAlignContent="center" >
                                    <Typography variant="body2" color="textSecondary" align="center" style={{ marginBottom: 25 }} >Upload a new photo or choose from your previous photos</Typography>
                                    <Files
                                        className={css(styles.img_drop_zone)}
                                        onChange={handleImageFilesChanged}
                                        onError={handleImageFileError}
                                        accepts={['image/png', 'image/jpg', 'image/jpeg']}
                                        maxFileSize={DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_BYTES}
                                        minFileSize={0}
                                        multiple
                                        clickable
                                        onClick={closeFeedbackSnackbar}
                                    >
                                        <FlexView vAlignContent="center" hAlignContent="center" >
                                            <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                            Upload photo
                                        </FlexView>
                                    </Files>

                                    <FlexView marginTop={22} hAlignContent="center" style={{ position: 'relative', width: "100%", height: 325 }} >
                                        <AvatarEditor
                                            ref={setEditorReference}
                                            image={imgPreEdited}
                                            width={270}
                                            height={270}
                                            border={25}
                                            borderRadius={150}
                                            disableBoundaryChecks={false}
                                            disableHiDPIScaling={false}
                                            scale={imgZoom}
                                            style={{
                                                position: 'absolute',
                                                top: 0
                                            }}
                                        />
                                        {
                                            imgPreEditedLoaded
                                                ?
                                                null
                                                :
                                                <FlexView
                                                    hAlignContent="center"
                                                    vAlignContent="center"
                                                    style={{ position: 'absolute', width: "100%", height: "100%", top: 0, zIndex: 1 }}
                                                >
                                                    <CircularProgress color="primary" />
                                                </FlexView>
                                        }
                                    </FlexView>

                                    {
                                        this.renderSelectedPreviousPhotoStatus()
                                    }

                                    <FlexView width={310} marginTop={15} vAlignContent="center" >
                                        <ImageIcon fontSize="small"/>
                                        <Slider
                                            min={1}
                                            max={2.5}
                                            step={0.001}
                                            value={imgZoom}
                                            onChange={handleSliderChanged}
                                            style={{ marginLeft: 11, marginRight: 11 }}
                                        />
                                        <ImageIcon fontSize="large"/>
                                    </FlexView>

                                    <FlexView marginTop={15} hAlignContent="right" >
                                        <Button
                                            size="medium"
                                            className={css(sharedStyles.no_text_transform)}
                                            variant="outlined"
                                            color="primary"
                                            onClick={() => cancelEditingCurrentImage()}
                                        >Cancel</Button>
                                        <Button
                                            size="medium"
                                            className={css(sharedStyles.no_text_transform)}
                                            variant="contained"
                                            color="secondary"
                                            disabled={!imgPreEdited}
                                            onClick={() => viewEditedImagePreview()}
                                            style={{ marginLeft: 16, marginRight: 16 }} >Preview</Button>
                                        <Button
                                            size="medium"
                                            className={css(sharedStyles.no_text_transform)}
                                            variant="contained"
                                            color="primary"
                                            disabled={!imgPreEdited}
                                            onClick={() => saveEditedImage()}
                                        >Save</Button>
                                    </FlexView>

                                    {
                                        !imgEdited
                                            ?
                                            null
                                            :
                                            (
                                                <FlexView marginTop={20} width={270} height={270} >
                                                    <Image
                                                        src={window.URL.createObjectURL(imgEdited)}
                                                        roundedCircle
                                                        thumbnail
                                                        style={{ width: "100%", height: "auto", objectFit: "scale-down" }}
                                                    />
                                                </FlexView>
                                            )
                                    }

                                </FlexView>
                            </Col>

                            <Col xs={12} sm={12} md={12} lg={12} >
                                <Divider/>
                            </Col>

                            {
                                // previous photos set to null --> don't want to display previous photos
                                !previousPhotos
                                    ?
                                    null
                                    :
                                    <Col xs={12} sm={12} md={12} lg={12} style={{ padding: 15 }} >
                                        <Typography variant="body1" color="textSecondary" >Your photos</Typography>

                                        <Row noGutters style={{ padding: 12 }} >
                                            {
                                                previousPhotos
                                                    .sort((photo1, photo2) => photo2.storageID - photo1.storageID)
                                                    .map((previousPhoto, index) => (
                                                        <Col
                                                            key={index}
                                                            xs={6}
                                                            sm={4}
                                                            md={3}
                                                            lg={3}
                                                            onClick={() => onPreviousImageItemClick(index)}
                                                        >
                                                            <FlexView hAlignContent="center" vAlignContent="center" style={{ width: "100%", padding: 5 }} >
                                                                <Image
                                                                    key={index}
                                                                    src={previousPhoto.url}
                                                                    className={css(styles.previous_img_item_selected)}
                                                                    style={{
                                                                        height: 128,
                                                                        width: 128,
                                                                        objectFit: "contain"
                                                                    }}
                                                                />
                                                            </FlexView>
                                                        </Col>
                                                    ))
                                            }
                                        </Row>
                                    </Col>
                            }
                        </Row>
                    </Container>
                </DialogContent>
            </Dialog>
        )
    }

    /**
     * Render selected previous photo's status
     *
     * @returns {null|*}
     */
    renderSelectedPreviousPhotoStatus = () => {
        const {
            user,
            imgPreIndex,
            mode
        } = this.props;

        let msg = '';

        if (imgPreIndex === -1) {
            return null;
        }

        // upload profile picture
        if (mode === UPLOAD_PROFILE_PICTURE_MODE) {
            // user has no previous profile pictures
            if (!user.profilePicture) {
                return null;
            }
            // user has previous profile pictures
            else {
                // the selected photo is not the current profile picture
                if (imgPreIndex !== user.profilePicture.findIndex(profilePic => !profilePic.hasOwnProperty('removed'))) {
                    msg = 'This photo is a previous profile picture.';
                } else {
                    msg = 'This photo is the current profile picture.';
                }
            }
        }
        // upload logo
        else {
            // user has no previous logos
            if (!user.BusinessProfile || (user.BusinessProfile && !user.BusinessProfile.logo)) {
                return null;
            }
            // user has previous logos
            else {
                // the selected photo is not the current logo
                if (imgPreIndex !== user.BusinessProfile.logo.findIndex(logo => !logo.hasOwnProperty('removed'))) {
                    msg = 'This photo is a previous logo.';
                } else {
                    msg = 'This photo is the current logo.';
                }
            }
        }

        return (
            <Typography align="center" variant="body2" color="textSecondary" style={{ marginTop: 12 }}>{msg}</Typography>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(
    React.forwardRef((props, ref) => (<EditImageDialog {...props} forwardedRef={ref}/>))
);

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
    },

    previous_img_item_selected: {
        ':hover': {
            border: `4px solid ${colors.primaryColor}`,
            cursor: 'pointer',
            opacity: 0.90
        }
    }
});