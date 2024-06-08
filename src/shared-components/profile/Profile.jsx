import React, {Component} from 'react';
import FlexView from 'react-flexview';
import {css, StyleSheet} from 'aphrodite';
import {
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    FormLabel,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemSecondaryAction,
    ListItemText,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import InfoIcon from '@material-ui/icons/Info';
import SearchIcon from '@material-ui/icons/Search';
import CloseIcon from '@material-ui/icons/Close';
import PublicIcon from '@material-ui/icons/Public';
import {Col, Container, Image, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import ReactPlayer from 'react-player';

import LetterAvatar from './LetterAvatar';
import ActivitiesTable from '../activities-components/ActivitiesTable';

import * as colors from '../../values/colors';
import * as DB_CONST from '../../firebase/databaseConsts';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';
import Routes from '../../router/routes';

import {connect} from 'react-redux';
import * as createBusinessProfileActions from '../../redux-store/actions/createBusinessProfileActions';
import * as editUserActions from '../../redux-store/actions/editUserActions';
import * as editImageActions from '../../redux-store/actions/editImageActions';
import * as editVideoActions from '../../redux-store/actions/editVideoActions';
import * as uploadFilesActions from '../../redux-store/actions/uploadFilesActions';
import * as legalDocumentsActions from '../../redux-store/actions/legalDocumentsActions';

import {
    UPLOAD_LOGO_FIRST_TIME_MODE,
    UPLOAD_LOGO_MODE,
    UPLOAD_PROFILE_PICTURE_MODE,
    UPLOAD_VIDEO_FIRST_TIME_MODE,
    UPLOAD_VIDEO_MODE
} from '../uploading-dialog/UploadingDialog';
import {HashLoader} from 'react-spinners';
import OffersTable from "../offers-table/OffersTable";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Footer from "../footer/Footer";

const mapStateToProps = state => {
    return {
        // -- old states -----------------------------------------------------------------------------------------------
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,

        currentUser: state.auth.user,

        clubAttributes: state.manageClubAttributes.clubAttributes,

        // Create new business profile state ----------------------------------------------------------------------------
        createBusinessProfile: state.createBusinessProfile,
        //--------------------------------------------------------------------------------------------------------------

        // Edit user's profile state ------------------------------------------------------------------------------------
        originalUser: state.editUser.originalUser,
        userEdited: state.editUser.userEdited,
        allowEditing: state.editUser.allowEditing,
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------

        // User's legal documents (for issuer only) --------------------------------------------------------------------
        legalDocuments_userID: state.legalDocuments.userID,
        userLegalDocuments: state.legalDocuments.legalDocuments,
        userLegalDocumentsLoaded: state.legalDocuments.legalDocumentsLoaded,
        userLegalDocumentsBeingLoaded: state.legalDocuments.legalDocumentsBeingLoaded,
        //--------------------------------------------------------------------------------------------------------------

        // Upload documents state --------------------------------------------------------------------------------------
        toBeUploadedLegalDocuments: state.uploadFiles.filesToBeUploaded.legalDocuments,
        fileUploadErrorMessage: state.uploadFiles.fileUploadErrorMessage,
        fileUploadErrorSnackbarOpen: state.uploadFiles.fileUploadErrorSnackbarOpen,
        //--------------------------------------------------------------------------------------------------------------

        // These states can be also be used when creating business profile ***********
        addNewDirector: state.editUser.addNewDirector,
        newDirectorText: state.editUser.newDirectorText
        //***************************************************************************
        //--------------------------------------------------------------------------------------------------------------
    }
};

const mapDispatchToProps = dispatch => {
    return {
        // Create new business profile functions ------------------------------------------------------------------------
        handleCreateBusinessProfileTextChanged: (fieldType, event) => dispatch(createBusinessProfileActions.handleTextChanged(fieldType, event)),
        searchAddress: (mode) => dispatch(createBusinessProfileActions.searchAddresses(mode)),
        toggleEnterAddressManually: (field) => dispatch(createBusinessProfileActions.toggleEnterAddressManually(field)),
        toggleTradingAddressSameAsRegisteredOffice: (checked) => dispatch(createBusinessProfileActions.toggleTradingAddressSameAsRegisteredOffice(checked)),
        resetCreatingBusinessProfile: () => dispatch(createBusinessProfileActions.clearAllFields()),
        handleRecommendedAddressSelected: (field, index) => dispatch(createBusinessProfileActions.handleRecommendedAddressSelected(field, index)),
        toggleExpandBusinessProfileFillingForInvestor: () => dispatch(createBusinessProfileActions.toggleExpandBusinessProfileFillingForInvestor()),
        uploadBusinessProfile: () => dispatch(createBusinessProfileActions.uploadBusinessProfile()),
        //--------------------------------------------------------------------------------------------------------------

        // Edit user's profile functions --------------------------------------------------------------------------------
        editUserLocally: (type, edit) => dispatch(editUserActions.editUserLocally(type, edit)),
        toggleAddNewDirector: () => dispatch(editUserActions.toggleAddNewDirector()),
        addNewDirectorTemporarily: (isEditingExistingBusinessProfile) => dispatch(editUserActions.addNewDirectorTemporarily(isEditingExistingBusinessProfile)),
        deleteDirectorTemporarily: (index, isEditingExistingBusinessProfile) => dispatch(editUserActions.deleteDirectorTemporarily(index, isEditingExistingBusinessProfile)),
        cancelEditingUser: (type) => dispatch(editUserActions.cancelEditingUser(type)),
        commitUserProfileChanges: (type) => dispatch(editUserActions.commitUserProfileChanges(type)),
        //--------------------------------------------------------------------------------------------------------------

        //--------------------------------------------------------------------------------------------------------------

        // User's legal documents functions ----------------------------------------------------------------------------
        legalDocuments_setUserID: (userID) => dispatch(legalDocumentsActions.setUserID(userID)),
        getUserLegalDocuments: () => dispatch(legalDocumentsActions.getLegalDocuments()),
        startListeningForLegalDocumentsChanged: () => dispatch(legalDocumentsActions.startListeningForLegalDocumentsChanged()),
        stopListeningForLegalDocumentsChanged: () => dispatch(legalDocumentsActions.stopListeningForLegalDocumentsChanged()),
        //--------------------------------------------------------------------------------------------------------------

        // Upload documents functions ----------------------------------------------------------------------------------
        handleFilesChanged: (mode, files, user, project) => dispatch(uploadFilesActions.handleFilesChanged(mode, files, user, project)),
        handleFileError: (error, file) => dispatch(uploadFilesActions.handleFileError(error, file)),
        closeFileUploadSnackbarError: () => dispatch(uploadFilesActions.closeErrorSnackbar()),
        resetErrorMessageWhenFileUploadSnackbarExited: () => dispatch(uploadFilesActions.resetErrorMessageWhenSnackbarExited()),
        deleteToBeUploadedFile: (mode, index) => dispatch(uploadFilesActions.deleteToBeUploadedFile(mode, index)),
        deleteUploadedFile: (mode, index, user, project) => dispatch(uploadFilesActions.deleteUploadedFile(mode, index, user, project)),
        uploadFiles: (mode, user, project) => dispatch(uploadFilesActions.uploadFiles(mode, user, project)),
        //--------------------------------------------------------------------------------------------------------------

        // Open edit image dialog --------------------------------------------------------------------------------------
        toggleEditImageDialog: (mode) => dispatch(editImageActions.toggleEditImageDialog(mode)),
        //--------------------------------------------------------------------------------------------------------------

        // Open video image dialog -------------------------------------------------------------------------------------
        toggleEditVideoDialog: (mode) => dispatch(editVideoActions.toggleEditVideoDialog(mode))
        //--------------------------------------------------------------------------------------------------------------
    }
};

class Profile extends Component {

    componentDidMount() {
        this.loadData();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            userLegalDocumentsLoaded,

            startListeningForLegalDocumentsChanged
        } = this.props;

        this.loadData();

        if (userLegalDocumentsLoaded) {
            startListeningForLegalDocumentsChanged();
        }
    }

    componentWillUnmount() {
        const {
            stopListeningForLegalDocumentsChanged
        } = this.props;

        stopListeningForLegalDocumentsChanged();
    }

    /**
     * Load data
     *
     * @returns {null|*}
     */
    loadData = () => {
        const {
            originalUser,

            legalDocuments_userID,
            userLegalDocumentsLoaded,
            userLegalDocumentsBeingLoaded,


            legalDocuments_setUserID,
            getUserLegalDocuments,
        } = this.props;

        // if user has been set
        if (originalUser) {
            // if user id for reference in legal documents has not been set
            if (!legalDocuments_userID && originalUser.type === DB_CONST.TYPE_ISSUER) {
                legalDocuments_setUserID(originalUser.id);
            }

            // if user id for reference in investor self-certification agreement has not been set
        }

        // if user id for reference in legal documents has been set
        if (legalDocuments_userID) {
            // if legal documents for issuer have not been loaded
            if (!userLegalDocumentsLoaded && !userLegalDocumentsBeingLoaded && originalUser.type === DB_CONST.TYPE_ISSUER) {
                getUserLegalDocuments();
            }
        }

    };

    /**
     * Handle text changed when editing user's profile
     */
    handleEditUser = type => event => {
        this.props.editUserLocally(type, {property: event.target.name, value: event.target.value});
    };

    /**
     * Handle text changed when creating a new business profile
     */
    handleCreateBusinessProfileTextChanged = fieldType => event => {
        this.props.handleCreateBusinessProfileTextChanged(fieldType, event);
    };

    /**
     * Handle toggling if trading address is the same of registered office
     */
    toggleTradingAddressSameAsRegisteredOffice = event => {
        this.props.toggleTradingAddressSameAsRegisteredOffice(event.target.checked);
    };

    /**
     * Handle files changed when uploading legal documents
     */
    handleFilesChanged = (mode, user) => files => {
        this.props.handleFilesChanged(mode, files, user, null);
    };

    /**
     * Handle delete a to-be-uploaded file
     *
     * @param mode
     * @returns {Function}
     */
    deleteToBeUploadedFile = mode => index => {
        this.props.deleteToBeUploadedFile(mode, index);
    };

    /**
     * Handle delete an uploaded file
     *
     * @param mode
     * @param user
     * @returns {Function}
     */
    deleteUploadedFile = (mode, user) => index => {
        this.props.deleteUploadedFile(mode, index, user, null);
    };

    /**
     * Handle upload legal documents
     */
    uploadFiles = (mode, user) => {
        this.props.uploadFiles(mode, user, null);
    };

    //----------------------------------------------------------------------------------------------------------

    render() {
        const {
            groupUserName,
            groupPropertiesLoaded,

            currentUser,
            originalUser,
            userEdited,
            allowEditing
        } = this.props;

        if (!groupPropertiesLoaded) {
            return null;
        }

        // these users will be set in the componentDidMount (happens after render) of the main component
        // therefore, without this check it may lead to a crash due to null objects
        if (!currentUser || !originalUser || !userEdited) {
            return null;
        }

        return (
            <Container fluid style={{ padding: 0 }} >
                <Row noGutters style={{ backgroundColor: colors.kick_starter_background_color_1 }} >
                    <Col xs={12} sm={12} md={12} lg={12} style={{ padding: 20 }} >
                        <FlexView hAlignContent="right" vAlignContent="center" >
                            <NavLink
                                to={
                                    groupUserName
                                        ?
                                        ROUTES.USER_PROFILE.replace(":groupUserName", groupUserName).replace(":userID", userEdited.id)
                                        :
                                        ROUTES.USER_PROFILE_INVEST_WEST_SUPER.replace(":userID", userEdited.id)
                                }
                                target={currentUser.id === originalUser.id ? "" : "_blank"}
                                className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                            >
                                <Button className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary" >
                                    <PublicIcon style={{ marginRight: 8 }} />
                                    {
                                        currentUser.type === DB_CONST.TYPE_ADMIN
                                            ?
                                            "View profile"
                                            :
                                            "View my profile"
                                    }
                                </Button>
                            </NavLink>
                            <OverlayTrigger
                                trigger={['hover', 'focus']}
                                placement="bottom"
                                flip
                                overlay={
                                    <Tooltip id={`tooltip-bottom`} >
                                        {
                                            currentUser.type === DB_CONST.TYPE_ADMIN
                                                ?
                                                "See how this student looks to other members. Since you are a group admin, you can see more information about this student than the other ordinary members."
                                                :
                                                "See how you look to other members."
                                        }
                                    </Tooltip>
                                }>
                                <InfoIcon fontSize="small" style={{ marginLeft: 15, color: colors.gray_600 }} />
                            </OverlayTrigger>
                        </FlexView>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12} >
                        <Divider/>
                    </Col>
                </Row>

                {/** Personal details */}
                <Row noGutters style={{ backgroundColor: colors.white }} >
                    <Col xs={12} md={12} lg={12} style={{ padding: 24 }} >
                        <FlexView column >
                            <Typography variant="h6" color="primary" >Personal details</Typography>

                            <Row noGutters style={{ marginTop: 20 }} >
                                {/** Profile picture */}
                                <Col xs={12} sm={12} md={6} lg={4} >
                                    <FlexView column hAlignContent="center" style={{ padding: 10 }} >
                                        {
                                            !originalUser.profilePicture
                                            || (
                                                originalUser.profilePicture
                                                && originalUser.profilePicture.findIndex(profilePicture => !profilePicture.hasOwnProperty('removed')) === -1
                                            )
                                                ?
                                                <LetterAvatar firstName={originalUser.firstName} lastName={originalUser.lastName} width={196} height={196} textVariant="h5" />
                                                :
                                                <FlexView width={256} height={256} >
                                                    <Image
                                                        roundedCircle
                                                        thumbnail
                                                        src={
                                                            originalUser.profilePicture[
                                                                originalUser.profilePicture.findIndex(profilePicture => !profilePicture.hasOwnProperty('removed'))
                                                                ].url
                                                        }
                                                        style={{ width: "100%", maxHeight: 256, objectFit: "contain" }}
                                                    />
                                                </FlexView>
                                        }
                                        {
                                            currentUser.type === DB_CONST.TYPE_ADMIN
                                                ?
                                                null
                                                :
                                                <FlexView marginTop={20} marginBottom={20} >
                                                    <Button size="small" className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary" onClick={() => this.props.toggleEditImageDialog(UPLOAD_PROFILE_PICTURE_MODE)} style={{ width: 256 }} >Update profile picture</Button>
                                                </FlexView>
                                        }
                                    </FlexView>
                                </Col>
                                {/** Personal info */}
                                <Col xs={12} sm={12} md={6} lg={8} >
                                    <Row>
                                        {/** Title */}
                                        <Col xs={12} md={12} lg={{span: 6, order: 1}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>Title</b></FormLabel>
                                                <Select name="title" value={userEdited.title} onChange={this.handleEditUser(editUserActions.EDIT_PERSONAL_INFORMATION)} input={ <OutlinedInput/> } margin="dense" >
                                                    {
                                                        DB_CONST.USER_TITLES.map((title, index) => (
                                                            <MenuItem key={index} value={title}>{title}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
                                        </Col>

                                        {/** Empty column to reserve empty space */}
                                        <Col xs={12} sm={12} md={6} lg={{span: 6, order: 2}} >
                                            {/** Empty column to reserve empty space */}
                                        </Col>

                                        {/** Divider */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 3}} >
                                            <Divider style={{ marginTop: 10, marginBottom: 20 }} />
                                        </Col>

                                        {/** First name */}
                                        <Col xs={12} sm={12} md={6} lg={{span: 6, order: 4}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>First name</b></FormLabel>
                                                <TextField name="firstName" placeholder="Enter first name" value={userEdited.firstName} margin="dense" variant="outlined" onChange={this.handleEditUser(editUserActions.EDIT_PERSONAL_INFORMATION)} error={userEdited.firstName.trim().length === 0} />
                                            </FormControl>
                                        </Col>

                                        {/** Last name */}
                                        <Col xs={12} sm={12} md={6} lg={{span: 6, order: 5}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>Last name</b></FormLabel>
                                                <TextField name="lastName" placeholder="Enter last name" value={userEdited.lastName} margin="dense" variant="outlined" onChange={this.handleEditUser(editUserActions.EDIT_PERSONAL_INFORMATION)} error={userEdited.lastName.trim().length === 0} />
                                            </FormControl>
                                        </Col>

                                        {/** Divider */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 6}} >
                                            <Divider style={{ marginTop: 10, marginBottom: 20 }} />
                                        </Col>

                                        {/** Email */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 7}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>Email</b></FormLabel>
                                                <TextField
                                                    name="email"
                                                    placeholder="Enter email"
                                                    value={userEdited.email}
                                                    margin="dense"
                                                    variant="outlined"
                                                    onChange={this.handleEditUser(editUserActions.EDIT_PERSONAL_INFORMATION)}
                                                    disabled={true} // --> do not allow the users (including the admins) to change the email field for now.
                                                    error={userEdited.email.trim().length === 0}
                                                />
                                            </FormControl>
                                        </Col>

                                        {/** Divider */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 7}} >
                                            <Divider style={{ marginTop: 10, marginBottom: 20 }} />
                                        </Col>

                                        {/** LinkedIn */}
                                        <Col xs={12} sm={12} md={12} lg={{span: 12, order: 8}} style={{ marginBottom: 20 }} >
                                            <FormControl fullWidth >
                                                <FormLabel><b>LinkedIn</b></FormLabel>
                                                <TextField
                                                    name="linkedin"
                                                    placeholder="Enter your LinkedIn profile"
                                                    value={userEdited.hasOwnProperty('linkedin') ? userEdited.linkedin : ''}
                                                    margin="dense"
                                                    variant="outlined"
                                                    onChange={this.handleEditUser(editUserActions.EDIT_PERSONAL_INFORMATION)}
                                                    error={!utils.isValidLinkedInURL(userEdited.linkedin)}
                                                />
                                            </FormControl>
                                            {
                                                utils.isValidLinkedInURL(userEdited.linkedin)
                                                    ?
                                                    null
                                                    :
                                                    <FormHelperText className={css(sharedStyles.error_text)} >Invalid LinkedIn URL</FormHelperText>
                                            }
                                        </Col>
                                    </Row>

                                    <FlexView hAlignContent="right" marginTop={30} >
                                        <FlexView marginRight={20} >
                                            <Button variant="outlined" color="primary" onClick={() => this.props.cancelEditingUser(editUserActions.RESET_PERSONAL_INFORMATION)} >Cancel</Button>
                                        </FlexView>
                                        <FlexView>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                disabled={
                                                    (
                                                        currentUser.type === DB_CONST.TYPE_ADMIN
                                                        && !currentUser.superAdmin
                                                        && !allowEditing
                                                    )
                                                    ||
                                                    userEdited.firstName.trim().length === 0
                                                    || userEdited.lastName.trim().length === 0
                                                    ||
                                                    (
                                                        userEdited.title === originalUser.title
                                                        && userEdited.firstName === originalUser.firstName
                                                        && userEdited.lastName === originalUser.lastName
                                                        && userEdited.email === originalUser.email
                                                        && (
                                                            (originalUser.linkedin && userEdited.linkedin && userEdited.linkedin === originalUser.linkedin)
                                                            ||
                                                            (!userEdited.linkedin && !originalUser.linkedin)
                                                            ||
                                                            (userEdited.linkedin && !originalUser.linkedin && !utils.isValidLinkedInURL(userEdited.linkedin))
                                                            ||
                                                            (userEdited.linkedin && originalUser.linkedin && !utils.isValidLinkedInURL(userEdited.linkedin))
                                                        )
                                                    )
                                                }
                                                onClick={() => this.props.commitUserProfileChanges(editUserActions.COMMIT_PERSONAL_INFORMATION_CHANGES)}
                                            >
                                                Save
                                            </Button>
                                        </FlexView>
                                    </FlexView>
                                    {
                                        currentUser.type === DB_CONST.TYPE_ADMIN
                                        && !currentUser.superAdmin
                                        && !allowEditing
                                            ?
                                            <Typography variant="body1" color="error" align="right" style={{ marginTop: 25 }} >This student is not a home member of your course. So, you cannot edit their profile.</Typography>
                                            :
                                            null
                                    }
                                </Col>
                            </Row>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12} style={{ marginTop: 20 }} >
                        <Divider/>
                    </Col>
                </Row>

                {/** Business profile */}
                <Row noGutters style={{ backgroundColor: colors.kick_starter_background_color_1 }} >
                    <Col xs={12} md={12} lg={12} style={{ padding: 24 }} >
                        {
                            this.renderBusinessProfile()
                        }
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12} >
                        <Divider/>
                    </Col>
                </Row>

                {/** Fundraising summary - only available for super user who is viewing the profile of an issuer or an investor */}
                {
                    currentUser.type !== DB_CONST.TYPE_ADMIN
                        ?
                        null
                        :
                        <Row noGutters style={{ backgroundColor: colors.kick_starter_background_color_1 }} >
                            {
                                originalUser.type !== DB_CONST.TYPE_ISSUER
                                    ?
                                    null
                                    :
                                    <Col xs={12} md={12} lg={12} style={{ padding: 24 }} >
                                        <FlexView column >
                                            <Typography variant="h6" color="primary" >Fundraising summary</Typography>

                                            <FlexView column marginTop={20} >
                                                <OffersTable directTableUser={originalUser} />
                                            </FlexView>
                                        </FlexView>
                                    </Col>
                            }

                            {
                                originalUser.type !== DB_CONST.TYPE_ISSUER
                                    ?
                                    null
                                    :
                                    <Col xs={12} md={12} lg={12} style={{ marginTop: 20 }} >
                                        <Divider/>
                                    </Col>
                            }
                        </Row>
                }

                {/** User's activities - only available for admins */}
                {
                    currentUser.type !== DB_CONST.TYPE_ADMIN
                        ?
                        null
                        :
                        <Row noGutters style={{ backgroundColor: colors.kick_starter_background_color_1 }} >
                            <Col xs={12} md={12} lg={12} style={{ padding: 24 }} >
                                <FlexView column >
                                    <Typography variant="h6" color="primary" >Student activities</Typography>
                                </FlexView>

                                <FlexView column marginTop={20} >
                                    <ActivitiesTable/>
                                </FlexView>
                            </Col>
                        </Row>
                }

                <Row noGutters >
                    <Col xs={12} sm={12} md={12} lg={12} >
                        <Footer position="relative" />
                    </Col>
                </Row>
            </Container>
        );
    }

    /**
     * Render business profile section
     *
     * @returns {*}
     */
    renderBusinessProfile = () => {
        const {
            currentUser,

            originalUser,
            userEdited,
            allowEditing,

            clubAttributes,

            createBusinessProfile,
            addNewDirector,
            newDirectorText,

            searchAddress,
            toggleEnterAddressManually,
            resetCreatingBusinessProfile,
            handleRecommendedAddressSelected,
            toggleExpandBusinessProfileFillingForInvestor,
            uploadBusinessProfile
        } = this.props;

        // user has already uploaded their business profile
        if (originalUser.BusinessProfile) {
            return (
                /** Business profile has been uploaded */
                <FlexView column >
                    <Typography variant="h6" color="primary">Business profile</Typography>
                    <Row noGutters style={{ marginTop: 20 }} >
                        <Col xs={12} sm={12} md={6} lg={4} style={{ padding: 10, width: "100%" }} >
                            <FlexView column hAlignContent="center" >
                                <FlexView column width="100%" hAlignContent="center" >
                                    {
                                        !originalUser.BusinessProfile.hasOwnProperty('logo')
                                        || (
                                            originalUser.BusinessProfile.hasOwnProperty('logo')
                                            && originalUser.BusinessProfile.logo.findIndex(logoItem => !logoItem.hasOwnProperty('removed')) === -1
                                        )
                                            ?
                                            <Typography
                                                align="center"
                                                color="textSecondary"
                                                variant="body1">
                                                {
                                                    currentUser.type !== DB_CONST.TYPE_ADMIN
                                                        ?
                                                        "You haven't uploaded your company logo"
                                                        :
                                                        "This user hasn't uploaded company logo"
                                                }
                                            </Typography>
                                            :
                                            <FlexView width={256} height={256} >
                                                <Image
                                                    roundedCircle
                                                    thumbnail
                                                    src={
                                                        originalUser.BusinessProfile.logo[originalUser.BusinessProfile.logo.findIndex(logoItem => !logoItem.hasOwnProperty('removed'))].url
                                                    }
                                                    style={{ width: "100%", maxHeight: 256, objectFit: "contain" }}
                                                />
                                            </FlexView>
                                    }
                                    {
                                        currentUser.type === DB_CONST.TYPE_ADMIN
                                            ?
                                            null
                                            :
                                            <FlexView marginTop={20} >
                                                <Button
                                                    size="small"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    variant="outlined"
                                                    color="primary"
                                                    fullWidth
                                                    onClick={() => this.props.toggleEditImageDialog(UPLOAD_LOGO_MODE)}
                                                    style={{ width: 256 }}
                                                >Update logo
                                                </Button>
                                            </FlexView>
                                    }
                                </FlexView>

                                <FlexView column marginTop={80} marginBottom={20} width="100%" hAlignContent="center" style={{ paddingLeft: 25, paddingRight: 25 }} >
                                    {
                                        !originalUser.BusinessProfile.hasOwnProperty('video')
                                        || (
                                            originalUser.BusinessProfile.hasOwnProperty('video')
                                            && originalUser.BusinessProfile.video.findIndex(videoItem => !videoItem.hasOwnProperty('removed')) === -1
                                        )
                                            ?
                                            <Typography
                                                align="center"
                                                color="textSecondary"
                                                variant="body1">
                                                {
                                                    currentUser.type !== DB_CONST.TYPE_ADMIN
                                                        ?
                                                        "You have no introduction video"
                                                        :
                                                        "This user has no introduction video"
                                                }
                                            </Typography>
                                            :
                                            <ReactPlayer
                                                url={
                                                    originalUser.BusinessProfile.video[
                                                        originalUser.BusinessProfile.video.findIndex(videoItem => !videoItem.hasOwnProperty('removed'))
                                                        ].url
                                                }
                                                width="100%"
                                                height="100%"
                                                controls={true}
                                                playing={false}
                                            />
                                    }

                                    {
                                        currentUser.type === DB_CONST.TYPE_ADMIN
                                            ?
                                            null
                                            :
                                            <FlexView marginTop={20}>
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    color="primary"
                                                    onClick={() => this.props.toggleEditVideoDialog(UPLOAD_VIDEO_MODE)}
                                                    style={{ width: 256 }}
                                                >Update introduction video
                                                </Button>
                                            </FlexView>
                                    }
                                </FlexView>
                            </FlexView>
                        </Col>
                        <Col xs={12} sm={12} md={6} lg={8} >
                            {/** Company name */}
                            <FlexView column>
                                <FormControl>
                                    <FormLabel><b>Company name</b></FormLabel>
                                    <TextField
                                        name="companyName"
                                        placeholder="Enter company name"
                                        value={userEdited.BusinessProfile.hasOwnProperty('companyName') ? userEdited.BusinessProfile.companyName : ''}
                                        margin="dense"
                                        variant="outlined"
                                        fullWidth
                                        onChange={this.handleEditUser(editUserActions.EDIT_ORDINARY_BUSINESS_PROFILE_INFORMATION)}
                                        error={userEdited.BusinessProfile.hasOwnProperty('companyName') && userEdited.BusinessProfile.companyName.trim().length === 0}
                                    />
                                </FormControl>
                            </FlexView>

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                            {/** Registration number */}
                            <FlexView column >
                                <FormControl>
                                    <FormLabel><b>Registration number</b></FormLabel>
                                    <TextField
                                        name="registrationNo"
                                        placeholder="Enter company registration number"
                                        value={userEdited.BusinessProfile.hasOwnProperty('registrationNo') ? userEdited.BusinessProfile.registrationNo : ''}
                                        margin="dense"
                                        variant="outlined"
                                        disabled={currentUser.type !== DB_CONST.TYPE_ADMIN}
                                        fullWidth
                                        onChange={this.handleEditUser(editUserActions.EDIT_ORDINARY_BUSINESS_PROFILE_INFORMATION)}
                                    />
                                </FormControl>
                            </FlexView>

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                            {/** Registered office */}
                            <FlexView column>
                                <FormControl>
                                    <FormLabel><b>Registered office</b></FormLabel>
                                    <FormGroup>
                                        <FlexView column>
                                            <TextField
                                                name="address1"
                                                placeholder="Address 1"
                                                value={
                                                    userEdited.BusinessProfile.hasOwnProperty('registeredOffice')
                                                        ?
                                                        userEdited.BusinessProfile.registeredOffice.address1
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditUser(editUserActions.EDIT_REGISTERED_OFFICE_BUSINESS_PROFILE)}
                                                error={
                                                    userEdited.BusinessProfile.hasOwnProperty('registeredOffice')
                                                    && userEdited.BusinessProfile.registeredOffice.address1.trim().length === 0
                                                }
                                            />
                                            <TextField
                                                name="address2"
                                                placeholder="Address 2"
                                                value={
                                                    userEdited.BusinessProfile.hasOwnProperty('registeredOffice')
                                                        ?
                                                        userEdited.BusinessProfile.registeredOffice.address2
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditUser(editUserActions.EDIT_REGISTERED_OFFICE_BUSINESS_PROFILE)}
                                            />
                                            <TextField
                                                name="address3"
                                                placeholder="Address 3"
                                                value={
                                                    userEdited.BusinessProfile.hasOwnProperty('registeredOffice')
                                                        ?
                                                        userEdited.BusinessProfile.registeredOffice.address3
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditUser(editUserActions.EDIT_REGISTERED_OFFICE_BUSINESS_PROFILE)}
                                            />
                                            <Row>
                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    <TextField
                                                        name="townCity"
                                                        placeholder="Town/City"
                                                        value={
                                                            userEdited.BusinessProfile.hasOwnProperty('registeredOffice')
                                                                ?
                                                                userEdited.BusinessProfile.registeredOffice.townCity
                                                                :
                                                                ''
                                                        }
                                                        margin="dense"
                                                        variant="outlined"
                                                        fullWidth
                                                        onChange={this.handleEditUser(editUserActions.EDIT_REGISTERED_OFFICE_BUSINESS_PROFILE)}
                                                        error={
                                                            userEdited.BusinessProfile.hasOwnProperty('registeredOffice')
                                                            && userEdited.BusinessProfile.registeredOffice.townCity.trim().length === 0
                                                        }
                                                    />
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    <TextField
                                                        name="postcode"
                                                        placeholder="Postcode"
                                                        value={
                                                            userEdited.BusinessProfile.hasOwnProperty('registeredOffice')
                                                                ?
                                                                userEdited.BusinessProfile.registeredOffice.postcode.toUpperCase()
                                                                :
                                                                ''
                                                        }
                                                        margin="dense"
                                                        variant="outlined"
                                                        fullWidth
                                                        onChange={this.handleEditUser(editUserActions.EDIT_REGISTERED_OFFICE_BUSINESS_PROFILE)}
                                                        error={
                                                            userEdited.BusinessProfile.hasOwnProperty('registeredOffice')
                                                            && userEdited.BusinessProfile.registeredOffice.postcode.trim().length === 0
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </FlexView>
                                    </FormGroup>
                                </FormControl>
                            </FlexView>

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                            {/** Trading address */}
                            <FlexView column>
                                <FormControl>
                                    <FormLabel><b>Trading address</b></FormLabel>
                                    <FormGroup>
                                        <FlexView column>
                                            <TextField
                                                name="address1"
                                                placeholder="Address 1"
                                                value={
                                                    userEdited.BusinessProfile.hasOwnProperty('tradingAddress')
                                                        ?
                                                        userEdited.BusinessProfile.tradingAddress.address1
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditUser(editUserActions.EDIT_TRADING_ADDRESS_BUSINESS_PROFILE)}
                                                error={
                                                    userEdited.BusinessProfile.hasOwnProperty('tradingAddress')
                                                    && userEdited.BusinessProfile.tradingAddress.address1.trim().length === 0
                                                }
                                            />
                                            <TextField
                                                name="address2"
                                                placeholder="Address 2"
                                                value={
                                                    userEdited.BusinessProfile.hasOwnProperty('tradingAddress')
                                                        ?
                                                        userEdited.BusinessProfile.tradingAddress.address2
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditUser(editUserActions.EDIT_TRADING_ADDRESS_BUSINESS_PROFILE)}
                                            />
                                            <TextField
                                                name="address3"
                                                placeholder="Address 3"
                                                value={
                                                    userEdited.BusinessProfile.hasOwnProperty('tradingAddress')
                                                        ?
                                                        userEdited.BusinessProfile.tradingAddress.address3
                                                        :
                                                        ''
                                                }
                                                margin="dense"
                                                variant="outlined"
                                                fullWidth
                                                onChange={this.handleEditUser(editUserActions.EDIT_TRADING_ADDRESS_BUSINESS_PROFILE)}
                                            />
                                            <Row>
                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    <TextField
                                                        name="townCity"
                                                        placeholder="Town/City"
                                                        value={
                                                            userEdited.BusinessProfile.hasOwnProperty('tradingAddress')
                                                                ?
                                                                userEdited.BusinessProfile.tradingAddress.townCity
                                                                :
                                                                ''
                                                        }
                                                        margin="dense"
                                                        variant="outlined"
                                                        fullWidth
                                                        onChange={this.handleEditUser(editUserActions.EDIT_TRADING_ADDRESS_BUSINESS_PROFILE)}
                                                        error={
                                                            userEdited.BusinessProfile.hasOwnProperty('tradingAddress')
                                                            && userEdited.BusinessProfile.tradingAddress.townCity.trim().length === 0
                                                        }
                                                    />
                                                </Col>
                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    <TextField
                                                        name="postcode"
                                                        placeholder="Postcode"
                                                        value={
                                                            userEdited.BusinessProfile.hasOwnProperty('tradingAddress')
                                                                ?
                                                                userEdited.BusinessProfile.tradingAddress.postcode.toUpperCase()
                                                                :
                                                                ''
                                                        }
                                                        margin="dense"
                                                        variant="outlined"
                                                        fullWidth
                                                        onChange={this.handleEditUser(editUserActions.EDIT_TRADING_ADDRESS_BUSINESS_PROFILE)}
                                                        error={
                                                            userEdited.BusinessProfile.hasOwnProperty('tradingAddress')
                                                            && userEdited.BusinessProfile.tradingAddress.postcode.trim().length === 0
                                                        }
                                                    />
                                                </Col>
                                            </Row>
                                        </FlexView>
                                    </FormGroup>
                                </FormControl>
                            </FlexView>

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                            {
                                !clubAttributes
                                    ?
                                    null
                                    :
                                    (
                                        <FlexView>
                                            <FormControl fullWidth >
                                                <FormLabel><b>Sector</b></FormLabel>
                                                <Select
                                                    name="sector"
                                                    value={
                                                        userEdited.BusinessProfile.hasOwnProperty('sector')
                                                            ?
                                                            userEdited.BusinessProfile.sector
                                                            :
                                                            ''
                                                    }
                                                    onChange={this.handleEditUser(editUserActions.EDIT_ORDINARY_BUSINESS_PROFILE_INFORMATION)}
                                                    input={<OutlinedInput/>}
                                                    margin="dense"
                                                >

                                                    {
                                                        clubAttributes.Sectors.map((sector, index) => (
                                                            <MenuItem key={index} value={sector}>{sector}</MenuItem>
                                                        ))
                                                    }
                                                </Select>
                                            </FormControl>
                                        </FlexView>
                                    )
                            }

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                            {/** Directors */}
                            <FlexView column>
                                <FormControl
                                    error={
                                        userEdited.BusinessProfile.hasOwnProperty('directors')
                                        && userEdited.BusinessProfile.directors.length === 0
                                    }
                                >
                                    <FormLabel>
                                        <b>Directors</b>
                                    </FormLabel>

                                    <Row noGutters>
                                        <Col xs={12} sm={12} md={6} lg={6} >
                                            {
                                                !userEdited.BusinessProfile.hasOwnProperty('directors')
                                                    ?
                                                    null
                                                    :
                                                    <List>
                                                        {
                                                            userEdited.BusinessProfile.directors.map((director, index) => (
                                                                <ListItem
                                                                    key={index}
                                                                >
                                                                    <ListItemText>
                                                                        {director}
                                                                    </ListItemText>
                                                                    <ListItemSecondaryAction>
                                                                        <IconButton onClick={() => this.props.deleteDirectorTemporarily(index, true)} >
                                                                            <CloseIcon/>
                                                                        </IconButton>
                                                                    </ListItemSecondaryAction>
                                                                </ListItem>
                                                            ))
                                                        }
                                                    </List>
                                            }

                                            {
                                                !userEdited.BusinessProfile.hasOwnProperty('directors')
                                                || (userEdited.BusinessProfile.hasOwnProperty('directors') && userEdited.BusinessProfile.directors.length === 0)
                                                    ?
                                                    null
                                                    :
                                                    <Divider style={{ marginTop: 10, marginBottom: 16 }} />
                                            }
                                        </Col>

                                        <Col xs={12} sm={12} md={6} lg={6} >
                                        </Col>

                                        <Col xs={12} sm={12} md={6} lg={6} >
                                            {
                                                !addNewDirector
                                                    ?
                                                    <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} onClick={this.props.toggleAddNewDirector} >
                                                        <AddIcon fontSize="small" style={{ marginRight: 4 }} />
                                                        Add director
                                                    </Button>
                                                    :
                                                    <FlexView column >
                                                        <TextField
                                                            placeholder="Enter director's name"
                                                            name="newDirectorText"
                                                            value={newDirectorText}
                                                            fullWidth
                                                            variant="outlined"
                                                            onChange={this.handleEditUser(editUserActions.ADDING_NEW_DIRECTOR)}
                                                            margin="dense"
                                                        />

                                                        <FlexView marginTop={8} hAlignContent="right" >
                                                            <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} onClick={this.props.toggleAddNewDirector} style={{ marginRight: 8 }} >Cancel</Button>
                                                            <Button
                                                                variant="contained"
                                                                size="small"
                                                                color="primary"
                                                                className={css(sharedStyles.no_text_transform)}
                                                                onClick={() => this.props.addNewDirectorTemporarily(true)}
                                                                disabled={newDirectorText.trim().length === 0}
                                                            >
                                                                Add
                                                            </Button>
                                                        </FlexView>
                                                    </FlexView>
                                            }
                                        </Col>
                                    </Row>
                                </FormControl>
                            </FlexView>

                            <Divider style={{ marginTop: 20, marginBottom: 20 }} />
                            {/** Website */}
                            <FlexView column>
                                <FormControl>
                                    <FormLabel>
                                        <b>Company website</b>
                                    </FormLabel>
                                    <TextField
                                        name="companyWebsite"
                                        placeholder="Enter company website"
                                        value={
                                            userEdited.BusinessProfile.hasOwnProperty('companyWebsite')
                                                ?
                                                userEdited.BusinessProfile.companyWebsite
                                                :
                                                ''
                                        }
                                        margin="dense"
                                        variant="outlined"
                                        fullWidth
                                        onChange={this.handleEditUser(editUserActions.EDIT_ORDINARY_BUSINESS_PROFILE_INFORMATION)}
                                        error={
                                            (userEdited.BusinessProfile.hasOwnProperty('companyWebsite')
                                                && userEdited.BusinessProfile.companyWebsite.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('companyWebsite')
                                                && userEdited.BusinessProfile.companyWebsite.trim().length > 0
                                                && !utils.isValidWebURL(userEdited.BusinessProfile.companyWebsite)
                                            )
                                        }
                                    />
                                </FormControl>
                                {
                                    !userEdited.BusinessProfile.hasOwnProperty('companyWebsite')
                                    || (userEdited.BusinessProfile.hasOwnProperty('companyWebsite')
                                        && userEdited.BusinessProfile.companyWebsite.trim().length === 0
                                    )
                                    || (userEdited.BusinessProfile.hasOwnProperty('companyWebsite')
                                        && userEdited.BusinessProfile.companyWebsite.trim().length > 0
                                        && utils.isValidWebURL(userEdited.BusinessProfile.companyWebsite)
                                    )
                                        ?
                                        null
                                        :
                                        <Typography variant="body2" color="error" align="left" > Invalid website URL </Typography>
                                }
                            </FlexView>

                            <FlexView hAlignContent="right" marginTop={30} >
                                <FlexView marginRight={20} >
                                    <Button variant="outlined" color="primary" onClick={() => this.props.cancelEditingUser(editUserActions.RESET_BUSINESS_PROFILE)}>Cancel</Button>
                                </FlexView>
                                <FlexView>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={
                                            (
                                                currentUser.type === DB_CONST.TYPE_ADMIN
                                                && !currentUser.superAdmin
                                                && !allowEditing
                                            )
                                            || (userEdited.BusinessProfile.hasOwnProperty('companyName') && userEdited.BusinessProfile.companyName.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('registeredOffice') && userEdited.BusinessProfile.registeredOffice.address1.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('registeredOffice') && userEdited.BusinessProfile.registeredOffice.townCity.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('registeredOffice') && userEdited.BusinessProfile.registeredOffice.postcode.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('tradingAddress') && userEdited.BusinessProfile.tradingAddress.address1.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('tradingAddress') && userEdited.BusinessProfile.tradingAddress.townCity.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('tradingAddress') && userEdited.BusinessProfile.tradingAddress.postcode.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('directors') && userEdited.BusinessProfile.directors.length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('companyWebsite') && userEdited.BusinessProfile.companyWebsite.trim().length === 0)
                                            || (userEdited.BusinessProfile.hasOwnProperty('companyWebsite')
                                                && userEdited.BusinessProfile.companyWebsite.trim().length > 0
                                                && !utils.isValidWebURL(userEdited.BusinessProfile.companyWebsite)
                                            )
                                            || JSON.stringify(originalUser.BusinessProfile) === JSON.stringify(userEdited.BusinessProfile)
                                        }
                                        onClick={() => this.props.commitUserProfileChanges(editUserActions.COMMIT_BUSINESS_PROFILE_CHANGES)}
                                    >
                                        Save
                                    </Button>
                                </FlexView>
                            </FlexView>
                            {
                                currentUser.type === DB_CONST.TYPE_ADMIN
                                && !currentUser.superAdmin
                                && !allowEditing
                                    ?
                                    <Typography variant="body1" color="error" align="right" style={{ marginTop: 25 }}>This user is not a home member of your group. So, you cannot edit their profile.</Typography>
                                    :
                                    null
                            }
                        </Col>
                    </Row>
                </FlexView>
            );
        }
        // user has not uploaded their business profile yet
        else {
            // if the user is not a super user
            if (currentUser.type !== DB_CONST.TYPE_ADMIN) {
                return (
                    // user has not uploaded Business profile yet
                    <FlexView column >
                        <FlexView column >
                            <Typography variant="h6" color="primary" style={{ marginBottom: 4 }} >Business profile</Typography>
                            {
                                originalUser.type === DB_CONST.TYPE_ISSUER
                                    ?
                                    null
                                    :
                                    <Row noGutters >
                                        <Col xs={12} sm={12} md={{span: 6, offset: 3}} lg={{span: 4, offset: 4}} >
                                            <Button
                                                fullWidth
                                                className={css(sharedStyles.no_text_transform)}
                                                color={
                                                    !createBusinessProfile.expandBusinessProfileFilling
                                                        ? "primary"
                                                        : "secondary"
                                                }
                                                variant="outlined"
                                                size="medium"
                                                onClick={toggleExpandBusinessProfileFillingForInvestor}
                                                style={{ marginTop: 25, marginBottom: 20 }}
                                            >
                                                {
                                                    !createBusinessProfile.expandBusinessProfileFilling
                                                        ?
                                                        "Create company profile (optional)"
                                                        :
                                                        "Cancel creating company profile"
                                                }
                                            </Button>
                                        </Col>
                                    </Row>
                            }
                        </FlexView>

                        {
                            originalUser.type === DB_CONST.TYPE_ISSUER
                            || createBusinessProfile.expandBusinessProfileFilling
                                ?
                                // start filling in Business profile
                                <FlexView column marginTop={20} >
                                    {/** Company name */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Company name</b>
                                            </FormLabel>
                                            <TextField
                                                placeholder="Enter company name"
                                                name="companyName"
                                                value={createBusinessProfile.BusinessProfile.companyName}
                                                fullWidth
                                                variant="outlined"
                                                margin="dense"
                                                onChange={
                                                    this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.ORDINARY_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                }
                                            />
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Registration number */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Registration number</b>
                                            </FormLabel>
                                            <TextField
                                                placeholder="Enter company registration number"
                                                name="registrationNo"
                                                value={createBusinessProfile.BusinessProfile.registrationNo}
                                                fullWidth
                                                variant="outlined"
                                                margin="dense"
                                                onChange={
                                                    this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.ORDINARY_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                }
                                            />
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Registered office */}
                                    <FlexView column >
                                        <FormControl required >
                                            <Container fluid style={{ padding: 0 }} >
                                                <Row noGutters >
                                                    <Col xs={12} sm={12} md={6} lg={4} >
                                                        <FormLabel>
                                                            <b>Registered office</b>
                                                        </FormLabel>
                                                        <FormHelperText>Enter a UK postcode to search for address or click on "Enter address manually" to enter your address manually.</FormHelperText>
                                                        <FormGroup>
                                                            {/** Search postcode field */}
                                                            <FlexView>
                                                                <TextField
                                                                    placeholder="Enter UK postcode"
                                                                    name="registeredOfficeSearchPostcode"
                                                                    value={createBusinessProfile.registeredOfficeSearchPostcode.toUpperCase()}
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    margin="dense"
                                                                    onChange={
                                                                        this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.BUSINESS_PROFILE_CONTROL_FIELDS_CHANGED)
                                                                    }
                                                                    InputProps={{
                                                                        startAdornment:
                                                                            <InputAdornment position="start" >
                                                                                <IconButton
                                                                                    disableRipple
                                                                                    style={{ width: 48, height: 48 }}
                                                                                    onClick={() => searchAddress(createBusinessProfileActions.SEARCHING_REGISTERED_OFFICE_ADDRESSES)}
                                                                                >
                                                                                    <SearchIcon/>
                                                                                </IconButton>
                                                                            </InputAdornment>
                                                                    }}
                                                                />
                                                            </FlexView>

                                                            {
                                                                !createBusinessProfile.registeredOfficeEnterAddressManually
                                                                    ?
                                                                    null
                                                                    :
                                                                    <FlexView column >
                                                                        <TextField
                                                                            placeholder="Address 1:*"
                                                                            name="address1"
                                                                            value={createBusinessProfile.BusinessProfile.registeredOffice.address1}
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            required
                                                                            margin="dense"
                                                                            onChange={
                                                                                this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.REGISTERED_OFFICE_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                            }
                                                                        />

                                                                        <TextField
                                                                            placeholder="Address 2:"
                                                                            name="address2"
                                                                            value={createBusinessProfile.BusinessProfile.registeredOffice.address2}
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            margin="dense"
                                                                            onChange={
                                                                                this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.REGISTERED_OFFICE_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                            }
                                                                        />

                                                                        <TextField
                                                                            placeholder="Address 3:"
                                                                            name="address3"
                                                                            value={createBusinessProfile.BusinessProfile.registeredOffice.address3}
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            margin="dense"
                                                                            onChange={
                                                                                this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.REGISTERED_OFFICE_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                            }
                                                                        />

                                                                        <Row
                                                                        >
                                                                            <Col xs={12} sm={12} md={6} lg={6} >
                                                                                <TextField
                                                                                    placeholder="Town/City:*"
                                                                                    name="townCity"
                                                                                    value={createBusinessProfile.BusinessProfile.registeredOffice.townCity}
                                                                                    fullWidth
                                                                                    variant="outlined"
                                                                                    required
                                                                                    margin="dense"
                                                                                    onChange={
                                                                                        this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.REGISTERED_OFFICE_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                                    }
                                                                                />
                                                                            </Col>
                                                                            <Col xs={12} sm={12} md={6} lg={6} >
                                                                                <TextField
                                                                                    placeholder="Postcode:*"
                                                                                    name="postcode"
                                                                                    value={createBusinessProfile.BusinessProfile.registeredOffice.postcode.toUpperCase()}
                                                                                    fullWidth
                                                                                    variant="outlined"
                                                                                    required
                                                                                    margin="dense"
                                                                                    onChange={
                                                                                        this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.REGISTERED_OFFICE_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                                    }
                                                                                />
                                                                            </Col>
                                                                        </Row>
                                                                    </FlexView>
                                                            }
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                <Row
                                                    noGutters
                                                >
                                                    <Col xs={12} sm={12} md={6} lg={4} >
                                                        {
                                                            createBusinessProfile.registeredOfficeRecommendedAddresses
                                                            && createBusinessProfile.registeredOfficeRecommendedAddresses.error
                                                                ?
                                                                <Typography variant="body2" color="error" align="left" style={{ marginTop: 4, marginBottom: 4 }} >Sorry, we can't find your address, please check the details entered and search again, alternatively you can enter your address manually below.</Typography>
                                                                :
                                                                null
                                                        }

                                                        {
                                                            !createBusinessProfile.registeredOfficeRecommendedAddresses
                                                                ?
                                                                null
                                                                :
                                                                // error happened while finding addresses
                                                                createBusinessProfile.registeredOfficeRecommendedAddresses.error
                                                                    ?
                                                                    null
                                                                    :
                                                                    <List
                                                                        className={css(styles.address_list)}
                                                                    >
                                                                        {
                                                                            createBusinessProfile.registeredOfficeRecommendedAddresses.formattedAddresses.map((address, index) => (
                                                                                <ListItem
                                                                                    button
                                                                                    key={index}
                                                                                    onClick={() => handleRecommendedAddressSelected(createBusinessProfileActions.SELECT_REGISTERED_OFFICE_RECOMMENDED_ADDRESS, index)}
                                                                                >
                                                                                    <ListItemText primary={address} />
                                                                                </ListItem>
                                                                            ))
                                                                        }
                                                                    </List>
                                                        }

                                                        {
                                                            createBusinessProfile.registeredOfficeEnterAddressManually
                                                                ?
                                                                null
                                                                :
                                                                <Typography
                                                                    variant="body2"
                                                                    color="primary"
                                                                    align="left"
                                                                    className={css(styles.enter_address_manually)}
                                                                    onClick={() => toggleEnterAddressManually(createBusinessProfileActions.TOGGLE_REGISTERED_OFFICE_ENTER_ADDRESS_MANUALLY)}
                                                                >
                                                                    Enter address manually.
                                                                </Typography>
                                                        }
                                                    </Col>
                                                </Row>
                                            </Container>
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Trading address */}
                                    <FlexView column >
                                        <FormControl required >
                                            <Container fluid style={{ padding: 0 }} >
                                                <Row noGutters >
                                                    <Col xs={12} sm={12} md={6} lg={4} >
                                                        <FormLabel>
                                                            <b>Trading address</b>
                                                        </FormLabel>
                                                    </Col>
                                                </Row>

                                                <Row noGutters >
                                                    <Col xs={12} sm={12} md={6} lg={4} >
                                                        <FormGroup>
                                                            <FormControlLabel
                                                                label="Same as registered office address"
                                                                labelPlacement="end"
                                                                control={
                                                                    <Checkbox checked={createBusinessProfile.tradingAddressSameAsRegisteredOffice} color="primary" onChange={this.toggleTradingAddressSameAsRegisteredOffice} />
                                                                }
                                                            />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>

                                                {
                                                    createBusinessProfile.tradingAddressSameAsRegisteredOffice
                                                        ?
                                                        null
                                                        :
                                                        <Row noGutters >
                                                            <Col xs={12} sm={12} md={6} lg={4} >
                                                                <FormGroup>
                                                                    <FormHelperText>Enter a UK postcode to search for address or click on "Enter address manually" to enter your address manually.</FormHelperText>
                                                                    <FlexView>
                                                                        <TextField
                                                                            placeholder="Enter UK postcode"
                                                                            name="tradingAddressSearchPostcode"
                                                                            value={createBusinessProfile.tradingAddressSearchPostcode.toUpperCase()}
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            margin="dense"
                                                                            onChange={
                                                                                this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.BUSINESS_PROFILE_CONTROL_FIELDS_CHANGED)
                                                                            }
                                                                            InputProps={{
                                                                                startAdornment:
                                                                                    <InputAdornment position="start" >
                                                                                        <IconButton disableRipple style={{ width: 48, height: 48 }} onClick={() => searchAddress(createBusinessProfileActions.SEARCHING_TRADING_ADDRESSES)} >
                                                                                            <SearchIcon/>
                                                                                        </IconButton>
                                                                                    </InputAdornment>
                                                                            }}
                                                                        />
                                                                    </FlexView>

                                                                    {
                                                                        !createBusinessProfile.tradingAddressEnterAddressManually
                                                                            ?
                                                                            null
                                                                            :
                                                                            <FlexView column >
                                                                                <TextField
                                                                                    placeholder="Address 1:*"
                                                                                    name="address1"
                                                                                    value={createBusinessProfile.BusinessProfile.tradingAddress.address1}
                                                                                    fullWidth
                                                                                    variant="outlined"
                                                                                    required
                                                                                    margin="dense"
                                                                                    onChange={
                                                                                        this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.TRADING_ADDRESS_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                                    }
                                                                                />

                                                                                <TextField
                                                                                    placeholder="Address 2:"
                                                                                    name="address2"
                                                                                    value={createBusinessProfile.BusinessProfile.tradingAddress.address2}
                                                                                    fullWidth
                                                                                    variant="outlined"
                                                                                    margin="dense"
                                                                                    onChange={
                                                                                        this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.TRADING_ADDRESS_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                                    }
                                                                                />

                                                                                <TextField
                                                                                    placeholder="Address 3:"
                                                                                    name="address3"
                                                                                    value={createBusinessProfile.BusinessProfile.tradingAddress.address3}
                                                                                    fullWidth
                                                                                    variant="outlined"
                                                                                    margin="dense"
                                                                                    onChange={
                                                                                        this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.TRADING_ADDRESS_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                                    }
                                                                                />

                                                                                <Row
                                                                                >
                                                                                    <Col xs={12} sm={12} md={6} lg={6} >
                                                                                        <TextField
                                                                                            placeholder="Town/City:*"
                                                                                            name="townCity"
                                                                                            value={createBusinessProfile.BusinessProfile.tradingAddress.townCity}
                                                                                            fullWidth
                                                                                            variant="outlined"
                                                                                            required
                                                                                            margin="dense"
                                                                                            onChange={
                                                                                                this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.TRADING_ADDRESS_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                                            }
                                                                                        />
                                                                                    </Col>
                                                                                    <Col xs={12} sm={12} md={6} lg={6} >
                                                                                        <TextField
                                                                                            placeholder="Postcode:*"
                                                                                            name="postcode"
                                                                                            value={createBusinessProfile.BusinessProfile.tradingAddress.postcode.toUpperCase()}
                                                                                            fullWidth
                                                                                            variant="outlined"
                                                                                            required
                                                                                            margin="dense"
                                                                                            onChange={
                                                                                                this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.TRADING_ADDRESS_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                                                            }
                                                                                        />
                                                                                    </Col>
                                                                                </Row>
                                                                            </FlexView>
                                                                    }
                                                                </FormGroup>
                                                            </Col>
                                                        </Row>
                                                }

                                                {
                                                    createBusinessProfile.tradingAddressSameAsRegisteredOffice
                                                        ?
                                                        null
                                                        :
                                                        <Row noGutters >
                                                            <Col xs={12} sm={12} md={6} lg={4} >
                                                                {
                                                                    createBusinessProfile.tradingAddressRecommendedAddresses
                                                                    && createBusinessProfile.tradingAddressRecommendedAddresses.error
                                                                        ?
                                                                        <Typography variant="body2" color="error" align="left" style={{ marginTop: 4, marginBottom: 4 }} >Sorry, we can't find your address, please check the details entered and search again, alternatively you can enter your address manually below.</Typography>
                                                                        :
                                                                        null
                                                                }

                                                                {
                                                                    !createBusinessProfile.tradingAddressRecommendedAddresses
                                                                        ?
                                                                        null
                                                                        :
                                                                        // error happened while finding addresses
                                                                        createBusinessProfile.tradingAddressRecommendedAddresses.error
                                                                            ?
                                                                            null
                                                                            :
                                                                            <List
                                                                                className={css(styles.address_list)}
                                                                            >
                                                                                {
                                                                                    createBusinessProfile.tradingAddressRecommendedAddresses.formattedAddresses.map((address, index) => (
                                                                                        <ListItem
                                                                                            button
                                                                                            key={index}
                                                                                            onClick={() => handleRecommendedAddressSelected(createBusinessProfileActions.SELECT_TRADING_ADDRESS_RECOMMENDED_ADDRESS, index)}
                                                                                        >
                                                                                            <ListItemText
                                                                                                primary={address}
                                                                                            />
                                                                                        </ListItem>
                                                                                    ))
                                                                                }
                                                                            </List>
                                                                }

                                                                {
                                                                    createBusinessProfile.tradingAddressEnterAddressManually
                                                                        ?
                                                                        null
                                                                        :
                                                                        <Typography variant="body2" color="primary" align="left" className={css(styles.enter_address_manually)} onClick={() => toggleEnterAddressManually(createBusinessProfileActions.TOGGLE_TRADING_ADDRESS_ENTER_ADDRESS_MANUALLY)} >Enter address manually.</Typography>
                                                                }
                                                            </Col>
                                                        </Row>
                                                }
                                            </Container>
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Directors */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Company directors</b>
                                            </FormLabel>

                                            <Row noGutters >
                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    <List>
                                                        {
                                                            createBusinessProfile.BusinessProfile.directors.map((director, index) => (
                                                                <ListItem key={index} >
                                                                    <ListItemText> {director} </ListItemText>
                                                                    <ListItemSecondaryAction>
                                                                        <IconButton onClick={() => this.props.deleteDirectorTemporarily(index, false)} >
                                                                            <CloseIcon/>
                                                                        </IconButton>
                                                                    </ListItemSecondaryAction>
                                                                </ListItem>
                                                            ))
                                                        }
                                                    </List>

                                                    {
                                                        createBusinessProfile.BusinessProfile.directors.length === 0
                                                            ?
                                                            null
                                                            :
                                                            <Divider style={{ marginTop: 10, marginBottom: 16 }} />
                                                    }
                                                </Col>

                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                </Col>

                                                <Col xs={12} sm={12} md={6} lg={6} >
                                                    {
                                                        !addNewDirector
                                                            ?
                                                            <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} onClick={this.props.toggleAddNewDirector} >
                                                                <AddIcon fontSize="small" style={{ marginRight: 4 }} />
                                                                Add director
                                                            </Button>
                                                            :
                                                            <FlexView column >
                                                                <TextField
                                                                    placeholder="Enter director's name"
                                                                    name="newDirectorText"
                                                                    value={newDirectorText}
                                                                    fullWidth
                                                                    variant="outlined"
                                                                    onChange={this.handleEditUser(editUserActions.ADDING_NEW_DIRECTOR)}
                                                                    margin="dense"
                                                                />

                                                                <FlexView marginTop={8} hAlignContent="right" >
                                                                    <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} onClick={this.props.toggleAddNewDirector} style={{ marginRight: 8 }} >Cancel</Button>
                                                                    <Button
                                                                        variant="contained"
                                                                        size="small"
                                                                        color="primary"
                                                                        className={css(sharedStyles.no_text_transform)}
                                                                        onClick={() => this.props.addNewDirectorTemporarily(false)}
                                                                        disabled={newDirectorText.trim().length === 0}
                                                                    >
                                                                        Add
                                                                    </Button>
                                                                </FlexView>
                                                            </FlexView>
                                                    }
                                                </Col>
                                            </Row>
                                        </FormControl>
                                    </FlexView>

                                    <Divider
                                        style={{ marginTop: 20, marginBottom: 20 }}
                                    />

                                    {/** Business sector */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Business sector</b>
                                            </FormLabel>
                                            <Select
                                                name="sector"
                                                value={createBusinessProfile.BusinessProfile.sector}
                                                input={<OutlinedInput/>}
                                                margin="dense"
                                                onChange={ this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.ORDINARY_BUSINESS_PROFILE_FIELDS_CHANGED) }
                                            >
                                                <MenuItem key={-1} value={'None'} >Choose business sector</MenuItem>
                                                {
                                                    clubAttributes
                                                        ?
                                                        clubAttributes.Sectors.map((sector, index) => (
                                                            <MenuItem key={index} value={sector}>{sector}</MenuItem>
                                                        ))
                                                        :
                                                        null
                                                }
                                            </Select>
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Company Website */}
                                    <FlexView column >
                                        <FormControl required >
                                            <FormLabel>
                                                <b>Company website</b>
                                            </FormLabel>
                                            <TextField
                                                placeholder="Enter company website"
                                                name="companyWebsite"
                                                value={createBusinessProfile.BusinessProfile.companyWebsite}
                                                fullWidth
                                                variant="outlined"
                                                margin="dense"
                                                onChange={
                                                    this.handleCreateBusinessProfileTextChanged(createBusinessProfileActions.ORDINARY_BUSINESS_PROFILE_FIELDS_CHANGED)
                                                }
                                            />
                                            {
                                                createBusinessProfile.BusinessProfile.companyWebsite.trim().length === 0
                                                || utils.isValidWebURL(createBusinessProfile.BusinessProfile.companyWebsite)
                                                    ?
                                                    null
                                                    :
                                                    <Typography variant="body2" color="error" align="left" >Invalid website URL</Typography>
                                            }
                                        </FormControl>
                                    </FlexView>

                                    <Divider style={{ marginTop: 20, marginBottom: 20 }} />

                                    {/** Upload logo and introduction video */}
                                    <FlexView marginBottom={20} width="100%" hAlignContent="center" >
                                        <Row style={{ width: "100%" }} >
                                            {/** Upload logo */}
                                            <Col xs={12} sm={12} md={6} lg={6} style={{ padding: 15 }} >
                                                <FlexView column width="100%" hAlignContent="center" >
                                                    <FlexView className={css(styles.upload_files_area_style)} onClick={() => this.props.toggleEditImageDialog(UPLOAD_LOGO_FIRST_TIME_MODE)} >
                                                        <Typography variant="body2" align="center" >Upload company logo (optional)</Typography>
                                                    </FlexView>
                                                    {
                                                        !createBusinessProfile.logoToBeUploaded
                                                            ?
                                                            null
                                                            :
                                                            <FlexView width={270} height={270} marginTop={28} >
                                                                <Image src={window.URL.createObjectURL(createBusinessProfile.logoToBeUploaded)} roundedCircle thumbnail style={{ maxHeight: 270, width: "100%", objectFit: "scale-down" }}/>
                                                            </FlexView>
                                                    }
                                                </FlexView>
                                            </Col>

                                            {/** Upload introduction video */}
                                            <Col xs={12} sm={12} md={6} lg={6} style={{ padding: 15 }} >
                                                <FlexView column width="100%" hAlignContent="center" >
                                                    <FlexView vAlignContent="center" >
                                                        <FlexView className={css(styles.upload_files_area_style)} onClick={() => this.props.toggleEditVideoDialog(UPLOAD_VIDEO_FIRST_TIME_MODE)} >
                                                            <Typography variant="body2" align="center" >Upload introduction video (optional)</Typography>
                                                        </FlexView>

                                                        <OverlayTrigger
                                                            trigger={['hover', 'focus']}
                                                            placement="top"
                                                            flip
                                                            overlay={
                                                                <Tooltip id={`tooltip-top`} >Introduction video helps other members understand more about your business.</Tooltip>
                                                            }>
                                                            <InfoIcon
                                                                fontSize="default"
                                                                style={{
                                                                    marginLeft: 14,
                                                                    color: colors.gray_600
                                                                }}
                                                            />
                                                        </OverlayTrigger>
                                                    </FlexView>
                                                    {
                                                        !createBusinessProfile.videoToBeUploaded
                                                            ?
                                                            null
                                                            :
                                                            <FlexView marginTop={28} >
                                                                <ReactPlayer
                                                                    url={
                                                                        typeof (createBusinessProfile.videoToBeUploaded) === "string"
                                                                            ?
                                                                            createBusinessProfile.videoToBeUploaded
                                                                            :
                                                                            window.URL.createObjectURL(createBusinessProfile.videoToBeUploaded)
                                                                    }
                                                                    controls={true}
                                                                    playing={false}
                                                                    width="100%"
                                                                    height="auto"
                                                                />
                                                            </FlexView>
                                                    }
                                                </FlexView>
                                            </Col>
                                        </Row>
                                    </FlexView>

                                    <FlexView grow={1} hAlignContent="right" marginTop={30} marginBottom={20} >
                                        <FlexView marginRight={20} >
                                            <Button variant="outlined" color="primary" onClick={resetCreatingBusinessProfile}>Cancel</Button>
                                        </FlexView>
                                        <FlexView>
                                            <Button variant="contained" color="primary" onClick={uploadBusinessProfile} disabled={this.shouldUploadButtonBeDisabled()}>Save</Button>
                                        </FlexView>
                                    </FlexView>
                                </FlexView>
                                :
                                null
                        }
                    </FlexView>
                );
            } else {
                return (
                    <FlexView column >
                        <Typography variant="h6" color="primary" >Business profile</Typography>
                        <Typography variant="body1" color="textSecondary" align="center" style={{ marginTop: 15 }} >Business profile has not been uploaded.</Typography>
                    </FlexView>
                );
            }
        }
    };

    /**
     * Check if the user can upload business profile --> only allow upload when all the required information has been provided
     *
     * @returns {boolean}
     */
    shouldUploadButtonBeDisabled = () => {
        const {
            originalUser,
            createBusinessProfile,
        } = this.props;

        // user is an issuer
        if (originalUser.type === DB_CONST.TYPE_ISSUER) {
            if (createBusinessProfile.BusinessProfile.companyName.trim().length === 0
                || createBusinessProfile.BusinessProfile.registrationNo.trim().length === 0
                || createBusinessProfile.BusinessProfile.registeredOffice.address1.trim().length === 0
                || createBusinessProfile.BusinessProfile.registeredOffice.townCity.trim().length === 0
                || createBusinessProfile.BusinessProfile.registeredOffice.postcode.trim().length === 0
                || (
                    !createBusinessProfile.tradingAddressSameAsRegisteredOffice
                    && (
                        createBusinessProfile.BusinessProfile.tradingAddress.address1.trim().length === 0
                        || createBusinessProfile.BusinessProfile.tradingAddress.townCity.trim().length === 0
                        || createBusinessProfile.BusinessProfile.tradingAddress.postcode.trim().length === 0
                    )
                )
                || createBusinessProfile.BusinessProfile.directors.length === 0
                || createBusinessProfile.BusinessProfile.sector === 'None'
                || createBusinessProfile.BusinessProfile.companyWebsite.trim().length === 0
                || (createBusinessProfile.BusinessProfile.companyWebsite.trim().length > 0
                    && !utils.isValidWebURL(createBusinessProfile.BusinessProfile.companyWebsite)
                )
            ) {
                return true;
            }
        }
        // user is an investor
        else if (originalUser.type === DB_CONST.TYPE_INVESTOR) {
            if (createBusinessProfile.expandBusinessProfileFilling) {
                if (createBusinessProfile.BusinessProfile.companyName.trim().length === 0
                    || createBusinessProfile.BusinessProfile.registrationNo.trim().length === 0
                    || createBusinessProfile.BusinessProfile.registeredOffice.address1.trim().length === 0
                    || createBusinessProfile.BusinessProfile.registeredOffice.townCity.trim().length === 0
                    || createBusinessProfile.BusinessProfile.registeredOffice.postcode.trim().length === 0
                    || (
                        !createBusinessProfile.tradingAddressSameAsRegisteredOffice
                        && (
                            createBusinessProfile.BusinessProfile.tradingAddress.address1.trim().length === 0
                            || createBusinessProfile.BusinessProfile.tradingAddress.townCity.trim().length === 0
                            || createBusinessProfile.BusinessProfile.tradingAddress.postcode.trim().length === 0
                        )
                    )
                    || createBusinessProfile.BusinessProfile.directors.length === 0
                    || createBusinessProfile.BusinessProfile.sector === 'None'
                    || createBusinessProfile.BusinessProfile.companyWebsite.trim().length === 0
                    || (createBusinessProfile.BusinessProfile.companyWebsite.trim().length > 0
                        && !utils.isValidWebURL(createBusinessProfile.BusinessProfile.companyWebsite)
                    )
                ) {
                    return true;
                }
            } else {
                return true;
            }
        }

        return false;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Profile);

const styles = StyleSheet.create({
    upload_files_area_style: {
        padding: 12,
        textAlign: 'center',
        border: `1px solid ${colors.gray_400}`,

        ':hover': {
            backgroundColor: colors.blue_gray_50,
            cursor: 'pointer'
        }
    },

    address_list: {
        backgroundColor: colors.blue_gray_50,
        borderRadius: 3,
        padding: 4,
        width: "90%",

        position: 'relative',
        overflow: 'auto',
        maxHeight: 300
    },

    enter_address_manually: {
        marginTop: 6,
        ':hover': {
            color: colors.blue_gray_600,
            cursor: 'pointer',
            textDecoration: 'underline'
        }
    }
});