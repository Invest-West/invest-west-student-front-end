import * as DB_CONST from "../../firebase/databaseConsts";
import * as realtimeDBUtils from "../../firebase/realtimeDBUtils";
import firebase from "../../firebase/firebaseApp";
import * as selectProjectVisibilityActions from "../actions/selectProjectVisibilityActions";
import * as utils from "../../utils/utils";
import * as myUtils from "../../utils/utils";
import {
    PITCH_PUBLISH_CHECK_NONE,
    PITCH_PUBLISH_FALSE_INVALID_DATE,
    PITCH_PUBLISH_FALSE_INVALID_FUND,
    PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION,
    PITCH_PUBLISH_FALSE_MISSING_PITCH_COVER,
    PITCH_PUBLISH_FALSE_MISSING_PITCH_PRESENTATION,
    STEP_ACCEPT_TERMS_AND_CONDITIONS,
    STEP_PITCH_COVER,
    STEP_PITCH_DECK,
    STEP_PITCH_GENERAL_INFORMATION,
    STEP_PITCH_SUPPORTING_DOCUMENTS,
    PITCH_COVER_FILE_TYPE_SELECTED,
    PITCH_COVER_VIDEO_URL_TYPE_SELECTED
} from "../../pages/create-project/CreateProject";
import * as ROUTES from "../../router/routes";

export const CREATE_PROJECT_SET_COMPONENT_PROPS = "CREATE_PROJECT_SET_COMPONENT_PROPS";
export const setComponentContext = (context) => {
    return {
        type: CREATE_PROJECT_SET_COMPONENT_PROPS,
        context
    }
}

export const CREATE_PROJECT_LOADING_DATA = "CREATE_PROJECT_LOADING_DATA";
export const CREATE_PROJECT_FINISHED_LOADING_DATA = "CREATE_PROJECT_FINISHED_LOADING_DATA";

export const CREATE_PROJECT_MODE_EDIT = 1;
export const CREATE_PROJECT_MODE_CREATE_NEW = 2;

/**
 * Load data
 *
 * @param params
 * @returns {Promise<function(...[*]=)>}
 */
export const loadData = async (params) => {
    return (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const groupProperties = getState().manageGroupFromParams.groupProperties;

        const {
            projectEditedLoaded,
            projectIDToBeLoadedAfterSavingFirstTime
        } = getState().manageCreateProject;

        if (!currentUser
            ||
            (currentUser && currentUser.type === DB_CONST.TYPE_INVESTOR)
        ) {
            if (!projectEditedLoaded) {
                this.setState({
                    projectEditedLoaded: true
                });
                dispatch({
                    type: CREATE_PROJECT_FINISHED_LOADING_DATA,
                    error: "Error happened."
                });
            }
            return;
        }

        dispatch({
            type: CREATE_PROJECT_LOADING_DATA
        });

        // in edit mode
        if (params.edit || projectIDToBeLoadedAfterSavingFirstTime) {
            // load the project
            realtimeDBUtils
                .loadAParticularProject(!params.edit ? projectIDToBeLoadedAfterSavingFirstTime : params.edit)
                .then(project => {

                    // allow the group admin to change the visibility of the project
                    if ((currentUser.type === DB_CONST.TYPE_ADMIN && currentUser.anid === project.anid)
                        && (groupProperties && groupProperties.anid === project.anid)
                    ) {
                        dispatch({
                            type: selectProjectVisibilityActions.SELECT_PROJECT_VISIBILITY_SET_PROJECT,
                            project
                        });
                    }

                    dispatch({
                        type: CREATE_PROJECT_FINISHED_LOADING_DATA,
                        projectEdited: project,
                        mode: CREATE_PROJECT_MODE_EDIT
                    });
                })
                .catch(error => {
                    dispatch({
                        type: CREATE_PROJECT_FINISHED_LOADING_DATA,
                        error: error
                    });
                });
        }
        // in create mode
        else {
            dispatch({
                type: CREATE_PROJECT_FINISHED_LOADING_DATA,
                mode: CREATE_PROJECT_MODE_CREATE_NEW
            });

            // allow the group admin to change the visibility of the project
            if (currentUser.type === DB_CONST.TYPE_ADMIN
                && (groupProperties && groupProperties.anid === currentUser.anid)
            ) {
                dispatch({
                    type: selectProjectVisibilityActions.SELECT_PROJECT_VISIBILITY_SET_PROJECT,
                    project: null
                });
            }
        }
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
export const navigateToTheSamePageWithActiveStepSaved = (activeStep, projectID) => {
    return (dispatch, getState) => {
        const {
            groupUserName
        } = getState().manageGroupFromParams;

        const componentContext = getState().manageCreateProject.componentContext;

        // projectID not null
        // --> still in edit mode
        if (projectID) {
            componentContext.props.history.push({
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
            componentContext.props.history.push({
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
    }
};

export const handleMoveToNextStep = (params) => {
    return (dispatch, getState) => {
        const {
            projectEdited,
            progressBeingSaved
        } = getState().manageCreateProject;

        const {
            activeStep,

            pitchSector,
            pitchProjectName,
            pitchProjectDescription,
            pitchExpiredDate,

            pitchCover,
            pitchCoverVideoURL,
            pitchCoverTypeSelected,
            pitchPresentationDocument,
            pitchPresentationText,

        } = getState().manageCreateProject.createNewPitch;

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
                    || pitchProjectName.trim().length === 0
                    || pitchProjectDescription.trim().length === 0
                    || pitchExpiredDate === null) {

                    this.setState({
                        createNewPitch: {
                            ...this.state.createNewPitch,
                            pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_FIELDS_IN_GENERAL_INFORMATION,
                            pitchPublishErrorMessageShowed: true
                        }
                    });

                    return;
                }

                // check if the entered date is in a valid format or the entered is less than the minimum date
                if (isNaN(pitchExpiredDate)
                    ||
                    (pitchExpiredDate && (pitchExpiredDate < myUtils.getDateWithDaysFurtherThanToday(0)))
                ) {
                    this.setState({
                        createNewPitch: {
                            ...this.state.createNewPitch,
                            pitchPublishCheck: PITCH_PUBLISH_FALSE_INVALID_DATE,
                            pitchPublishErrorMessageShowed: true
                        }
                    });
                    return;
                }
                this.setState({
                    createNewPitch: {
                        ...this.state.createNewPitch,
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
                            createNewPitch: {
                                ...this.state.createNewPitch,
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
                            createNewPitch: {
                                ...this.state.createNewPitch,
                                pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_PITCH_COVER,
                                pitchPublishErrorMessageShowed: true
                            }
                        });
                        return;
                    }
                }
                this.setState({
                    createNewPitch: {
                        ...this.state.createNewPitch,
                        activeStep: activeStep + 1,
                        pitchPublishCheck: PITCH_PUBLISH_CHECK_NONE,
                        pitchPublishErrorMessageShowed: false
                    }
                });
                break;
            // Pitch deck
            case STEP_PITCH_DECK:
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
                            createNewPitch: {
                                ...this.state.createNewPitch,
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
                            createNewPitch: {
                                ...this.state.createNewPitch,
                                pitchPublishCheck: PITCH_PUBLISH_FALSE_MISSING_PITCH_PRESENTATION,
                                pitchPublishErrorMessageShowed: true
                            }
                        });
                        return;
                    }
                }
                this.setState({
                    createNewPitch: {
                        ...this.state.createNewPitch,
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
                        createNewPitch: {
                            ...this.state.createNewPitch,
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
    }
}

let draftProjectListener = null;

export const CREATE_PROJECT_DRAFT_PROJECT_CHANGED = "CREATE_PROJECT_DRAFT_PROJECT_CHANGED";
export const startListeningForDraftProjectChanged = () => {
    return (dispatch, getState) => {
        const projectEdited = getState().manageCreateProject.projectEdited;

        if (utils.isDraftProject(projectEdited)) {
            if (!draftProjectListener) {
                draftProjectListener = firebase
                    .database()
                    .ref(DB_CONST.PROJECTS_CHILD)
                    .orderByKey()
                    .equalTo(projectEdited.id);

                draftProjectListener
                    .on('child_changed', snapshot => {

                        let project = snapshot.val();

                        this.setState({
                            projectEdited: Object.assign({}, project)
                        });
                        dispatch({
                            type: CREATE_PROJECT_DRAFT_PROJECT_CHANGED,
                            projectChanged: project
                        });
                    });
            }
        }
    }
}

export const stopListeningForDraftProjectChanged = () => {
    return (dispatch, getState) => {
        if (draftProjectListener) {
            draftProjectListener.off('child_changed');
            draftProjectListener = null;
        }
    }
}