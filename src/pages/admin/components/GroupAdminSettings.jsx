import React, {Component} from "react";

import {
    FormControl,
    FormControlLabel,
    Typography,
    RadioGroup,
    Radio,
    Divider,
    Button,
    TextField
} from "@material-ui/core";
import {KeyboardDatePicker} from "@material-ui/pickers";
import PublicIcon from "@material-ui/icons/Public";
import {
    Col,
    Container,
    Row
} from "react-bootstrap";
import FlexView from "react-flexview";
import {css} from "aphrodite";
import {NavLink} from "react-router-dom";
import 'react-quill/dist/quill.snow.css';
// React Quill - text editor
import ReactQuill from 'react-quill';

import {connect} from "react-redux";
import * as groupAdminSettingsActions from "../../../redux-store/actions/groupAdminSettingsActions";

import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import * as DB_CONST from "../../../firebase/databaseConsts";
import * as colors from "../../../values/colors";
import * as utils from "../../../utils/utils";
import * as ROUTES from "../../../router/routes";
import Routes from "../../../router/routes";
import ManageSectors from "./manage-sectors/ManageSectors";
import ManageCourses from "./manage-courses/ManageCourses";

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupDetails: state.manageGroupFromParams.groupProperties,
        groupAttributesEdited: state.groupAdminSettings.groupAttributesEdited,

        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesEdited: state.groupAdminSettings.clubAttributesEdited,

        groupWebsite: state.groupAdminSettings.website,
        groupDescription: state.groupAdminSettings.description,
        primaryColor: state.groupAdminSettings.primaryColor,
        secondaryColor: state.groupAdminSettings.secondaryColor,

        addNewPledgeFAQ: state.groupAdminSettings.addNewPledgeFAQ,
        addedPledgeQuestion: state.groupAdminSettings.addedPledgeQuestion,
        addedPledgeAnswer: state.groupAdminSettings.addedPledgeAnswer,
        expandedPledgeFAQ: state.groupAdminSettings.expandedPledgeFAQ,
        editExpandedPledgeFAQ: state.groupAdminSettings.editExpandedPledgeFAQ,
        editedPledgeQuestion: state.groupAdminSettings.editedPledgeQuestion,
        editedPledgeAnswer: state.groupAdminSettings.editedPledgeAnswer
    }
};

const mapDispatchToProps = dispatch => {
    return {
        initializeGroupAttributesEdited: () => dispatch(groupAdminSettingsActions.initializeGroupAttributesEdited()),
        handleInputChanged: (event) => dispatch(groupAdminSettingsActions.handleInputChanged(event)),

        saveGroupDetails: (field, value) => dispatch(groupAdminSettingsActions.saveGroupDetails(field, value)),
        cancelEditingGroupDetails: (field) => dispatch(groupAdminSettingsActions.cancelEditingGroupDetails(field)),

        saveColor: (field) => dispatch(groupAdminSettingsActions.saveColor(field)),
        cancelEditingColor: (field) => dispatch(groupAdminSettingsActions.cancelEditingColor(field)),
        handlePitchExpiryDateChanged: (date) => dispatch(groupAdminSettingsActions.handlePitchExpiryDateChanged(date)),
        handleSavePitchExpiryDate: () => dispatch(groupAdminSettingsActions.handleSavePitchExpiryDate()),
        handleCancelEditingPitchExpiryDate: () => dispatch(groupAdminSettingsActions.handleCancelEditingPitchExpiryDate()),

        handleExpandPledgeFAQPanel: (FAQ, isExpanded) => dispatch(groupAdminSettingsActions.handleExpandPledgeFAQPanel(FAQ, isExpanded)),
        toggleAddNewPledgeFAQ: () => dispatch(groupAdminSettingsActions.toggleAddNewPledgeFAQ()),
        submitNewPledgeFAQ: () => dispatch(groupAdminSettingsActions.submitNewPledgeFAQ()),
        toggleEditExpandedPledgeFAQ: () => dispatch(groupAdminSettingsActions.toggleEditExpandedPledgeFAQ()),
        saveEditedPledgeFAQ: () => dispatch(groupAdminSettingsActions.saveEditedPledgeFAQ()),
        deleteExistingPledgeFAQ: () => dispatch(groupAdminSettingsActions.deleteExistingPledgeFAQ()),
        handleQuillEditorChanged: (fieldName, content, delta, source, editor) => dispatch(groupAdminSettingsActions.handleQuillEditorChanged(fieldName, content, delta, source, editor)),
        saveEditedQuill: (fieldName) => dispatch(groupAdminSettingsActions.saveEditedQuill(fieldName))
    }
};

class GroupAdminSettings extends Component {

    handleExpandPledgeFAQPanel = FAQ => (event, isExpanded) => {
        this.props.handleExpandPledgeFAQPanel(FAQ, isExpanded);
    };

    handleQuillEditorChanged = fieldName => (content, delta, source, editor) => {
        this.props.handleQuillEditorChanged(fieldName, content, delta, source, editor);
    };

    componentDidMount() {
        const {
            initializeGroupAttributesEdited
        } = this.props;

        initializeGroupAttributesEdited();
    }

    render() {
        const {
            groupUserName,
            groupDetails,
            groupAttributesEdited,

            clubAttributes,
            clubAttributesEdited,

            groupWebsite,
            groupDescription,
            primaryColor,
            secondaryColor,

            handleInputChanged,
            handlePitchExpiryDateChanged,
            handleSavePitchExpiryDate,
            handleCancelEditingPitchExpiryDate,
            saveGroupDetails,
            cancelEditingGroupDetails,
            saveColor,
            cancelEditingColor,
            saveEditedQuill,
        } = this.props;

        if (!groupAttributesEdited) {
            return null;
        }

        return (
            <Container fluid style={{padding: 30}}>
                <Row noGutters>
                    {/** Manage group details */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="h6" color="primary">
                            Manage course details
                        </Typography>

                        <FlexView marginTop={16} marginBottom={32}>
                            <NavLink
                                to={
                                    groupUserName
                                        ?
                                        ROUTES.VIEW_GROUP_DETAILS.replace(":groupUserName", groupUserName).replace(":groupID", groupDetails.anid)
                                        :
                                        ROUTES.VIEW_GROUP_DETAILS_INVEST_WEST_SUPER.replace(":groupID", groupDetails.anid)
                                }
                                className={css(sharedStyles.nav_link_white_text_hover_without_changing_text_color)}
                            >
                                <Button className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary">
                                    <PublicIcon style={{marginRight: 8}}/>
                                    View course's public page
                                </Button>
                            </NavLink>
                        </FlexView>

                        {/** Edit group description */}
                        <FlexView column marginTop={20}>
                            <TextField name="description" value={groupDescription} variant="outlined" label="Course description" multiline rowsMax={5} rows={5} onChange={handleInputChanged}/>

                            <FlexView width="100%" hAlignContent="right" marginTop={15}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => cancelEditingGroupDetails('description')} style={{ marginRight: 6}}>
                                    Cancel
                                </Button>
                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => saveGroupDetails('description', groupDescription)} disabled={groupDetails.description === groupDescription} style={{marginLeft: 6}}>
                                    Save
                                </Button>
                            </FlexView>
                        </FlexView>

                        {/** Edit website */}
                        <FlexView marginTop={35} column>
                            <FormControl fullWidth>
                                <TextField label="Website" placeholder="Official website" name="website" value={groupWebsite} fullWidth margin="dense" variant="outlined" required onChange={handleInputChanged}
                                    error={
                                        groupWebsite.trim().length === 0
                                        || (groupWebsite.trim().length > 0 && !utils.isValidWebURL(groupWebsite))
                                    }/>
                                {
                                    groupWebsite.trim().length === 0 || utils.isValidWebURL(groupWebsite)
                                        ?
                                        null
                                        :
                                        <Typography variant="body2" color="error" align="left">
                                            Invalid website URL
                                        </Typography>
                                }
                            </FormControl>

                            <FlexView width="100%" hAlignContent="right" marginTop={15}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => cancelEditingGroupDetails('website')} style={{marginRight: 6}}>
                                    Cancel
                                </Button>
                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => saveGroupDetails('website', groupWebsite)}
                                    disabled={
                                        groupDetails.website === groupWebsite
                                        || groupWebsite.trim().length === 0
                                        || (groupWebsite.trim().length > 0 && !utils.isValidWebURL(groupWebsite))
                                    }
                                    style={{marginLeft: 6}}>
                                    Save
                                </Button>
                            </FlexView>
                        </FlexView>

                        {/** Sign up link */}
                        <FlexView marginTop={35} column>
                            <FormControl fullWidth>
                                <TextField label="Public registration link" fullWidth margin="dense" variant="outlined" helperText="This link can be shared to unregistered issuers/students so that they can sign up and become members of your course without sending invitation emails manually." value={ process.env.REACT_APP_PUBLIC_URL + Routes.constructSignUpRoute(groupUserName)}/>
                            </FormControl>
                        </FlexView>

                        {/** Edit primary color */}
                        <FlexView marginTop={35} column>
                            <FlexView vAlignContent="center">
                                <TextField required name="primaryColor" variant="outlined" margin="dense" label="Primary color" value={primaryColor.toUpperCase()} onChange={handleInputChanged}/>

                                {
                                    utils.isValidHexColorCode(primaryColor)
                                        ?
                                        <FlexView width={20} height={20} marginLeft={15} style={{backgroundColor: primaryColor}}/>
                                        :
                                        null
                                }
                            </FlexView>

                            {
                                utils.isValidHexColorCode(primaryColor)
                                    ?
                                    null
                                    :
                                    <Typography variant="body2" color="error" align="left" style={{marginTop: 4}}>
                                        Invalid color
                                    </Typography>
                            }

                            <FlexView width="100%" marginTop={10}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => cancelEditingColor("primaryColor")} style={{ marginRight: 6}}>
                                    Cancel
                                </Button>
                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => saveColor("primaryColor")}
                                    disabled={!utils.isValidHexColorCode(primaryColor) || groupDetails.settings.primaryColor === primaryColor}
                                    style={{marginLeft: 6}}>
                                    Save
                                </Button>
                            </FlexView>
                        </FlexView>

                        {/** Edit secondary color */}
                        <FlexView marginTop={35} column>
                            <FlexView vAlignContent="center">
                                <TextField required name="secondaryColor" variant="outlined" margin="dense" label="Secondary color" value={secondaryColor.toUpperCase()} onChange={handleInputChanged}/>

                                {
                                    utils.isValidHexColorCode(secondaryColor)
                                        ?
                                        <FlexView width={20} height={20} marginLeft={15} style={{backgroundColor: secondaryColor}}/>
                                        :
                                        null
                                }
                            </FlexView>

                            {
                                utils.isValidHexColorCode(secondaryColor)
                                    ?
                                    null
                                    :
                                    <Typography variant="body2" color="error" align="left" style={{marginTop: 4}}>
                                        Invalid color
                                    </Typography>
                            }

                            <FlexView width="100%" marginTop={10}>
                                <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => cancelEditingColor("secondaryColor")} style={{marginRight: 6}}>
                                    Cancel
                                </Button>
                                <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={() => saveColor("secondaryColor")}
                                    disabled={!utils.isValidHexColorCode(secondaryColor) || groupDetails.settings.secondaryColor === secondaryColor}
                                    style={{ marginLeft: 6}}>
                                    Save
                                </Button>
                            </FlexView>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 4,
                                backgroundColor:
                                    !groupDetails
                                        ?
                                        colors.primaryColor
                                        :
                                        groupDetails.settings.primaryColor
                            }}/>
                    </Col>

                    {/** Manage group attributes */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">
                                Manage course attributes
                            </Typography>

                            {
                                /**
                                 * Set pitch expiry date (for QIB only)
                                 */
                            }
                            {
                                groupUserName !== "qib"
                                    ?
                                    null
                                    :
                                    <FlexView column marginTop={30}>
                                        <KeyboardDatePicker
                                            autoOk
                                            fullWidth
                                            variant="dialog"
                                            inputVariant="outlined"
                                            label="Choose expired date for this project"
                                            format="dd/MM/yyyy"
                                            minDate={utils.getDateWithDaysFurtherThanToday(1)}
                                            value={
                                                !groupAttributesEdited.hasOwnProperty('defaultPitchExpiryDate')
                                                    ?
                                                    utils.getDateWithDaysFurtherThanToday(1)
                                                    :
                                                    groupAttributesEdited.defaultPitchExpiryDate
                                            }
                                            InputAdornmentProps={{position: "start"}}
                                            error={
                                                groupAttributesEdited.hasOwnProperty('groupAttributesEdited')
                                                    ?
                                                    groupAttributesEdited.defaultPitchExpiryDate === null
                                                    || isNaN(groupAttributesEdited.defaultPitchExpiryDate)
                                                    :
                                                    false
                                            }
                                            onChange={handlePitchExpiryDateChanged}
                                        />

                                        <FlexView width="100%" marginTop={15}>
                                            <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={handleCancelEditingPitchExpiryDate} style={{marginRight: 6}}>
                                                Cancel
                                            </Button>
                                            <Button color="primary" variant="contained" className={css(sharedStyles.no_text_transform)} onClick={handleSavePitchExpiryDate}
                                                disabled={
                                                    groupAttributesEdited.hasOwnProperty('defaultPitchExpiryDate')
                                                        ?
                                                        groupAttributesEdited.defaultPitchExpiryDate === null
                                                        || isNaN(groupAttributesEdited.defaultPitchExpiryDate)
                                                        || (
                                                            groupDetails.settings.hasOwnProperty('defaultPitchExpiryDate')
                                                            && groupAttributesEdited.hasOwnProperty('defaultPitchExpiryDate')
                                                            && groupDetails.settings.defaultPitchExpiryDate === groupAttributesEdited.defaultPitchExpiryDate
                                                        )
                                                        :
                                                        false}
                                                style={{marginLeft: 6}}>
                                                Save
                                            </Button>
                                        </FlexView>

                                        {/** Divider */}
                                        <Divider style={{marginTop: 40, marginBottom: 20, height: 3}}/>
                                    </FlexView>
                            }

                            {
                                /**
                                 * Set project's visibility
                                 */
                            }
                            <FlexView marginTop={20}>
                                <FormControl>
                                    <Typography variant="body1" align="left" paragraph>
                                        Choose default visibility value for all newly created student projects
                                    </Typography>
                                    <RadioGroup name="projectVisibility" value={groupAttributesEdited.projectVisibility.toString()} onChange={handleInputChanged}>
                                        <FormControlLabel value={DB_CONST.PROJECT_VISIBILITY_PRIVATE.toString()} control={<Radio/>} label="Private"/>
                                        <FormControlLabel value={DB_CONST.PROJECT_VISIBILITY_RESTRICTED.toString()} control={<Radio/>} label="Restricted"/>
                                        <FormControlLabel value={DB_CONST.PROJECT_VISIBILITY_PUBLIC.toString()} control={<Radio/>} label="Public"/>
                                    </RadioGroup>
                                </FormControl>
                            </FlexView>

                            {/** Divider */}
                            <Divider style={{marginTop: 20, marginBottom: 20, height: 3}}/>

                            {
                                /**
                                 * Hide/Show investors' contact details
                                 */
                            }
                            {/*<FlexView>*/}
                            {/*    <FormControl>*/}
                            {/*        <FormControlLabel*/}
                            {/*            name="makeInvestorsContactDetailsVisibleToIssuers"*/}
                            {/*            control={*/}
                            {/*                <Checkbox*/}
                            {/*                    color="primary"*/}
                            {/*                    value={groupAttributesEdited.makeInvestorsContactDetailsVisibleToIssuers}*/}
                            {/*                    checked={groupAttributesEdited.makeInvestorsContactDetailsVisibleToIssuers}*/}
                            {/*                    onChange={handleInputChanged}*/}
                            {/*                />*/}
                            {/*            }*/}
                            {/*            label="Allow issuers to see investors' contact details"*/}
                            {/*            labelPlacement="end"*/}
                            {/*        />*/}
                            {/*        <Typography*/}
                            {/*            variant="body1"*/}
                            {/*            align="left"*/}
                            {/*            style={{*/}
                            {/*                marginTop: 8*/}
                            {/*            }}*/}
                            {/*        >*/}
                            {/*            <b*/}
                            {/*                style={{*/}
                            {/*                    color: colors.errorColor*/}
                            {/*                }}*/}
                            {/*            >*/}
                            {/*                <u>Note:</u>&nbsp;This is a global setting.*/}
                            {/*            </b>*/}
                            {/*            &nbsp;When <u><b>ticked</b></u>, <b>the contact details of all investors in this*/}
                            {/*            group</b> will be*/}
                            {/*            made visible to the issuers.*/}
                            {/*        </Typography>*/}
                            {/*    </FormControl>*/}
                            {/*</FlexView>*/}
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 4,
                                backgroundColor:
                                    !groupDetails
                                        ?
                                        colors.primaryColor
                                        :
                                        groupDetails.settings.primaryColor
                            }}/>
                    </Col>

                    {/** Edit sectors */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <ManageSectors/>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 4,
                                backgroundColor:
                                    !groupDetails
                                        ?
                                        colors.primaryColor
                                        :
                                        groupDetails.settings.primaryColor
                            }}/>
                    </Col>

                    {/** Edit courses */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <ManageCourses/>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 4,
                                backgroundColor:
                                    !groupDetails
                                        ?
                                        colors.primaryColor
                                        :
                                        groupDetails.settings.primaryColor
                            }}/>
                    </Col>

                    {/** Edit create project terms and conditions */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Edit create project terms and conditions</Typography>

                            <NavLink to={ROUTES.CREATE_PITCH_TERMS_AND_CONDITIONS} target="_blank" className={css(sharedStyles.nav_link_hover_without_changing_text_color)} style={{marginTop: 30}}>
                                <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}>View create project terms and conditions page</Button>
                            </NavLink>

                            <ReactQuill theme="snow" onChange={this.handleQuillEditorChanged('createPitchTermsAndConditions')} modules={modules} value={clubAttributesEdited && clubAttributesEdited.hasOwnProperty('createPitchTermsAndConditions') ? clubAttributesEdited.createPitchTermsAndConditions : {ops: []}} style={{marginTop: 20}}/>

                            <FlexView marginTop={15} width="100%" hAlignContent="right">
                                <Button variant="contained" color="primary" onClick={() => saveEditedQuill('createPitchTermsAndConditions')} style={{marginLeft: 12}}>Save</Button>
                            </FlexView>
                        </FlexView>
                    </Col>
{/* 
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Edit privacy policy</Typography>

                            <NavLink to={ROUTES.PRIVACY_POLICY} target="_blank" className={css(sharedStyles.nav_link_hover_without_changing_text_color)} style={{marginTop: 30}}>
                                <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}>View privacy policy page</Button>
                            </NavLink>

                            <ReactQuill theme="snow" onChange={this.handleQuillEditorChanged('privacyPolicy')} modules={modules} value={clubAttributesEdited && clubAttributesEdited.hasOwnProperty('privacyPolicy') ? clubAttributesEdited.privacyPolicy : {ops: []}} style={{marginTop: 20 }}/>

                            <FlexView marginTop={15} width="100%" hAlignContent="right">
                                <Button variant="contained" color="primary" onClick={() => saveEditedQuill('privacyPolicy')} style={{marginLeft: 12}}>Save</Button>
                            </FlexView>
                        </FlexView>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 4,
                                backgroundColor:
                                    !groupDetails
                                        ?
                                        colors.primaryColor
                                        :
                                        groupDetails.settings.primaryColor
                            }}/>
                    </Col>

                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Edit terms of use</Typography>

                            <NavLink to={ROUTES.TERMS_OF_USE} target="_blank" className={css(sharedStyles.nav_link_hover_without_changing_text_color)} style={{marginTop: 30}}>
                                <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}>View terms of use page</Button>
                            </NavLink>

                            <ReactQuill theme="snow" onChange={this.handleQuillEditorChanged('termsOfUse')} modules={modules} value={clubAttributesEdited && clubAttributesEdited.hasOwnProperty('termsOfUse') ? clubAttributesEdited.termsOfUse : {ops: []}} style={{marginTop: 20 }}/>

                            <FlexView marginTop={15} width="100%" hAlignContent="right">
                                <Button variant="contained" color="primary" onClick={() => saveEditedQuill('termsOfUe')} style={{marginLeft: 12}}>Save</Button>
                            </FlexView>
                        </FlexView>
                    </Col>
                    */}

                    {/** Final Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 4,
                                backgroundColor:
                                    !groupDetails
                                        ?
                                        colors.primaryColor
                                        :
                                        groupDetails.settings.primaryColor
                            }}/>
                    </Col> 
                </Row>
            </Container>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupAdminSettings);

const modules = {
    toolbar: [
        [{'header': [1, 2, 3, 4, 5, 6, false]}],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}, {'align': []}],
        [{'script': 'sub'}, {'script': 'super'}],
        [{'color': []}, {'background': []}],
        ['link', 'image'],
        ['clean']
    ]
};