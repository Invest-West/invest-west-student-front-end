import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../redux-store/reducers";
import {
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    FormControlLabel,
    Select,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper
} from "@material-ui/core";
import {css} from "aphrodite";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import AddIcon from "@material-ui/icons/Add";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";
import SendIcon from "@material-ui/icons/Send";
import FlexView from "react-flexview";
import {BeatLoader} from "react-spinners";
import * as DB_CONST from "../../../firebase/databaseConsts";
import * as utils from "../../../utils/utils";
import UserRepository from "../../../api/repositories/UserRepository";

export const INVITE_STATUS_NONE = 0;
export const INVITE_STATUS_SENDING = 1;
export const INVITE_STATUS_SUCCESS = 2;
export const INVITE_STATUS_ERROR = 3;

interface EmailInvite {
    id: string;
    email: string;
    userType: number;
    status: number;
    statusMessage?: string;
}

interface InviteMultipleUsersProps {
    currentAdmin?: any;
    currentGroup?: any;
    groupUserName?: string;
    // For super admins who need to select a group
    systemGroups?: any[];
    groupsLoaded?: boolean;
}

interface InviteMultipleUsersState {
    dialogOpen: boolean;
    newEmail: string;
    newUserType: number;
    emailList: EmailInvite[];
    sending: boolean;
    emailError: string;
    // For super admins - selected group to invite to
    selectedGroupId: string;
}

class InviteMultipleUsers extends Component<InviteMultipleUsersProps, InviteMultipleUsersState> {

    constructor(props: InviteMultipleUsersProps) {
        super(props);
        this.state = {
            dialogOpen: false,
            newEmail: '',
            newUserType: DB_CONST.TYPE_ISSUER, // Default to Student
            emailList: [],
            sending: false,
            emailError: '',
            selectedGroupId: ''
        };
    }

    toggleDialog = () => {
        this.setState({
            dialogOpen: !this.state.dialogOpen,
            newEmail: '',
            newUserType: DB_CONST.TYPE_ISSUER,
            emailList: [],
            sending: false,
            emailError: '',
            selectedGroupId: ''
        });
    };

    handleGroupChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        this.setState({
            selectedGroupId: event.target.value as string
        });
    };

    // Get the active group - either from URL params or from super admin selection
    getActiveGroup = () => {
        const { currentGroup, systemGroups } = this.props;
        const { selectedGroupId } = this.state;

        // If we have a current group from URL params, use that
        if (currentGroup) {
            return currentGroup;
        }

        // For super admins, use the selected group
        if (selectedGroupId && systemGroups) {
            return systemGroups.find(group => group.anid === selectedGroupId);
        }

        return null;
    };

    getActiveGroupUserName = () => {
        const { groupUserName, systemGroups } = this.props;
        const { selectedGroupId } = this.state;

        // If we have a group username from URL params, use that
        if (groupUserName) {
            return groupUserName;
        }

        // For super admins, get the username from the selected group
        if (selectedGroupId && systemGroups) {
            const group = systemGroups.find(g => g.anid === selectedGroupId);
            return group?.groupUserName;
        }

        return null;
    };

    isSuperAdmin = () => {
        const { currentAdmin } = this.props;
        return currentAdmin?.superAdmin || currentAdmin?.superGroupAdmin;
    };

    validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    handleEmailInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newEmail: event.target.value,
            emailError: ''
        });
    };

    handleUserTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            newUserType: parseInt(event.target.value)
        });
    };

    addEmailToList = () => {
        const {newEmail, newUserType, emailList} = this.state;

        if (!newEmail.trim()) {
            this.setState({emailError: 'Please enter an email address'});
            return;
        }

        if (!this.validateEmail(newEmail.trim())) {
            this.setState({emailError: 'Please enter a valid email address'});
            return;
        }

        // Check for duplicates
        if (emailList.some(item => item.email.toLowerCase() === newEmail.trim().toLowerCase())) {
            this.setState({emailError: 'This email is already in the list'});
            return;
        }

        const newInvite: EmailInvite = {
            id: Date.now().toString(),
            email: newEmail.trim(),
            userType: newUserType,
            status: INVITE_STATUS_NONE,
            statusMessage: ''
        };

        this.setState({
            emailList: [...emailList, newInvite],
            newEmail: '',
            emailError: ''
        });
    };

    removeEmailFromList = (id: string) => {
        this.setState({
            emailList: this.state.emailList.filter(item => item.id !== id)
        });
    };

    sendInvitations = async () => {
        const {emailList} = this.state;

        // Get the active group (from URL params or super admin selection)
        const activeGroup = this.getActiveGroup();
        const activeGroupUserName = this.getActiveGroupUserName();

        if (emailList.length === 0 || !activeGroup) {
            return;
        }

        this.setState({sending: true});

        const userRepository = new UserRepository();

        // Process each email invitation
        const updatedList = [...emailList];

        for (let i = 0; i < updatedList.length; i++) {
            const invite = updatedList[i];

            // Update status to sending
            updatedList[i] = {...invite, status: INVITE_STATUS_SENDING, statusMessage: 'Sending...'};
            this.setState({emailList: updatedList});

            try {
                // Call backend to create Firebase Auth account, Users record,
                // InvitedUsers record, and send email with generated password
                await userRepository.inviteStudent({
                    email: invite.email,
                    userType: invite.userType,
                    groupID: activeGroup.anid,
                    groupDisplayName: activeGroup.displayName,
                    groupUserName: activeGroupUserName || activeGroup.groupUserName,
                    groupLogo: utils.getLogoFromGroup(utils.GET_PLAIN_LOGO, activeGroup) || ''
                });

                // Update status to success
                updatedList[i] = {
                    ...invite,
                    status: INVITE_STATUS_SUCCESS,
                    statusMessage: 'Sent successfully'
                };
                this.setState({emailList: updatedList});

            } catch (error: any) {
                console.error(`Error sending invite to ${invite.email}:`, error);
                updatedList[i] = {
                    ...invite,
                    status: INVITE_STATUS_ERROR,
                    statusMessage: error.message || 'Failed to send'
                };
                this.setState({emailList: updatedList});
            }
        }

        this.setState({sending: false});
    };

    clearSuccessful = () => {
        this.setState({
            emailList: this.state.emailList.filter(item => item.status !== INVITE_STATUS_SUCCESS)
        });
    };

    render() {
        const {currentGroup, systemGroups, groupsLoaded} = this.props;
        const {dialogOpen, newEmail, newUserType, emailList, sending, emailError, selectedGroupId} = this.state;

        const hasSuccess = emailList.some(item => item.status === INVITE_STATUS_SUCCESS);
        const allComplete = emailList.length > 0 && emailList.every(item => item.status !== INVITE_STATUS_NONE && item.status !== INVITE_STATUS_SENDING);

        // Get the active group for display
        const activeGroup = this.getActiveGroup();
        const isSuperAdmin = this.isSuperAdmin();
        const needsGroupSelection = isSuperAdmin && !currentGroup;

        // Filter to only show parent groups (universities) for super admin selection
        const availableGroups = systemGroups?.filter(group => !group.parentGroupId) || [];

        return (
            <Box>
                <Typography variant="h6" color="primary">
                    Invite Multiple Users
                </Typography>

                <Box height="15px" />

                <Typography variant="body2" color="textSecondary" paragraph>
                    Send email invitations to multiple users at once. Users will receive an email with their login credentials to join {isSuperAdmin ? 'a university' : 'your course'}.
                </Typography>

                <Button
                    className={css(sharedStyles.no_text_transform)}
                    variant="outlined"
                    color="primary"
                    onClick={this.toggleDialog}
                    startIcon={<AddIcon />}
                >
                    Invite Multiple Users
                </Button>

                <Dialog
                    open={dialogOpen}
                    onClose={this.toggleDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        <FlexView vAlignContent="center">
                            <FlexView grow={4}>
                                <Typography variant="h6" color="primary">
                                    Invite Multiple Users {activeGroup ? `to ${activeGroup.displayName}` : ''}
                                </Typography>
                            </FlexView>
                            <FlexView grow={1} hAlignContent="right">
                                <IconButton onClick={this.toggleDialog}>
                                    <CloseIcon />
                                </IconButton>
                            </FlexView>
                        </FlexView>
                    </DialogTitle>

                    <DialogContent>
                        <Box display="flex" flexDirection="column" style={{gap: '16px'}}>
                            {/* Group Selection for Super Admins */}
                            {needsGroupSelection && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Select University
                                    </Typography>
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>University</InputLabel>
                                        <Select
                                            value={selectedGroupId}
                                            onChange={this.handleGroupChange}
                                            label="University"
                                            disabled={sending || !groupsLoaded}
                                        >
                                            <MenuItem value="">
                                                <em>{groupsLoaded ? 'Select a university...' : 'Loading universities...'}</em>
                                            </MenuItem>
                                            {availableGroups.map(group => (
                                                <MenuItem key={group.anid} value={group.anid}>
                                                    {group.displayName}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Box>
                            )}

                            {/* Add Email Section */}
                            <Box>
                                <Typography variant="subtitle1" gutterBottom>
                                    Add Email Addresses
                                </Typography>

                                <Box display="flex" flexDirection="column" style={{gap: '12px'}}>
                                    <TextField
                                        variant="outlined"
                                        label="Email Address"
                                        placeholder="Enter email address"
                                        value={newEmail}
                                        onChange={this.handleEmailInputChange}
                                        fullWidth
                                        error={!!emailError}
                                        helperText={emailError}
                                        disabled={sending || (needsGroupSelection && !selectedGroupId)}
                                    />

                                    <FormControl component="fieldset">
                                        <FormLabel component="legend">User Type</FormLabel>
                                        <RadioGroup
                                            row
                                            value={newUserType.toString()}
                                            onChange={this.handleUserTypeChange}
                                        >
                                            <FormControlLabel
                                                value={DB_CONST.TYPE_ISSUER.toString()}
                                                control={<Radio color="primary" />}
                                                label="Student"
                                                disabled={sending || (needsGroupSelection && !selectedGroupId)}
                                            />
                                            <FormControlLabel
                                                value={DB_CONST.TYPE_INVESTOR.toString()}
                                                control={<Radio color="primary" />}
                                                label="Project Viewer"
                                                disabled={sending || (needsGroupSelection && !selectedGroupId)}
                                            />
                                        </RadioGroup>
                                    </FormControl>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={this.addEmailToList}
                                        disabled={sending || (needsGroupSelection && !selectedGroupId)}
                                        className={css(sharedStyles.no_text_transform)}
                                    >
                                        Add to List
                                    </Button>
                                </Box>
                            </Box>

                            {/* Email List */}
                            {emailList.length > 0 && (
                                <Box>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Email List ({emailList.length})
                                    </Typography>
                                    <Paper elevation={1}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell>Type</TableCell>
                                                    <TableCell>Status</TableCell>
                                                    <TableCell>Action</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {emailList.map((invite) => (
                                                    <TableRow key={invite.id}>
                                                        <TableCell>{invite.email}</TableCell>
                                                        <TableCell>
                                                            {invite.userType === DB_CONST.TYPE_ISSUER ? 'Student' : 'Project Viewer'}
                                                        </TableCell>
                                                        <TableCell>
                                                            {invite.status === INVITE_STATUS_NONE && (
                                                                <Chip label="Ready" size="small" />
                                                            )}
                                                            {invite.status === INVITE_STATUS_SENDING && (
                                                                <Chip
                                                                    label="Sending..."
                                                                    size="small"
                                                                    color="primary"
                                                                    icon={<BeatLoader size={5} color="white" />}
                                                                />
                                                            )}
                                                            {invite.status === INVITE_STATUS_SUCCESS && (
                                                                <Chip
                                                                    label={invite.statusMessage}
                                                                    size="small"
                                                                    style={{backgroundColor: '#4caf50', color: 'white'}}
                                                                />
                                                            )}
                                                            {invite.status === INVITE_STATUS_ERROR && (
                                                                <Chip
                                                                    label={invite.statusMessage}
                                                                    size="small"
                                                                    color="secondary"
                                                                />
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => this.removeEmailFromList(invite.id)}
                                                                disabled={sending || invite.status === INVITE_STATUS_SUCCESS}
                                                            >
                                                                <DeleteIcon fontSize="small" />
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Paper>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions>
                        <FlexView width="100%" marginRight={25} marginBottom={15} marginTop={20} hAlignContent="right" vAlignContent="center" style={{gap: '10px'}}>
                            {hasSuccess && allComplete && (
                                <Button
                                    variant="outlined"
                                    onClick={this.clearSuccessful}
                                    className={css(sharedStyles.no_text_transform)}
                                >
                                    Clear Successful
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                onClick={this.toggleDialog}
                                className={css(sharedStyles.no_text_transform)}
                                disabled={sending}
                            >
                                {allComplete ? 'Close' : 'Cancel'}
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={this.sendInvitations}
                                disabled={emailList.length === 0 || sending || allComplete || !activeGroup}
                                startIcon={sending ? <BeatLoader size={8} color="white" /> : <SendIcon />}
                                className={css(sharedStyles.no_text_transform)}
                            >
                                {sending ? 'Sending...' : `Send ${emailList.length} Invitation${emailList.length !== 1 ? 's' : ''}`}
                            </Button>
                        </FlexView>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }
}

const mapStateToProps = (state: AppState) => {
    return {
        currentAdmin: state.auth?.user,
        currentGroup: state.manageGroupFromParams?.groupProperties,
        groupUserName: state.manageGroupFromParams?.groupUserName,
        // For super admins who need to select a group
        systemGroups: state.manageSystemGroups?.systemGroups,
        groupsLoaded: state.manageSystemGroups?.groupsLoaded
    };
};

export default connect(mapStateToProps)(InviteMultipleUsers);
