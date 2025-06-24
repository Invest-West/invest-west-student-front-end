import * as createProjectActions from '../actions/createProjectActions';
import * as authActions from '../actions/authActions';
import {
    STEP_PITCH_GENERAL_INFORMATION,
    PITCH_PUBLISH_CHECK_NONE,
    UPLOAD_NONE
} from '../../pages/create-project/CreateProject';

const initState = {
    componentContext: null,

    recoveredFromPreviousState: false,

    projectBeforeEdited: null,
    projectEdited: null,
    projectEditedLoaded: false,

    requestToLoadData: true,
    projectIDToBeLoadedAfterSavingFirstTime: null,

    saveProgress: false,
    progressBeingSaved: false,
    draftBeingDeleted: false,

    createNewPitch: {

        activeStep: STEP_PITCH_GENERAL_INFORMATION,

        // project sector
        pitchSector: '-',
        // project project name
        pitchProjectName: '',
        pitchProjectDescription: '',
        pitchExpiredDate: null,

        //pitchInvestorsCommitted: '',

        // project cover (image or video) --- 1 file
        pitchCover: [],
        // project cover - video URL
        pitchCoverVideoURL: '',
        // select between uploading an image or a video ULR -----
        pitchCoverTypeSelected: null,
        // ------------------------------------------------------
        // project supporting documents --- max 10 files
        pitchSupportingDocuments: [],
        // project presentation file (user uploads a file for project presentation) --- 1 file
        pitchPresentationDocument: [],
        // project presentation text (user uses the provided text editor to make project presentation)
        pitchPresentationText: {ops: []},

        // check for missing fields (or invalid inputs) when the user hits the Next button
        pitchPublishCheck: PITCH_PUBLISH_CHECK_NONE,

        // these 2 states are used to display popover error message when the Publish button is clicked
        pitchNextStepButtonTarget: null,
        pitchPublishErrorMessageShowed: false,

        uploadFileProgress: 0,
        uploadFileMode: UPLOAD_NONE,

        openUploadingProgressDialog: false,

        snackbarErrorMessage: '',
        errorSnackbarOpen: false,

        acceptedTermsAndConditions: false,

        projectID: null // set when project has been successfully published to pass to UploadDialog
    }
};

const createProjectReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case createProjectActions.CREATE_PROJECT_SET_COMPONENT_PROPS:
            return {
                ...state,
                componentContext: action.context
            }
        case createProjectActions.CREATE_PROJECT_LOADING_DATA:
            return {
                ...state,
                requestToLoadData: false
            };
        case createProjectActions.CREATE_PROJECT_FINISHED_LOADING_DATA: {
            if (action.hasOwnProperty('error')) {
                return {
                    ...state,
                    projectEditedLoaded: true,
                    projectIDToBeLoadedAfterSavingFirstTime: null
                }
            }
            else {
                // error
                if (!action.hasOwnProperty('mode')) {
                    return initState;
                }

                switch (action.mode) {
                    case createProjectActions.CREATE_PROJECT_MODE_EDIT: {
                        const project = JSON.parse(JSON.stringify(action.projectEdited));

                        return {
                            ...state,
                            projectBeforeEdited: project,
                            projectEdited: project,
                            projectEditedLoaded: true,
                            projectIDToBeLoadedAfterSavingFirstTime: null,

                            createNewPitch: {
                                ...state.createNewPitch,
                                // project sector
                                pitchSector:
                                    project.hasOwnProperty('sector')
                                        ?
                                        project.sector
                                        :
                                        ''
                                ,
                                // project project name
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
                                pitchExpiredDate:
                                    project.Pitch.hasOwnProperty('expiredDate')
                                        ?
                                        project.Pitch.expiredDate
                                        :
                                        null
                                ,
                                // pitchInvestorsCommitted:
                                //     project.Pitch.hasOwnProperty('investorsCommitted')
                                //         ?
                                //         project.Pitch.investorsCommitted
                                //         :
                                //         ''
                                // ,

                                pitchPresentationText:
                                    !project.Pitch.presentationText
                                        ?
                                        {ops: []}
                                        :
                                        project.Pitch.presentationText
                            }
                        };
                    }
                    case createProjectActions.CREATE_PROJECT_MODE_CREATE_NEW:
                        return {
                            ...state,
                            projectEditedLoaded: true,
                            projectIDToBeLoadedAfterSavingFirstTime: null
                        };
                    default:
                        return initState;
                }
            }
        }
        case createProjectActions.CREATE_PROJECT_DRAFT_PROJECT_CHANGED:
            return {
                ...state,
                projectEdited: JSON.parse(JSON.stringify(action.projectChanged))
            }
        default:
            return state;
    }
}

export default createProjectReducer;