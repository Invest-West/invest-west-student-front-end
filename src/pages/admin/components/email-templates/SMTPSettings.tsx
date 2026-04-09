/**
 * SMTPSettings Component
 *
 * Allows super admins to configure SMTP settings for email sending.
 */
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
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
  Typography,
} from '@mui/material';
import { AppState } from '../../../../redux-store/reducers';
import * as emailTemplateActions from '../../../../redux-store/actions/emailTemplateActions';
import { SMTPSettings as SMTPSettingsType } from '../../../../redux-store/actions/emailTemplateActions';

const defaultSettings: SMTPSettingsType = {
  provider: 'custom',
  host: '',
  port: 587,
  secure: false,
  auth: {
    user: '',
    pass: '',
  },
  fromEmail: '',
  fromName: '',
};

const SMTPSettings: React.FC = () => {
  const dispatch = useDispatch();
  const reduxSettings = useSelector((state: AppState) => state.EmailTemplateState.settings);
  const connectionStatus = useSelector(
    (state: AppState) => state.EmailTemplateState.connectionStatus
  );

  const [settings, setSettings] = useState<SMTPSettingsType>({ ...defaultSettings });
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    dispatch(emailTemplateActions.loadEmailSettings() as any);
  }, [dispatch]);

  useEffect(() => {
    if (reduxSettings) {
      setSettings(reduxSettings);
    }
  }, [reduxSettings]);

  const handleProviderChange = (provider: 'google' | 'custom') => {
    const newSettings = { ...settings, provider };
    if (provider === 'google') {
      newSettings.host = 'smtp.gmail.com';
      newSettings.port = 587;
      newSettings.secure = false;
    }
    setSettings(newSettings);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await (dispatch(emailTemplateActions.saveEmailSettings(settings) as any) as any);
    setSaving(false);
    if (result.success) {
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings: ' + (result.error || 'Unknown error'));
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    const connected = await (dispatch(emailTemplateActions.testEmailConnection() as any) as any);
    setTesting(false);
    alert(connected ? 'Connection successful!' : 'Connection failed. Please check your settings.');
  };

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
                variant="standard"
                value={settings.provider}
                onChange={(e) => handleProviderChange(e.target.value as 'google' | 'custom')}
                label="Provider"
              >
                <MenuItem value="google">Google SMTP (Gmail)</MenuItem>
                <MenuItem value="custom">Custom SMTP</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {settings.provider === 'google' && (
            <Grid item xs={12}>
              <Typography
                variant="body2"
                color="textSecondary"
                style={{ padding: 10, backgroundColor: '#f5f5f5', borderRadius: 4 }}
              >
                For Google SMTP, you need to use an App Password (requires 2-Factor Authentication
                enabled on your Google account).{' '}
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
              onChange={(e) => setSettings({ ...settings, host: e.target.value })}
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
              onChange={(e) => setSettings({ ...settings, port: parseInt(e.target.value) || 587 })}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.secure}
                  onChange={(e) => setSettings({ ...settings, secure: e.target.checked })}
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
              onChange={(e) =>
                setSettings({
                  ...settings,
                  auth: { ...settings.auth, user: e.target.value },
                })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="Password / App Password"
              type="password"
              fullWidth
              variant="outlined"
              value={settings.auth.pass}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  auth: { ...settings.auth, pass: e.target.value },
                })
              }
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="From Email"
              fullWidth
              variant="outlined"
              value={settings.fromEmail}
              onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
              helperText="Email address that appears as the sender"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              label="From Name"
              fullWidth
              variant="outlined"
              value={settings.fromName}
              onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
              helperText="Name that appears as the sender"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="outlined"
              onClick={handleTestConnection}
              disabled={testing}
              style={{ marginRight: 10 }}
            >
              {testing ? 'Testing...' : 'Test Connection'}
            </Button>
            <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SMTPSettings;
