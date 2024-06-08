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

        // pitch sector
        pitchSector: '-',
        // pitch project name
        pitchProjectName: '',
        pitchProjectDescription: '',
        pitchExpiredDate: null,

        pitchAmountRaisedToDate: '',
        pitchRaiseRequired: '',
        pitchPostMoneyValuation: '',
        pitchInvestorsCommitted: '',

        hasRaisedMoneyBefore: '',

        hasEIS: '',
        hasSEIS: '',

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
                                // pitch sector
                                pitchSector:
                                    project.hasOwnProperty('sector')
                                        ?
                                        project.sector
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
                                hasEIS: project.hasOwnProperty('hasEIS') ? project.hasEIS : false,
                                hasSEIS: project.hasOwnProperty('hasSEIS') ? project.hasSEIS : false,
                                pitchExpiredDate:
                                    project.Pitch.hasOwnProperty('expiredDate')
                                        ?
                                        project.Pitch.expiredDate
                                        :
                                        null
                                ,
                                pitchAmountRaisedToDate:
                                    project.Pitch.hasOwnProperty('amountRaised')
                                        ?
                                        Number(project.Pitch.amountRaised.toFixed(2)).toLocaleString()
                                        :
                                        ''
                                ,
                                pitchRaiseRequired:
                                    project.Pitch.hasOwnProperty('fundRequired')
                                        ?
                                        Number(project.Pitch.fundRequired.toFixed(2)).toLocaleString()
                                        :
                                        ''
                                ,
                                pitchPostMoneyValuation:
                                    project.Pitch.hasOwnProperty('postMoneyValuation')
                                        ?
                                        Number(project.Pitch.postMoneyValuation.toFixed(2)).toLocaleString()
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

                                hasRaisedMoneyBefore:
                                    project.Pitch.hasOwnProperty('amountRaised')
                                        ?
                                        (
                                            project.Pitch.amountRaised > 0
                                                ?
                                                "true"
                                                :
                                                "false"
                                        )
                                        :
                                        ''
                                ,

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