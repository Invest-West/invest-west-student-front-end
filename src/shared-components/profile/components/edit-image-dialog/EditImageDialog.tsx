import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Slider,
    Typography,
    withStyles
} from "@material-ui/core";
import {
    EditImageDialogModes,
    EditImageDialogState,
    isDeletingProfilePicture,
    isSavingProfilePicture,
    ProfileState
} from "../../ProfileReducer";
// @ts-ignore
import Files from "react-files";
// @ts-ignore
import AvatarEditor from "react-avatar-editor";
import {
    changeMode,
    deleteImage,
    handleImageChanged,
    handleImageError,
    handleSliderChanged,
    saveImage,
    setEditor,
    toggleDialog
} from "./EditImageDialogActions";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import {Close, Delete, Edit} from "@material-ui/icons";
import * as appColors from "../../../../values/colors";
import {Col, Image, Row} from "react-bootstrap";

interface EditImageDialogProps {
    ProfileLocalState: ProfileState;
    toggleDialog: () => any;
    setEditor: (editor: any) => any;
    changeMode: (mode: EditImageDialogModes) => any;
    handleImageChanged: (files: File[]) => any;
    handleImageError: (error: any, file: File) => any;
    handleSliderChanged: (sliderName: string, value: number) => any;
    saveImage: () => any;
    deleteImage: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ProfileLocalState: state.ProfileLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleDialog: () => dispatch(toggleDialog()),
        setEditor: (editor: any) => dispatch(setEditor(editor)),
        changeMode: (mode: EditImageDialogModes) => dispatch(changeMode(mode)),
        handleImageChanged: (files: File[]) => dispatch(handleImageChanged(files)),
        handleImageError: (error: any, file: File) => dispatch(handleImageError(error, file)),
        handleSliderChanged: (sliderName: string, value: number) => dispatch(handleSliderChanged(sliderName, value)),
        saveImage: () => dispatch(saveImage()),
        deleteImage: () => dispatch(deleteImage())
    }
}

class EditImageDialog extends Component<EditImageDialogProps, any> {

    handleSliderChanged = (sliderName: string) => (event: MouseEvent, value: number) => {
        this.props.handleSliderChanged(sliderName, value);
    }

    render() {
        const {
            ProfileLocalState,
            toggleDialog
        } = this.props;

        const EditImageLocalState: EditImageDialogState = ProfileLocalState.EditImageDialogState;

        return <Dialog
            open={EditImageLocalState.dialogOpen}
            maxWidth="sm"
            fullWidth
            // fullScreen={isMobile}
            onClose={toggleDialog}
        >
            <DialogTitle
                style={{
                    margin: 0,
                    padding: 0
                }}
            >
                <Box
                    display="flex"
                    flexDirection="row"
                    alignItems="center"
                    paddingX="15px"
                    paddingY="10px"
                >
                    <Box
                        display="flex"
                        flexGrow={1}
                    >
                        <Typography
                            variant="h6"
                            align="left"
                        >
                            {
                                EditImageLocalState.mode === EditImageDialogModes.AddPhoto
                                    ? "Add photo"
                                    : EditImageLocalState.mode === EditImageDialogModes.EditPhoto
                                    ? "Edit photo"
                                    : EditImageLocalState.mode === EditImageDialogModes.DisplayPhoto
                                        ? "Current photo"
                                        : ""
                            }
                        </Typography>
                    </Box>
                    <Box
                        display="flex"
                        flexGrow={1}
                        justifyContent="flex-end"
                    >
                        <IconButton
                            onClick={toggleDialog}
                        >
                            <Close/>
                        </IconButton>
                    </Box>
                </Box>
            </DialogTitle>
            <Divider/>
            <DialogContent
                style={{
                    margin: 0,
                    padding: 0
                }}
            >
                {
                    EditImageLocalState.mode === EditImageDialogModes.AddPhoto
                        ? this.renderAddPhotoContent()
                        : EditImageLocalState.mode === EditImageDialogModes.EditPhoto
                        ? this.renderEditPhotoContent()
                        : EditImageLocalState.mode === EditImageDialogModes.DisplayPhoto
                            ? this.renderDisplayPhotoContent()
                            : null
                }
            </DialogContent>
            <Divider/>
            <DialogActions
                style={{
                    margin: 0,
                    padding: 0
                }}
            >
                {
                    EditImageLocalState.mode === EditImageDialogModes.AddPhoto
                        ? this.renderAddPhotoActions()
                        : EditImageLocalState.mode === EditImageDialogModes.EditPhoto
                        ? this.renderEditPhotoActions()
                        : EditImageLocalState.mode === EditImageDialogModes.DisplayPhoto
                            ? this.renderDisplayPhotoActions()
                            : null
                }
            </DialogActions>
        </Dialog>;
    }

    /**
     * Render DialogContent when mode = Add photo
     */
    renderAddPhotoContent = () => {
        return <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            paddingY="40px"
        >
            <Typography variant="body1" align="center">Upload a photo. Then, edit it to perfection.</Typography>
        </Box>;
    }

    /**
     * Render DialogContent when mode = Edit photo
     */
    renderEditPhotoContent = () => {
        const {
            ProfileLocalState,
            setEditor
        } = this.props;

        const EditImageLocalState: EditImageDialogState = ProfileLocalState.EditImageDialogState;

        return <Box
            display="flex"
            flexDirection="column"
            bgcolor={appColors.black}
            paddingX="15px"
            paddingY="20px"
        >
            {/** Editor area */}
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
                <AvatarEditor
                    ref={setEditor}
                    image={EditImageLocalState.rawImage}
                    crossOrigin="anonymous"
                    width={300}
                    height={300}
                    border={25}
                    borderRadius={150}
                    disableBoundaryChecks={false}
                    disableHiDPIScaling={true}
                    scale={EditImageLocalState.scale}
                    rotate={EditImageLocalState.rotate}
                />

                <Box height="12px" />
                <Typography style={{ color: "white" }}>Drag to position photo</Typography>
            </Box>

            {/** Scale and rotate sliders */}
            <Box marginX="30px" marginTop="60px" marginBottom="15px">
                <Row>
                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Box display="flex" flexDirection="column">
                            <Typography variant="body2" style={{ color: "white" }}>
                                Zoom
                            </Typography>
                            <EditPhotoSlider
                                min={1}
                                max={3}
                                step={0.1}
                                value={EditImageLocalState.scale}
                                valueLabelDisplay="auto"
                                // @ts-ignore
                                onChange={this.handleSliderChanged("scale")}
                            />
                        </Box>
                    </Col>

                    <Col xs={12} sm={12} md={6} lg={6}>
                        <Box display="flex" flexDirection="column">
                            <Typography variant="body2" style={{ color: "white" }}>Rotate</Typography>
                            <EditPhotoSlider
                                min={-180}
                                max={180}
                                step={1}
                                value={EditImageLocalState.rotate}
                                valueLabelDisplay="auto"
                                // @ts-ignore
                                onChange={this.handleSliderChanged("rotate")}
                            />
                        </Box>
                    </Col>
                </Row>
            </Box>
        </Box>;
    }

    /**
     * Render DialogContent when mode = Display photo
     */
    renderDisplayPhotoContent = () => {
        const {
            ProfileLocalState
        } = this.props;

        const EditImageLocalState: EditImageDialogState = ProfileLocalState.EditImageDialogState;

        return <Box
            display="flex"
            justifyContent="center"
            paddingY="30px"
        >
            <Image roundedCircle thumbnail src={EditImageLocalState.rawImage as string ?? ""} width={256} height={256} style={{ objectFit: "contain" }}/>
        </Box>;
    }

    /**
     * Render DialogActions when mode = Add photo
     */
    renderAddPhotoActions = () => {
        const {
            handleImageChanged,
            handleImageError
        } = this.props;

        return <Box
            display="flex"
            justifyContent="flex-end"
            padding="20px"
        >
            <Files onChange={handleImageChanged} onError={handleImageError} accepts={["image/png", "image/jpg", "image/jpeg"]} maxFileSize={30000} minFileSize={0} multiple={false} clickable >
                <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary">Upload photo</Button>
            </Files>
        </Box>;
    }

    /**
     * Render DialogActions when mode = Edit photo
     */
    renderEditPhotoActions = () => {
        const {
            ProfileLocalState,
            handleImageChanged,
            handleImageError,
            saveImage
        } = this.props;

        const EditImageLocalState: EditImageDialogState = ProfileLocalState.EditImageDialogState;

        return <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-end"
            padding="20px"
        >
            <Files onChange={handleImageChanged} onError={handleImageError} accepts={["image/png", "image/jpg", "image/jpeg"]} maxFileSize={30000} minFileSize={0} multiple={false} clickable >
                <Button className={css(sharedStyles.no_text_transform)} variant="outlined">Change photo</Button>
            </Files>
            <Box width="20px" />
            <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => saveImage()}>
                {
                    isSavingProfilePicture(EditImageLocalState)
                        ? "Saving photo ..."
                        : "Save photo"
                }
            </Button>
        </Box>;
    }

    /**
     * Render DialogActions when mode = Display photo
     */
    renderDisplayPhotoActions = () => {
        const {
            ProfileLocalState,
            changeMode,
            deleteImage
        } = this.props;

        const EditImageLocalState: EditImageDialogState = ProfileLocalState.EditImageDialogState;

        return <Box
            display="flex"
            flexDirection="row"
            justifyContent="flex-end"
            padding="20px"
        >
            <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => changeMode(EditImageDialogModes.EditPhoto)}>
                <Edit/>
                <Box width="6px"/>
                Edit
            </Button>

            <Box width="20px"/>

            <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => deleteImage()}>
                <Delete/>
                <Box width="6px"/>
                {
                    isDeletingProfilePicture(EditImageLocalState)
                        ? "Deleting photo ..."
                        : "Delete"
                }
            </Button>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(EditImageDialog);

const EditPhotoSlider = withStyles({
    root: {
        color: "#52AF77",
        height: 6,
    },
    thumb: {
        height: 22,
        width: 22,
        backgroundColor: "#FFF",
        border: "2px solid currentColor",
        marginTop: -8,
        marginLeft: -12,
        "&:focus, &:hover, &$active": {
            boxShadow: "inherit",
        },
    },
    active: {},
    valueLabel: {
        left: "calc(-50% + 4px)",
    },
    track: {
        height: 6,
        borderRadius: 4,
    },
    rail: {
        height: 6,
        borderRadius: 4,
    },
})(Slider);
