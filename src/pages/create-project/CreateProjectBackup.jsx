import React, {Component} from "react";
import FlexView from "react-flexview";
import {css, StyleSheet} from "aphrodite";
import {
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Fab,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    IconButton,
    InputAdornment,
    MenuItem,
    OutlinedInput,
    Radio,
    RadioGroup,
    Select,
    Step,
    StepLabel,
    Stepper,
    TextField,
    Typography
} from "@material-ui/core";
import {KeyboardDatePicker} from "@material-ui/pickers";
import SaveIcon from "@material-ui/icons/Save";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import Files from "react-files";
import {NavLink} from "react-router-dom";
import {Col, Container, Image, Overlay, OverlayTrigger, Popover, ProgressBar, Row, Tooltip} from "react-bootstrap";
import ReactPlayer from "react-player";
import {AUTH_SUCCESS} from "../signin/Signin";
import {BeatLoader, HashLoader} from "react-spinners";

import queryString from "query-string";
// React Quill - text editor
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

import UploadDocuments from "../../shared-components/upload-documents/DocumentsUpload";
import PageNotFoundWhole from "../../shared-components/page-not-found/PageNotFoundWhole";
import HeaderWithoutDesc from "../../shared-components/nav-bars/HeaderWithoutDesc";
import DocumentsDownload from "../../shared-components/download-documents/DocumentsDownload";
import SelectPitchVisibility from "../../shared-components/select-pitch-visibility/SelectPitchVisibility";
import SelectPledgeVisibility from "../../shared-components/select-pledge-visibility/SelectPledgeVisibility";
import InfoOverlay from "../../shared-components/info_overlay/InfoOverlay";

import {connect} from "react-redux";
import * as manageGroupFromParamsActions from "../../redux-store/actions/manageGroupFromParamsActions";
import * as selectProjectVisibilityActions from "../../redux-store/actions/selectProjectVisibilityActions";
import * as feedbackSnackbarActions from "../../redux-store/actions/feedbackSnackbarActions";

import firebase from "../../firebase/firebaseApp";
import * as colors from "../../values/colors";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import * as utils from "../../utils/utils";
import * as DB_CONST from "../../firebase/databaseConsts";
import * as ROUTES from "../../router/routes";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";

import "./CreateProject.scss";

const PITCH_COVER_FILES_CHANGED = 1;
const PITCH_SUPPORTING_DOCUMENTS_FILES_CHANGED = 2;
const PITCH_PRESENTATION_FILES_CHANGED = 3;

export const PITCH_COVER_FILE_TYPE_SELECTED = 1; // users select to upload an image or a video for their pitch cover
export const PITCH_COVER_VIDEO_URL_TYPE_SELECTED = 2; // users select to upload a video URL for their pitch cover

// pitch create non-check
export const PITCH_PUBLISH_CHECK_NONE = 0;
// pitch cannot be created due to missing fields
export const PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION = 1;
// pitch cannot be created due to 0 or negative value of fund or equity
export const PITCH_PUBLISH_FALSE_INVALID_DATE = 2;
export const PITCH_PUBLISH_FALSE_INVALID_FUND = 3;
export const PITCH_PUBLISH_FALSE_MISSING_PITCH_COVER = 4;
export const PITCH_PUBLISH_FALSE_MISSING_PITCH_PRESENTATION = 5;

export const UPLOAD_NONE = 0;
export const UPLOAD_PITCH_COVER_MODE = 1;
export const UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE = 2;
export const UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE = 3;
export const UPLOAD_REALTIME_DB = 4;
export const UPLOAD_DONE_MODE = 5;

export const STEP_PITCH_GENERAL_INFORMATION = 0;
export const STEP_PITCH_COVER = 1;
export const STEP_PITCH_DECK = 2;
export const STEP_PITCH_SUPPORTING_DOCUMENTS = 3;
export const STEP_ACCEPT_TERMS_AND_CONDITIONS = 4;

const mapStateToProps = state => {
    return {
        isMobile: state.MediaQueryState.isMobile,

        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        authStatus: state.auth.authStatus,
        authenticating: state.auth.authenticating,
        currentUser: state.auth.user,
        currentUserLoaded: state.auth.userLoaded,
        currentUserBeingLoaded: state.auth.userBeingLoaded,

        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesLoaded: state.manageClubAttributes.clubAttributesLoaded,

        projectVisibilitySetting: state.manageSelectProjectVisibility.projectVisibilitySetting
    }
};

const mapDispatchToProps = dispatch => {
    return {
        setGroupUserNameFromParams: (groupUserName) => dispatch(manageGroupFromParamsActions.setGroupUserNameFromParams(groupUserName)),
        setExpectedAndCurrentPathsForChecking: (expectedPath, currentPath) => dispatch(manageGroupFromParamsActions.setExpectedAndCurrentPathsForChecking(expectedPath, currentPath)),
        loadAngelNetwork: () => dispatch(manageGroupFromParamsActions.loadAngelNetwork()),

        selectProjectVisibility_setProject: (project) => dispatch(selectProjectVisibilityActions.setProject(project)),

        setFeedbackSnackbarContent: (message, color, position) => dispatch(feedbackSnackbarActions.setFeedbackSnackbarContent(message, color, position))
    }
};

const initState = {
    recoveredFromPreviousState: false,

    projectBeforeEdited: null,
    projectEdited: null,
    projectEditedLoaded: false,

    requestToLoadData: true,
    projectIDToBeLoadedAfterSavingFirstTime: null,

    saveProgress: false,
    progressBeingSaved: false,
    draftBeingDeleted: false,

    createProject: {

        activeStep: STEP_PITCH_GENERAL_INFORMATION,

        // pitch sector
        pitchSector: '-',
        // pitch project name
        pitchCourse: '',
        pitchProjectName: '',
        pitchProjectDescription: '',
        pitchExpiryDate: null,

        financialRound: '',
        detailsAboutEarlierFundraisingRounds: '',
        pitchInvestorsCommitted: '',

        // pitch cover (image or video) --- 1 file
        pitchCover: [],
        // pitch cover - video URL
        pitchCoverVideoURL: '',
        // select between uploading an image or a video ULR -----
        pitchCoverTypeSelected: null,
        // ------------------------------------------------------
        // pitch supporting documents --- max 10 files
        pitchSupportingDocuments: [],
        // pitch presentation file (user uploads a file for pitch presentation) --- 1 file
        pitchPresentationDocument: [],
        // pitch presentation text (user uses the provided text editor to make pitch presentation)
        pitchPresentationText: {ops: []},
        // plain text obtained from quill editor
        pitchPresentationPlainText: null,

        // check for missing fields (or invalid inputs) when the user hits the Next button
        pitchPublishCheck: PITCH_PUBLISH_CHECK_NONE,

        // these 2 states are used to display popover error message when the Publish button is clicked
        pitchNextStepButtonTarget: null,
        pitchPublishErrorMessageShowed: false,

        uploadFileProgress: 0,
        uploadFileMode: UPLOAD_NONE,

        openUploadingProgressDialog: false,

        // T&Cs and marketing preferences ------------------------------------------------------------------------------
        acceptedTermsAndConditions: false,
        agreedToShareRaisePublicly: false,
        agreedToReceiveLocalInvestmentInfo: false,
        // -------------------------------------------------------------------------------------------------------------

        projectID: null, // set when project has been successfully published to pass to UploadDialog

        // customized fields (for specific groups only) ------------------------------------------------------------------
        // this field is only available for QIB
        qibSpecialNews: ''
        // -------------------------------------------------------------------------------------------------------------
    }
};

class CreatePitchPageMain extends Component {

    constructor(props) {
        super(props);

        this.firebaseDB = firebase.database();
        this.firebaseStorage = firebase.storage();

        // listen for changes made in save project mode
        this.projectEditedSaveModeRefListener = null;

        // these variables contain the data that is formatted to be uploaded on Realtime DB
        this.pitchCoverRealtimeDB = [];
        this.pitchSupportingDocumentsRealtimeDB = [];
        this.pitchPresentationDocumentRealtimeDB = [];

        this.state = {
            ...initState
        }
    }

    componentDidMount() {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            currentUserLoaded,
            currentUserBeingLoaded,

            setGroupUserNameFromParams,
            setExpectedAndCurrentPathsForChecking,
            loadAngelNetwork
        } = this.props;

        const {
            requestToLoadData
        } = this.state;

        const match = this.props.match;

        setGroupUserNameFromParams(match.params.hasOwnProperty('groupUserName') ? match.params.groupUserName : null);
        setExpectedAndCurrentPathsForChecking(
            match.params.hasOwnProperty('groupUserName')
                ?
                ROUTES.CREATE_OFFER
                :
                ROUTES.CREATE_OFFER_INVEST_WEST_SUPER, match.path);

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            if (!currentUserBeingLoaded && currentUserLoaded) {
                if (requestToLoadData) {
                    // call load data here when the save progress button is hit for the first time --> navigate to edit mode
                    this.loadData();
                }
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            groupPropertiesLoaded,
            shouldLoadOtherData,

            currentUserLoaded,
            currentUserBeingLoaded,

            loadAngelNetwork
        } = this.props;

        const {
            recoveredFromPreviousState,
            requestToLoadData,

            saveProgress,
            progressBeingSaved
        } = this.state;

        const previousState = this.props.location.state;
        // when the user clicks Save for the first time
        // or when they click on the Next button in the STEP_PITCH_GENERAL_INFORMATION step
        // the page will reload to take them to the edit page with the project ID.
        // If the user clicks on the Next button in the STEP_PITCH_GENERAL_INFORMATION step, once the page is
        // reloaded, they should be taken to the next step rather than stay in the same step.
        if (previousState !== undefined && previousState !== null) {
            if (!recoveredFromPreviousState) {
                this.setState({
                    recoveredFromPreviousState: true,
                    createProject: {
                        ...this.state.createProject,
                        activeStep:
                            previousState.activeStep !== -1
                                ?
                                previousState.activeStep
                                :
                                this.state.createProject.activeStep
                    }
                });
            }
        }

        loadAngelNetwork();

        if (groupPropertiesLoaded && shouldLoadOtherData) {
            if (!currentUserBeingLoaded && currentUserLoaded) {
                if (requestToLoadData) {
                    // call load data here when the save progress button is hit for the first time --> navigate to edit mode
                    this.loadData();
                }
            }

            if (saveProgress && !progressBeingSaved) {
                this.uploadProject();
            }
        }
    }

    componentWillUnmount() {
        if (this.projectEditedSaveModeRefListener) {
            this.projectEditedSaveModeRefListener.off('child_changed');
        }
    }

    /**
     * Navigate to the same page with active step saved
     * This will save the activeStep of the page, so when the user refreshes the page,
     * they can still continue with their previous step.
     *
     * @param activeStep
     * @param projectID
     */
    navigateToTheSamePageWithActiveStepSaved = (activeStep, projectID) => {
        const {
            groupUserName
        } = this.props;

        // projectID not null
        // --> still in edit mode
        if (projectID) {
            this.props.history.push({
                pathname:
                    groupUserName
                        ?
                        ROUTES.CREATE_OFFER
                            .replace(":groupUserName", groupUserName)
                        :
                        ROUTES.CREATE_OFFER_INVEST_WEST_SUPER,
                search: `?edit=${projectID}`,
                state: {
                    activeStep: activeStep
                }
            });
        }
        // projectID null --> create mode
        else {
            this.props.history.push({
                pathname:
                    groupUserName
                        ?
                        ROUTES.CREATE_OFFER
                            .replace(":groupUserName", groupUserName)
                        :
                        ROUTES.CREATE_OFFER_INVEST_WEST_SUPER,
                state: {
                    activeStep: activeStep
                }
            });
        }
    };

    /**
     * Load data
     */
    loadData = () => {
        const {
            groupProperties,
            currentUser,
            selectProjectVisibility_setProject
        } = this.props;

        const {
            projectEditedLoaded,
            projectIDToBeLoadedAfterSavingFirstTime
        } = this.state;

        if (!currentUser
            ||
            (currentUser && currentUser.type === DB_CONST.TYPE_INVESTOR)
        ) {
            if (!projectEditedLoaded) {
                this.setState({
                    projectEditedLoaded: true
                });
            }
            return;
        }

        this.setState({
            requestToLoadData: false
        });

        // get project id from the URL
        const params = queryString.parse(this.props.location.search);

        // in edit mode
        if (params.edit || projectIDToBeLoadedAfterSavingFirstTime) {
            // load the project
            realtimeDBUtils
                .loadAParticularProject(!params.edit ? projectIDToBeLoadedAfterSavingFirstTime : params.edit)
                .then(project => {

                    // allow the group admin to change the visibility of the project
                    if (currentUser.type === DB_CONST.TYPE_ADMIN) {
                        selectProjectVisibility_setProject(project);
                    }

                    // project is in draft mode
                    if (project.status === DB_CONST.PROJECT_STATUS_DRAFT) {
                        if (!this.projectEditedSaveModeRefListener) {
                            this.projectEditedSaveModeRefListener = this.firebaseDB
                                .ref(DB_CONST.PROJECTS_CHILD)
                                .orderByKey()
                                .equalTo(project.id);

                            this.projectEditedSaveModeRefListener
                                .on('child_changed', snapshot => {

                                    let project = snapshot.val();

                                    this.setState({
                                        projectEdited: Object.assign({}, project)
                                    });
                                });
                        }
                    }

                    this.setState({
                        projectBeforeEdited: JSON.parse(JSON.stringify(project)),
                        projectEdited: JSON.parse(JSON.stringify(project)),
                        projectEditedLoaded: true,
                        projectIDToBeLoadedAfterSavingFirstTime: null,

                        createProject: {
                            ...this.state.createProject,
                            // pitch sector
                            pitchSector:
                                project.hasOwnProperty('sector')
                                    ?
                                    project.sector
                                    :
                                    ''
                            ,
                            pitchCourse: 
                                project.hasOwnProperty('course')
                                    ?
                                    project.course
                                    :
                                    ''
                            ,
                            // pitch project name
                            pitchProjectName:
                                project.hasOwnProperty('projectName')
                                    ?
                                    project.projectName
                                    :
                                    ''
                            ,
                            pitchProjectDescription:
                                project.hasOwnProperty('description')
                                    ?
                                    project.description
                                    :
                                    ''
                            ,
                            pitchExpiryDate:
                                project.Pitch.hasOwnProperty('expiredDate')
                                    ?
                                    project.Pitch.expiredDate
                                    :
                                    null
                            ,
                            financialRound:
                                project.Pitch.hasOwnProperty('financialRound')
                                    ?
                                    project.Pitch.financialRound
                                    :
                                    ''
                            ,
                            detailsAboutEarlierFundraisingRounds:
                                project.Pitch.hasOwnProperty('detailsAboutEarlierFundraisingRounds')
                                    ?
                                    project.Pitch.detailsAboutEarlierFundraisingRounds
                                    :
                                    ''
                            ,
                            pitchInvestorsCommitted:
                                project.Pitch.hasOwnProperty('investorsCommitted')
                                    ?
                                    project.Pitch.investorsCommitted
                                    :
                                    ''
                            ,
                            pitchPresentationText:
                                !project.Pitch.presentationText
                                    ?
                                    {ops: []}
                                    :
                                    project.Pitch.presentationText
                            ,
                            // this field is only available for QIB
                            qibSpecialNews:
                                project.Pitch.hasOwnProperty('qibSpecialNews')
                                    ?
                                    project.Pitch.qibSpecialNews
                                    :
                                    ''
                        }
                    });
                })
                .catch(error => {
                    this.setState({
                        projectEditedLoaded: true,
                        projectIDToBeLoadedAfterSavingFirstTime: null
                    });
                });
        }
        // in create mode
        else {
            this.setState({
                projectEditedLoaded: true,
                projectIDToBeLoadedAfterSavingFirstTime: null,

                createProject: {
                    ...this.state.createProject,
                    pitchExpiryDate:
                        groupProperties.groupUserName === "qib"
                            ?
                            // if the group is QIB,
                            // set the pitch expiry date to the one specified by the QIB' admins
                            // Note: must ensure the defaultPitchExpiryDate field is valid
                            groupProperties.settings.defaultPitchExpiryDate
                            :
                            this.state.createProject.pitchExpiryDate
                }
            });

            // allow the group admin to change the visibility of the project
            if (currentUser.type === DB_CONST.TYPE_ADMIN) {
                selectProjectVisibility_setProject(null);
            }
        }
    };

    /**
     * This function is used to handle when the Next Step button is clicked
     */
    handleNextStepClick = () => {

        const params = queryString.parse(this.props.location.search);

        const {
            groupUserName
        } = this.props;

        const {
            projectEdited,
            progressBeingSaved
        } = this.state;

        const {
            activeStep,

            pitchSector,
            pitchCourse,
            pitchProjectName,
            pitchProjectDescription,
            pitchExpiryDate,

            financialRound,

            pitchCover,
            pitchCoverVideoURL,
            pitchCoverTypeSelected,
            pitchPresentationDocument,
            pitchPresentationText,


            // this field is only available for QIB
            qibSpecialNews
        } = this.state.createProject;

        // progress is being saved,
        // we shouldn't let the user click
        if (progressBeingSaved) {
            return;
        }

        switch (activeStep) {
            // General information
            case STEP_PITCH_GENERAL_INFORMATION:
                // if one of the fields in the General information part is missing, ask the user to fill them
                if (pitchSector === "-"
                    || pitchCourse === "-"
                    || pitchProjectName.trim().length === 0
                    || pitchProjectDescription.trim().length === 0
                    || pitchExpiryDate === null
                    || financialRound.trim().length === 0
                    || (groupUserName === "qib" && qibSpecialNews.trim().length === 0)
                ) {

                    this.setState({
                        createProject: {
                            ...this.state.createProject,
                            pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION,
                            pitchPublishErrorMessageShowed: true
                        }
                    });

                    return;
                }
                

                // check if the entered date is in a valid format or the entered is less than the minimum date
                if (isNaN(pitchExpiryDate)
                    ||
                    (pitchExpiryDate && (pitchExpiryDate < utils.getDateWithDaysFurtherThanToday(0)))
                ) {
                    this.setState({
                        createProject: {
                            ...this.state.createProject,
                            pitchPublishCheck: PITCH_PUBLISH_FALSE_INVALID_DATE,
                            pitchPublishErrorMessageShowed: true
                        }
                    });
                    return;
                }
                this.setState({
                    createProject: {
                        ...this.state.createProject,
                        activeStep: activeStep + 1,
                        pitchPublishCheck: PITCH_PUBLISH_CHECK_NONE,
                        pitchPublishErrorMessageShowed: false
                    }
                });
                break;
            // Pitch cover
            case STEP_PITCH_COVER:
                // in edit mode
                if (params.edit && projectEdited) {
                    if (
                        (
                            !projectEdited.Pitch.cover
                            ||
                            (projectEdited.Pitch.cover
                                && projectEdited.Pitch.cover.filter(coverItem => !coverItem.hasOwnProperty('removed')).length === 0)
                        )
                        && (
                            !pitchCoverTypeSelected
                            || (pitchCoverTypeSelected === PITCH_COVER_FILE_TYPE_SELECTED && pitchCover.length === 0)
                            || (pitchCoverTypeSelected === PITCH_COVER_VIDEO_URL_TYPE_SELECTED && pitchCoverVideoURL.trim().length === 0)
                        )
                    ) {
                        this.setState({
                            createProject: {
                                ...this.state.createProject,
                                pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_PITCH_COVER,
                                pitchPublishErrorMessageShowed: true
                            }
                        });
                        return;
                    }
                } else {
                    // if the user has not uploaded pitch cover, ask them to upload
                    if (!pitchCoverTypeSelected
                        || (pitchCoverTypeSelected === PITCH_COVER_FILE_TYPE_SELECTED && pitchCover.length === 0)
                        || (pitchCoverTypeSelected === PITCH_COVER_VIDEO_URL_TYPE_SELECTED && pitchCoverVideoURL.trim().length === 0)
                    ) {
                        this.setState({
                            createProject: {
                                ...this.state.createProject,
                                pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_PITCH_COVER,
                                pitchPublishErrorMessageShowed: true
                            }
                        });
                        return;
                    }
                }
                this.setState({
                    createProject: {
                        ...this.state.createProject,
                        activeStep: activeStep + 1,
                        pitchPublishCheck: PITCH_PUBLISH_CHECK_NONE,
                        pitchPublishErrorMessageShowed: false
                    }
                });
                break;
            // Pitch deck
            case STEP_PITCH_DECK:
                // for QIB, pitch deck is considered as one-pager
                // there will be no presentation text, so don't need to check
                if (groupUserName === "qib") {
                    // in edit mode
                    if (params.edit && projectEdited) {
                        if (pitchPresentationDocument.length === 0
                            && (
                                !projectEdited.Pitch.presentationDocument
                                ||
                                (
                                    projectEdited.Pitch.presentationDocument
                                    && projectEdited.Pitch.presentationDocument.filter(document => !document.hasOwnProperty('removed')).length === 0
                                )
                            )
                        ) {
                            this.setState({
                                createProject: {
                                    ...this.state.createProject,
                                    pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_PITCH_PRESENTATION,
                                    pitchPublishErrorMessageShowed: true
                                }
                            });
                            return;
                        }
                    } else {
                        // if the user has not created their pitch presentation, ask them to do so by uploading a presentation file or use the text editor provided
                        if (pitchPresentationDocument.length === 0) {
                            this.setState({
                                createProject: {
                                    ...this.state.createProject,
                                    pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_PITCH_PRESENTATION,
                                    pitchPublishErrorMessageShowed: true
                                }
                            });
                            return;
                        }
                    }
                }
                    // for other groups, we need to ensure the user is uploading a pitch deck file or filling
                // in the text editor or both
                else {
                    // in edit mode
                    if (params.edit && projectEdited) {
                        if (pitchPresentationDocument.length === 0
                            && pitchPresentationText.ops.length === 0
                            && (
                                !projectEdited.Pitch.presentationDocument
                                ||
                                (
                                    projectEdited.Pitch.presentationDocument
                                    && projectEdited.Pitch.presentationDocument.filter(document => !document.hasOwnProperty('removed')).length === 0
                                )
                            )
                            && !projectEdited.Pitch.presentationText) {
                            this.setState({
                                createProject: {
                                    ...this.state.createProject,
                                    pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_PITCH_PRESENTATION,
                                    pitchPublishErrorMessageShowed: true
                                }
                            });
                            return;
                        }
                    } else {
                        // if the user has not created their pitch presentation, ask them to do so by uploading a presentation file or use the text editor provided
                        if (pitchPresentationDocument.length === 0 && pitchPresentationText.ops.length === 0) {
                            this.setState({
                                createProject: {
                                    ...this.state.createProject,
                                    pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_PITCH_PRESENTATION,
                                    pitchPublishErrorMessageShowed: true
                                }
                            });
                            return;
                        }
                    }
                }
                this.setState({
                    createProject: {
                        ...this.state.createProject,
                        activeStep: activeStep + 1,
                        pitchPublishCheck: PITCH_PUBLISH_CHECK_NONE,
                        pitchPublishErrorMessageShowed: false
                    }
                });
                break;
            // Supporting documents
            case STEP_PITCH_SUPPORTING_DOCUMENTS:
                if (projectEdited.status !== DB_CONST.PROJECT_STATUS_DRAFT) {
                    // upload the pitch
                    this.uploadProject();
                    return;
                } else {
                    this.setState({
                        createProject: {
                            ...this.state.createProject,
                            activeStep: activeStep + 1,
                            pitchPublishCheck: PITCH_PUBLISH_CHECK_NONE,
                            pitchPublishErrorMessageShowed: false
                        }
                    });
                }
                break;
            case STEP_ACCEPT_TERMS_AND_CONDITIONS:
                // publish button is clicked and the offer is a draft, detach the listener so that success message can be displayed correctly
                if (projectEdited && projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT) {
                    if (this.projectEditedSaveModeRefListener) {
                        this.projectEditedSaveModeRefListener.off('child_changed');
                    }

                    // upload the pitch
                    this.uploadProject();
                    this.navigateToTheSamePageWithActiveStepSaved(0, projectEdited.id);
                    return;
                }
                break;
            default:
                return;
        }

        if (params.edit && projectEdited) {
            if (projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT) {
                // save progress
                this.handleSaveProgressClick();
            } else {
                this.navigateToTheSamePageWithActiveStepSaved(activeStep + 1, projectEdited.id);
            }
        } else {
            // save progress
            this.handleSaveProgressClick();
        }
    };

    /**
     * This function is used to handle when the Back button is clicked (got to previous step)
     */
    handleBackClick = () => {
        const projectEdited = this.state.projectEdited;
        const activeStep = this.state.createProject.activeStep;

        if (activeStep === 0) {
            return;
        }
        this.setState({
            createProject: {
                ...this.state.createProject,
                activeStep: activeStep - 1
            }
        });
        this.navigateToTheSamePageWithActiveStepSaved(activeStep - 1, projectEdited.id);
    };

    /**
     * Handle between selecting to upload an image or a video or adding a video URL for the pitch cover.
     *
     * @param type
     */
    handleSelectPitchCoverTypeClick = type => {

        const {
            pitchCoverTypeSelected,
            pitchCover,
            pitchCoverVideoURL
        } = this.state.createProject;

        if (pitchCoverTypeSelected === type) {
            this.setState({
                createProject: {
                    ...this.state.createProject,
                    pitchCoverTypeSelected: null,
                    pitchCover: type === PITCH_COVER_FILE_TYPE_SELECTED ? [] : pitchCover,
                    pitchCoverVideoURL: type === PITCH_COVER_VIDEO_URL_TYPE_SELECTED ? '' : pitchCoverVideoURL
                }
            });
        } else {
            this.setState({
                createProject: {
                    ...this.state.createProject,
                    pitchCoverTypeSelected: type
                }
            });
        }
    };

    /**
     * This function gets called when files to be uploaded changed.
     */
    handleFilesChanged = (mode, files) => {

        const {
            groupUserName
        } = this.props;

        const {
            projectEdited
        } = this.state;

        const {
            pitchSupportingDocuments
        } = this.state.createProject;

        const {
            setFeedbackSnackbarContent
        } = this.props;

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            const fileRead = {
                file: files[files.length - 1],
                preview: reader.result
            };

            switch (mode) {
                // there can only be 1 file uploaded for the pitch cover
                case PITCH_COVER_FILES_CHANGED:
                    this.setState({
                        createProject: {
                            ...this.state.createProject,
                            pitchCover: [fileRead]
                        }
                    });
                    break;
                // there can be more than 1 pitch supporting files
                case PITCH_SUPPORTING_DOCUMENTS_FILES_CHANGED:
                    // for QIB, supporting document will be considered as pitch deck
                    // so, the user can only upload one file
                    if (groupUserName === "qib") {
                        this.setState(prevState => ({
                            createProject: {
                                ...prevState.createProject,
                                pitchSupportingDocuments: [fileRead]
                            }
                        }));
                    }
                    // for other groups, the user can upload multiple files for supporting documents
                    else {
                        if (projectEdited) {
                            if (!projectEdited.Pitch.supportingDocuments) {
                                if (pitchSupportingDocuments.length >= DB_CONST.MAX_FILES_FOR_PITCH_SUPPORTING_DOCUMENTS) {
                                    setFeedbackSnackbarContent(
                                        'Max file count reached.',
                                        "error",
                                        "bottom"
                                    );
                                    break;
                                }
                            } else {
                                if (pitchSupportingDocuments.length >=
                                    DB_CONST.MAX_FILES_FOR_PITCH_SUPPORTING_DOCUMENTS - projectEdited.Pitch.supportingDocuments.filter(document => !document.hasOwnProperty('removed')).length) {
                                    setFeedbackSnackbarContent(
                                        'Max file count reached.',
                                        "error",
                                        "bottom"
                                    );
                                    break;
                                }
                            }
                        } else {
                            if (pitchSupportingDocuments.length >= DB_CONST.MAX_FILES_FOR_PITCH_SUPPORTING_DOCUMENTS) {
                                setFeedbackSnackbarContent(
                                    'Max file count reached.',
                                    "error",
                                    "bottom"
                                );
                                break;
                            }
                        }

                        this.setState(prevState => ({
                            createProject: {
                                ...prevState.createProject,
                                pitchSupportingDocuments: [...prevState.createProject.pitchSupportingDocuments, fileRead]
                            }
                        }));
                    }
                    break;
                // there can only be 1 file for pitch presentation
                case PITCH_PRESENTATION_FILES_CHANGED:
                    this.setState({
                        createProject: {
                            ...this.state.createProject,
                            pitchPresentationDocument: [fileRead]
                        }
                    });
                    break;
                default:
                    break;
            }
        });
        reader.readAsDataURL(files[files.length - 1]);
    };

    /**
     * This function gets called when files to be uploaded have error (exceed size, type not matched, etc.).
     */
    handleFileError = (error, file) => {
        const {
            setFeedbackSnackbarContent
        } = this.props;

        let errorMessage = error.message;
        errorMessage = errorMessage.charAt(0).toUpperCase() + errorMessage.slice(1);

        setFeedbackSnackbarContent(
            errorMessage,
            "error",
            "bottom"
        );
    };

    /**
     * This function gets called when the texts in the Create Pitch Dialog changed.
     */
    handleCreatePitchInputChanged = event => {
        const name = event.target.name;
        const value = event.target.value;

        this.setState({
            createProject: {
                ...this.state.createProject,
                [name]: value
            }
        });
    };

    /**
     * Handle changes when the Quill editor is changed.
     */
    handlePitchEditorChanged = (content, delta, source, editor) => {

        // check if the editor is empty (or does not have any text)
        // we must ensure that a pitch body contains text
        if (editor.getText().trim().length === 0) {
            this.setState({
                createProject: {
                    ...this.state.createProject,
                    pitchPresentationText: {ops: []}
                }
            });
        } else {
            this.setState({
                createProject: {
                    ...this.state.createProject,
                    pitchPresentationText: editor.getContents(),
                    pitchPresentationPlainText: editor.getText()
                }
            });
        }
    };

    /**
     * This function gets called to create a new pitch.
     */
    uploadProject = () => {

        const params = queryString.parse(this.props.location.search);

        const {
            groupProperties,

            currentUser,

            projectVisibilitySetting
        } = this.props;

        const {
            projectBeforeEdited,
            projectEdited,

            saveProgress,
            progressBeingSaved
        } = this.state;

        const {
            activeStep,

            pitchSector,
            pitchCourse,
            pitchProjectName,
            pitchProjectDescription,
            pitchExpiryDate,

            financialRound,
            detailsAboutEarlierFundraisingRounds,
            pitchInvestorsCommitted,

            pitchCover,
            pitchCoverVideoURL,
            pitchPresentationDocument,
            pitchPresentationText,
            pitchPresentationPlainText,

            agreedToShareRaisePublicly,
            agreedToReceiveLocalInvestmentInfo,

            // this field is only available for QIB
            qibSpecialNews
        } = this.state.createProject;


        if (saveProgress && !progressBeingSaved) {
            this.setState({
                progressBeingSaved: true
            });
        }

        // in edit mode
        if (params.edit && projectEdited) {
            // new cover has been chosen
            if (pitchCover.length > 0 || pitchCoverVideoURL.trim().length > 0) {
                if (projectEdited.Pitch.hasOwnProperty('cover')) {
                    // mark the existing cover with the 'removed' tag
                    projectEdited.Pitch.cover.forEach((coverItem, index) => {
                        coverItem.removed = true;
                        projectEdited.Pitch.cover[index] = coverItem;
                    });
                }
            }

            // new pitch presentation document has been chosen
            if (pitchPresentationDocument.length > 0) {
                if (projectEdited.Pitch.hasOwnProperty('presentationDocument')) {
                    // mark the existing presentation document with the 'removed' tag
                    projectEdited.Pitch.presentationDocument.forEach((presentationItem, index) => {
                        presentationItem.removed = true;
                        // noinspection TypeScriptValidateTypes
                        projectEdited.Pitch.presentationDocument[index] = presentationItem;
                    });
                }
            }

            // pitch reference in Realtime DB
            const projectRef = this.firebaseDB
                .ref(DB_CONST.PROJECTS_CHILD);

            // pitch storage reference
            const projectStorageRef = this.firebaseStorage
                .ref(DB_CONST.USERS_CHILD)
                .child(projectEdited.issuerID)
                .child(DB_CONST.PROJECTS_CHILD)
                .child(projectEdited.id);

            // upload pitch cover
            this.uploadMultipleFiles(UPLOAD_PITCH_COVER_MODE, projectStorageRef)
                .then(successful => {

                    this.setState({
                        createProject: {
                            ...this.state.createProject,
                            uploadFileProgress: 100
                        }
                    });

                    // upload pitch supporting documents
                    this.uploadMultipleFiles(UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE, projectStorageRef)
                        .then(successful => {

                            this.setState({
                                createProject: {
                                    ...this.state.createProject,
                                    uploadFileProgress: 100
                                }
                            });

                            // upload pitch presentation or pitch deck
                            this.uploadMultipleFiles(UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE, projectStorageRef)
                                .then(successful => {

                                    this.setState({
                                        createProject: {
                                            ...this.state.createProject,
                                            uploadFileMode: UPLOAD_REALTIME_DB,
                                            uploadFileProgress: 100
                                        }
                                    });

                                    let updatedProject = {
                                        ...JSON.parse(JSON.stringify(projectEdited)),
                                        issuer: null,
                                        group: null,
                                        projectName:
                                            saveProgress
                                                ?
                                                pitchProjectName.trim().length === 0
                                                    ?
                                                    null
                                                    :
                                                    pitchProjectName
                                                :
                                                pitchProjectName
                                        ,
                                        sector:
                                            saveProgress
                                                ?
                                                pitchSector === "-"
                                                    ?
                                                    null
                                                    :
                                                    pitchSector
                                                :
                                                pitchSector
                                        ,
                                        course:
                                            saveProgress
                                                ?
                                                pitchCourse === "-"
                                                    ?
                                                    null
                                                    :
                                                    pitchCourse
                                                :
                                                pitchCourse
                                        ,
                                        description:
                                            saveProgress
                                                ?
                                                pitchProjectDescription.trim().length === 0
                                                    ?
                                                    null
                                                    :
                                                    pitchProjectDescription
                                                :
                                                pitchProjectDescription
                                        ,
                                        visibility:
                                            projectVisibilitySetting === -1
                                                ?
                                                projectEdited.visibility
                                                :
                                                projectVisibilitySetting
                                        ,
                                        status:
                                            saveProgress
                                                ?
                                                // in save progress mode --> set status to DRAFT
                                                DB_CONST.PROJECT_STATUS_DRAFT
                                                :
                                                // not in save progress mode --> publish mode
                                                // check if the edited project is a draft one --> if so, change its status to being checked
                                                // otherwise, keep the previous project status
                                                projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT
                                                    ?
                                                    DB_CONST.PROJECT_STATUS_BEING_CHECKED
                                                    :
                                                    projectEdited.status
                                        ,
                                        edited:
                                            saveProgress
                                                ?
                                                null
                                                :
                                                utils.getCurrentDate()
                                        ,
                                        PrimaryOffer:
                                            projectEdited.PrimaryOffer
                                                ?
                                                projectEdited.PrimaryOffer
                                                :
                                                null
                                        ,
                                        Pitch: {
                                            financialRound:
                                                saveProgress
                                                    ?
                                                    financialRound.trim().length === 0
                                                        ?
                                                        null
                                                        :
                                                        financialRound
                                                    :
                                                    financialRound
                                            ,
                                            detailsAboutEarlierFundraisingRounds:
                                                detailsAboutEarlierFundraisingRounds.trim().length === 0
                                                    ?
                                                    null
                                                    :
                                                    detailsAboutEarlierFundraisingRounds
                                            ,
                                            investorsCommitted:
                                                pitchInvestorsCommitted.trim().length === 0
                                                    ?
                                                    null
                                                    :
                                                    pitchInvestorsCommitted
                                            ,
                                            supportingDocuments:
                                                projectEdited.Pitch.supportingDocuments
                                                    ?
                                                    [...projectEdited.Pitch.supportingDocuments, ...this.pitchSupportingDocumentsRealtimeDB]
                                                    :
                                                    this.pitchSupportingDocumentsRealtimeDB
                                            ,
                                            presentationText:
                                                pitchPresentationText.ops.length === 0
                                                    ?
                                                    null
                                                    :
                                                    pitchPresentationText
                                            ,
                                            presentationPlainText:
                                                pitchPresentationText.ops.length === 0
                                                    ?
                                                    null
                                                    :
                                                    pitchPresentationPlainText
                                            ,
                                            presentationDocument:
                                                this.pitchPresentationDocumentRealtimeDB.length === 0
                                                    ?
                                                    (
                                                        projectEdited.Pitch.presentationDocument
                                                            ?
                                                            projectEdited.Pitch.presentationDocument
                                                            :
                                                            null
                                                    )
                                                    :
                                                    (
                                                        projectEdited.Pitch.presentationDocument
                                                            ?
                                                            [...projectEdited.Pitch.presentationDocument, ...this.pitchPresentationDocumentRealtimeDB]
                                                            :
                                                            this.pitchPresentationDocumentRealtimeDB
                                                    )
                                            ,
                                            cover:
                                                projectEdited.Pitch.cover
                                                    ?
                                                    [...projectEdited.Pitch.cover, ...this.pitchCoverRealtimeDB]
                                                    :
                                                    this.pitchCoverRealtimeDB
                                            ,
                                            postedDate:
                                                saveProgress
                                                    ?
                                                    utils.getCurrentDate()
                                                    :
                                                    projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT
                                                        ?
                                                        utils.getCurrentDate()
                                                        :
                                                        projectEdited.Pitch.postedDate
                                            ,
                                            expiredDate:
                                                saveProgress
                                                    ?
                                                    !pitchExpiryDate
                                                        ?
                                                        null
                                                        :
                                                        pitchExpiryDate
                                                    :
                                                    pitchExpiryDate
                                            ,
                                            status:
                                                saveProgress
                                                    ?
                                                    DB_CONST.PROJECT_STATUS_DRAFT
                                                    :
                                                    projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT
                                                        ?
                                                        DB_CONST.PITCH_STATUS_ON_GOING
                                                        :
                                                        projectEdited.Pitch.status
                                            ,
                                            // this field is only available for QIB
                                            qibSpecialNews:
                                                saveProgress
                                                    ?
                                                    qibSpecialNews.trim().length === 0
                                                        ?
                                                        null
                                                        :
                                                        qibSpecialNews
                                                    :
                                                    qibSpecialNews
                                            ,
                                        }
                                    };

                                    // set the updated pitch in firebase
                                    projectRef
                                        .child(projectEdited.id)
                                        .update(updatedProject)
                                        .then(() => {
                                            // publish button is clicked
                                            // only check and send notifications if the save progress is not triggered (save progress is only available for saving draft)
                                            if (!saveProgress) {
                                                // if the draft offer is published, don't need to check for sending notifications
                                                if (projectEdited.status !== DB_CONST.PROJECT_STATUS_DRAFT) {
                                                    projectBeforeEdited.issuer = null;
                                                    projectBeforeEdited.group = null;
                                                    // track activity for editing a published project
                                                    realtimeDBUtils
                                                        .trackActivity({
                                                            userID: currentUser.id,
                                                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                                                            interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                                                            interactedObjectID: projectEdited.id,
                                                            activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_EDITED_PROJECT.replace("%project%", projectEdited.projectName),
                                                            action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", projectEdited.id),
                                                            value: {
                                                                before: JSON.parse(JSON.stringify(projectBeforeEdited)),
                                                                after: JSON.parse(JSON.stringify(updatedProject))
                                                            }
                                                        });

                                                    // Send notifications to investors who voted or pledged
                                                    // load votes
                                                    realtimeDBUtils
                                                        .loadVotes(projectEdited.id, null, realtimeDBUtils.LOAD_VOTES_ORDER_BY_PROJECT)
                                                        .then(votes => {

                                                            let listOfInvestorsToBeNotified = [];
                                                            votes.forEach(vote => {
                                                                listOfInvestorsToBeNotified.push(vote.investorID);
                                                            });

                                                            // load pledges
                                                            realtimeDBUtils
                                                                .loadPledges(projectEdited.id, null, realtimeDBUtils.LOAD_PLEDGES_ORDER_BY_PROJECT)
                                                                .then(pledges => {
                                                                    pledges.forEach(pledge => {
                                                                        if (listOfInvestorsToBeNotified.findIndex(investorID => investorID === pledge.investorID) === -1) {
                                                                            listOfInvestorsToBeNotified.push(pledge.investorID);
                                                                        }
                                                                    });

                                                                    let notifications = [];
                                                                    listOfInvestorsToBeNotified.forEach(investorID => {
                                                                        const notification = {
                                                                            title: `${projectEdited.projectName} has been edited`,
                                                                            message: `Please have a look at the changes that have been made in this investment opportunity. You may find some more useful information.`,
                                                                            userID: investorID,
                                                                            action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", projectEdited.id)
                                                                        };
                                                                        notifications.push(notification);
                                                                    });

                                                                    // push all the notifications to firebase
                                                                    Promise.all(notifications.map(notification => {
                                                                        return new Promise((resolve, reject) => {
                                                                            realtimeDBUtils
                                                                                .sendNotification(notification)
                                                                                .then(() => {
                                                                                    return resolve();
                                                                                })
                                                                                .catch(error => {
                                                                                    return reject(error);
                                                                                });
                                                                        });
                                                                    })).then(() => {

                                                                        this.setState({
                                                                            createProject: {
                                                                                ...this.state.createProject,
                                                                                uploadFileMode: UPLOAD_DONE_MODE,
                                                                                uploadFileProgress: 100,
                                                                                projectID: projectEdited.id
                                                                            }
                                                                        });

                                                                    }).catch(error => {

                                                                        this.setState({
                                                                            createProject: {
                                                                                ...this.state.createProject,
                                                                                uploadFileMode: UPLOAD_DONE_MODE,
                                                                                uploadFileProgress: 100
                                                                            }
                                                                        });
                                                                    });
                                                                });
                                                        });
                                                }
                                                // a draft offer is published
                                                else {
                                                    // don't need to check for prior TCs acceptance because this is create new mode
                                                    const acceptedTCsObj = {
                                                        issuerID: currentUser.id,
                                                        projectID: projectEdited.id,
                                                        date: utils.getCurrentDate(),
                                                        agreedToShareRaisePublicly
                                                    };

                                                    // push to Create Pitch T&Cs
                                                    this.firebaseDB
                                                        .ref(DB_CONST.ACCEPTED_CREATE_PITCH_TERM_AND_CONDITIONS_CHILD)
                                                        .push(acceptedTCsObj)
                                                        .then(() => {
                                                            // track activity for creating a new project from a draft one
                                                            realtimeDBUtils
                                                                .trackActivity({
                                                                    userID: currentUser.id,
                                                                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                                                                    interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                                                                    interactedObjectID: projectEdited.id,
                                                                    activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_CREATED_PROJECT.replace("%project%", updatedProject.projectName),
                                                                    action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", updatedProject.id),
                                                                    value: updatedProject
                                                                });

                                                            // if the user is an issuer,
                                                            // update the marketing preferences setting
                                                            if (currentUser.type === DB_CONST.TYPE_ISSUER) {
                                                                realtimeDBUtils
                                                                    .updateMarketingPreferencesSetting({
                                                                        userID: currentUser.id,
                                                                        field: "agreedToReceiveLocalInvestmentInfo",
                                                                        value: agreedToReceiveLocalInvestmentInfo
                                                                    })
                                                                    .catch(error => {
                                                                        // handle error
                                                                    });
                                                            }

                                                            this.setState({
                                                                createProject: {
                                                                    ...this.state.createProject,
                                                                    uploadFileMode: UPLOAD_DONE_MODE,
                                                                    uploadFileProgress: 100,
                                                                    projectID: projectEdited.id
                                                                }
                                                            });
                                                        });
                                                }
                                            }
                                            // save button is clicked
                                            else {
                                                // reset all variables and states
                                                this.pitchCoverRealtimeDB = [];
                                                this.pitchPresentationDocumentRealtimeDB = [];
                                                this.pitchSupportingDocumentsRealtimeDB = [];

                                                this.setState({
                                                    saveProgress: false,
                                                    progressBeingSaved: false,
                                                    acceptedTermsAndConditions: false,

                                                    createProject: {
                                                        ...this.state.createProject,
                                                        uploadFileMode: UPLOAD_NONE,
                                                        uploadFileProgress: 0,
                                                        pitchCover: [],
                                                        pitchCoverVideoURL: '',
                                                        pitchCoverTypeSelected: null,
                                                        pitchSupportingDocuments: [],
                                                        pitchPresentationDocument: []
                                                    }
                                                });

                                                this.navigateToTheSamePageWithActiveStepSaved(
                                                    activeStep,
                                                    projectEdited.id
                                                );
                                            }
                                        })
                                        .catch(error => {
                                            // handle error
                                            return error;
                                        });
                                });
                        });
                });
        }
        // in create new mode
        else {
            // calculate posted date (current time)
            const postedDate = utils.getCurrentDate();

            // pitch reference in Realtime DB
            const projectRef = this.firebaseDB
                .ref(DB_CONST.PROJECTS_CHILD);
            // get pitch's publishing id
            const projectID = projectRef.push().key;

            // pitch storage reference
            const projectStorageRef = this.firebaseStorage
                .ref(DB_CONST.USERS_CHILD)
                .child(currentUser.id)
                .child(DB_CONST.PROJECTS_CHILD)
                .child(projectID);

            // upload pitch cover
            this.uploadMultipleFiles(UPLOAD_PITCH_COVER_MODE, projectStorageRef)
                .then(successful => {

                    this.setState({
                        createProject: {
                            ...this.state.createProject,
                            uploadFileProgress: 100
                        }
                    });

                    // upload pitch supporting documents
                    this.uploadMultipleFiles(UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE, projectStorageRef)
                        .then(successful => {

                            this.setState({
                                createProject: {
                                    ...this.state.createProject,
                                    uploadFileProgress: 100
                                }
                            });

                            // upload pitch presentation or pitch deck
                            this.uploadMultipleFiles(UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE, projectStorageRef)
                                .then(successful => {

                                    this.setState({
                                        createProject: {
                                            ...this.state.createProject,
                                            uploadFileMode: UPLOAD_REALTIME_DB,
                                            uploadFileProgress: 100
                                        }
                                    });

                                    const projectObj = {
                                        id: projectID,
                                        anid: groupProperties.anid,
                                        visibility:
                                            projectVisibilitySetting === -1
                                                ?
                                                groupProperties.settings.projectVisibility
                                                :
                                                projectVisibilitySetting
                                        ,
                                        issuerID:
                                        // a group admin is creating an offer on behalf of a known issuer
                                            params.admin && params.issuer
                                                ?
                                                // then the issuerID is set to the id of the issuer that the
                                                // group admin is creating an offer for
                                                params.issuer
                                                :
                                                // in this case, it can be the issuer creating their own offer
                                                // or a group admin is doing so for an unknown issuer --> this means
                                                // the group admin clicks on the "Create new investment opportunity" in their
                                                // main dashboard.
                                                currentUser.id
                                        , // this can the id of the issuer or the group admin
                                        createdByGroupAdmin:
                                        // a group admin is creating an offer on behalf of a known issuer
                                            params.admin && params.issuer
                                                ?
                                                // then, set the admin id as a proof of creating
                                                params.admin
                                                :
                                                // the group admin is creating an offer for an unknown issuer
                                                currentUser.type === DB_CONST.TYPE_ADMIN
                                                    ?
                                                    // then, this field is also set to the group admin id
                                                    currentUser.id
                                                    :
                                                    // this case means that the issuer is creating their own offer
                                                    // so this field is set to null
                                                    null
                                        ,
                                        projectName: saveProgress ? (pitchProjectName.trim().length === 0 ? null : pitchProjectName) : pitchProjectName,
                                        sector: saveProgress ? (pitchSector === "-" ? null : pitchSector) : pitchSector,
                                        course: saveProgress ? (pitchCourse === "-" ? null : pitchCourse) : pitchCourse,
                                        description: saveProgress ? (pitchProjectDescription.trim().length === 0 ? null : pitchProjectDescription) : pitchProjectDescription,
                                        status:
                                            saveProgress
                                                ?
                                                DB_CONST.PROJECT_STATUS_DRAFT
                                                :
                                                // if a group admin creates the offer
                                                // then let it go live
                                                currentUser.type === DB_CONST.TYPE_ADMIN
                                                    ?
                                                    DB_CONST.PROJECT_STATUS_PITCH_PHASE
                                                    :
                                                    // if an issuer creates the offer
                                                    // let the group admin check it first
                                                    DB_CONST.PROJECT_STATUS_BEING_CHECKED
                                        ,
                                        Pitch: {
                                            financialRound:
                                                saveProgress
                                                    ?
                                                    financialRound.trim().length === 0
                                                        ?
                                                        null
                                                        :
                                                        financialRound
                                                    :
                                                    financialRound
                                            ,
                                            investorsCommitted:
                                                pitchInvestorsCommitted.trim().length === 0
                                                    ?
                                                    null
                                                    :
                                                    pitchInvestorsCommitted
                                            ,
                                            supportingDocuments: this.pitchSupportingDocumentsRealtimeDB,
                                            presentationText:
                                                pitchPresentationText.ops.length === 0
                                                    ?
                                                    null
                                                    :
                                                    pitchPresentationText
                                            ,
                                            presentationPlainText:
                                                pitchPresentationText.ops.length === 0
                                                    ?
                                                    null
                                                    :
                                                    pitchPresentationPlainText
                                            ,
                                            presentationDocument: this.pitchPresentationDocumentRealtimeDB,
                                            cover: this.pitchCoverRealtimeDB,
                                            postedDate: postedDate,
                                            expiredDate:
                                                saveProgress
                                                    ?
                                                    !pitchExpiryDate
                                                        ?
                                                        null
                                                        :
                                                        pitchExpiryDate
                                                    :
                                                    pitchExpiryDate
                                            ,
                                            status:
                                                saveProgress
                                                    ?
                                                    DB_CONST.PROJECT_STATUS_DRAFT
                                                    :
                                                    DB_CONST.PITCH_STATUS_ON_GOING
                                            ,
                                            // this field is only available for QIB
                                            qibSpecialNews:
                                                saveProgress
                                                    ?
                                                    qibSpecialNews.trim().length === 0
                                                        ?
                                                        null
                                                        :
                                                        qibSpecialNews
                                                    :
                                                    qibSpecialNews
                                            ,
                                        }
                                    };

                                    projectRef
                                        .child(projectID)
                                        .set(projectObj)
                                        .then(() => {
                                            // save button is clicked
                                            if (saveProgress) {
                                                // don't need to track activity for draft project

                                                // reset all variables and states
                                                this.pitchCoverRealtimeDB = [];
                                                this.pitchPresentationDocumentRealtimeDB = [];
                                                this.pitchSupportingDocumentsRealtimeDB = [];

                                                this.setState({
                                                    requestToLoadData: true,
                                                    projectIDToBeLoadedAfterSavingFirstTime: projectID,
                                                    saveProgress: false,
                                                    progressBeingSaved: false,
                                                    projectEditedLoaded: false,
                                                    acceptedTermsAndConditions: false,

                                                    createProject: {
                                                        ...this.state.createProject,
                                                        uploadFileMode: UPLOAD_NONE,
                                                        uploadFileProgress: 0,
                                                        pitchCover: [],
                                                        pitchCoverVideoURL: '',
                                                        pitchCoverTypeSelected: null,
                                                        pitchSupportingDocuments: [],
                                                        pitchPresentationDocument: []
                                                    }
                                                });

                                                this.navigateToTheSamePageWithActiveStepSaved(
                                                    activeStep,
                                                    projectID
                                                );
                                            }
                                            // publish button is clicked
                                            else {
                                                // track activity for creating a new project
                                                realtimeDBUtils
                                                    .trackActivity({
                                                        userID: currentUser.id,
                                                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                                                        interactedObjectLocation: DB_CONST.PROJECTS_CHILD,
                                                        interactedObjectID: projectID,
                                                        activitySummary: realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_CREATED_PROJECT.replace("%project%", projectObj.projectName),
                                                        action: ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", projectObj.id),
                                                        value: projectObj
                                                    });

                                                const id = this.firebaseDB
                                                    .ref(DB_CONST.ACCEPTED_CREATE_PITCH_TERM_AND_CONDITIONS_CHILD)
                                                    .push()
                                                    .key;

                                                // don't need to check for prior TCs acceptance because this is create new mode
                                                const acceptedTCsObj = {
                                                    id,
                                                    issuerID: currentUser.id,
                                                    projectID: projectID,
                                                    date: utils.getCurrentDate()
                                                };

                                                this.firebaseDB
                                                    .ref(DB_CONST.ACCEPTED_CREATE_PITCH_TERM_AND_CONDITIONS_CHILD)
                                                    .child(id)
                                                    .set(acceptedTCsObj)
                                                    .then(() => {
                                                        this.setState({
                                                            createProject: {
                                                                ...this.state.createProject,
                                                                uploadFileMode: UPLOAD_DONE_MODE,
                                                                uploadFileProgress: 100,
                                                                projectID: projectID
                                                            }
                                                        });
                                                    });
                                            }
                                        })
                                        .catch(error => {
                                            // handle error
                                            return error;
                                        });
                                });
                        });
                });
        }
    };

    /**
     * Upload multiple files
     */
    uploadMultipleFiles = async (mode, projectStorageRef) => {

        const {
            saveProgress
        } = this.state;

        const {
            pitchCover,
            pitchCoverVideoURL,
            pitchCoverTypeSelected,
            pitchSupportingDocuments,
            pitchPresentationDocument
        } = this.state.createProject;

        this.setState({
            createProject: {
                ...this.state.createProject,
                pitchPublishCheck: PITCH_PUBLISH_CHECK_NONE,
                openUploadingProgressDialog: !saveProgress,
                uploadFileMode: mode,
                uploadFileProgress: 0
            }
        });

        let filesArray = null;

        switch (mode) {
            case UPLOAD_PITCH_COVER_MODE:
                // no pitch cover selected
                if (!pitchCoverTypeSelected) {
                    return null;
                }
                // pitch cover as a video URL
                if (pitchCoverTypeSelected === PITCH_COVER_VIDEO_URL_TYPE_SELECTED) {
                    const formattedCover = {
                        url: pitchCoverVideoURL,
                        fileType: DB_CONST.FILE_TYPE_VIDEO,
                        fileExtension: "",
                        storageID: ""
                    };
                    this.pitchCoverRealtimeDB = [...this.pitchCoverRealtimeDB, formattedCover];
                    return;
                }
                filesArray = pitchCover;
                break;
            case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                filesArray = pitchSupportingDocuments;
                break;
            case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                filesArray = pitchPresentationDocument;
                break;
            default:
                return;
        }

        return Promise
            .all(
                filesArray.map(file => this.uploadIndividualFile(mode, projectStorageRef, file))
            )
            .then(() => {
                return true;
            })
            .catch(error => {
                return false;
            });
    };

    /**
     * Upload a single file (document)
     */
    uploadIndividualFile = async (mode, pitchStorageRef, document) => {

        const {
            pitchSupportingDocuments
        } = this.state.createProject;

        let docRef = null;

        const storageID = utils.getCurrentDate();
        const storageFileName = utils.constructStorageFileName(document, storageID);

        switch (mode) {
            case UPLOAD_PITCH_COVER_MODE:
                docRef = pitchStorageRef
                    .child(DB_CONST.PROJECT_COVER_CHILD)
                    .child(`${storageID}.${document.file.extension}`);
                break;
            case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                docRef = pitchStorageRef
                    .child(DB_CONST.PROJECT_SUPPORTING_DOCUMENTS_CHILD)
                    .child(storageFileName);
                break;
            case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                docRef = pitchStorageRef
                    .child(DB_CONST.PROJECT_PRESENTATION_DOCUMENT_CHILD)
                    .child(storageFileName);
                break;
            default:
                return;
        }

        return new Promise((resolve, reject) => {
            const uploadTask = docRef.put(document.file);
            uploadTask.on('state_changed', snapshot => {
                // do nothing here
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

                if (mode === UPLOAD_PITCH_COVER_MODE || mode === UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE) {
                    this.setState({
                        createProject: {
                            ...this.state.createProject,
                            uploadFileProgress: progress
                        }
                    });
                }

            }, error => {
                // handle error
                return reject(error);
            }, () => {

                uploadTask.snapshot.ref.getDownloadURL().then(fileDownloadURL => {

                    let percentDone = 0;

                    switch (mode) {
                        case UPLOAD_PITCH_COVER_MODE:
                            // capture the downloadable URL of the pitch cover and store in this variable for uploading to Realtime DB
                            const formattedCover = {
                                url: fileDownloadURL,
                                fileType: document.file.type === "video/mp4" ? DB_CONST.FILE_TYPE_VIDEO : DB_CONST.FILE_TYPE_IMAGE,
                                fileExtension: document.file.extension,
                                storageID: storageID
                            };
                            this.pitchCoverRealtimeDB = [...this.pitchCoverRealtimeDB, formattedCover];
                            return resolve();
                        case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                            percentDone = 100 / (pitchSupportingDocuments.length);
                            this.setState(prevState => ({
                                createProject: {
                                    ...prevState.createProject,
                                    uploadFileProgress: prevState.createProject.uploadFileProgress + percentDone.toFixed(0)
                                }
                            }));
                            const formattedSupportingDocument = {
                                fileName: storageFileName.split(DB_CONST.STORAGE_FILE_NAME_ID_SPLIT)[1],
                                readableSize: document.file.sizeReadable,
                                downloadURL: fileDownloadURL,
                                storageID: storageID
                            };
                            // capture the file uploaded to storage and store in this variable for uploading to Realtime DB
                            this.pitchSupportingDocumentsRealtimeDB = [...this.pitchSupportingDocumentsRealtimeDB, formattedSupportingDocument];
                            return resolve();
                        case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                            const formattedPresentationDocument = {
                                fileName: storageFileName.split(DB_CONST.STORAGE_FILE_NAME_ID_SPLIT)[1],
                                readableSize: document.file.sizeReadable,
                                downloadURL: fileDownloadURL,
                                storageID: storageID
                            };
                            // capture the file uploaded to storage and store in this variable for uploading to Realtime DB
                            this.pitchPresentationDocumentRealtimeDB = [...this.pitchPresentationDocumentRealtimeDB, formattedPresentationDocument];
                            return resolve();
                        default:
                            return reject("Not existing mode");
                    }
                });
            });
        });
    };

    /**
     * This function handles when a document is deleted
     *
     * @param mode
     * @param index
     */
    handleDeleteDocument = (mode, index) => {

        switch (mode) {
            case PITCH_SUPPORTING_DOCUMENTS_FILES_CHANGED:
                let supportingDocuments = this.state.createProject.pitchSupportingDocuments;
                supportingDocuments.splice(index, 1);
                this.setState({
                    createProject: {
                        ...this.state.createProject,
                        pitchSupportingDocuments: supportingDocuments
                    }
                });
                break;
            case PITCH_PRESENTATION_FILES_CHANGED:
                this.setState({
                    createProject: {
                        ...this.state.createProject,
                        pitchPresentationDocument: []
                    }
                });
                break;
            case PITCH_COVER_FILES_CHANGED:
                this.setState({
                    createProject: {
                        ...this.state.createProject,
                        pitchCover: []
                    }
                });
                break;
            default:
                break;
        }
    };

    /**
     * This function is used to set the reference of the Publish button so that the error message popover can be displayed properly
     *
     * @param target
     */
    attachNextStepButtonRef = target => {
        this.setState({
            createProject: {
                ...this.state.createProject,
                pitchNextStepButtonTarget: target
            }
        });
    };

    /**
     * This function is used to close the popover error message displayed when the user hits the Publish click without filling all the required fields
     */
    handlePopoverErrorMessageClose = () => {
        this.setState({
            createProject: {
                ...this.state.createProject,
                pitchPublishErrorMessageShowed: false
            }
        });
    };

    /**
     * Handle when a document is deleted ==> displaying a list of support documents ==> able to delete them
     *
     * @param index
     */
    handleDownloadDocumentDeleteClick = index => {
        const {
            projectEdited
        } = this.state;

        let updatedProjectEdited = JSON.parse(JSON.stringify(projectEdited));
        updatedProjectEdited.Pitch.supportingDocuments[index].removed = true;

        this.setState({
            projectEdited: updatedProjectEdited
        });
    };

    /**
     * This function is used to close file upload error snackbar
     */
    handleCloseErrorSnackbar = (event, reason) => {

        if (reason === 'clickaway') {
            this.setState({
                createProject: {
                    ...this.state.createProject,
                    errorSnackbarOpen: false
                }
            });
            return;
        }

        this.setState({
            createProject: {
                ...this.state.createProject,
                errorSnackbarOpen: false
            }
        });
    };

    /**
     * Handle when date changed
     */
    handleDateChanged = date => {

        if (date && date === "Invalid Date") {
            this.setState({
                createProject: {
                    ...this.state.createProject,
                    pitchExpiryDate: NaN
                }
            });
            return;
        }

        this.setState({
            createProject: {
                ...this.state.createProject,
                pitchExpiryDate:
                    !date
                        ?
                        null
                        :
                        date.getTime()
            }
        });
    };

    /**
     * Handle when accept terms and conditions checkbox changed
     */
    handleCheckboxChanged = event => {

        const name = event.target.name;

        this.setState({
            createProject: {
                ...this.state.createProject,
                [name]: event.target.checked
            }
        });
    };

    /**
     * Handle when the save progress button is clicked
     */
    handleSaveProgressClick = () => {

        const {
            groupUserName,

            setFeedbackSnackbarContent
        } = this.props;

        const {
            activeStep,

            pitchSector,
            pitchCourse,
            pitchProjectName,
            pitchProjectDescription,
            pitchExpiryDate,

            financialRound,

            qibSpecialNews
        } = this.state.createProject;

        if (activeStep === STEP_PITCH_GENERAL_INFORMATION) {
            // check if at least one field is filled
            if (pitchSector === "-"
                && pitchCourse === "-"
                && pitchProjectName.trim().length === 0
                && pitchProjectDescription.trim().length === 0
                && pitchExpiryDate === null
                && financialRound.trim().length === 0
                && (groupUserName === "qib" && qibSpecialNews.trim().length === 0)
            ) {
                setFeedbackSnackbarContent(
                    'You have nothing to save.',
                    "error",
                    "bottom"
                );
                return;
            }

            // check if the entered date is in a valid format or the entered date is less than the minimum date
            if (isNaN(pitchExpiryDate)
                ||
                (pitchExpiryDate && (pitchExpiryDate < utils.getDateWithDaysFurtherThanToday(0)))
            ) {
                setFeedbackSnackbarContent(
                    'Please enter a valid date.',
                    "error",
                    "bottom"
                );
                return;
            }

            // check if entered funds are valid
        }

        this.setState({
            saveProgress: true,
            progressBeingSaved: false
        });
    };

    /**
     * Handle when the user clicks on the Delete draft button
     */
    handleDeleteDraftClick = () => {

        const {
            projectEdited
        } = this.state;

        this.setState({ 
            draftBeingDeleted: true
        });

        // delete pitch cover
        this.deleteMultiplesOnStorage(UPLOAD_PITCH_COVER_MODE)
            .then(() => {
                // delete pitch deck
                this.deleteMultiplesOnStorage(UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE)
                    .then(() => {
                        // delete pitch supporting documents
                        this.deleteMultiplesOnStorage(UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE)
                            .then(() => {
                                this.firebaseDB
                                    .ref(DB_CONST.PROJECTS_CHILD)
                                    .child(projectEdited.id)
                                    .remove()
                                    .then(() => {
                                        // reset all variables and states to refresh the page
                                        this.pitchCoverRealtimeDB = [];
                                        this.pitchPresentationDocumentRealtimeDB = [];
                                        this.pitchSupportingDocumentsRealtimeDB = [];
                                        this.selectedProjectVisibilitySetting = -1;

                                        this.setState({
                                            ...initState
                                        });

                                        // remove listener
                                        if (this.projectEditedSaveModeRefListener) {
                                            this.projectEditedSaveModeRefListener.off('child_changed');
                                        }

                                        this.navigateToTheSamePageWithActiveStepSaved(0, null);
                                        // reload the page
                                        window.location.reload();
                                    });
                            });
                    });
            });
    };

    /**
     * Handle delete multiple files on firebase storage
     */
    deleteMultiplesOnStorage = async (mode) => {
        const {
            currentUser
        } = this.props;

        const {
            projectEdited
        } = this.state;

        let storageRef = this.firebaseStorage
            .ref(DB_CONST.USERS_CHILD)
            .child(currentUser.id)
            .child(DB_CONST.PROJECTS_CHILD)
            .child(projectEdited.id);

        switch (mode) {
            case UPLOAD_PITCH_COVER_MODE:
                if (!projectEdited.Pitch.cover) {
                    return;
                }
                storageRef = storageRef
                    .child(DB_CONST.PROJECT_COVER_CHILD);
                return Promise
                    .all(
                        projectEdited.Pitch.cover.map(coverItem => (
                            this.deleteASingleFileOnStorage(mode, storageRef, coverItem)
                        ))
                    )
                    .then(() => {
                        return true;
                    })
                    .catch(error => {
                        return (error);
                    });
            case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                if (!projectEdited.Pitch.presentationDocument) {
                    return;
                }
                storageRef = storageRef
                    .child(DB_CONST.PROJECT_PRESENTATION_DOCUMENT_CHILD);
                return Promise
                    .all(
                        projectEdited.Pitch.presentationDocument.map(coverItem => (
                            this.deleteASingleFileOnStorage(mode, storageRef, coverItem)
                        ))
                    )
                    .then(() => {
                        return true;
                    })
                    .catch(error => {
                        return (error);
                    });
            case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                if (!projectEdited.Pitch.supportingDocuments) {
                    return;
                }
                storageRef = storageRef
                    .child(DB_CONST.PROJECT_SUPPORTING_DOCUMENTS_CHILD);
                return Promise
                    .all(
                        projectEdited.Pitch.supportingDocuments.map(coverItem => (
                            this.deleteASingleFileOnStorage(mode, storageRef, coverItem)
                        ))
                    )
                    .then(() => {
                        return true;
                    })
                    .catch(error => {
                        return (error);
                    });
            default:
                return;
        }
    };

    /**
     * Handle delete a single file on firebase storage
     */
    deleteASingleFileOnStorage = async (mode, storageRef, file) => {
        switch (mode) {
            case UPLOAD_PITCH_COVER_MODE:
                // a video URL from other servers instead of from Firebase storage
                if (file.storageID === "") {
                    return;
                }
                return new Promise((resolve, reject) => {
                    storageRef = storageRef
                        .child(`${file.storageID}.${file.fileExtension}`)
                        .delete()
                        .then(() => {
                            return resolve();
                        })
                        .catch(error => {
                            return reject(error);
                        });
                });
            case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                return new Promise((resolve, reject) => {
                    storageRef = storageRef
                        .child(`${file.storageID}${DB_CONST.STORAGE_FILE_NAME_ID_SPLIT}${file.fileName}`)
                        .delete()
                        .then(() => {
                            return resolve();
                        })
                        .catch(error => {
                            return reject(error);
                        });
                });
            case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                return new Promise((resolve, reject) => {
                    storageRef = storageRef
                        .child(`${file.storageID}${DB_CONST.STORAGE_FILE_NAME_ID_SPLIT}${file.fileName}`)
                        .delete()
                        .then(() => {
                            return resolve();
                        })
                        .catch(error => {
                            return reject(error);
                        });
                });
            default:
                return;
        }
    };

    render() {

        const params = queryString.parse(this.props.location.search);

        const {
            isMobile,

            groupUserName,
            groupProperties,
            groupPropertiesLoaded,
            shouldLoadOtherData,

            authStatus,
            authenticating,
            currentUser,
            currentUserLoaded,

            clubAttributes,
            clubAttributesLoaded
        } = this.props;

        const {
            projectEdited,
            projectEditedLoaded,

            saveProgress,
            progressBeingSaved,

            draftBeingDeleted
        } = this.state;

        if (!groupPropertiesLoaded) {
            return (
                <FlexView marginTop={30} hAlignContent="center">
                    <HashLoader color={colors.primaryColor}/>
                </FlexView>
            );
        }

        if (!shouldLoadOtherData) {
            return <PageNotFoundWhole/>;
        }

        // user not loaded yet
        if (authenticating || !currentUserLoaded || !clubAttributesLoaded) {
            return (
                <FlexView width="100%" hAlignContent="center" style={{padding: 30}}>
                    <HashLoader color={colors.primaryColor}/>
                </FlexView>
            );
        }

        if (authStatus !== AUTH_SUCCESS) {
            return <PageNotFoundWhole/>;
        }

        // when creating a new offer,
        // if no user found or found user is an investor or a super admin
        // --> display Page Not Found
        if (!currentUser
            || (currentUser && currentUser.type === DB_CONST.TYPE_INVESTOR)
            || (!params.edit && currentUser && (currentUser.type === DB_CONST.TYPE_INVESTOR
                    || (currentUser.type === DB_CONST.TYPE_ADMIN && currentUser.superAdmin))
            )
        ) {
            return (
                <PageNotFoundWhole/>
            );
        }

        // in edit mode
        if (params.edit) {
            // offer not loaded yet
            if (!projectEditedLoaded || !clubAttributesLoaded) {
                return (
                    <FlexView width="100%" hAlignContent="center" style={{padding: 30}}>
                        <HashLoader color={colors.primaryColor}/>
                    </FlexView>
                );
            }

            // no offer found or found offer does not belong to the current issuer/group admin
            if (
                !projectEdited
                // current user is an issuer that does not own the project
                || (projectEdited
                    && currentUser.type === DB_CONST.TYPE_ISSUER
                    && currentUser.id !== projectEdited.issuerID
                )
                // current user is a group admin that does not own the project
                || (projectEdited
                    && currentUser.type === DB_CONST.TYPE_ADMIN
                    && !currentUser.superAdmin
                    && currentUser.anid !== projectEdited.anid
                )
            ) {
                return (
                    <PageNotFoundWhole/>
                );
            }

            // check editable offer
            if (!utils.shouldAProjectBeEdited(currentUser, projectEdited)) {
                return (
                    <FlexView column width="100%">
                        <Typography variant="h4" color="error" align="center" style={{marginTop: 50}}>This investment opportunity can't be edited anymore.</Typography>
                    </FlexView>
                );
            }
        }

        return (
            <Container fluid style={{padding: 0}}>
                <CreateProject
                    clubAttributes={clubAttributes}
                    groupUserName={groupUserName}
                    groupProperties={groupProperties}
                    params={params}
                    currentUser={currentUser}
                    projectEdited={projectEdited}
                    projectEditedLoaded={projectEditedLoaded}
                    saveProgress={saveProgress}
                    progressBeingSaved={progressBeingSaved}
                    draftBeingDeleted={draftBeingDeleted}
                    isMobile={isMobile}
                    createProjectState={this.state.createProject}
                    onSelectPitchCoverTypeClick={this.handleSelectPitchCoverTypeClick}
                    onFilesChanged={this.handleFilesChanged}
                    onFilesError={this.handleFileError}
                    onDeleteDocument={this.handleDeleteDocument}
                    onInputChanged={this.handleCreatePitchInputChanged}
                    onPitchEditorChanged={this.handlePitchEditorChanged}
                    attachNextStepButtonRef={this.attachNextStepButtonRef}
                    onPopoverErrorMessageClose={this.handlePopoverErrorMessageClose}
                    onNextStepClick={this.handleNextStepClick}
                    onBackClick={this.handleBackClick}
                    onDownloadDocumentDeleteClick={this.handleDownloadDocumentDeleteClick}
                    onDateChanged={this.handleDateChanged}
                    onCheckboxChanged={this.handleCheckboxChanged}
                    onSaveProgressClick={this.handleSaveProgressClick}
                    onDeleteDraftClick={this.handleDeleteDraftClick}
                />

                <UploadingDialog
                    groupUserName={groupUserName}
                    currentUser={currentUser}
                    open={this.state.createProject.openUploadingProgressDialog}
                    uploadFileMode={this.state.createProject.uploadFileMode}
                    uploadFileProgress={this.state.createProject.uploadFileProgress}
                    params={params}
                    projectEdited={projectEdited}
                    projectID={this.state.createProject.projectID}
                />
            </Container>
        );
    }
}

/**
 * This component contains the main UI elements for the whole page
 */
class CreateProject extends Component {

    onNextStepClick = () => {
        this.props.onNextStepClick();
    };

    onBackClick = () => {
        this.props.onBackClick();
    };

    onSelectPitchCoverTypeClick = type => {
        this.props.onSelectPitchCoverTypeClick(type);
    };

    onFilesChanged = mode => files => {
        this.props.onFilesChanged(mode, files);
    };

    onFilesError = (error, files) => {
        this.props.onFilesError(error, files);
    };

    onInputChanged = event => {
        this.props.onInputChanged(event);
    };

    onPitchEditorChanged = (content, delta, source, editor) => {
        this.props.onPitchEditorChanged(content, delta, source, editor);
    };

    onDeleteDocument = mode => index => {
        this.props.onDeleteDocument(mode, index);
    };

    attachNextStepButtonRef = (target) => {
        this.props.attachNextStepButtonRef(target);
    };

    onPopoverErrorMessageClose = () => {
        this.props.onPopoverErrorMessageClose();
    };

    onDownloadDocumentDeleteClick = index => {
        this.props.onDownloadDocumentDeleteClick(index);
    };

    onDateChanged = date => {
        this.props.onDateChanged(date);
    };

    onCheckboxChanged = event => {
        this.props.onCheckboxChanged(event);
    };

    onSaveProgressClick = () => {
        this.props.onSaveProgressClick();
    };

    onDeleteDraftClick = () => {
        this.props.onDeleteDraftClick();
    };

    /**
     * Render pop-over error message (if any) when the user clicks to move to the next step
     */
    renderPitchPublishErrorMessage = () => {

        const {
            groupUserName
        } = this.props;

        let msg = "";

        switch (this.props.createProjectState.pitchPublishCheck) {
            case PITCH_PUBLISH_CHECK_NONE:
                return null;
            case PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION:
                msg = "Please fill in all the General information.";
                break;
            case PITCH_PUBLISH_FALSE_INVALID_DATE:
                msg = "Please enter a valid date.";
                break;
            case PITCH_PUBLISH_FALSE_INVALID_FUND:
                msg = "Please check your entered funds again.";
                break;
            case PITCH_PUBLISH_FALSE_MISSING_PITCH_COVER:
                msg = "Please upload an image or a video for your pitch cover.";
                break;
            case PITCH_PUBLISH_FALSE_MISSING_PITCH_PRESENTATION:
                // for QIB, pitch deck is a one-pager
                if (groupUserName === "qib") {
                    msg = "Please upload your one-pager.";
                }
                // for other groups, pitch deck is still pitch deck
                else {
                    msg = "Please upload a file or use our provided text editor to make your pitch presentation.";
                }
                break;
            default:
                return null;
        }

        return (
            <Typography align="center" variant="body2" color="error">{msg}</Typography>
        );
    };

    render() {
        const {
            clubAttributes,
            groupUserName,
            groupProperties,
            currentUser,
            params,
            projectEdited,

            saveProgress,
            progressBeingSaved,
            draftBeingDeleted,

            isMobile,

            createProjectState
        } = this.props;

        return (
            <Container fluid style={{padding: 0}}>
                {/** Stepper */}
                <Row noGutters style={{marginTop: 40,padding: 20}}>
                    <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 8, offset: 2}}>
                        <FlexView hAlignContent="center" vAlignContent="center">
                            <Stepper activeStep={createProjectState.activeStep} alternativeLabel style={{width: isMobile ? "auto" : "100%", padding: 0}}>
                                <Step key={0}>
                                    <StepLabel>General information</StepLabel>
                                </Step>
                                <Step key={1}>
                                    <StepLabel>Pitch cover</StepLabel>
                                </Step>
                                <Step key={2}>
                                    {
                                        groupUserName === "qib"
                                            ?
                                            <StepLabel>One-pager</StepLabel>
                                            :
                                            <StepLabel>Pitch deck</StepLabel>
                                    }
                                </Step>
                                <Step key={3}>
                                    {
                                        groupUserName === "qib"
                                            ?
                                            <StepLabel>Pitch deck</StepLabel>
                                            :
                                            <StepLabel>Supporting documents</StepLabel>
                                    }
                                </Step>
                                {
                                    params.edit && projectEdited
                                        ?
                                        (
                                            projectEdited.status !== DB_CONST.PROJECT_STATUS_DRAFT
                                                ?
                                                null
                                                :
                                                <Step
                                                    key={4}
                                                >
                                                    <StepLabel>Terms and conditions</StepLabel>
                                                </Step>
                                        )
                                        :
                                        <Step key={4}>
                                            <StepLabel>Terms and conditions</StepLabel>
                                        </Step>
                                }
                            </Stepper>
                        </FlexView>
                    </Col>
                </Row>

                {/** Main content (changed based on activeStep) */}
                <Row noGutters style={{padding: 18}}>
                    {
                        createProjectState.activeStep === STEP_PITCH_GENERAL_INFORMATION
                            ?
                            /**
                             * General information column
                             */
                            <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 6, offset: 3}} style={{marginTop: 30}}>
                                {
                                    /**
                                     * Step 1: General information
                                     */
                                }
                                <FlexView column>
                                    <FlexView>
                                        <Typography color="primary" variant="h6" align="left">Step 1: General information</Typography>
                                    </FlexView>

                                    {
                                        currentUser.type === DB_CONST.TYPE_ADMIN
                                            // && (groupProperties && currentUser.anid === groupProperties.anid)
                                            ?
                                            <FlexView marginTop={30}>
                                                {/*{*/}
                                                {/*    params.edit && projectEdited*/}
                                                {/*        ?*/}
                                                {/*        projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT*/}
                                                {/*        || projectEdited.status === DB_CONST.PROJECT_STATUS_BEING_CHECKED*/}
                                                {/*            ?*/}
                                                {/*            <SelectPitchVisibility/>*/}
                                                {/*            :*/}
                                                {/*            projectEdited.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED*/}
                                                {/*                ?*/}
                                                {/*                <SelectPledgeVisibility/>*/}
                                                {/*                :*/}
                                                {/*                null*/}
                                                {/*        :*/}
                                                {/*        <SelectPitchVisibility/>*/}
                                                {/*}*/}
                                                <SelectPitchVisibility/>
                                            </FlexView>
                                            :
                                            null
                                    }

                                    {
                                        /**
                                         * Choosing sector
                                         */
                                    }
                                    <FlexView marginTop={30}>
                                        <FormControl fullWidth required
                                            error={
                                                createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                                                && createProjectState.pitchSector === "-"
                                            }
                                        >
                                            <FormLabel>Choose sector</FormLabel>
                                            <Select name="pitchSector" value={createProjectState.pitchSector} margin="dense" input={<OutlinedInput/>} onChange={this.onInputChanged}>
                                                <MenuItem key={-1} value="-">
                                                    -
                                                </MenuItem>
                                                {
                                                    !clubAttributes
                                                        ?
                                                        null
                                                        :
                                                        clubAttributes.Sectors.map((sector, index) => (
                                                            <MenuItem key={index} value={sector}>{sector}</MenuItem>
                                                        ))
                                                }
                                            </Select>
                                        </FormControl>
                                    </FlexView>

                                    <FlexView marginTop={30}>
                                        <FormControl fullWidth required
                                            error={
                                                createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                                                && createProjectState.pitchCourse === "-"
                                            }
                                        >
                                            <FormLabel>Choose course</FormLabel>
                                            <Select name="pitchCourse" value={createProjectState.pitchCourse} margin="dense" input={<OutlinedInput/>} onChange={this.onInputChanged}>
                                                <MenuItem key={-1} value="-">
                                                    -
                                                </MenuItem>
                                                {
                                                    !clubAttributes
                                                        ?
                                                        null
                                                        :
                                                        clubAttributes.Courses.map((course, index) => (
                                                            <MenuItem key={index} value={course}>{course}</MenuItem>
                                                        ))
                                                }
                                            </Select>
                                        </FormControl>
                                    </FlexView>

                                    {
                                        /**
                                         * Select expiry date
                                         *
                                         * For QIB: Hide this section as the group admins will set
                                         * the default expiry date for all the projects.
                                         */
                                    }
                                    {
                                        groupUserName === "qib"
                                            ?
                                            <FlexView marginTop={30}>
                                                <Row noGutters style={{width: "100%"}}>
                                                    <Col xs={12} sm={12} md={12} lg={12}>
                                                        <Typography align="left" variant="body2" color="textSecondary">
                                                            Pitch expiry
                                                            date: {utils.dateInReadableFormat(groupProperties.settings.defaultPitchExpiryDate)} (set
                                                            by QIB admins)
                                                        </Typography>
                                                    </Col>
                                                </Row>
                                            </FlexView>
                                            :
                                            <FlexView marginTop={30}>
                                                <Row noGutters style={{width: "100%"}}>
                                                    <Col xs={12} sm={12} md={8} lg={6}>
                                                        {
                                                            !params.edit || !projectEdited
                                                                ?
                                                                <KeyboardDatePicker
                                                                    autoOk
                                                                    fullWidth
                                                                    variant="dialog"
                                                                    inputVariant="outlined"
                                                                    label="Choose expiry date for this pitch"
                                                                    format="dd/MM/yyyy"
                                                                    minDate={utils.getDateWithDaysFurtherThanToday(1)}
                                                                    value={createProjectState.pitchExpiryDate}
                                                                    InputAdornmentProps={{position: "start"}}
                                                                    error={
                                                                        (createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                                                                            && createProjectState.pitchExpiryDate === null)
                                                                        ||
                                                                        (createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_INVALID_DATE
                                                                            && (isNaN(createProjectState.pitchExpiryDate)
                                                                                || createProjectState.pitchExpiryDate < utils.getDateWithDaysFurtherThanToday(0))
                                                                        )
                                                                    }
                                                                    onChange={date => this.onDateChanged(date)}
                                                                />
                                                                :
                                                                (
                                                                    utils.isDraftProject(projectEdited)
                                                                        ?
                                                                        <KeyboardDatePicker
                                                                            autoOk
                                                                            fullWidth
                                                                            variant="dialog"
                                                                            inputVariant="outlined"
                                                                            label="Choose expiry date for this pitch"
                                                                            format="dd/MM/yyyy"
                                                                            minDate={utils.getDateWithDaysFurtherThanToday(1)}
                                                                            value={createProjectState.pitchExpiryDate}
                                                                            InputAdornmentProps={{position: "start"}}
                                                                            error={
                                                                                (createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                                                                                    && createProjectState.pitchExpiryDate === null)
                                                                                || (createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_INVALID_DATE
                                                                                    && (isNaN(createProjectState.pitchExpiryDate)
                                                                                        || createProjectState.pitchExpiryDate < utils.getDateWithDaysFurtherThanToday(0))
                                                                                )
                                                                            }
                                                                            onChange={date => this.onDateChanged(date)}
                                                                        />
                                                                        :
                                                                        <FlexView column>
                                                                            <Typography variant="body1" align="left" color="primary">
                                                                                {
                                                                                    currentUser.type === DB_CONST.TYPE_ADMIN
                                                                                        ?
                                                                                        null
                                                                                        :
                                                                                        projectEdited.PrimaryOffer
                                                                                            ?
                                                                                            `Pledge phase will be active in ${utils.dateDiff(projectEdited.PrimaryOffer.expiredDate)} days. Please contact us if you need to change the expiry date.`
                                                                                            :
                                                                                            projectEdited.Pitch
                                                                                                ?
                                                                                                `Pitch phase will be active in ${utils.dateDiff(projectEdited.Pitch.expiredDate)} days. Please contact us if you need to change the expiry date.`
                                                                                                :
                                                                                                null
                                                                                }
                                                                            </Typography>
                                                                            {
                                                                                currentUser.type !== DB_CONST.TYPE_ADMIN
                                                                                    ?
                                                                                    null
                                                                                    :
                                                                                    (
                                                                                        projectEdited.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED
                                                                                            ?
                                                                                            <Typography variant="body1" align="left" color="primary">
                                                                                                Pitch phase has ended.
                                                                                                Waiting
                                                                                                for the issuer to create
                                                                                                pledge.
                                                                                            </Typography>
                                                                                            :
                                                                                            <KeyboardDatePicker
                                                                                                autoOk
                                                                                                fullWidth
                                                                                                variant="dialog"
                                                                                                inputVariant="outlined"
                                                                                                label={
                                                                                                    projectEdited.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE
                                                                                                        ?
                                                                                                        "Choose expiry date for pledge phase"
                                                                                                        :
                                                                                                        "Choose expiry date for pitch phase"
                                                                                                }
                                                                                                format="dd/MM/yyyy"
                                                                                                minDate={utils.getDateWithDaysFurtherThanToday(1)}
                                                                                                value={createProjectState.pitchExpiryDate}
                                                                                                InputAdornmentProps={{position: "start"}}
                                                                                                error={
                                                                                                    (createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                                                                                                        && createProjectState.pitchExpiryDate === null)
                                                                                                    || (createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_INVALID_DATE
                                                                                                        && (isNaN(createProjectState.pitchExpiryDate)
                                                                                                            || createProjectState.pitchExpiryDate < utils.getDateWithDaysFurtherThanToday(0))
                                                                                                    )
                                                                                                }
                                                                                                onChange={date => this.onDateChanged(date)}
                                                                                            />
                                                                                    )
                                                                            }
                                                                        </FlexView>
                                                                )
                                                        }
                                                    </Col>
                                                </Row>
                                            </FlexView>
                                    }

                                    {
                                        /**
                                         * Student project name (or project name)
                                         */
                                    }
                                    <FlexView marginTop={20}>
                                        <TextField label="Student project name" name="pitchProjectName" value={createProjectState.pitchProjectName} fullWidth margin="normal" variant="outlined" required
                                            error={
                                                createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                                                && createProjectState.pitchProjectName.trim().length === 0
                                            }
                                            onChange={this.onInputChanged}
                                        />
                                    </FlexView>

                                    {
                                        /**
                                         * Company description (or project description)
                                         */
                                    }
                                    <FlexView marginTop={10}>
                                        <FormControl required fullWidth>
                                            <TextField label="Please provide a brief summary of what your project is about" name="pitchProjectDescription" value={createProjectState.pitchProjectDescription} margin="normal" variant="outlined"
                                                error={
                                                    createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                                                    && createProjectState.pitchProjectDescription.trim().length === 0
                                                }
                                                multiline
                                                rowsMax={5}
                                                rows={5}
                                                onChange={this.onInputChanged}
                                            />
                                            <FormHelperText>This will be circulated to studentss in and outside course.</FormHelperText>
                                        </FormControl>
                                    </FlexView>

                                    {
                                        /**
                                         * If raised money before, ask how much has been raised?
                                         */
                                    }

                                    {
                                        /**
                                         * Financial round
                                         */
                                    }
                                    <FlexView marginTop={45}>
                                        <FormControl required fullWidth
                                            error={
                                                createProjectState.pitchPublishCheck === PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION
                                                && createProjectState.financialRound.trim().length === 0
                                            }>
                                            <FormLabel style={{marginBottom: 16}}>What financial round are you looking for?</FormLabel>
                                            <RadioGroup name="financialRound" value={createProjectState.financialRound} onChange={this.onInputChanged}>
                                                {
                                                    DB_CONST.FINANCIAL_ROUNDS.map(round =>
                                                        <FormControlLabel key={round} value={round} control={<Radio/>} label={round}/>
                                                    )
                                                }
                                            </RadioGroup>
                                        </FormControl>
                                    </FlexView>

                                    {
                                        /**
                                         * Special news - QIB only
                                         */
                                    }
                                    {
                                        groupUserName === "qib"
                                        || (
                                            !groupUserName
                                            && currentUser.type === DB_CONST.TYPE_ADMIN
                                            && currentUser.superAdmin
                                        )
                                            ?
                                            <FlexView marginTop={45}>
                                                <FormControl required fullWidth>
                                                    <FormLabel>What special news should Briony talk about when she mentions your investment raise at the QIB?</FormLabel>
                                                    <TextField
                                                        name="qibSpecialNews"
                                                        value={createProjectState.qibSpecialNews}
                                                        placeholder="This would be a good place to mention if you have already made progress in your funding round."
                                                        fullWidth
                                                        variant="outlined"
                                                        onChange={this.onInputChanged}
                                                        multiline
                                                        rowsMax={3}
                                                        error={
                                                            groupUserName === "qib"
                                                            && createProjectState.qibSpecialNews === PITCH_PUBLISH_FALSE_INVALID_FUND
                                                            && createProjectState.qibSpecialNews.trim().length === 0
                                                        }
                                                    />
                                                    <FormHelperText>QIB won't be able to mention everyone. So, you can make it REALLY exciting.
                                                    </FormHelperText>
                                                </FormControl>
                                            </FlexView>
                                            :
                                            null
                                    }
                                </FlexView>

                                <Divider style={{marginTop: 60}}/>
                            </Col>
                            :
                            (
                                createProjectState.activeStep === STEP_PITCH_COVER
                                    ?
                                    // Pitch cover
                                    <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 6, offset: 3}} style={{marginTop: 30}}>
                                        <FlexView column width="100%">
                                            <FlexView vAlignContent="center">
                                                <Typography color="primary" variant="h6"align="left" style={{marginRight: 15}}>Step 2: Upload pitch cover</Typography>
                                                <InfoOverlay message="Pitch cover is an image or video that will appear on your pitch summary tile." placement="right"/>
                                            </FlexView>

                                            {
                                                !params.edit || !projectEdited
                                                    ?
                                                    null
                                                    :
                                                    !projectEdited.Pitch.hasOwnProperty('cover')
                                                        ?
                                                        null
                                                        :
                                                        <FlexView column width="100%" marginTop={25} marginBottom={25}>
                                                            <Typography variant="body1" color="textSecondary" align="left" style={{marginBottom: 20}}>Your current pitch cover</Typography>

                                                            {
                                                                projectEdited.Pitch.cover.map((coverItem, index) => (
                                                                    coverItem.hasOwnProperty('removed')
                                                                        ?
                                                                        null
                                                                        :
                                                                        coverItem.fileType === DB_CONST.FILE_TYPE_VIDEO
                                                                            ?
                                                                            <ReactPlayer key={index} playsInline url={coverItem.url} width="100%" height={coverItem.storageID === "" ? 280 : "auto"} playing={false} controls={true}/>
                                                                            :
                                                                            <Image key={index} fluid src={coverItem.url}/>
                                                                ))
                                                            }

                                                            <Divider style={{marginTop: 45}}/>
                                                        </FlexView>
                                            }

                                            <Typography variant="subtitle1" color="textSecondary" align="left" style={{marginTop: 18}}>
                                                {
                                                    !params.edit || !projectEdited
                                                        ?
                                                        "You need to upload an image or a video for the cover of your pitch."
                                                        :
                                                        projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT && !projectEdited.Pitch.hasOwnProperty('cover')
                                                            ?
                                                            "You need to upload an image or a video for the cover of your pitch."
                                                            :
                                                            "Upload an image or a video to change your pitch cover. We will use the new cover for your pitch instead of the old one."
                                                }
                                            </Typography>

                                            {
                                                groupUserName !== "qib"
                                                    ?
                                                    null
                                                    :
                                                    <Typography variant="subtitle1" color="textSecondary" align="left" style={{marginTop: 8}}>Please upload your company logo here.</Typography>
                                            }

                                            <FlexView column marginTop={32}>
                                                <FlexView>
                                                    <Button
                                                        variant={
                                                            createProjectState.pitchCoverTypeSelected
                                                            && createProjectState.pitchCoverTypeSelected === PITCH_COVER_FILE_TYPE_SELECTED
                                                                ?
                                                                "contained"
                                                                :
                                                                "outlined"
                                                        }
                                                        className={css(sharedStyles.no_text_transform)}
                                                        color="primary"
                                                        onClick={() => this.onSelectPitchCoverTypeClick(PITCH_COVER_FILE_TYPE_SELECTED)}
                                                    >
                                                        {
                                                            clubAttributes && clubAttributes.allowVideoUpload
                                                                ?
                                                                createProjectState.pitchCoverTypeSelected
                                                                && createProjectState.pitchCoverTypeSelected === PITCH_COVER_FILE_TYPE_SELECTED
                                                                    ?
                                                                    "Cancel upload an image or a video"
                                                                    :
                                                                    "Upload an image or a video"
                                                                :
                                                                createProjectState.pitchCoverTypeSelected
                                                                && createProjectState.pitchCoverTypeSelected === PITCH_COVER_FILE_TYPE_SELECTED
                                                                    ?
                                                                    "Cancel upload an image"
                                                                    :
                                                                    "Upload an image"
                                                        }
                                                    </Button>

                                                    <FlexView marginLeft={20} vAlignContent="center">
                                                        <Button
                                                            variant={
                                                                createProjectState.pitchCoverTypeSelected
                                                                && createProjectState.pitchCoverTypeSelected === PITCH_COVER_VIDEO_URL_TYPE_SELECTED
                                                                    ?
                                                                    "contained"
                                                                    :
                                                                    "outlined"
                                                            }
                                                            className={css(sharedStyles.no_text_transform)}
                                                            color="primary"
                                                            onClick={
                                                                () => this.onSelectPitchCoverTypeClick(PITCH_COVER_VIDEO_URL_TYPE_SELECTED)
                                                            }
                                                            style={{
                                                                marginRight: 15
                                                            }}
                                                        >
                                                            {
                                                                createProjectState.pitchCoverTypeSelected
                                                                && createProjectState.pitchCoverTypeSelected === PITCH_COVER_VIDEO_URL_TYPE_SELECTED
                                                                    ?
                                                                    "Cancel upload a video URL"
                                                                    :
                                                                    "Upload a video URL"
                                                            }
                                                        </Button>
                                                        <InfoOverlay message="If your company has a short explainer or introductory video, we suggest you embed it here." placement="right"/>
                                                    </FlexView>
                                                </FlexView>

                                                <FlexView column marginTop={20}>
                                                    {
                                                        !createProjectState.pitchCoverTypeSelected
                                                            ?
                                                            null
                                                            :
                                                            createProjectState.pitchCoverTypeSelected === PITCH_COVER_FILE_TYPE_SELECTED
                                                                ?
                                                                <FlexView column marginTop={10}>
                                                                    <Files className={css(styles.file_drop_zone)} onChange={this.onFilesChanged(PITCH_COVER_FILES_CHANGED)} onError={this.onFilesError}
                                                                        accepts={
                                                                            clubAttributes && clubAttributes.allowVideoUpload
                                                                                ?
                                                                                ['video/mp4', 'image/*']
                                                                                :
                                                                                ['image/*']
                                                                        }
                                                                        multiple
                                                                        maxFileSize={DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_BYTES}
                                                                        minFileSize={0}
                                                                        clickable>
                                                                        <Typography variant="body2" align="left">
                                                                            {
                                                                                clubAttributes && clubAttributes.allowVideoUpload
                                                                                    ?
                                                                                    "Drop an image or a video here or click to upload"
                                                                                    :
                                                                                    "Drop an image here or click to upload"
                                                                            }
                                                                        </Typography>
                                                                    </Files>
                                                                    <Typography variant="body2" color="textSecondary" align="left" style={{marginTop: 11}}>
                                                                        <u>Note:</u> Pitch cover must not
                                                                        exceed {DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_MB}MB.
                                                                    </Typography>
                                                                </FlexView>
                                                                :
                                                                <FlexView column>
                                                                    <TextField name="pitchCoverVideoURL" value={createProjectState.pitchCoverVideoURL} placeholder="Enter your video URL here" variant="outlined" margin="dense" onChange={this.onInputChanged}/>
                                                                </FlexView>
                                                    }

                                                    {/** Pitch cover file type preview */}
                                                    {
                                                        createProjectState.pitchCoverTypeSelected === PITCH_COVER_FILE_TYPE_SELECTED
                                                        && createProjectState.pitchCover.length > 0
                                                            ?
                                                            <FlexView column marginTop={35}>
                                                                {
                                                                    createProjectState.pitchCover[0].file.type !== "video/mp4"
                                                                        ?
                                                                        <Image fluid src={createProjectState.pitchCover[0].preview}/>
                                                                        :
                                                                        <ReactPlayer url={createProjectState.pitchCover[0].preview} playsInline width="100%" height="auto" playing={false} controls={true}/>
                                                                }
                                                                <FlexView marginTop={10} hAlignContent="center">
                                                                    <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" flip
                                                                        overlay={
                                                                            <Tooltip id={`tooltip-bottom`}>Delete this cover</Tooltip>
                                                                        }>
                                                                        <IconButton onClick={this.onDeleteDocument(PITCH_COVER_FILES_CHANGED)}>
                                                                            <DeleteIcon fontSize="default" color="error"/>
                                                                        </IconButton>
                                                                    </OverlayTrigger>
                                                                </FlexView>

                                                            </FlexView>
                                                            :
                                                            null
                                                    }

                                                    {/** Pitch cover video URL preview */}
                                                    {
                                                        createProjectState.pitchCoverTypeSelected === PITCH_COVER_VIDEO_URL_TYPE_SELECTED
                                                        && createProjectState.pitchCoverVideoURL.trim().length > 0
                                                            ?
                                                            <FlexView column marginTop={35} height={280}>
                                                                <ReactPlayer url={createProjectState.pitchCoverVideoURL} playsInline width="100%" height="100%" playing={false} controls={true}/>
                                                            </FlexView>
                                                            :
                                                            null
                                                    }
                                                </FlexView>
                                            </FlexView>
                                        </FlexView>
                                    </Col>
                                    :
                                    (
                                        createProjectState.activeStep === STEP_PITCH_DECK
                                            ?
                                            // Pitch deck (other groups)
                                            // One-pager (for QIB only)
                                            <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 6, offset: 3}} style={{marginTop: 30}}>
                                                {
                                                    groupUserName === "qib"
                                                        ?
                                                        // QIB pitch deck which is also known as one-pager
                                                        <FlexView column>
                                                            <Typography color="primary" variant="h6" align="left">Step 3: Submit your one-pager</Typography>

                                                            {/** Display the current one-pager if there is one */}
                                                            {
                                                                !params.edit || !projectEdited
                                                                    ?
                                                                    null
                                                                    :
                                                                    (
                                                                        utils.isDraftProject(projectEdited)
                                                                        && (
                                                                            !projectEdited.Pitch.presentationDocument
                                                                            ||
                                                                            (
                                                                                projectEdited.Pitch.presentationDocument
                                                                                && projectEdited.Pitch.presentationDocument
                                                                                    .filter(document => !document.hasOwnProperty('removed')).length === 0
                                                                            )
                                                                        )
                                                                            ?
                                                                            null
                                                                            :
                                                                            <FlexView column marginTop={25} marginBottom={25}>
                                                                                <Typography variant="body1" color="textSecondary" align="left">
                                                                                    {
                                                                                        projectEdited.Pitch.presentationDocument
                                                                                        && projectEdited.Pitch.presentationDocument
                                                                                            .filter(document => !document.hasOwnProperty('removed')).length > 0
                                                                                            ?
                                                                                            "Your current one-pager"
                                                                                            :
                                                                                            "You haven't submitted your one-pager."
                                                                                    }
                                                                                </Typography>
                                                                                <DocumentsDownload documents={projectEdited.Pitch.presentationDocument}/>

                                                                                <Divider style={{marginTop: 20}}/>
                                                                            </FlexView>
                                                                    )
                                                            }

                                                            {/** File upload area */}
                                                            <FlexView column marginTop={30} marginBottom={30}>
                                                                <Typography variant="body1" paragraph align="left">Upload your one-pager</Typography>
                                                                <Files
                                                                    className={css(styles.file_drop_zone)}
                                                                    onChange={this.onFilesChanged(PITCH_PRESENTATION_FILES_CHANGED)}
                                                                    onError={this.onFilesError}
                                                                    accepts={['.pdf', '.doc', '.docx', '.ppt', '.pptx']}
                                                                    multiple
                                                                    maxFileSize={DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_BYTES}
                                                                    minFileSize={0}
                                                                    clickable
                                                                >
                                                                    <Typography variant="body2" align="left">Drop a file here or click to upload</Typography>
                                                                </Files>

                                                                <Typography variant="body2" color="textSecondary" align="left" style={{marginTop: 11}}>
                                                                    <u>Note:</u> The one-pager must not
                                                                    exceed {DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_MB}MB.
                                                                    Files in
                                                                    formats .pdf, .doc, .docx, .ppt, and .pptx are
                                                                    accepted
                                                                    only.
                                                                </Typography>

                                                                <UploadDocuments documents={createProjectState.pitchPresentationDocument} onDeleteDocument={this.onDeleteDocument(PITCH_PRESENTATION_FILES_CHANGED)}/>
                                                            </FlexView>

                                                            {/** Explanation text */}
                                                            <FlexView column marginBottom={60}>
                                                                <Typography variant="body1" align="left" component="span">
                                                                    We recommend the following headings for your
                                                                    one-page, one-sided summary:
                                                                    <ul>
                                                                        <li>Problem</li>
                                                                        <li>Solution</li>
                                                                        <li>Business model</li>
                                                                        <li>Market opportunity</li>
                                                                        <li>Team</li>
                                                                        <li>Journey so far/timeline</li>
                                                                        <li>Ask/Investment proposition</li>
                                                                    </ul>
                                                                </Typography>
                                                            </FlexView>
                                                        </FlexView>
                                                        :
                                                        // other groups pitch deck
                                                        <FlexView column>
                                                            <Typography color="primary" variant="h6" align="left">Step 3: Upload pitch deck
                                                            </Typography>

                                                            {/** Display the current pitch deck if there is one */}
                                                            {
                                                                !params.edit || !projectEdited
                                                                    ?
                                                                    null
                                                                    :
                                                                    (
                                                                        utils.isDraftProject(projectEdited)
                                                                        && (
                                                                            !projectEdited.Pitch.presentationDocument
                                                                            ||
                                                                            (
                                                                                projectEdited.Pitch.presentationDocument
                                                                                && projectEdited.Pitch.presentationDocument
                                                                                    .filter(document => !document.hasOwnProperty('removed')).length === 0
                                                                            )
                                                                        )
                                                                            ?
                                                                            null
                                                                            :
                                                                            <FlexView column marginTop={25} marginBottom={25}>
                                                                                <Typography variant="body1" color="textSecondary" align="left">
                                                                                    {
                                                                                        projectEdited.Pitch.presentationDocument
                                                                                        && projectEdited.Pitch.presentationDocument
                                                                                            .filter(document => !document.hasOwnProperty('removed')).length > 0
                                                                                            ?
                                                                                            "Your current pitch deck"
                                                                                            :
                                                                                            "You have no pitch deck."
                                                                                    }
                                                                                </Typography>
                                                                                <DocumentsDownload documents={projectEdited.Pitch.presentationDocument}/>

                                                                                <Divider style={{ marginTop: 20}}/>
                                                                            </FlexView>
                                                                    )
                                                            }

                                                            {/** Explanation text */}
                                                            <Typography variant="subtitle1" color="textSecondary" align="left" style={{marginTop: 8}}>
                                                                {
                                                                    !params.edit || !projectEdited
                                                                        ?
                                                                        "You need to either upload your pitch deck (PDF, Word, or Power Point file) or use our provided text editor to create your own presentation."
                                                                        :
                                                                        projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT
                                                                        &&
                                                                        (
                                                                            !projectEdited.Pitch.presentationDocument
                                                                            ||
                                                                            (
                                                                                projectEdited.Pitch.presentationDocument
                                                                                && projectEdited.Pitch.presentationDocument.filter(document => !document.hasOwnProperty('removed')).length === 0
                                                                            )
                                                                        )
                                                                            ?
                                                                            "You need to either upload your pitch deck (PDF, Word, or Power Point file) or use our provided text editor to create your own presentation."
                                                                            :
                                                                            "Upload a PDF, Word, or Power Point file to change your pitch deck. We will use the new document for your pitch deck instead of the old one."
                                                                }
                                                            </Typography>

                                                            {/** File upload area */}
                                                            <FlexView
                                                                column
                                                                marginTop={30}
                                                                marginBottom={60}
                                                            >
                                                                <Typography variant="body1" paragraph align="left">Upload pitch deck</Typography>
                                                                <Files
                                                                    className={css(styles.file_drop_zone)}
                                                                    onChange={this.onFilesChanged(PITCH_PRESENTATION_FILES_CHANGED)}
                                                                    onError={this.onFilesError}
                                                                    accepts={['.pdf', '.doc', '.docx', '.ppt', '.pptx']}
                                                                    multiple
                                                                    maxFileSize={DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_BYTES}
                                                                    minFileSize={0}
                                                                    clickable
                                                                >
                                                                    <Typography variant="body2" align="left">Drop a file here or click to upload</Typography>
                                                                </Files>

                                                                <Typography variant="body2" color="textSecondary" align="left" style={{marginTop: 11}}>
                                                                    <u>Note:</u> Pitch deck must not
                                                                    exceed {DB_CONST.MAX_VIDEO_OR_IMAGE_SIZE_IN_MB}MB.
                                                                    Files in
                                                                    formats .pdf, .doc, .docx, .ppt, and .pptx are
                                                                    accepted
                                                                    only.
                                                                </Typography>

                                                                <UploadDocuments
                                                                    documents={createProjectState.pitchPresentationDocument}
                                                                    onDeleteDocument={this.onDeleteDocument(PITCH_PRESENTATION_FILES_CHANGED)}
                                                                />
                                                            </FlexView>

                                                            {/** Rich text editor */}
                                                            <FlexView column marginTop={20}>
                                                                <Typography variant="body1" paragraph align="left">Write overview</Typography>
                                                                <ReactQuill
                                                                    theme="snow"
                                                                    placeholder={
                                                                        !params.edit || !projectEdited
                                                                            ?
                                                                            "Write your pitch presentation here. Add images for visual effects."
                                                                            :
                                                                            projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT && !projectEdited.Pitch.hasOwnProperty('presentationText')
                                                                                ?
                                                                                "Write your pitch presentation here. Add images for visual effects."
                                                                                :
                                                                                "You haven't had text presentation for this investment opportunity."
                                                                    }
                                                                    onChange={this.onPitchEditorChanged}
                                                                    modules={modules}
                                                                    value={createProjectState.pitchPresentationText}
                                                                />
                                                            </FlexView>
                                                        </FlexView>
                                                }
                                            </Col>
                                            :
                                            (
                                                createProjectState.activeStep === STEP_PITCH_SUPPORTING_DOCUMENTS
                                                    ?
                                                    // Supporting documents (other groups)
                                                    // Pitch deck (for QIB only)
                                                    <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 6, offset: 3}} style={{marginTop: 30}}>
                                                        {
                                                            groupUserName === "qib"
                                                                ?
                                                                // QIB supporting document which is also known as pitch deck
                                                                <FlexView column>
                                                                    <Typography color="primary" variant="h6" align="left">Step 4: Upload pitch deck (optional)</Typography>

                                                                    {/** Display current pitch deck if there is */}
                                                                    {
                                                                        !params.edit || !projectEdited
                                                                            ?
                                                                            null
                                                                            :
                                                                            utils.isDraftProject(projectEdited)
                                                                            &&
                                                                            (
                                                                                !projectEdited.Pitch.supportingDocuments
                                                                                ||
                                                                                (
                                                                                    projectEdited.Pitch.supportingDocuments
                                                                                    && projectEdited.Pitch.supportingDocuments
                                                                                        .filter(document => !document.hasOwnProperty('removed')).length === 0
                                                                                )
                                                                            )
                                                                                ?
                                                                                null
                                                                                :
                                                                                <FlexView column marginTop={25} marginBottom={25}>
                                                                                    {
                                                                                        projectEdited.Pitch.supportingDocuments
                                                                                        && projectEdited.Pitch.supportingDocuments
                                                                                            .filter(document => !document.hasOwnProperty('removed')).length > 0
                                                                                            ?
                                                                                            <FlexView column>
                                                                                                <Typography variant="body1" color="textSecondary" align="left">Your current pitch deck</Typography>
                                                                                                <DocumentsDownload documents={projectEdited.Pitch.supportingDocuments} deleteEnable onDeleteDocument={this.onDownloadDocumentDeleteClick}/>
                                                                                            </FlexView>
                                                                                            :
                                                                                            <Typography variant="body1" color="textSecondary" align="left">You have no pitch deck.</Typography>
                                                                                    }

                                                                                    <Divider style={{marginTop: 20}}/>
                                                                                </FlexView>
                                                                    }

                                                                    {/** File upload area */}
                                                                    <FlexView column marginTop={25}>
                                                                        <Files
                                                                            className={css(styles.file_drop_zone)}
                                                                            onChange={this.onFilesChanged(PITCH_SUPPORTING_DOCUMENTS_FILES_CHANGED)}
                                                                            onError={this.onFilesError}
                                                                            accepts={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx']}
                                                                            multiple
                                                                            maxFileSize={DB_CONST.MAX_FILE_SIZE_IN_BYTES}
                                                                            minFileSize={0}
                                                                            clickable>
                                                                            <Typography variant="body2" align="left">Drop a file here or click to upload</Typography>
                                                                        </Files>

                                                                        <Typography variant="body2" color="textSecondary" align="left" style={{marginTop: 11}}>
                                                                            <u>Note:</u> Each document must not
                                                                            exceed {DB_CONST.MAX_FILE_SIZE_IN_MB}MB.
                                                                            Files
                                                                            in formats .pdf, .doc, .docx, .ppt, .pptx,
                                                                            .xls,
                                                                            and .xlsx are accepted only.
                                                                        </Typography>

                                                                        <UploadDocuments documents={createProjectState.pitchSupportingDocuments} onDeleteDocument={this.onDeleteDocument(PITCH_SUPPORTING_DOCUMENTS_FILES_CHANGED)}/>
                                                                    </FlexView>

                                                                    {/** Divider */}
                                                                    <Divider style={{marginTop: 20, marginBottom: 20}}/>
                                                                </FlexView>
                                                                :
                                                                // Other groups supporting documents
                                                                <FlexView column>
                                                                    <Typography color="primary" variant="h6" align="left">Step 4: Upload supporting documents</Typography>

                                                                    {/** Display current supporting documents if there are */}
                                                                    {
                                                                        !params.edit || !projectEdited
                                                                            ?
                                                                            null
                                                                            :
                                                                            utils.isDraftProject(projectEdited)
                                                                            &&
                                                                            (
                                                                                !projectEdited.Pitch.supportingDocuments
                                                                                ||
                                                                                (
                                                                                    projectEdited.Pitch.supportingDocuments
                                                                                    && projectEdited.Pitch.supportingDocuments
                                                                                        .filter(document => !document.hasOwnProperty('removed')).length === 0
                                                                                )
                                                                            )
                                                                                ?
                                                                                null
                                                                                :
                                                                                <FlexView column marginTop={25} marginBottom={25}>
                                                                                    {
                                                                                        projectEdited.Pitch.supportingDocuments
                                                                                        && projectEdited.Pitch.supportingDocuments
                                                                                            .filter(document => !document.hasOwnProperty('removed')).length > 0
                                                                                            ?
                                                                                            <FlexView column>
                                                                                                <Typography variant="body1" color="textSecondary" align="left">Your supporting documents</Typography>
                                                                                                <DocumentsDownload documents={projectEdited.Pitch.supportingDocuments} deleteEnable onDeleteDocument={this.onDownloadDocumentDeleteClick}/>
                                                                                            </FlexView>
                                                                                            :
                                                                                            <Typography variant="body1" color="textSecondary" align="left">You have no supporting documents.</Typography>
                                                                                    }

                                                                                    <Divider style={{marginTop: 20}}/>
                                                                                </FlexView>
                                                                    }

                                                                    {/** Explanation text */}
                                                                    <Typography variant="body1" color="textSecondary" align="left" style={{marginTop: 8}}>
                                                                        {
                                                                            !params.edit || !projectEdited
                                                                                ?
                                                                                `You can upload supporting documents to help strengthen your pitch. You can upload up to ${DB_CONST.MAX_FILES_FOR_PITCH_SUPPORTING_DOCUMENTS} files.`
                                                                                :
                                                                                (
                                                                                    !projectEdited.Pitch.supportingDocuments
                                                                                        ?
                                                                                        `You can upload supporting documents to help strengthen your pitch. You can upload up to ${DB_CONST.MAX_FILES_FOR_PITCH_SUPPORTING_DOCUMENTS} files.`
                                                                                        :
                                                                                        `Upload new supporting documents. 
                                                                        You can still upload ${DB_CONST.MAX_FILES_FOR_PITCH_SUPPORTING_DOCUMENTS - projectEdited.Pitch.supportingDocuments.filter(document => !document.hasOwnProperty('removed')).length} 
                                                                        more documents.`
                                                                                )
                                                                        }
                                                                    </Typography>

                                                                    {/** File upload area */}
                                                                    <FlexView column marginTop={25}>
                                                                        <Files
                                                                            className={css(styles.file_drop_zone)}
                                                                            onChange={this.onFilesChanged(PITCH_SUPPORTING_DOCUMENTS_FILES_CHANGED)}
                                                                            onError={this.onFilesError}
                                                                            accepts={['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx']}
                                                                            multiple
                                                                            maxFileSize={DB_CONST.MAX_FILE_SIZE_IN_BYTES}
                                                                            minFileSize={0}
                                                                            clickable>
                                                                            <Typography variant="body2" align="left">Drop a file here or click to upload</Typography>
                                                                        </Files>

                                                                        <Typography variant="body2" color="textSecondary" align="left" style={{marginTop: 11}}>
                                                                            <u>Note:</u> Each document must not
                                                                            exceed {DB_CONST.MAX_FILE_SIZE_IN_MB}MB.
                                                                            Files
                                                                            in formats .pdf, .doc, .docx, .ppt, .pptx,
                                                                            .xls,
                                                                            and .xlsx are accepted only.
                                                                        </Typography>

                                                                        <UploadDocuments documents={createProjectState.pitchSupportingDocuments} onDeleteDocument={this.onDeleteDocument(PITCH_SUPPORTING_DOCUMENTS_FILES_CHANGED)}/>
                                                                    </FlexView>

                                                                    {/** Divider */}
                                                                    <Divider style={{marginTop: 20, marginBottom: 20}}/>
                                                                </FlexView>
                                                        }
                                                    </Col>
                                                    :
                                                    <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 6, offset: 3}} style={{marginTop: 30}}>
                                                        <FlexView column>
                                                            <Typography color="primary" variant="h6" align="left">Step 5: Accept terms and conditions</Typography>

                                                            {
                                                                /**
                                                                 * Agree to share raise publicly
                                                                 */
                                                            }
                                                            <FormControl component="fieldset" style={{marginTop: 30}}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox color="primary" name="agreedToShareRaisePublicly" value={createProjectState.agreedToShareRaisePublicly} checked={createProjectState.agreedToShareRaisePublicly} onChange={this.onCheckboxChanged}/>
                                                                    }
                                                                    label={
                                                                        <Typography variant="body1" align="left">If you're happy to share news of your raise publicly e.g. via Twitter, please tick this box.</Typography>
                                                                    }
                                                                />
                                                            </FormControl>

                                                            {/** Divider */}
                                                            <Divider style={{marginTop: 20, marginBottom: 20}}/>

                                                            {
                                                                /**
                                                                 * Agree to receive local investment information
                                                                 */
                                                            }
                                                            <FormControl component="fieldset">
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox color="primary" name="agreedToReceiveLocalInvestmentInfo" value={createProjectState.agreedToReceiveLocalInvestmentInfo} checked={createProjectState.agreedToReceiveLocalInvestmentInfo} onChange={this.onCheckboxChanged}/>
                                                                    }
                                                                    label={
                                                                        <Typography variant="body1" align="left">If you're happy to receive information about the local investment ecosystem (max 8 times a year), please tick this box.</Typography>
                                                                    }
                                                                />
                                                            </FormControl>

                                                            {/** Divider */}
                                                            <Divider style={{marginTop: 20, marginBottom: 20}}/>

                                                            {
                                                                /**
                                                                 * Agree to T&Cs
                                                                 */
                                                            }
                                                            <FormControl component="fieldset">
                                                                <Typography variant="body1" align="left">Please tick the box below to confirm that you agree to comply with the terms and conditions of creating a pitch in our platform.</Typography>
                                                                <FormControlLabel style={{marginTop: 10}}
                                                                    control={
                                                                        <Checkbox color="primary" name="acceptedTermsAndConditions" value={createProjectState.acceptedTermsAndConditions} checked={createProjectState.acceptedTermsAndConditions} onChange={this.onCheckboxChanged}/>
                                                                    }
                                                                    label={
                                                                        <Typography variant="body1" align="left">I've read and accept the<b>
                                                                                &nbsp;
                                                                                <NavLink
                                                                                    to={ROUTES.CREATE_PITCH_TERMS_AND_CONDITIONS}
                                                                                    target="_blank"
                                                                                    className={css(sharedStyles.nav_link_hover)}
                                                                                    style={{
                                                                                        color:
                                                                                            !groupProperties
                                                                                                ?
                                                                                                colors.primaryColor
                                                                                                :
                                                                                                groupProperties.settings.primaryColor
                                                                                    }}>
                                                                                    terms and conditions.
                                                                                </NavLink>
                                                                            </b>
                                                                        </Typography>
                                                                    }/>
                                                            </FormControl>

                                                            <Divider style={{marginTop: 20, marginBottom: 20}}/>
                                                        </FlexView>
                                                    </Col>
                                            )
                                    )
                            )
                    }
                </Row>

                {/** Navigation buttons */}
                <Row noGutters>
                    <Col xs={12} sm={12} md={{span: 10, offset: 1}} lg={{span: 6, offset: 3}} style={{marginTop: 20, marginBottom: 120, padding: 18}}>

                        {
                            params.edit && projectEdited
                                ?
                                (
                                    projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT
                                        ?
                                        createProjectState.activeStep === STEP_ACCEPT_TERMS_AND_CONDITIONS
                                            ?
                                            (
                                                !createProjectState.acceptedTermsAndConditions
                                                    ?
                                                    null
                                                    :
                                                    <Typography color="error" variant="body1" align="right" style={{marginBottom: 25}}>Please check everything carefully again before you submit.</Typography>
                                            )
                                            :
                                            null
                                        :
                                        createProjectState.activeStep === STEP_PITCH_SUPPORTING_DOCUMENTS
                                            ?
                                            <Typography color="error" variant="body1" align="right" style={{marginBottom: 25}}>Please check everything carefully again before publishing.</Typography>
                                            :
                                            null
                                )
                                :
                                (
                                    createProjectState.activeStep === STEP_ACCEPT_TERMS_AND_CONDITIONS
                                        ?
                                        (
                                            !createProjectState.acceptedTermsAndConditions
                                                ?
                                                null
                                                :
                                                <Typography color="error" variant="body1" align="right" style={{marginBottom: 25}}>Please check everything carefully again before publishing.</Typography>
                                        )
                                        :
                                        null
                                )
                        }

                        <FlexView width="100%" hAlignContent="right">
                            <Button variant="text" onClick={this.onBackClick} disabled={createProjectState.activeStep === STEP_PITCH_GENERAL_INFORMATION} size="large" className={css(sharedStyles.no_text_transform)}>Back</Button>
                            <Button ref={this.attachNextStepButtonRef} variant="outlined" color="primary" onClick={this.onNextStepClick} size="large" className={css(sharedStyles.no_text_transform)}
                                disabled={
                                    createProjectState.activeStep === STEP_ACCEPT_TERMS_AND_CONDITIONS
                                    && !createProjectState.acceptedTermsAndConditions
                                }
                                style={{marginLeft: 15}}>
                                {
                                    progressBeingSaved
                                        ?
                                        <BeatLoader size={8}/>
                                        :
                                        params.edit && projectEdited
                                            ?
                                            (
                                                projectEdited.status !== DB_CONST.PROJECT_STATUS_DRAFT
                                                    ?
                                                    createProjectState.activeStep === STEP_PITCH_SUPPORTING_DOCUMENTS
                                                        ?
                                                        "Update"
                                                        :
                                                        "Next"
                                                    :
                                                    createProjectState.activeStep === STEP_ACCEPT_TERMS_AND_CONDITIONS
                                                        ?
                                                        "Submit"
                                                        :
                                                        "Save and Next"
                                            )
                                            :
                                            (
                                                createProjectState.activeStep === STEP_ACCEPT_TERMS_AND_CONDITIONS
                                                    ?
                                                    "Submit"
                                                    :
                                                    "Save and Next"
                                            )
                                }
                            </Button>
                            <Overlay show={createProjectState.pitchPublishErrorMessageShowed} target={createProjectState.pitchNextStepButtonTarget} placement="bottom">
                                <Popover style={{ marginTop: 14}} id="publish-popover-bottom">
                                    <FlexView vAlignContent="center">
                                        {
                                            this.renderPitchPublishErrorMessage()
                                        }
                                        <IconButton style={{width: 42, height: 42}} onClick={this.onPopoverErrorMessageClose}>
                                            <CloseIcon fontSize="small"/>
                                        </IconButton>
                                    </FlexView>
                                </Popover>
                            </Overlay>
                        </FlexView>
                    </Col>
                </Row>

                {
                    (!params.edit || !projectEdited)
                    || (params.edit && projectEdited && projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT)
                        ?
                        <div style={{position: 'fixed', width: 'auto', height: 'auto', bottom: 0, right: 0, marginRight: isMobile ? 72 : 120, marginBottom: isMobile ? 80 : 100}}>
                            <FlexView column>
                                <div>
                                    <OverlayTrigger trigger={['hover', 'focus']} placement="left" flip
                                        overlay={
                                            <Tooltip id={`tooltip-left`}>Save draft</Tooltip>
                                        }>
                                        <Fab color="primary"size={isMobile ? "medium" : "large"} onClick={this.onSaveProgressClick} disabled={saveProgress && progressBeingSaved}
                                            style={{position: 'absolute', zIndex: 1}}>
                                            <SaveIcon/>
                                        </Fab>
                                    </OverlayTrigger>
                                    {
                                        saveProgress && progressBeingSaved
                                            ?
                                            <CircularProgress thickness={2.7} size={isMobile ? 60 : 68} style={{position: 'absolute', top: -6, left: -6}}/>
                                            :
                                            null
                                    }
                                </div>

                                {
                                    params.edit && projectEdited && projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT
                                        ?
                                        <div style={{marginTop: isMobile ? 62 : 72}}>
                                            <OverlayTrigger trigger={['hover', 'focus']} placement="left" flip
                                                overlay={
                                                    <Tooltip id={`tooltip-left`}>Delete this draft</Tooltip>
                                                }>
                                                <Fab size={isMobile ? "medium" : "large"} onClick={this.onDeleteDraftClick} disabled={draftBeingDeleted}
                                                    style={{position: 'absolute', zIndex: 1}}>
                                                    <DeleteIcon color="error"/>
                                                </Fab>
                                            </OverlayTrigger>
                                            {
                                                draftBeingDeleted
                                                    ?
                                                    <CircularProgress color="secondary" thickness={2.7} size={isMobile ? 60 : 68} style={{position: 'absolute', top: isMobile ? 56 : 66, left: -6}}/>
                                                    :
                                                    null
                                            }
                                        </div>
                                        :
                                        null
                                }
                            </FlexView>
                        </div>
                        :
                        null
                }
            </Container>
        );
    }
}

const modules = {
    toolbar: [
        [{'header': [1, 2, 3, 4, 5, 6, false]}],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote', 'code-block'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}, {'align': []}],
        [{'script': 'sub'}, {'script': 'super'}],
        [{'color': []}, {'background': []}],
        ['link', 'image'],
        ['clean']
    ]
};

/**
 * This component shows the uploading progress
 */
class UploadingDialog extends Component {

    render() {

        const {
            groupUserName,

            open,
            uploadFileMode,
            uploadFileProgress,

            saveProgress,
            progressBeingSaved,

            params,
            projectEdited, // pass in if in edit mode
            projectID,
            currentUser,

            ...other
        } = this.props;

        return (
            <Dialog maxWidth="sm" fullWidth open={open} {...other}>
                <DialogTitle disableTypography={true}>
                    <Typography color="primary" variant="h6" align="left">
                        {
                            uploadFileMode === UPLOAD_DONE_MODE
                                ?
                                "Upload done"
                                :
                                "You are almost done..."
                        }
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <FlexView column>
                        <Typography variant="body1" align="left">
                            {
                                uploadFileMode !== UPLOAD_DONE_MODE
                                    ?
                                    "Please stay tuned while we are publishing your pitch"
                                    :
                                    null
                            }
                        </Typography>
                        <FlexView column marginBottom={20}>
                            {
                                this.renderUploadFileMode()
                            }
                            {
                                uploadFileMode === UPLOAD_DONE_MODE
                                    ?
                                    null
                                    :
                                    <ProgressBar style={{marginTop: 25}} striped variant="success" now={uploadFileProgress} label={`${parseInt(uploadFileProgress)}%`}/>
                            }
                        </FlexView>
                    </FlexView>
                </DialogContent>
                {
                    uploadFileMode !== UPLOAD_DONE_MODE
                        ?
                        null
                        :
                        <DialogActions>
                            <FlexView width="100%" hAlignContent="center" marginBottom={20} marginRight={20} marginLeft={20}>
                                <NavLink
                                    to={
                                        groupUserName
                                            ?
                                            ROUTES.PROJECT_DETAILS.replace(":groupUserName", groupUserName).replace(":projectID", projectID)
                                            :
                                            ROUTES.PROJECT_DETAILS_INVEST_WEST_SUPER.replace(":projectID", projectID)
                                    }
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{width: "100%", marginRight: 10}}>
                                    <Button variant="outlined" color="primary" size="medium" fullWidth className={css(sharedStyles.no_text_transform)}>
                                        {
                                            params.edit && projectEdited
                                                ?
                                                (
                                                    projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT
                                                        ?
                                                        "View submitted investment opportunity"
                                                        :
                                                        "View updated investment opportunity"
                                                )
                                                :
                                                "View submitted investment opportunity"
                                        }
                                    </Button>
                                </NavLink>
                                <NavLink
                                    to={
                                        currentUser.type === DB_CONST.TYPE_ISSUER
                                            ?
                                            groupUserName
                                                ?
                                                `${ROUTES.DASHBOARD_ISSUER.replace(":groupUserName", groupUserName)}?tab=Home`
                                                :
                                                `${ROUTES.DASHBOARD_ISSUER_INVEST_WEST_SUPER}?tab=Home`
                                            :
                                            currentUser.type === DB_CONST.TYPE_ADMIN
                                                ?
                                                groupUserName
                                                    ?
                                                    `${ROUTES.ADMIN.replace(":groupUserName", groupUserName)}?tab=Home`
                                                    :
                                                    `${ROUTES.ADMIN_INVEST_WEST_SUPER}?tab=Home`
                                                :
                                                ""
                                    }
                                    className={css(sharedStyles.nav_link_hover)}
                                    style={{ width: "100%", marginLeft: 10}}>
                                    <Button variant="outlined" color="primary" size="medium" fullWidth className={css(sharedStyles.no_text_transform)}>Go back to your dashboard</Button>
                                </NavLink>
                            </FlexView>
                        </DialogActions>
                }
            </Dialog>
        );
    }

    renderUploadFileMode = () => {

        const {
            uploadFileMode,
            params,
            projectEdited,
            currentUser
        } = this.props;

        switch (uploadFileMode) {
            case UPLOAD_PITCH_COVER_MODE:
                return (
                    <Typography variant="body2" color="textSecondary" align="left">Uploading pitch cover</Typography>
                );
            case UPLOAD_PITCH_SUPPORTING_DOCUMENTS_MODE:
                return (
                    <Typography variant="body2" color="textSecondary" align="left">Uploading pitch supporting documents</Typography>
                );
            case UPLOAD_PITCH_PRESENTATION_DOCUMENT_MODE:
                return (
                    <Typography variant="body2" color="textSecondary" align="left"> Uploading pitch presentation document</Typography>
                );
            case UPLOAD_REALTIME_DB:
                return (
                    <Typography variant="body2" color="textSecondary" align="left">Finalizing</Typography>
                );
            case UPLOAD_DONE_MODE:
                return (
                    <Typography variant="body1" color="textSecondary" align="left">
                        {
                            params.edit && projectEdited
                                ?
                                (
                                    projectEdited.status === DB_CONST.PROJECT_STATUS_DRAFT
                                        ?
                                        currentUser.type === DB_CONST.TYPE_ADMIN
                                            ?
                                            "Congratulations! Your investment opportunity has been uploaded.\n" +
                                            "Please double check and publish it."
                                            :
                                            "Congratulations! Your investment opportunity has been uploaded.\n" +
                                            "It will not be published until the group administrator has approved it.\n" +
                                            "You will be notified once approved."
                                        :
                                        "Your investment opportunity has been successfully updated."
                                )
                                :
                                currentUser.type === DB_CONST.TYPE_ADMIN
                                    ?
                                    "Congratulations! Your investment opportunity has been uploaded.\n" +
                                    "Please double check and make it go live."
                                    :
                                    "Congratulations! Your investment opportunity has been uploaded.\n" +
                                    "It will not be published until the group administrator has approved it.\n" +
                                    "You will be notified once approved."
                        }
                    </Typography>
                );
            default:
                return;
        }
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePitchPageMain);

const styles = StyleSheet.create({

    file_drop_zone: {
        padding: 12,
        border: `1px solid ${colors.gray_400}`,

        ':hover': {
            backgroundColor: colors.gray_100,
            cursor: 'pointer'
        }
    }
});