import React, { Component } from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    Divider,
    IconButton,
    Typography,
    TextField
} from '@material-ui/core';
import {
    Container,
    Row,
    Col
} from 'react-bootstrap';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import FlexView from 'react-flexview';
import Files from 'react-files';
import { css, StyleSheet } from 'aphrodite';
import ReactPlayer from 'react-player';

import sharedStyles from '../../shared-js-css-styles/SharedStyles';

import * as colors from '../../values/colors';
import * as DB_CONST from '../../firebase/databaseConsts';

import {connect} from 'react-redux';
import * as editVideoActions from '../../redux-store/actions/editVideoActions';
import * as feedbackSnackbarActions from '../../redux-store/actions/feedbackSnackbarActions';

export const VIDEO_UPLOAD_FILE_SELECTED = 1;
export const VIDEO_UPLOAD_URL_SELECTED = 2;

const mapStateToProps = state => {
    return {
        user: state.auth.user,

        allowVideoUpload:
            state.manageClubAttributes.clubAttributes && state.manageClubAttributes.clubAttributes.hasOwnProperty('allowVideoUpload')
                ?
                state.manageClubAttributes.clubAttributes.allowVideoUpload
                :
                false,

        open: state.editVideo.editVideoDialogOpen,
        mode: state.editVideo.mode,

        videoTypeSelected: state.editVideo.videoTypeSelected,
        videoChosen: state.editVideo.videoChosen,
        previousVideos: state.editVideo.previousVideos,
        videoPreIndex: state.editVideo.videoPreIndex,

        isMobile: state.MediaQueryState.isMobile
    }
};

const mapDispatchToProps = dispatch => {
    return {
        onClose: () => dispatch(editVideoActions.toggleEditVideoDialog(null)),
        chooseVideoType: (videoType) => dispatch(editVideoActions.chooseVideoType(videoType)),
        handleVideoURLChanged: (event) => dispatch(editVideoActions.handleVideoURLChanged(event)),
        handleVideoFileChanged: (files) => dispatch(editVideoActions.handleVideoFilesChanged(files)),
        handleVideoFileError: (error, file) => dispatch(editVideoActions.handleVideoFileError(error, file)),
        cancelEditingCurrentVideo: () => dispatch(editVideoActions.cancelEditingCurrentVideo()),
        handlePreviousVideoItemClick: (index) => dispatch(editVideoActions.handlePreviousVideoItemClick(index)),
        handleSaveVideo: () => dispatch(editVideoActions.handleSaveVideo()),

        closeFeedbackSnackbar: () => dispatch(feedbackSnackbarActions.closeFeedbackSnackbar())
    }
};

class EditVideoDialog extends Component {

    render() {

        const {
            forwardedRef,

            isMobile,
            open,
            user,

            allowVideoUpload,
            videoTypeSelected,

            previousVideos,
            videoChosen,
            videoPreIndex,

            onClose,
            chooseVideoType,
            handleVideoURLChanged,
            handleVideoFileChanged,
            handleVideoFileError,
            cancelEditingCurrentVideo,
            handlePreviousVideoItemClick,
            handleSaveVideo,

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
                        <Row noGutters>

                            <Col xs={12} sm={12} md={12} lg={12}
                                style={{
                                    backgroundColor: colors.kick_starter_background_color_1,
                                    paddingTop: 6,
                                    paddingBottom: 6,
                                    paddingLeft: 15,
                                    paddingRight: 15
                                }}
                            >
                                <FlexView vAlignContent="center">
                                    <FlexView grow={8} >
                                        <Typography variant="body1">Upload introduction video</Typography>
                                    </FlexView>

                                    <FlexView grow={1} hAlignContent="right" >
                                        <IconButton onClick={onClose} >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </FlexView>
                                </FlexView>
                            </Col>

                            <Col xs={12} sm={12} md={12} lg={12} >
                                <Divider />
                            </Col>

                            <Col xs={12} sm={12} md={12} lg={12} style={{ padding: 18 }} >
                                <FlexView column width="100%" hAlignContent="center" >
                                    <Typography variant="body2" color="textSecondary" align="center" style={{ marginBottom: 25 }} >Upload a new video or choose from your previous videos</Typography>

                                    {
                                        allowVideoUpload
                                            ?
                                            <FlexView>
                                                <Button
                                                    variant={videoTypeSelected === VIDEO_UPLOAD_FILE_SELECTED ? "contained" : "outlined"}
                                                    color="primary"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    onClick={
                                                        () => chooseVideoType(
                                                            videoTypeSelected === VIDEO_UPLOAD_FILE_SELECTED
                                                                ?
                                                                null
                                                                :
                                                                VIDEO_UPLOAD_FILE_SELECTED
                                                        )
                                                    }
                                                >
                                                    {
                                                        videoTypeSelected === VIDEO_UPLOAD_FILE_SELECTED
                                                            ?
                                                            "Cancel upload a video"
                                                            :
                                                            "Upload a video"
                                                    }
                                                </Button>
                                                <Button
                                                    variant={videoTypeSelected === VIDEO_UPLOAD_URL_SELECTED ? "contained" : "outlined"}
                                                    color="primary"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    onClick={
                                                        () => chooseVideoType(
                                                            videoTypeSelected === VIDEO_UPLOAD_URL_SELECTED
                                                                ?
                                                                null
                                                                :
                                                                VIDEO_UPLOAD_URL_SELECTED
                                                        )
                                                    }
                                                    style={{ marginLeft: 20 }}
                                                >
                                                    {
                                                        videoTypeSelected === VIDEO_UPLOAD_URL_SELECTED
                                                            ?
                                                            "Cancel upload a video URL"
                                                            :
                                                            "Upload a video URL"
                                                    }
                                                </Button>
                                            </FlexView>
                                            :
                                            <Button
                                                variant={videoTypeSelected === VIDEO_UPLOAD_URL_SELECTED ? "contained" : "outlined"}
                                                color="primary"
                                                className={css(sharedStyles.no_text_transform)}
                                                onClick={() => chooseVideoType(VIDEO_UPLOAD_URL_SELECTED)}
                                            >
                                                {
                                                    videoTypeSelected === VIDEO_UPLOAD_URL_SELECTED
                                                        ?
                                                        "Cancel upload a video URL"
                                                        :
                                                        "Upload a video URL"
                                                }
                                            </Button>
                                    }

                                    {/** Upload video field (upload file or URL) */}
                                    {
                                        !videoTypeSelected
                                            ?
                                            null
                                            :
                                            videoTypeSelected === VIDEO_UPLOAD_FILE_SELECTED
                                                ?
                                                <FlexView column marginTop={20} >
                                                    <Files
                                                        className={css(styles.video_drop_zone)}
                                                        onChange={handleVideoFileChanged}
                                                        onError={handleVideoFileError}
                                                        accepts={['video/mp4']}
                                                        maxFileSize={DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_BYTES}
                                                        minFileSize={0}
                                                        multiple
                                                        clickable
                                                        onClick={closeFeedbackSnackbar}
                                                    >
                                                        <FlexView vAlignContent="center" hAlignContent="center" >
                                                            <AddIcon fontSize="small" style={{ marginRight: 8 }} />
                                                            Upload video
                                                        </FlexView>
                                                    </Files>
                                                </FlexView>
                                                :
                                                <TextField
                                                    name="videoChosen"
                                                    placeholder="Enter your video URL"
                                                    variant="outlined"
                                                    value={
                                                        !videoChosen
                                                            ?
                                                            ''
                                                            :
                                                            typeof(videoChosen) === "string"
                                                                ?
                                                                videoChosen
                                                                :
                                                                ''
                                                    }
                                                    fullWidth
                                                    onChange={handleVideoURLChanged}
                                                    style={{
                                                        marginTop: 20
                                                    }}
                                                />
                                    }

                                    {/** Preview video */}
                                    {
                                        !videoChosen
                                            ?
                                            null
                                            :
                                            <FlexView marginTop={20} hAlignContent="center" style={{ width: "100%" }} >
                                                <ReactPlayer
                                                    url={
                                                        typeof(videoChosen) === "string"
                                                            ?
                                                            videoChosen
                                                            :
                                                            window.URL.createObjectURL(videoChosen)
                                                    }
                                                    playing={false}
                                                    controls={true}
                                                    width="100%"
                                                    height={280}
                                                />
                                            </FlexView>
                                    }

                                    {/** Previous/current video status */}
                                    {
                                        this.renderSelectedPreviousVideoStatus()
                                    }

                                    {/** Cancel/Save */}
                                    {
                                        !videoChosen
                                            ?
                                            null
                                            :
                                            <FlexView marginTop={20} hAlignContent="right" >
                                                <Button
                                                    size="medium"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    variant="outlined"
                                                    color="primary"
                                                    onClick={() => cancelEditingCurrentVideo()}
                                                    style={{ marginRight: 8 }}
                                                >Cancel
                                                </Button>
                                                <Button
                                                    size="medium"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    variant="contained"
                                                    color="primary"
                                                    disabled={!videoChosen}
                                                    onClick={handleSaveVideo}
                                                    style={{
                                                        marginLeft: 8
                                                    }}
                                                >Save
                                                </Button>
                                            </FlexView>
                                    }
                                </FlexView>
                            </Col>

                            {/** Divider */}
                            <Col xs={12} sm={12} md={12} lg={12} >
                                <Divider style={{ marginTop: 8 }} />
                            </Col>

                            {/** Previous videos */}
                            {
                                // previous videos set to null --> don't want to display previous videos
                                !previousVideos
                                    ?
                                    null
                                    :
                                    <Col xs={12} sm={12} md={12} lg={12} style={{ padding: 15 }} >
                                        <Typography variant="body1" color="textSecondary">Your videos</Typography>

                                        <Row noGutters style={{ padding: 12 }} >
                                            {
                                                previousVideos
                                                    .sort((video1, video2) => video2.dateUploaded - video1.dateUploaded)
                                                    .map((previousVideo, index) => (
                                                        <Col
                                                            key={index}
                                                            xs={6}
                                                            sm={4}
                                                            md={4}
                                                            lg={4}
                                                            onClick={() => handlePreviousVideoItemClick(index)}
                                                        >
                                                            <FlexView hAlignContent="center" vAlignContent="center" style={{ width: "100%", padding: 10 }} >
                                                                <ReactPlayer
                                                                    url={previousVideo.url}
                                                                    playing={false}
                                                                    controls={false}
                                                                    playsinline={false}
                                                                    width="100%"
                                                                    height="auto"
                                                                    className={css(styles.previous_video_item_selected)}
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

    renderSelectedPreviousVideoStatus = () => {
        const {
            user,
            videoPreIndex,
        } = this.props;

        let msg = '';

        if (videoPreIndex === -1) {
            return null;
        }

        // user has no previous videos
        if (!user.BusinessProfile || (user.BusinessProfile && !user.BusinessProfile.video)) {
            return null;
        }
        // user has previous videos
        else {
            // the selected photo is not the current video
            if (videoPreIndex !== user.BusinessProfile.video.findIndex(video => !video.hasOwnProperty('removed'))) {
                msg = 'This video is a previous introduction video.';
            }
            else {
                msg = 'This video is the current introduction video.';
            }
        }

        return (
            <Typography align="center" variant="body2" color="textSecondary" style={{ marginTop: 12 }}>{msg}</Typography>
        );
    }
}
export default connect(mapStateToProps, mapDispatchToProps)(
    React.forwardRef((props, ref) => <EditVideoDialog {...props} forwardedRef={ref} />)
);

const styles = StyleSheet.create({

    video_drop_zone: {
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

    previous_video_item_selected: {
        ':hover': {
            border: `4px solid ${colors.primaryColor}`,
            cursor: 'pointer',
            opacity: 0.90
        }
    }
});