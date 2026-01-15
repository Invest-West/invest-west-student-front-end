import React, {Component} from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {css, StyleSheet} from 'aphrodite';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Button,
    Checkbox,
    Divider,
    FormControl,
    FormControlLabel,
    FormHelperText,
    TextField,
    Typography
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import CreateIcon from '@material-ui/icons/CreateOutlined';
import DeleteIcon from '@material-ui/icons/DeleteOutlined';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// React Quill - text editor
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import * as ROUTES from '../../../router/routes';
import sharedStyles from '../../../shared-js-css-styles/SharedStyles';
import {NavLink} from 'react-router-dom';
import * as DB_CONST from '../../../firebase/databaseConsts';
import * as colors from '../../../values/colors';
import {connect} from 'react-redux';
import * as superAdminSettingsActions from '../../../redux-store/actions/superAdminSettingsActions';
import ManageSectors from "./manage-sectors/ManageSectors";
import ManageCourses from "./manage-courses/ManageCourses";
import FeedbackSnackbarNew from "../../../shared-components/feedback-snackbar/FeedbackSnackbarNew";
import EmailTemplateManager from "./email-templates/EmailTemplateManager";
import SMTPSettings from "./email-templates/SMTPSettings";

const mapStateToProps = state => {
    return {
        clubAttributes: state.manageClubAttributes.clubAttributes,
        clubAttributesEdited: state.superAdminSettings.clubAttributesEdited,

        addNewPledgeFAQ: state.superAdminSettings.addNewPledgeFAQ,
        addedPledgeQuestion: state.superAdminSettings.addedPledgeQuestion,
        addedPledgeAnswer: state.superAdminSettings.addedPledgeAnswer,
        expandedPledgeFAQ: state.superAdminSettings.expandedPledgeFAQ,
        editExpandedPledgeFAQ: state.superAdminSettings.editExpandedPledgeFAQ,
        editedPledgeQuestion: state.superAdminSettings.editedPledgeQuestion,
        editedPledgeAnswer: state.superAdminSettings.editedPledgeAnswer
    }
};

const mapDispatchToProps = dispatch => {
    return {
        initializeClubAttributesEdited: () => dispatch(superAdminSettingsActions.initializeClubAttributesEdited()),
        handleInputChanged: (event) => dispatch(superAdminSettingsActions.handleInputChanged(event)),
        handleExpandPledgeFAQPanel: (FAQ, isExpanded) => dispatch(superAdminSettingsActions.handleExpandPledgeFAQPanel(FAQ, isExpanded)),
        toggleAddNewPledgeFAQ: () => dispatch(superAdminSettingsActions.toggleAddNewPledgeFAQ()),
        submitNewPledgeFAQ: () => dispatch(superAdminSettingsActions.submitNewPledgeFAQ()),
        toggleEditExpandedPledgeFAQ: () => dispatch(superAdminSettingsActions.toggleEditExpandedPledgeFAQ()),
        saveEditedPledgeFAQ: () => dispatch(superAdminSettingsActions.saveEditedPledgeFAQ()),
        deleteExistingPledgeFAQ: () => dispatch(superAdminSettingsActions.deleteExistingPledgeFAQ()),
        handleQuillEditorChanged: (fieldName, content, delta, source, editor) => dispatch(superAdminSettingsActions.handleQuillEditorChanged(fieldName, content, delta, source, editor)),
        saveEditedQuill: (fieldName) => dispatch(superAdminSettingsActions.saveEditedQuill(fieldName))
    }
};

class SuperAdminSettings extends Component {

    handleExpandPledgeFAQPanel = FAQ => (event, isExpanded) => {
        this.props.handleExpandPledgeFAQPanel(FAQ, isExpanded);
    };

    handleQuillEditorChanged = fieldName => (content, delta, source, editor) => {
        this.props.handleQuillEditorChanged(fieldName, content, delta, source, editor);
    };

    componentDidMount() {
        const {
            initializeClubAttributesEdited
        } = this.props;

        initializeClubAttributesEdited();
    }

    render() {
        const {
            clubAttributes,
            clubAttributesEdited,

            addNewPledgeFAQ,
            addedPledgeQuestion,
            addedPledgeAnswer,
            expandedPledgeFAQ,
            editExpandedPledgeFAQ,
            editedPledgeQuestion,
            editedPledgeAnswer,

            handleInputChanged,
            toggleAddNewPledgeFAQ,
            submitNewPledgeFAQ,
            toggleEditExpandedPledgeFAQ,
            saveEditedPledgeFAQ,
            deleteExistingPledgeFAQ,
            saveEditedQuill
        } = this.props;

        if (!clubAttributes || !clubAttributesEdited) {
            return null;
        }

        return (
            <Container
                fluid
                style={{
                    padding: 30
                }}
            >
                <FeedbackSnackbarNew/>
                <Row
                    noGutters
                >
                    {/** Manage system's functions */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="h6" color="primary">Manage system's functions</Typography>

                        <FlexView marginTop={20}>
                            <FormControl>
                                <FormControlLabel name="allowVideoUpload"
                                    control={
                                        <Checkbox color="primary" value={clubAttributesEdited.allowVideoUpload} checked={clubAttributesEdited.allowVideoUpload} onChange={handleInputChanged}/>
                                    }
                                    label="Allow video upload"
                                    labelPlacement="end"
                                />
                                <FormHelperText>
                                    Allow videos (Introduction video in Profile page and Project cover video) to be
                                    uploaded to the database.
                                    When turned off, the users cannot upload videos from their machines, instead they
                                    can only upload a video URL.
                                </FormHelperText>
                            </FormControl>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Support email */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="h6" color="primary">Edit support email</Typography>

                        <FlexView marginTop={20}>
                            <TextField name="supportEmail" label="Support email" value={clubAttributesEdited.supportEmail} margin="normal" variant="outlined" fullWidth required onChange={handleInputChanged}/>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{ marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Edit sectors */}
                    <Col xs={12}sm={12} md={12} lg={12}>
                        <ManageSectors/>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Edit courses */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <ManageCourses/>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Edit FAQs in Pledge Page */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Typography variant="h6" color="primary">Edit FAQs in Pledge Page</Typography>

                        <Button onClick={toggleAddNewPledgeFAQ} variant="outlined" className={css(sharedStyles.no_text_transform)} style={{ marginTop: 18}}>
                            {
                                !addNewPledgeFAQ
                                    ?
                                    <AddIcon fontSize="small" style={{marginRight: 6}}/>
                                    :
                                    <CloseIcon fontSize="small" style={{marginRight: 6}}/>
                            }
                            {
                                !addNewPledgeFAQ
                                    ?
                                    "Add new FAQ"
                                    :
                                    "Cancel adding new FAQ"
                            }
                        </Button>

                        {
                            !addNewPledgeFAQ
                                ?
                                null
                                :
                                <FlexView column marginTop={15}>
                                    <TextField name="addedPledgeQuestion" label="Question" value={addedPledgeQuestion} margin="dense" variant="outlined" fullWidth required onChange={handleInputChanged}/>
                                    <TextField name="addedPledgeAnswer" label="Answer" value={addedPledgeAnswer} margin="dense" variant="outlined" fullWidth required multiline rowsMax={5} onChange={handleInputChanged} style={{marginTop: 10}}/>
                                    <FlexView hAlignContent="right" marginTop={10}>
                                        <Button onClick={submitNewPledgeFAQ} variant="contained" color="primary" className={css(sharedStyles.no_text_transform)}>Add</Button>
                                    </FlexView>
                                </FlexView>
                        }

                        <FlexView column marginTop={20}>
                            {
                                !clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD]
                                    ?
                                    null
                                    :
                                    clubAttributesEdited[DB_CONST.PLEDGE_FAQS_CHILD].map(FAQ => (
                                        <Accordion key={FAQ.id} elevation={0} className={css(styles.frequently_asked_question_box)} expanded={(expandedPledgeFAQ && FAQ.id === expandedPledgeFAQ.id) ? true : false} onChange={this.handleExpandPledgeFAQPanel(FAQ)}>
                                            <AccordionSummary expandIcon={<ExpandMoreIcon/>}>
                                                <Typography variant="body2" align="left"><b>{FAQ.question}</b></Typography>
                                            </AccordionSummary>

                                            <AccordionDetails>
                                                <FlexView column width="100%">
                                                    <Typography variant="body2" align="left">{FAQ.answer}</Typography>

                                                    <FlexView marginTop={28}>
                                                        <Button onClick={toggleEditExpandedPledgeFAQ} variant="outlined" color={expandedPledgeFAQ && expandedPledgeFAQ.id === FAQ.id && editExpandedPledgeFAQ ? "default" : "primary"} className={css(sharedStyles.no_text_transform)}>
                                                            {
                                                                expandedPledgeFAQ && expandedPledgeFAQ.id === FAQ.id && editExpandedPledgeFAQ
                                                                    ?
                                                                    <CloseIcon fontSize="small" style={{marginRight: 6}}/>
                                                                    :
                                                                    <CreateIcon fontSize="small" style={{ marginRight: 6}}/>
                                                            }
                                                            {
                                                                expandedPledgeFAQ && expandedPledgeFAQ.id === FAQ.id && editExpandedPledgeFAQ
                                                                    ?
                                                                    "Cancel editing"
                                                                    :
                                                                    "Edit"
                                                            }
                                                        </Button>
                                                        <Button onClick={deleteExistingPledgeFAQ} variant="outlined" color="secondary" className={css(sharedStyles.no_text_transform)} style={{marginLeft: 12}}>
                                                            <DeleteIcon fontSize="small" style={{ marginRight: 6}}/>
                                                            Delete
                                                        </Button>
                                                    </FlexView>

                                                    {
                                                        expandedPledgeFAQ && expandedPledgeFAQ.id === FAQ.id && editExpandedPledgeFAQ
                                                            ?
                                                            <FlexView column width="100%" hAlignContent="right" marginTop={12}>
                                                                <TextField name="editedPledgeQuestion" label="Question" value={editedPledgeQuestion} margin="dense" variant="outlined" fullWidth required error={editedPledgeQuestion.trim().length === 0} onChange={handleInputChanged}/>
                                                                <TextField name="editedPledgeAnswer" label="Answer" value={editedPledgeAnswer} margin="dense" variant="outlined" fullWidth required multiline rowsMax={5} error={editedPledgeAnswer.trim().length === 0} onChange={handleInputChanged} style={{marginTop: 10}}/>

                                                                <Button onClick={saveEditedPledgeFAQ} variant="contained" color="primary" className={css(sharedStyles.no_text_transform)} style={{marginTop: 10}}>Save</Button>
                                                            </FlexView>
                                                            :
                                                            null
                                                    }
                                                </FlexView>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))
                            }
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{ marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Edit privacy policy */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Edit privacy policy</Typography>

                            <NavLink to={ROUTES.PRIVACY_POLICY} target="_blank" className={css(sharedStyles.nav_link_hover_without_changing_text_color)} style={{marginTop: 30}}>
                                <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}>View privacy policy page</Button>
                            </NavLink>

                            <ReactQuill theme="snow" onChange={this.handleQuillEditorChanged('privacyPolicy')} modules={modules} value={clubAttributesEdited.hasOwnProperty('privacyPolicy') ? clubAttributesEdited.privacyPolicy : {ops: []}} style={{marginTop: 20 }}/>

                            <FlexView marginTop={15} width="100%" hAlignContent="right">
                                <Button variant="contained" color="primary" onClick={() => saveEditedQuill('privacyPolicy')} style={{marginLeft: 12}}>Save</Button>
                            </FlexView>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{ marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Edit terms of use */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Edit terms of use</Typography>

                            <NavLink to={ROUTES.TERMS_OF_USE} target="_blank" className={css(sharedStyles.nav_link_hover_without_changing_text_color)} style={{ marginTop: 30}}>
                                <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}>View terms of use page</Button>
                            </NavLink>

                            <ReactQuill theme="snow" onChange={this.handleQuillEditorChanged('termsOfUse')} modules={modules} value={clubAttributesEdited.hasOwnProperty('termsOfUse') ? clubAttributesEdited.termsOfUse : {ops: []}} style={{marginTop: 20}}/>

                            <FlexView marginTop={15} width="100%" hAlignContent="right">
                                <Button variant="contained" color="primary" onClick={() => saveEditedQuill('termsOfUse')} style={{marginLeft: 12}}>Save</Button>
                            </FlexView>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Edit risk warnings */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Edit risk warnings</Typography>

                            {/** Risk warning footer */}
                            <FlexView column marginTop={30}>
                                <Typography variant="body1" align="left"><b>Risk warning footer</b></Typography>
                                <br/>
                                <Typography variant="body1" align="left" color="textSecondary">
                                    Risk warning footer is used in the footer of the Explore Offers page and
                                    the Pledge page.
                                    <br/><br/>
                                    As the course's name will be populated dynamically, therefore, anywhere in the text
                                    that needs to use course's name, please replace it with <b><u>%groupName%</u></b>.
                                    <br/><br/>
                                    Also, this risk warning footer will need to have a URL that leads to the
                                    risk warning page where the information will be further explained. Therefore, please
                                    use the following format to express the URL:
                                    <br/><br/>
                                    <b><u>%URL%any text inside%URL%</u></b>. For example:&nbsp;
                                    <b>%URL%Please click here to see full risk warning.%URL%</b>. The URL doesn't need
                                    to be
                                    put here manually, it will be done on the development side as long as the format
                                    is correct.
                                </Typography>
                                <br/>
                                <TextField variant="outlined" name="riskWarningFooter" placeholder="Edit risk warning footer" value={clubAttributesEdited.riskWarningFooter} onChange={handleInputChanged} multiline rowsMax={10} rows={10}/>
                            </FlexView>

                            <Divider style={{marginTop: 50, marginBottom: 40}}/>

                            <FlexView column>
                                <Typography variant="body1" align="left"><b>Risk warning page</b></Typography>

                                <br/>

                                <NavLink to={ROUTES.RISK_WARNING} target="_blank" className={css(sharedStyles.nav_link_hover_without_changing_text_color)}>
                                    <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}>View risk warning page</Button>
                                </NavLink>

                                <ReactQuill theme="snow" onChange={this.handleQuillEditorChanged('riskWarning')} modules={modules} value={clubAttributesEdited.hasOwnProperty('riskWarning') ? clubAttributesEdited.riskWarning : {ops: []}} style={{marginTop: 20}}/>

                                <FlexView marginTop={15} width="100%" hAlignContent="right">
                                    <Button variant="contained" color="primary" onClick={() => saveEditedQuill('riskWarning')} style={{marginLeft: 12}}>Save</Button>
                                </FlexView>
                            </FlexView>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{ marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Edit create project terms and conditions */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Edit create project terms and conditions</Typography>

                            <NavLink to={ROUTES.CREATE_PITCH_TERMS_AND_CONDITIONS} target="_blank" className={css(sharedStyles.nav_link_hover_without_changing_text_color)} style={{marginTop: 30}}>
                                <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}>View create project terms and conditions page</Button>
                            </NavLink>

                            <ReactQuill theme="snow" onChange={this.handleQuillEditorChanged('createPitchTermsAndConditions')} modules={modules} value={clubAttributesEdited.hasOwnProperty('createPitchTermsAndConditions') ? clubAttributesEdited.createPitchTermsAndConditions : {ops: []}} style={{marginTop: 20}}/>

                            <FlexView marginTop={15} width="100%" hAlignContent="right">
                                <Button variant="contained" color="primary" onClick={() => saveEditedQuill('createPitchTermsAndConditions')} style={{marginLeft: 12}}> Save</Button>
                            </FlexView>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{ marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Edit marketing preferences */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Edit marketing preferences</Typography>

                            <NavLink to={ROUTES.MARKETING_PREFERENCES} target="_blank" className={css(sharedStyles.nav_link_hover_without_changing_text_color)} style={{marginTop: 30}}>
                                <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)}>View marketing preferences page</Button>
                            </NavLink>

                            <ReactQuill theme="snow" onChange={this.handleQuillEditorChanged('marketingPreferences')} modules={modules} value={clubAttributesEdited.hasOwnProperty('marketingPreferences') ? clubAttributesEdited.marketingPreferences : {ops: []}} style={{marginTop: 20}}/>

                            <FlexView marginTop={15} width="100%" hAlignContent="right">
                                <Button variant="contained" color="primary" onClick={() => saveEditedQuill('marketingPreferences')} style={{marginLeft: 12}}>Save</Button>
                            </FlexView>
                        </FlexView>
                    </Col>

                    {/** Divider */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <Divider style={{marginTop: 40, marginBottom: 40, height: 3, backgroundColor: colors.primaryColor}}/>
                    </Col>

                    {/** Email Settings */}
                    <Col xs={12} sm={12} md={12} lg={12}>
                        <FlexView column>
                            <Typography variant="h6" color="primary">Email Settings</Typography>
                            <Typography variant="body2" color="textSecondary" style={{marginTop: 10, marginBottom: 20}}>
                                Configure SMTP server settings and manage email templates.
                            </Typography>
                            <SMTPSettings />
                            <EmailTemplateManager />
                        </FlexView>
                    </Col>
                </Row>
            </Container>
        )
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SuperAdminSettings);

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

const styles = StyleSheet.create({
    frequently_asked_question_box: {
        border: `1px solid ${colors.gray_300}`,
        marginTop: 12
    }
});