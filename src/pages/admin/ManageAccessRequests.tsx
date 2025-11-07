import React, {useEffect, useState} from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
    Tab,
    Tabs,
    TextField,
    Typography
} from '@material-ui/core';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import CloseIcon from '@material-ui/icons/Close';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import AdminAccessRequestRepository from '../../api/repositories/AdminAccessRequestRepository';
import {AdminAccessRequestInstance} from '../../models/admin_access_request';
import Admin, {isAdmin} from '../../models/admin';
import User from '../../models/user';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const {children, value, index, ...other} = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </div>
    );
}

interface ManageAccessRequestsProps {
    currentUser: User | Admin;
}

export default function ManageAccessRequests({currentUser}: ManageAccessRequestsProps) {
    const [activeTab, setActiveTab] = useState(0);
    const [pendingRequests, setPendingRequests] = useState<AdminAccessRequestInstance[]>([]);
    const [approvedRequests, setApprovedRequests] = useState<AdminAccessRequestInstance[]>([]);
    const [rejectedRequests, setRejectedRequests] = useState<AdminAccessRequestInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Rejection dialog state
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<AdminAccessRequestInstance | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');

    const repository = new AdminAccessRequestRepository();

    // Check if current user is super admin
    const currentAdmin = isAdmin(currentUser);
    const isSuperAdmin = !!(currentAdmin && (currentAdmin.superAdmin || currentAdmin.superGroupAdmin));

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        setError(null);

        try {
            // For normal admins, only fetch their own requests
            // For super admins, fetch all requests
            const fetchOptions = isSuperAdmin
                ? {}
                : { requestedBy: currentUser.id };

            const [pending, approved, rejected] = await Promise.all([
                repository.fetchAdminAccessRequests({...fetchOptions, status: 'pending'}),
                repository.fetchAdminAccessRequests({...fetchOptions, status: 'approved'}),
                repository.fetchAdminAccessRequests({...fetchOptions, status: 'rejected'})
            ]);

            setPendingRequests(pending.data || []);
            setApprovedRequests(approved.data || []);
            setRejectedRequests(rejected.data || []);
        } catch (err: any) {
            console.error('Error loading admin access requests:', err);
            setError('Failed to load requests. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (request: AdminAccessRequestInstance) => {
        setActionLoading(request.request.id);
        try {
            await repository.approveAdminAccessRequest(request.request.id);
            // Refresh requests
            await loadRequests();
        } catch (err: any) {
            console.error('Error approving request:', err);
            alert(err?.response?.data?.detail || 'Failed to approve request. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectClick = (request: AdminAccessRequestInstance) => {
        setSelectedRequest(request);
        setRejectionReason('');
        setRejectDialogOpen(true);
    };

    const handleRejectSubmit = async () => {
        if (!selectedRequest || !rejectionReason.trim()) {
            return;
        }

        setActionLoading(selectedRequest.request.id);
        try {
            await repository.rejectAdminAccessRequest(selectedRequest.request.id, rejectionReason.trim());
            setRejectDialogOpen(false);
            setSelectedRequest(null);
            setRejectionReason('');
            // Refresh requests
            await loadRequests();
        } catch (err: any) {
            console.error('Error rejecting request:', err);
            alert(err?.response?.data?.detail || 'Failed to reject request. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderRequestCard = (requestInstance: AdminAccessRequestInstance, showActions: boolean = false) => {
        const {request, requester, group, requestedUser} = requestInstance;
        const isProcessing = actionLoading === request.id;

        return (
            <Card key={request.id} style={{marginBottom: 16}}>
                <CardContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <FlexView vAlignContent="center" style={{marginBottom: 8}}>
                                <Typography variant="h6" style={{marginRight: 12}}>
                                    {request.requestedEmail}
                                </Typography>
                                <Chip
                                    label={request.requestType === 'upgrade' ? 'Upgrade User' : 'Invite New User'}
                                    size="small"
                                    color={request.requestType === 'upgrade' ? 'primary' : 'default'}
                                />
                            </FlexView>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            {isSuperAdmin && (
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Requested by:</strong> {requester.email}
                                </Typography>
                            )}
                            <Typography variant="body2" color="textSecondary">
                                <strong>Course:</strong> {group.displayName}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                <strong>Date:</strong> {formatDate(request.requestedDate)}
                            </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            {requestedUser && (
                                <Typography variant="body2" color="textSecondary">
                                    <strong>Existing User:</strong> {
                                        'firstName' in requestedUser && 'lastName' in requestedUser
                                            ? `${requestedUser.firstName} ${requestedUser.lastName}`
                                            : requestedUser.email
                                    }
                                </Typography>
                            )}
                            {request.reason && (
                                <Typography variant="body2" color="textSecondary" style={{marginTop: 8}}>
                                    <strong>Reason:</strong> {request.reason}
                                </Typography>
                            )}
                        </Grid>

                        {request.rejectionFeedback && (
                            <Grid item xs={12}>
                                <Paper elevation={0} style={{backgroundColor: '#ffebee', padding: 12}}>
                                    <Typography variant="body2" color="error">
                                        <strong>Rejected:</strong> {request.rejectionFeedback.reason}
                                    </Typography>
                                    <Typography variant="caption" color="textSecondary">
                                        {formatDate(request.rejectionFeedback.rejectedDate)}
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}

                        {request.approvalInfo && (
                            <Grid item xs={12}>
                                <Paper elevation={0} style={{backgroundColor: '#e8f5e9', padding: 12}}>
                                    <Typography variant="body2" style={{color: '#2e7d32'}}>
                                        <strong>Approved</strong> on {formatDate(request.approvalInfo.approvedDate)}
                                    </Typography>
                                </Paper>
                            </Grid>
                        )}

                        {showActions && (
                            <Grid item xs={12}>
                                <FlexView hAlignContent="right" vAlignContent="center" style={{marginTop: 8}}>
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<CancelIcon/>}
                                        onClick={() => handleRejectClick(requestInstance)}
                                        disabled={isProcessing}
                                        className={css(sharedStyles.no_text_transform)}
                                        style={{marginRight: 12}}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={isProcessing ? <CircularProgress size={20} color="inherit"/> : <CheckCircleIcon/>}
                                        onClick={() => handleApprove(requestInstance)}
                                        disabled={isProcessing}
                                        className={css(sharedStyles.no_text_transform)}
                                    >
                                        {isProcessing ? 'Approving...' : 'Approve'}
                                    </Button>
                                </FlexView>
                            </Grid>
                        )}
                    </Grid>
                </CardContent>
            </Card>
        );
    };

    if (loading) {
        return (
            <FlexView hAlignContent="center" vAlignContent="center" style={{minHeight: '400px'}}>
                <CircularProgress/>
            </FlexView>
        );
    }

    return (
        <Box width="100%">
            {error && (
                <Paper elevation={0} style={{backgroundColor: '#ffebee', padding: 16, marginBottom: 16}}>
                    <Typography color="error">{error}</Typography>
                </Paper>
            )}

            <Paper>
                <Tabs
                    value={activeTab}
                    onChange={(_, newValue) => setActiveTab(newValue)}
                    indicatorColor="primary"
                    textColor="primary"
                >
                    <Tab label={`Pending (${pendingRequests.length})`}/>
                    <Tab label={`Approved (${approvedRequests.length})`}/>
                    <Tab label={`Rejected (${rejectedRequests.length})`}/>
                </Tabs>

                <TabPanel value={activeTab} index={0}>
                    {pendingRequests.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" align="center">
                            {isSuperAdmin ? 'No pending requests' : 'You have no pending requests'}
                        </Typography>
                    ) : (
                        pendingRequests.map(request => renderRequestCard(request, isSuperAdmin))
                    )}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                    {approvedRequests.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" align="center">
                            {isSuperAdmin ? 'No approved requests' : 'You have no approved requests'}
                        </Typography>
                    ) : (
                        approvedRequests.map(request => renderRequestCard(request, false))
                    )}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                    {rejectedRequests.length === 0 ? (
                        <Typography variant="body2" color="textSecondary" align="center">
                            {isSuperAdmin ? 'No rejected requests' : 'You have no rejected requests'}
                        </Typography>
                    ) : (
                        rejectedRequests.map(request => renderRequestCard(request, false))
                    )}
                </TabPanel>
            </Paper>

            {/* Rejection Dialog */}
            <Dialog
                open={rejectDialogOpen}
                onClose={() => !actionLoading && setRejectDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle disableTypography>
                    <FlexView vAlignContent="center">
                        <FlexView grow={4}>
                            <Typography variant='h6' color='secondary'>
                                Reject Access Request
                            </Typography>
                        </FlexView>
                        <FlexView grow={1} hAlignContent="right">
                            <IconButton onClick={() => setRejectDialogOpen(false)} disabled={!!actionLoading}>
                                <CloseIcon/>
                            </IconButton>
                        </FlexView>
                    </FlexView>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" gutterBottom>
                        Please provide a reason for rejecting this request. This will be sent to the requester.
                    </Typography>
                    <TextField
                        label="Rejection Reason"
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        fullWidth
                        multiline
                        rows={4}
                        margin="normal"
                        variant="outlined"
                        required
                        disabled={!!actionLoading}
                        error={!rejectionReason.trim()}
                        helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setRejectDialogOpen(false)}
                        disabled={!!actionLoading}
                        className={css(sharedStyles.no_text_transform)}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRejectSubmit}
                        color="secondary"
                        variant="contained"
                        disabled={!rejectionReason.trim() || !!actionLoading}
                        className={css(sharedStyles.no_text_transform)}
                    >
                        {actionLoading ? 'Rejecting...' : 'Reject Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
