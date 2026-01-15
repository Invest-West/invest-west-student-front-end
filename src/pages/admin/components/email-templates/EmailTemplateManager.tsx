/**
 * EmailTemplateManager Component
 *
 * Allows super admins to manage email templates with visual editing.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Button,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    FormControlLabel,
    Grid,
    Switch,
    TextField,
    Typography,
    CircularProgress
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Editor from '@monaco-editor/react';
import Handlebars from 'handlebars';
import { AppState } from '../../../../redux-store/reducers';
import * as emailTemplateActions from '../../../../redux-store/actions/emailTemplateActions';
import { EmailTemplate } from '../../../../redux-store/actions/emailTemplateActions';
import User from '../../../../models/user';
import Admin from '../../../../models/admin';
import GroupOfMembership, { getHomeGroup } from '../../../../models/group_of_membership';
import { getGroupLogo, isCourse } from '../../../../models/group_properties';

/**
 * Email template info with variable definitions
 */
const EMAIL_TEMPLATE_INFO: Record<string, { name: string; variables: string[]; description: string }> = {
    'enquiry': {
        name: 'Enquiry Email',
        description: 'Sent when someone submits an enquiry',
        variables: ['senderEmail', 'senderName', 'companyName', 'companyPosition', 'message']
    },
    'user-invitation': {
        name: 'User Invitation',
        description: 'Sent when an admin invites a new user',
        variables: ['groupName', 'groupLogo', 'groupWebsite', 'groupContactUs', 'userName', 'userType', 'signupURL']
    },
    'pitch-published': {
        name: 'Pitch Published',
        description: 'Sent when a pitch is published/approved',
        variables: ['projectName', 'projectUrl']
    },
    'new-pitch-submitted': {
        name: 'New Pitch Submitted',
        description: 'Sent to admins when a new pitch is submitted',
        variables: ['projectUrl']
    },
    'project-feedback': {
        name: 'Project Feedback',
        description: 'Sent when feedback is given on a project',
        variables: ['project', 'feedback']
    },
    'welcome-user': {
        name: 'Welcome User',
        description: 'Sent when a user completes registration',
        variables: ['userName', 'groupName', 'groupLogo', 'groupWebsite', 'groupContactUs', 'signInURL']
    },
    'reset-password': {
        name: 'Reset Password',
        description: 'Sent when a user requests a password reset',
        variables: ['resetPasswordLink']
    },
    'super-admin-invitation': {
        name: 'Super Admin Invitation',
        description: 'Sent when inviting a super admin',
        variables: ['groupName', 'groupLogo', 'email', 'password', 'website']
    },
    'group-admin-invitation': {
        name: 'Group Admin Invitation',
        description: 'Sent when inviting a group admin',
        variables: ['groupName', 'groupLogo', 'email', 'password', 'website']
    },
    'contact-resource': {
        name: 'Contact Resource',
        description: 'Sent when someone contacts a resource',
        variables: ['userName', 'userCompanyName', 'userEmail']
    },
    'contact-pitch-owner': {
        name: 'Contact Pitch Owner',
        description: 'Sent when someone contacts a pitch owner',
        variables: ['userName', 'companyName', 'companyPosition', 'projectName', 'message', 'senderEmail']
    }
};

interface Props {
    templates: EmailTemplate[];
    loading: boolean;
    error: string | null;
    currentUser: User | Admin | null;
    groupsOfMembership: GroupOfMembership[];
    loadEmailTemplates: () => void;
    saveEmailTemplate: (template: Partial<EmailTemplate>) => any;
    sendTestEmail: (templateSlug: string, testEmail: string, testData: Record<string, any>) => any;
    seedDefaultTemplates: () => any;
}

interface State {
    selectedTemplate: Partial<EmailTemplate> | null;
    editDialogOpen: boolean;
    testDialogOpen: boolean;
    previewHtml: string;
    testEmail: string;
    testData: Record<string, any>;
    saving: boolean;
    sendingTest: boolean;
    seeding: boolean;
}

class EmailTemplateManager extends Component<Props, State> {
    state: State = {
        selectedTemplate: null,
        editDialogOpen: false,
        testDialogOpen: false,
        previewHtml: '',
        testEmail: '',
        testData: {},
        saving: false,
        sendingTest: false,
        seeding: false
    };

    componentDidMount() {
        this.props.loadEmailTemplates();
    }

    getSampleData = (slug: string): Record<string, string> => {
        const info = EMAIL_TEMPLATE_INFO[slug];
        if (!info) return {};

        const { currentUser, groupsOfMembership } = this.props;
        const homeGroup = getHomeGroup(groupsOfMembership);
        const group = homeGroup?.group;
        const baseUrl = window.location.origin;

        // Build real data from current user and group
        const realData: Record<string, string> = {};

        // Build the group path first for URLs
        let groupPath = '';
        if (group) {
            if (isCourse(group) && group.parentGroup) {
                // Course URL: /groups/{universityUserName}/{courseUserName}
                groupPath = `/groups/${group.parentGroup.groupUserName}/${group.groupUserName}`;
            } else {
                // University URL: /groups/{groupUserName}
                groupPath = `/groups/${group.groupUserName}`;
            }
        } else {
            // Fallback to default path
            groupPath = '/groups/invest-west/student-showcase';
        }

        // Group-related variables
        if (group) {
            realData['groupName'] = group.displayName;
            realData['groupLogo'] = getGroupLogo(group) || '[No Logo]';
            realData['groupWebsite'] = group.website || `${baseUrl}${groupPath}`;
            realData['groupContactUs'] = `${baseUrl}${groupPath}/contact-us-front`;
            realData['website'] = group.website || `${baseUrl}${groupPath}`;
        }

        // User-related variables
        if (currentUser) {
            const user = currentUser as User;
            realData['userName'] = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : currentUser.email;
            realData['userEmail'] = currentUser.email;
            realData['senderEmail'] = currentUser.email;
            realData['senderName'] = user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Sample User';
            realData['email'] = currentUser.email;

            // Business profile data
            if (user.BusinessProfile) {
                realData['companyName'] = user.BusinessProfile.companyName || 'Sample Company';
                realData['userCompanyName'] = user.BusinessProfile.companyName || 'Sample Company';
            }
            // Company/position - use company field or fallback
            realData['companyPosition'] = user.company || 'Team Member';
        }

        // URL-related variables - use the groupPath built above
        realData['signupURL'] = `${baseUrl}${groupPath}/signup`;
        realData['signInURL'] = `${baseUrl}${groupPath}/signin`;
        realData['resetPasswordLink'] = `${baseUrl}/auth/action?mode=resetPassword&oobCode=sample-token`;
        realData['projectUrl'] = `${baseUrl}${groupPath}/project/sample-project`;

        // Static sample data for variables we can't get dynamically
        realData['userType'] = 'Student';
        realData['message'] = 'This is a sample message that would appear in the email template.';
        realData['projectName'] = 'Sample Project';
        realData['project'] = 'Sample Project';
        realData['feedback'] = 'This is sample feedback for the project.';
        realData['password'] = '********';

        // Build the sample data using real values when available, otherwise use placeholders
        const sampleData: Record<string, string> = {};
        info.variables.forEach(v => {
            sampleData[v] = realData[v] || `[${v}]`;
        });
        return sampleData;
    };

    updatePreview = (htmlTemplate: string, data: Record<string, any>) => {
        try {
            const compiled = Handlebars.compile(htmlTemplate || '');
            this.setState({ previewHtml: compiled(data) });
        } catch (error) {
            this.setState({ previewHtml: '<p style="color: red;">Error rendering preview</p>' });
        }
    };

    handleTemplateSelect = (template: Partial<EmailTemplate>) => {
        const sampleData = this.getSampleData(template.slug || '');
        this.setState({
            selectedTemplate: template,
            editDialogOpen: true,
            testData: sampleData
        });
        this.updatePreview(template.htmlTemplate || '', sampleData);
    };

    handleSave = async () => {
        const { selectedTemplate } = this.state;
        if (!selectedTemplate) return;

        this.setState({ saving: true });
        const result = await this.props.saveEmailTemplate(selectedTemplate);
        this.setState({ saving: false });

        if (result.success) {
            this.setState({ editDialogOpen: false });
        } else {
            alert('Failed to save template: ' + (result.error || 'Unknown error'));
        }
    };

    handleSendTest = async () => {
        const { selectedTemplate, testEmail, testData } = this.state;
        if (!selectedTemplate?.slug || !testEmail) return;

        this.setState({ sendingTest: true });
        const result = await this.props.sendTestEmail(
            selectedTemplate.slug,
            testEmail,
            testData
        );
        this.setState({ sendingTest: false });

        if (result.success) {
            alert('Test email sent successfully!');
            this.setState({ testDialogOpen: false });
        } else {
            alert('Failed to send test email: ' + (result.error || 'Unknown error'));
        }
    };

    handleSeedTemplates = async () => {
        if (!window.confirm('This will create default templates. Continue?')) return;

        this.setState({ seeding: true });
        const result = await this.props.seedDefaultTemplates();
        this.setState({ seeding: false });

        if (result.success) {
            alert('Default templates created successfully!');
        } else {
            alert('Failed to seed templates: ' + (result.error || 'Unknown error'));
        }
    };

    render() {
        const { templates, loading } = this.props;
        const {
            selectedTemplate,
            editDialogOpen,
            testDialogOpen,
            previewHtml,
            testEmail,
            testData,
            saving,
            sendingTest,
            seeding
        } = this.state;

        if (loading) {
            return (
                <div style={{ padding: 20, textAlign: 'center' }}>
                    <CircularProgress />
                    <Typography style={{ marginTop: 10 }}>Loading templates...</Typography>
                </div>
            );
        }

        return (
            <div style={{ padding: 20 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h5" gutterBottom>Email Templates</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={this.handleSeedTemplates}
                            disabled={seeding}
                            style={{ marginBottom: 20 }}
                        >
                            {seeding ? 'Seeding...' : 'Seed Default Templates'}
                        </Button>
                    </Grid>

                    {Object.entries(EMAIL_TEMPLATE_INFO).map(([slug, info]) => {
                        const template = templates.find(t => t.slug === slug);
                        return (
                            <Grid item xs={12} md={6} key={slug}>
                                <Accordion>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
                                            <Typography style={{ flexGrow: 1 }}>{info.name}</Typography>
                                            <Chip
                                                label={template ? (template.isActive ? 'Active' : 'Inactive') : 'Not Created'}
                                                color={template?.isActive ? 'primary' : 'default'}
                                                size="small"
                                            />
                                        </div>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <div style={{ width: '100%' }}>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                {info.description}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" style={{ marginBottom: 10 }}>
                                                <strong>Variables:</strong> {info.variables.join(', ')}
                                            </Typography>
                                            {template ? (
                                                <div style={{ marginTop: 10 }}>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => this.handleTemplateSelect(template)}
                                                        style={{ marginRight: 10 }}
                                                    >
                                                        Edit Template
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        onClick={() => this.setState({
                                                            selectedTemplate: template,
                                                            testDialogOpen: true,
                                                            testData: this.getSampleData(slug)
                                                        })}
                                                    >
                                                        Send Test
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => this.handleTemplateSelect({
                                                        name: info.name,
                                                        slug,
                                                        subject: '',
                                                        htmlTemplate: '',
                                                        description: info.description,
                                                        variables: info.variables,
                                                        isActive: true
                                                    })}
                                                >
                                                    Create Template
                                                </Button>
                                            )}
                                        </div>
                                    </AccordionDetails>
                                </Accordion>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Edit Dialog */}
                <Dialog
                    open={editDialogOpen}
                    onClose={() => this.setState({ editDialogOpen: false })}
                    maxWidth="lg"
                    fullWidth
                >
                    <DialogTitle>{selectedTemplate?.name}</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    label="Subject Line"
                                    fullWidth
                                    value={selectedTemplate?.subject || ''}
                                    onChange={(e) => this.setState({
                                        selectedTemplate: { ...selectedTemplate, subject: e.target.value }
                                    })}
                                    helperText="Use {{variableName}} for dynamic content"
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={selectedTemplate?.isActive ?? true}
                                            onChange={(e) => this.setState({
                                                selectedTemplate: { ...selectedTemplate, isActive: e.target.checked }
                                            })}
                                        />
                                    }
                                    label="Active"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" gutterBottom>HTML Template</Typography>
                                <div style={{ border: '1px solid #ccc', borderRadius: 4 }}>
                                    <Editor
                                        height="400px"
                                        language="html"
                                        value={selectedTemplate?.htmlTemplate || ''}
                                        onChange={(value) => {
                                            this.setState({
                                                selectedTemplate: { ...selectedTemplate, htmlTemplate: value || '' }
                                            });
                                            this.updatePreview(value || '', this.getSampleData(selectedTemplate?.slug || ''));
                                        }}
                                        options={{ minimap: { enabled: false } }}
                                    />
                                </div>
                            </Grid>
                            <Grid item xs={6}>
                                <Typography variant="subtitle2" gutterBottom>Preview</Typography>
                                <div
                                    style={{
                                        height: 400,
                                        border: '1px solid #ccc',
                                        borderRadius: 4,
                                        overflow: 'auto',
                                        padding: 10,
                                        backgroundColor: '#fff'
                                    }}
                                    dangerouslySetInnerHTML={{ __html: previewHtml }}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ editDialogOpen: false })}>Cancel</Button>
                        <Button
                            onClick={this.handleSave}
                            color="primary"
                            variant="contained"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Test Email Dialog */}
                <Dialog
                    open={testDialogOpen}
                    onClose={() => this.setState({ testDialogOpen: false })}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Send Test Email</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Test Email Address"
                            fullWidth
                            value={testEmail}
                            onChange={(e) => this.setState({ testEmail: e.target.value })}
                            margin="normal"
                        />
                        <Typography variant="subtitle2" style={{ marginTop: 16, marginBottom: 8 }}>
                            Test Data (JSON)
                        </Typography>
                        <div style={{ border: '1px solid #ccc', borderRadius: 4 }}>
                            <Editor
                                height="200px"
                                language="json"
                                value={JSON.stringify(testData, null, 2)}
                                onChange={(value) => {
                                    try {
                                        this.setState({ testData: JSON.parse(value || '{}') });
                                    } catch {
                                        // Invalid JSON, ignore
                                    }
                                }}
                                options={{ minimap: { enabled: false } }}
                            />
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => this.setState({ testDialogOpen: false })}>Cancel</Button>
                        <Button
                            onClick={this.handleSendTest}
                            color="primary"
                            variant="contained"
                            disabled={sendingTest || !testEmail}
                        >
                            {sendingTest ? 'Sending...' : 'Send Test'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    templates: state.EmailTemplateState.templates,
    loading: state.EmailTemplateState.loading,
    error: state.EmailTemplateState.error,
    currentUser: state.AuthenticationState.currentUser,
    groupsOfMembership: state.AuthenticationState.groupsOfMembership
});

const mapDispatchToProps = {
    loadEmailTemplates: emailTemplateActions.loadEmailTemplates,
    saveEmailTemplate: emailTemplateActions.saveEmailTemplate,
    sendTestEmail: emailTemplateActions.sendTestEmail,
    seedDefaultTemplates: emailTemplateActions.seedDefaultTemplates
};

export default connect(mapStateToProps, mapDispatchToProps)(EmailTemplateManager);
