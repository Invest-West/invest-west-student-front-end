/**
 * SMTPSettings Component
 *
 * Allows super admins to configure SMTP settings for email sending.
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
    Button,
    Card,
    CardContent,
    Chip,
    FormControl,
    FormControlLabel,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    Switch,
    TextField,
    Typography
} from '@material-ui/core';
import { AppState } from '../../../../redux-store/reducers';
import * as emailTemplateActions from '../../../../redux-store/actions/emailTemplateActions';
import { SMTPSettings as SMTPSettingsType } from '../../../../redux-store/actions/emailTemplateActions';

interface Props {
    settings: SMTPSettingsType | null;
    connectionStatus: boolean | null;
    loadEmailSettings: () => void;
    saveEmailSettings: (settings: SMTPSettingsType) => any;
    testEmailConnection: () => any;
}

interface State {
    settings: SMTPSettingsType;
    testing: boolean;
    saving: boolean;
}

const defaultSettings: SMTPSettingsType = {
    provider: 'custom',
    host: '',
    port: 587,
    secure: false,
    auth: {
        user: '',
        pass: ''
    },
    fromEmail: '',
    fromName: ''
};

class SMTPSettings extends Component<Props, State> {
    state: State = {
        settings: { ...defaultSettings },
        testing: false,
        saving: false
    };

    componentDidMount() {
        this.props.loadEmailSettings();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.settings !== this.props.settings && this.props.settings) {
            this.setState({ settings: this.props.settings });
        }
    }

    handleProviderChange = (provider: 'google' | 'custom') => {
        const settings = { ...this.state.settings, provider };
        if (provider === 'google') {
            settings.host = 'smtp.gmail.com';
            settings.port = 587;
            settings.secure = false;
        }
        this.setState({ settings });
    };

    handleSave = async () => {
        this.setState({ saving: true });
        const result = await this.props.saveEmailSettings(this.state.settings);
        this.setState({ saving: false });
        if (result.success) {
            alert('Settings saved successfully!');
        } else {
            alert('Failed to save settings: ' + (result.error || 'Unknown error'));
        }
    };

    handleTestConnection = async () => {
        this.setState({ testing: true });
        const connected = await this.props.testEmailConnection();
        this.setState({ testing: false });
        alert(connected ? 'Connection successful!' : 'Connection failed. Please check your settings.');
    };

    render() {
        const { settings, testing, saving } = this.state;
        const { connectionStatus } = this.props;

        return (
            <Card style={{ marginBottom: 20 }}>
                <CardContent>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
                        <Typography variant="h6" style={{ flexGrow: 1 }}>
                            SMTP Settings
                        </Typography>
                        {connectionStatus !== null && (
                            <Chip
                                label={connectionStatus ? 'Connected' : 'Disconnected'}
                                color={connectionStatus ? 'primary' : 'secondary'}
                                size="small"
                            />
                        )}
                    </div>

                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Provider</InputLabel>
                                <Select
                                    value={settings.provider}
                                    onChange={(e) => this.handleProviderChange(e.target.value as 'google' | 'custom')}
                                    label="Provider"
                                >
                                    <MenuItem value="google">Google SMTP (Gmail)</MenuItem>
                                    <MenuItem value="custom">Custom SMTP</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {settings.provider === 'google' && (
                            <Grid item xs={12}>
                                <Typography variant="body2" color="textSecondary" style={{ padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 }}>
                                    For Google SMTP, you need to use an App Password (requires 2-Factor Authentication enabled on your Google account).
                                    {' '}
                                    <a
                                        href="https://support.google.com/accounts/answer/185833"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Learn how to create an App Password
                                    </a>
                                </Typography>
                            </Grid>
                        )}

                        <Grid item xs={8}>
                            <TextField
                                label="SMTP Host"
                                fullWidth
                                variant="outlined"
                                value={settings.host}
                                onChange={(e) => this.setState({
                                    settings: { ...settings, host: e.target.value }
                                })}
                                disabled={settings.provider === 'google'}
                            />
                        </Grid>

                        <Grid item xs={4}>
                            <TextField
                                label="Port"
                                type="number"
                                fullWidth
                                variant="outlined"
                                value={settings.port}
                                onChange={(e) => this.setState({
                                    settings: { ...settings, port: parseInt(e.target.value) || 587 }
                                })}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings.secure}
                                        onChange={(e) => this.setState({
                                            settings: { ...settings, secure: e.target.checked }
                                        })}
                                    />
                                }
                                label="Use SSL/TLS (secure connection)"
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Username / Email"
                                fullWidth
                                variant="outlined"
                                value={settings.auth.user}
                                onChange={(e) => this.setState({
                                    settings: {
                                        ...settings,
                                        auth: { ...settings.auth, user: e.target.value }
                                    }
                                })}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="Password / App Password"
                                type="password"
                                fullWidth
                                variant="outlined"
                                value={settings.auth.pass}
                                onChange={(e) => this.setState({
                                    settings: {
                                        ...settings,
                                        auth: { ...settings.auth, pass: e.target.value }
                                    }
                                })}
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="From Email"
                                fullWidth
                                variant="outlined"
                                value={settings.fromEmail}
                                onChange={(e) => this.setState({
                                    settings: { ...settings, fromEmail: e.target.value }
                                })}
                                helperText="Email address that appears as the sender"
                            />
                        </Grid>

                        <Grid item xs={6}>
                            <TextField
                                label="From Name"
                                fullWidth
                                variant="outlined"
                                value={settings.fromName}
                                onChange={(e) => this.setState({
                                    settings: { ...settings, fromName: e.target.value }
                                })}
                                helperText="Name that appears as the sender"
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                variant="outlined"
                                onClick={this.handleTestConnection}
                                disabled={testing}
                                style={{ marginRight: 10 }}
                            >
                                {testing ? 'Testing...' : 'Test Connection'}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.handleSave}
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Settings'}
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        );
    }
}

const mapStateToProps = (state: AppState) => ({
    settings: state.EmailTemplateState.settings,
    connectionStatus: state.EmailTemplateState.connectionStatus
});

const mapDispatchToProps = {
    loadEmailSettings: emailTemplateActions.loadEmailSettings,
    saveEmailSettings: emailTemplateActions.saveEmailSettings,
    testEmailConnection: emailTemplateActions.testEmailConnection
};

export default connect(mapStateToProps, mapDispatchToProps)(SMTPSettings);
