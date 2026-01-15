import React, {useState} from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
    CircularProgress
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SendIcon from '@material-ui/icons/Send';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';
import sharedStyles from '../../../shared-js-css-styles/SharedStyles';
import AdminAccessRequestRepository from '../../../api/repositories/AdminAccessRequestRepository';

interface AddAdminAccessRequestDialogProps {
    open: boolean;
    groupId: string;
    groupName: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AddAdminAccessRequestDialog(props: AddAdminAccessRequestDialogProps) {
    const {open, groupId, groupName, onClose, onSuccess} = props;

    const [requestedEmail, setRequestedEmail] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [touched, setTouched] = useState(false);

    const repository = new AdminAccessRequestRepository();

    const handleClose = () => {
        if (!isSubmitting) {
            // Reset state
            setRequestedEmail('');
            setReason('');
            setError(null);
            setSuccess(false);
            setTouched(false);
            onClose();
        }
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async () => {
        setTouched(true);
        setError(null);

        // Validate email
        if (!requestedEmail.trim()) {
            setError('Email address is required');
            return;
        }

        if (!validateEmail(requestedEmail)) {
            setError('Please enter a valid email address');
            return;
        }

        setIsSubmitting(true);

        try {
            await repository.createAdminAccessRequest(
                requestedEmail.trim(),
                groupId,
                reason.trim() || undefined
            );

            setSuccess(true);

            // Wait a moment to show success message, then close
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                }
                handleClose();
            }, 1500);
        } catch (err: any) {
            console.error('Error creating admin access request:', err);
            setError(err?.response?.data?.detail || 'Failed to submit request. Please try again.');
            setIsSubmitting(false);
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
                    <FlexView grow={4}>
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
                    Request to add a user as an admin to <strong>{groupName}</strong>.
                    The system will check if the user exists and either upgrade them or send an invitation.
                </Typography>

                <TextField
                    label="Email Address"
                    placeholder="user@example.com"
                    value={requestedEmail}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    required
                    disabled={isSubmitting || success}
                    error={touched && (!requestedEmail.trim() || !validateEmail(requestedEmail))}
                    helperText={
                        touched && !requestedEmail.trim()
                            ? "Email address is required"
                            : touched && !validateEmail(requestedEmail)
                            ? "Please enter a valid email address"
                            : "Enter the email address of the user you want to add as admin"
                    }
                    onChange={(e) => setRequestedEmail(e.target.value)}
                    onBlur={() => setTouched(true)}
                />

                <TextField
                    label="Reason (Optional)"
                    placeholder="Why should this user be granted admin access?"
                    value={reason}
                    fullWidth
                    margin="dense"
                    variant="outlined"
                    multiline
                    rows={3}
                    disabled={isSubmitting || success}
                    helperText="Provide a justification for this request to help super admins make a decision"
                    onChange={(e) => setReason(e.target.value)}
                />

                {error && (
                    <Typography color="error" variant="body2" style={{marginTop: 16}}>
                        {error}
                    </Typography>
                )}

                {success && (
                    <Typography color="primary" variant="body2" style={{marginTop: 16}}>
                        ✓ Request submitted successfully! A super admin will review it.
                    </Typography>
                )}
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
                        {success ? 'Close' : 'Cancel'}
                    </Button>
                    {!success && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={isSubmitting || !requestedEmail.trim() || !validateEmail(requestedEmail)}
                            className={css(sharedStyles.no_text_transform)}
                        >
                            {isSubmitting ? (
                                <>
                                    <CircularProgress size={20} style={{marginRight: 8}} color="inherit" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Request
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
