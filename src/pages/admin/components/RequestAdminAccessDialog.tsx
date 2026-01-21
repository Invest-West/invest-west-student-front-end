import React, {useState} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    CircularProgress
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';
import sharedStyles from '../../../shared-js-css-styles/SharedStyles';
import CourseAdminInviteRepository from '../../../api/repositories/CourseAdminInviteRepository';

interface RequestAdminAccessDialogProps {
    open: boolean;
    universityId: string;
    universityName: string;
    onClose: () => void;
    onSuccess?: () => void;
}

type RoleType = 'admin' | 'lecturer';

interface ResultInfo {
    success: boolean;
    type: 'signup_invitation' | 'upgrade_request';
    message: string;
}

/**
 * Dialog for Super Admins to request admin access for a user.
 *
 * This will either:
 * - Send a signup invitation email if the user doesn't exist
 * - Create an upgrade request if the user already exists
 */
export default function RequestAdminAccessDialog(props: RequestAdminAccessDialogProps) {
    const {open, universityId, universityName, onClose, onSuccess} = props;

    const [email, setEmail] = useState('');
    const [role, setRole] = useState<RoleType>('admin');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<ResultInfo | null>(null);
    const [touched, setTouched] = useState(false);

    const repository = new CourseAdminInviteRepository();

    const handleClose = () => {
        if (!isSubmitting) {
            // Reset state
            setEmail('');
            setRole('admin');
            setError(null);
            setResult(null);
            setTouched(false);
            onClose();
        }
    };

    const validateEmail = (emailStr: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(emailStr);
    };

    const handleSubmit = async () => {
        setTouched(true);
        setError(null);

        // Validate email
        if (!email.trim()) {
            setError('Email address is required');
            return;
        }

        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await repository.requestAdminAccess({
                email: email.trim(),
                universityId,
                role
            });

            const data = response.data;
            setResult({
                success: data.success,
                type: data.type,
                message: data.message
            });

            // Wait a moment to show success message, then close
            if (data.success) {
                setTimeout(() => {
                    if (onSuccess) {
                        onSuccess();
                    }
                    handleClose();
                }, 2500);
            }
        } catch (err: any) {
            const errorMessage = err?.response?.data?.error ||
                                 err?.response?.data?.message ||
                                 err?.message ||
                                 'Failed to send invitation. Please try again.';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getResultMessage = () => {
        if (!result) return null;

        if (result.type === 'signup_invitation') {
            return (
                <div style={{
                    backgroundColor: '#e8f5e9',
                    padding: 16,
                    borderRadius: 8,
                    marginTop: 16
                }}>
                    <Typography variant="body1" style={{color: '#2e7d32', fontWeight: 500}}>
                        Invitation Sent!
                    </Typography>
                    <Typography variant="body2" style={{color: '#2e7d32', marginTop: 4}}>
                        {result.message}
                    </Typography>
                    <Typography variant="body2" style={{color: '#558b2f', marginTop: 8}}>
                        A signup invitation has been sent to {email}. They will receive an email with a link to complete their registration.
                    </Typography>
                </div>
            );
        } else {
            return (
                <div style={{
                    backgroundColor: '#e3f2fd',
                    padding: 16,
                    borderRadius: 8,
                    marginTop: 16
                }}>
                    <Typography variant="body1" style={{color: '#1565c0', fontWeight: 500}}>
                        Upgrade Request Sent!
                    </Typography>
                    <Typography variant="body2" style={{color: '#1565c0', marginTop: 4}}>
                        {result.message}
                    </Typography>
                    <Typography variant="body2" style={{color: '#1976d2', marginTop: 8}}>
                        The user already has an account. They will receive an email to accept or decline the admin role.
                    </Typography>
                </div>
            );
        }
    };

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="sm"
            onClose={handleClose}
        >
            <DialogTitle disableTypography>
                <FlexView vAlignContent="center">
                    <FlexView grow={4} vAlignContent="center">
                        <PersonAddIcon color="primary" style={{marginRight: 8}} />
                        <Typography variant='h6' color='primary' align="left">
                            Request Admin Access
                        </Typography>
                    </FlexView>
                    <FlexView grow={1} hAlignContent="right">
                        <IconButton onClick={handleClose} disabled={isSubmitting}>
                            <CloseIcon/>
                        </IconButton>
                    </FlexView>
                </FlexView>
            </DialogTitle>
            <DialogContent style={{marginTop: 10, marginBottom: 20}}>
                <Typography variant="body2" color="textSecondary" paragraph>
                    Invite a user to become an admin or lecturer for <strong>{universityName}</strong>.
                </Typography>
                <Typography variant="body2" color="textSecondary" paragraph>
                    If the user already has an account, they will receive an upgrade request.
                    If they don't have an account, they will receive an invitation to sign up.
                </Typography>

                <TextField
                    label="Email Address"
                    placeholder="user@university.edu"
                    value={email}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    required
                    disabled={isSubmitting || !!result}
                    error={touched && (!email.trim() || !validateEmail(email))}
                    helperText={
                        touched && !email.trim()
                            ? "Email address is required"
                            : touched && !validateEmail(email)
                            ? "Please enter a valid email address"
                            : "Enter the email address of the user"
                    }
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                    style={{marginBottom: 16}}
                />

                <FormControl fullWidth variant="outlined" margin="dense" disabled={isSubmitting || !!result}>
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={role}
                        onChange={(e) => setRole(e.target.value as RoleType)}
                        label="Role"
                    >
                        <MenuItem value="admin">
                            <div>
                                <Typography variant="body1">Administrator</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Can manage courses, users, and all settings
                                </Typography>
                            </div>
                        </MenuItem>
                        <MenuItem value="lecturer">
                            <div>
                                <Typography variant="body1">Lecturer</Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Can manage assigned courses and students
                                </Typography>
                            </div>
                        </MenuItem>
                    </Select>
                </FormControl>

                {error && (
                    <Typography color="error" variant="body2" style={{marginTop: 16}}>
                        {error}
                    </Typography>
                )}

                {result && getResultMessage()}
            </DialogContent>
            <DialogActions>
                <FlexView width="100%" marginRight={25} marginBottom={15} marginTop={15} hAlignContent="right">
                    <Button
                        variant="outlined"
                        onClick={handleClose}
                        disabled={isSubmitting}
                        className={css(sharedStyles.no_text_transform)}
                        style={{marginRight: 12}}
                    >
                        {result ? 'Close' : 'Cancel'}
                    </Button>
                    {!result && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !email.trim() || !validateEmail(email)}
                            className={css(sharedStyles.no_text_transform)}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={20} style={{marginRight: 8}} color="inherit" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    Send Invitation
                                    <SendIcon fontSize="small" style={{marginLeft: 8}}/>
                                </>
                            )}
                        </Button>
                    )}
                </FlexView>
            </DialogActions>
        </Dialog>
    );
}
