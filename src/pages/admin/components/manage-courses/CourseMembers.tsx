import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Chip,
    Box,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Divider,
    Paper
} from '@material-ui/core';
import { Add as AddIcon, Delete as DeleteIcon, Email as EmailIcon } from '@material-ui/icons';
import Api from '../../../../api/Api';

interface CourseMembersProps {
    open: boolean;
    onClose: () => void;
    courseName: string;
    groupUserName: string;
    courseUserName: string;
}

interface CourseMember {
    email: string;
    firstName: string;
    lastName: string;
    type: number;
}

interface AddMemberResult {
    email: string;
    success: boolean;
    message: string;
}

const CourseMembers: React.FC<CourseMembersProps> = ({
    open,
    onClose,
    courseName,
    groupUserName,
    courseUserName
}) => {
    const [members, setMembers] = useState<CourseMember[]>([]);
    const [loading, setLoading] = useState(false);
    const [addingMembers, setAddingMembers] = useState(false);
    const [emailInput, setEmailInput] = useState('');
    const [emailsToAdd, setEmailsToAdd] = useState<string[]>([]);
    const [addResults, setAddResults] = useState<AddMemberResult[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Load course members when dialog opens
    useEffect(() => {
        if (open) {
            loadCourseMembers();
            setEmailInput('');
            setEmailsToAdd([]);
            setAddResults([]);
            setError(null);
        }
    }, [open, groupUserName, courseUserName]);

    const loadCourseMembers = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await Api.doGet(`/groups/${groupUserName}/courses/${courseUserName}/list-members`);
            setMembers(response.data || []);
        } catch (error) {
            console.error('Error loading course members:', error);
            setError('Failed to load course members');
            setMembers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleAddEmail = () => {
        const email = emailInput.trim();
        if (email && !emailsToAdd.includes(email)) {
            // Basic email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(email)) {
                setEmailsToAdd([...emailsToAdd, email]);
                setEmailInput('');
            } else {
                setError('Please enter a valid email address');
            }
        }
    };

    const handleRemoveEmail = (emailToRemove: string) => {
        setEmailsToAdd(emailsToAdd.filter(email => email !== emailToRemove));
    };

    const handleAddMembersToCourse = async () => {
        if (emailsToAdd.length === 0) return;

        try {
            setAddingMembers(true);
            setError(null);
            const response = await Api.doPut(`/groups/${groupUserName}/courses/${courseUserName}/add-members`, {
                emails: emailsToAdd
            });
            
            setAddResults(response.data.results || []);
            setEmailsToAdd([]);
            
            // Reload members to show updated list
            await loadCourseMembers();
        } catch (error) {
            console.error('Error adding members to course:', error);
            setError('Failed to add members to course');
        } finally {
            setAddingMembers(false);
        }
    };

    const handleRemoveMemberFromCourse = async (email: string) => {
        try {
            setError(null);
            await Api.doDelete(`/groups/${groupUserName}/courses/${courseUserName}/remove-member/${encodeURIComponent(email)}`);
            
            // Reload members to show updated list
            await loadCourseMembers();
        } catch (error) {
            console.error('Error removing member from course:', error);
            setError('Failed to remove member from course');
        }
    };

    const handleClose = () => {
        setEmailInput('');
        setEmailsToAdd([]);
        setAddResults([]);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center">
                    <EmailIcon style={{ marginRight: 8 }} />
                    Manage Members: {courseName}
                </Box>
                <Typography variant="body2" color="textSecondary">
                    Add or remove members for this course
                </Typography>
            </DialogTitle>

            <DialogContent>
                {error && (
                    <Paper style={{ padding: 16, marginBottom: 16, backgroundColor: '#ffebee', border: '1px solid #f44336' }}>
                        <Typography color="error">{error}</Typography>
                    </Paper>
                )}

                {/* Add Members Section */}
                <Box mb={3}>
                    <Typography variant="h6" gutterBottom>
                        Add Members by Email
                    </Typography>
                    
                    <Box display="flex" mb={2} style={{ gap: '8px' }}>
                        <TextField
                            label="Email Address"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleAddEmail();
                                }
                            }}
                            placeholder="Enter email address"
                            size="small"
                            fullWidth
                        />
                        <Button
                            variant="outlined"
                            onClick={handleAddEmail}
                            startIcon={<AddIcon />}
                            disabled={!emailInput.trim()}
                        >
                            Add
                        </Button>
                    </Box>

                    {/* Email chips */}
                    {emailsToAdd.length > 0 && (
                        <Box mb={2}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Emails to add:
                            </Typography>
                            <Box display="flex" flexWrap="wrap" style={{ gap: '8px' }}>
                                {emailsToAdd.map((email) => (
                                    <Chip
                                        key={email}
                                        label={email}
                                        onDelete={() => handleRemoveEmail(email)}
                                        color="primary"
                                        variant="outlined"
                                    />
                                ))}
                            </Box>
                        </Box>
                    )}

                    {emailsToAdd.length > 0 && (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddMembersToCourse}
                            disabled={addingMembers}
                            startIcon={addingMembers ? <CircularProgress size={20} /> : <AddIcon />}
                        >
                            {addingMembers ? 'Adding Members...' : `Add ${emailsToAdd.length} Member(s) to Course`}
                        </Button>
                    )}

                    {/* Add results */}
                    {addResults.length > 0 && (
                        <Box mt={2}>
                            <Typography variant="body2" gutterBottom>
                                Results:
                            </Typography>
                            {addResults.map((result, index) => (
                                <Paper 
                                    key={index}
                                    style={{ 
                                        padding: 12, 
                                        marginBottom: 8,
                                        backgroundColor: result.success ? '#e8f5e8' : '#ffebee',
                                        border: `1px solid ${result.success ? '#4caf50' : '#f44336'}`
                                    }}
                                >
                                    <Typography style={{ color: result.success ? '#2e7d32' : '#c62828' }}>
                                        <strong>{result.email}:</strong> {result.message}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </Box>

                <Divider />

                {/* Current Members Section */}
                <Box mt={3}>
                    <Typography variant="h6" gutterBottom>
                        Current Members ({members.length})
                    </Typography>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={3}>
                            <CircularProgress />
                        </Box>
                    ) : members.length === 0 ? (
                        <Typography color="textSecondary" style={{ textAlign: 'center', padding: 20 }}>
                            No members assigned to this course yet.
                        </Typography>
                    ) : (
                        <List>
                            {members.map((member, index) => (
                                <ListItem key={member.email} divider={index < members.length - 1}>
                                    <ListItemText
                                        primary={`${member.firstName} ${member.lastName}`}
                                        secondary={member.email}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            edge="end"
                                            onClick={() => handleRemoveMemberFromCourse(member.email)}
                                            color="secondary"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CourseMembers;