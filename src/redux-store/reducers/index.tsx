import {combineReducers} from "redux";
import authReducer from './authReducer';
import createBusinessProfileReducer from './createBusinessProfileReducer';
import editUserReducer from './editUserReducer';
import editImageReducer from './editImageReducer';
import editVideoReducer from './editVideoReducer';
import uploadFilesReducer from './uploadFilesReducer';
import uploadingStatusReducer from './uploadingStatusReducer';
import changePasswordReducer from './changePasswordReducer';
import clubAttributesReducer from './clubAttributesReducer';
import forumsReducer from './forumsReducer';
import notificationsReducer from './notificationsReducer';
import dashboardSidebarReducer from './dashboardSidebarReducer';
import mediaQueryReducer, {MediaQueryState} from './mediaQueryReducer';
import superAdminSettingsReducer from './superAdminSettingsReducer';
import groupAdminSettingsReducer from './groupAdminSettingsReducer';
import legalDocumentsReducer from './legalDocumentsReducer';
import invitedUsersReducer from './invitedUsersReducer';
import invitationDialogReducer from './invitationDialogReducer';
import addAngelNetworkDialogReducer from './addAngelNetworkDialogReducer';
import manageGroupFromParamsReducer from './manageGroupFromParamsReducer';
import angelNetworksReducer from './angelNetworksReducer';
import manageJoinRequestsReducer from './manageJoinRequestsReducer';
import pledgesTableReducer from './pledgesTableReducer';
import feedbackSnackbarReducer from './feedbackSnackbarReducer';
import activitiesTableReducer from './activitiesTableReducer';
import manageJSONCompareChangesDialogReducer from './manageJSONCompareChangesDialogReducer';
import groupAdminsTableReducer from './groupAdminsTableReducer';
import createPledgeDialogReducer from './createPledgeDialogReducer';
import selectProjectVisibilityReducer from './selectProjectVisiblityReducer';
import manageSystemGroupsReducer from './manageSystemGroupsReducer';
import manageMarketingPreferencesReducer from './manageMarketingPreferencesReducer';
import createProjectReducer from './createProjectReducer';
import manageGroupUrlReducer, {ManageGroupUrlState} from "./manageGroupUrlReducer";
import signInReducer, {SignInState} from "../../pages/signin/SignInReducer";
import authenticationReducer, {AuthenticationState} from "./authenticationReducer";
import manageSystemAttributesReducer, {ManageSystemAttributesState} from "./manageSystemAttributesReducer";
import exploreOffersReducer, {ExploreOffersState} from "../../shared-components/explore-offers/ExploreOffersReducer";
import offersTableReducer, {OffersTableStates} from "../../shared-components/offers-table/OffersTableReducer";
import {ExploreGroupsState} from "../../shared-components/explore-groups/ExploreGroupsReducer";
import newExploreGroupsReducer from "../../shared-components/explore-groups/ExploreGroupsReducer";
import groupDetailsReducer, {GroupDetailsState} from "../../pages/group-details/GroupDetailsReducer";
import manageSystemIdleTimeReducer, {ManageSystemIdleTimeState} from "./manageSystemIdleTimeReducer";
import resetPasswordReducer, {ResetPasswordState} from "../../pages/reset-password/ResetPasswordReducer";
import resourcesReducer, {ResourcesState} from "../../pages/resources/ResourcesReducer";
import feedbackSnackbarReducerNew, {FeedbackSnackbarState} from "../../shared-components/feedback-snackbar/FeedbackSnackbarReducer";
import documentsDownloadReducer, {DocumentsDownloadState} from "../../shared-components/documents-download/DocumentsDownloadReducer";
import contactPitchOwnerDialogReducer, {ContactPitchOwnerDialogState} from "../../pages/project-details/components/contact-pitch-owner-dialog/ContactPitchOwnerDialogReducer";
import profileReducer, {ProfileState} from "../../shared-components/profile/ProfileReducer";
import signUpReducer, {SignUpState} from "../../pages/signup/SignUpReducer";
import manageSectorsReducer, {ManageSectorsState} from "../../pages/admin/components/manage-sectors/ManageSectorsReducer";
import manageCoursesReducer, {ManageCoursesState} from "../../pages/admin/components/manage-courses/ManageCoursesReducer";

export interface AppState {
    MediaQueryState: MediaQueryState;
    ManageSystemIdleTimeState: ManageSystemIdleTimeState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    ManageSystemAttributesState: ManageSystemAttributesState;

    SignInLocalState: SignInState;
    SignUpLocalState: SignUpState;
    ExploreOffersLocalState: ExploreOffersState;
    OffersTableLocalState: OffersTableStates;
    ExploreGroupsLocalState: ExploreGroupsState;
    GroupDetailsLocalState: GroupDetailsState;
    ResetPasswordLocalState: ResetPasswordState;
    ResourcesLocalState: ResourcesState;

    FeedbackSnackbarLocalState: FeedbackSnackbarState;
    DocumentsDownloadLocalState: DocumentsDownloadState;
    ContactPitchOwnerDialogLocalState: ContactPitchOwnerDialogState;

    ManageSectorsLocalState: ManageSectorsState;
    ManageCoursesLocalState: ManageCoursesState;

    ProfileLocalState: ProfileState;

    // mitigation plan for the old states of old reducers
    [oldReducers: string]: any;
}

const rootReducer = combineReducers<AppState>({
    MediaQueryState: mediaQueryReducer,
    ManageSystemIdleTimeState: manageSystemIdleTimeReducer,
    ManageGroupUrlState: manageGroupUrlReducer,
    AuthenticationState: authenticationReducer,
    ManageSystemAttributesState: manageSystemAttributesReducer,

    SignInLocalState: signInReducer,
    SignUpLocalState: signUpReducer,
    ExploreOffersLocalState: exploreOffersReducer,
    OffersTableLocalState: offersTableReducer,
    ExploreGroupsLocalState: newExploreGroupsReducer,
    GroupDetailsLocalState: groupDetailsReducer,
    ResetPasswordLocalState: resetPasswordReducer,
    ResourcesLocalState: resourcesReducer,

    FeedbackSnackbarLocalState: feedbackSnackbarReducerNew,
    DocumentsDownloadLocalState: documentsDownloadReducer,
    ContactPitchOwnerDialogLocalState: contactPitchOwnerDialogReducer,

    ManageSectorsLocalState: manageSectorsReducer,
    ManageCoursesLocalState: manageCoursesReducer,

    ProfileLocalState: profileReducer,

    // Old reducers --------------------------
    auth: authReducer,
    createBusinessProfile: createBusinessProfileReducer,
    editUser: editUserReducer,
    editImage: editImageReducer,
    editVideo: editVideoReducer,
    uploadFiles: uploadFilesReducer,
    uploadingStatus: uploadingStatusReducer,
    changePassword: changePasswordReducer,
    manageClubAttributes: clubAttributesReducer,
    manageForums: forumsReducer,
    manageNotifications: notificationsReducer,
    dashboardSidebar: dashboardSidebarReducer,
    superAdminSettings: superAdminSettingsReducer,
    groupAdminSettings: groupAdminSettingsReducer,
    legalDocuments: legalDocumentsReducer,
    invitedUsers: invitedUsersReducer,
    manageInvitationDialog: invitationDialogReducer,
    manageAddAngelNetworkDialog: addAngelNetworkDialogReducer,
    manageGroupFromParams: manageGroupFromParamsReducer,
    manageAngelNetworks: angelNetworksReducer,
    manageJoinRequests: manageJoinRequestsReducer,
    managePledgesTable: pledgesTableReducer,
    manageFeedbackSnackbar: feedbackSnackbarReducer,
    manageActivitiesTable: activitiesTableReducer,
    manageJSONCompareChangesDialog: manageJSONCompareChangesDialogReducer,
    manageGroupAdminsTable: groupAdminsTableReducer,
    manageCreatePledgeDialog: createPledgeDialogReducer,
    manageSelectProjectVisibility: selectProjectVisibilityReducer,
    manageSystemGroups: manageSystemGroupsReducer,
    manageMarketingPreferences: manageMarketingPreferencesReducer,
    manageCreateProject: createProjectReducer,
});

export default rootReducer;