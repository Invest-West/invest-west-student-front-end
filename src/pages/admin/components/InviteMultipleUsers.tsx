import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
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
    Radio,
    RadioGroup,
    FormControlLabel,
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
import * as colors from "../../../values/colors";
import * as DB_CONST from "../../../firebase/databaseConsts";
import * as emailUtils from "../../../utils/emailUtils";
import * as realtimeDBUtils from "../../../firebase/realtimeDBUtils";
import firebase from "../../../firebase/firebaseApp";

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
}

interface InviteMultipleUsersState {
    dialogOpen: boolean;
    newEmail: string;
    newUserType: number;
    emailList: EmailInvite[];
    sending: boolean;
    emailError: string;
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
            emailError: ''
        };
    }

    toggleDialog = () => {
        this.setState({
            dialogOpen: !this.state.dialogOpen,
            newEmail: '',
            newUserType: DB_CONST.TYPE_ISSUER,
            emailList: [],
            sending: false,
            emailError: ''
        });
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
        const {currentAdmin, currentGroup, groupUserName} = this.props;

        if (emailList.length === 0) {
            return;
        }

        this.setState({sending: true});

        // Process each email invitation
        const updatedList = [...emailList];

        for (let i = 0; i < updatedList.length; i++) {
            const invite = updatedList[i];

            // Update status to sending
            updatedList[i] = {...invite, status: INVITE_STATUS_SENDING, statusMessage: 'Sending...'};
            this.setState({emailList: updatedList});

            try {
                // Check if user was already invited
                const existingInvites = await realtimeDBUtils.loadInvitedUsers(currentGroup?.anid);
                const alreadyInvited = existingInvites.find(
                    (invitedUser: any) => invitedUser.email.toLowerCase() === invite.email.toLowerCase()
                );

                if (alreadyInvited) {
                    updatedList[i] = {
                        ...invite,
                        status: INVITE_STATUS_ERROR,
                        statusMessage: 'Already invited'
                    };
                    this.setState({emailList: updatedList});
                    continue;
                }

                // Generate invitation ID
                const invitationID = firebase.database().ref().child('invitedUsers').push().key;

                // Build signup URL
                const signupURL = `${window.location.origin}/groups/${groupUserName}/signup?invitedUserID=${invitationID}`;

                // Create invited user object
                const invitedUser = {
                    id: invitationID,
                    email: invite.email,
                    firstName: '',
                    lastName: '',
                    title: '',
                    type: invite.userType,
                    status: DB_CONST.INVITED_USER_NOT_REGISTERED,
                    invitedBy: currentGroup?.anid,
                    invitedDate: Date.now(),
                    Invitor: {
                        anid: currentGroup?.anid,
                        displayName: currentGroup?.displayName,
                        groupUserName: currentGroup?.groupUserName
                    }
                };

                // Save to Firebase
                await firebase
                    .database()
                    .ref(DB_CONST.INVITED_USERS_CHILD)
                    .child(invitationID!)
                    .set(invitedUser);

                // Send email
                await emailUtils.sendEmail({
                    serverURL: process.env.REACT_APP_BACK_END_BASE_URL,
                    emailType: emailUtils.EMAIL_INVITATION,
                    data: {
                        groupName: currentGroup?.displayName,
                        groupLogo: currentGroup?.plainLogo?.[0] || '',
                        groupWebsite: currentGroup?.website || '',
                        groupContactUs: currentGroup?.contactUs || '',
                        sender: currentAdmin?.email,
                        receiver: invite.email,
                        receiverName: invite.email.split('@')[0],
                        userType: invite.userType,
                        signupURL: signupURL
                    }
                });

                // Track activity
                await realtimeDBUtils
                    .trackActivity({
                        userID: currentAdmin.id,
                        activityType: DB_CONST.ACTIVITY_TYPE_POST,
                        interactedObjectLocation: DB_CONST.INVITED_USERS_CHILD,
                        interactedObjectID: invitedUser.id,
                        activitySummary: `invited ${invite.email} to join ${currentGroup?.displayName} as a ${invite.userType === DB_CONST.TYPE_ISSUER ? 'student' : 'project viewer'}`
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
        const {currentAdmin, currentGroup} = this.props;
        const {dialogOpen, newEmail, newUserType, emailList, sending, emailError} = this.state;

        const hasSuccess = emailList.some(item => item.status === INVITE_STATUS_SUCCESS);
        const allComplete = emailList.length > 0 && emailList.every(item => item.status !== INVITE_STATUS_NONE && item.status !== INVITE_STATUS_SENDING);

        return (
            <Box>
                <Typography variant="h6" color="primary">
                    Invite Multiple Users
                </Typography>

                <Box height="15px" />

                <Typography variant="body2" color="textSecondary" paragraph>
                    Send email invitations to multiple users at once. Users will receive an email with a signup link to join your course.
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
                                    Invite Multiple Users to {currentGroup?.displayName}
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
                                        disabled={sending}
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
                                                disabled={sending}
                                            />
                                            <FormControlLabel
                                                value={DB_CONST.TYPE_INVESTOR.toString()}
                                                control={<Radio color="primary" />}
                                                label="Project Viewer"
                                                disabled={sending}
                                            />
                                        </RadioGroup>
                                    </FormControl>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={this.addEmailToList}
                                        disabled={sending}
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
                                disabled={emailList.length === 0 || sending || allComplete}
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
        groupUserName: state.manageGroupFromParams?.groupUserName
    };
};

export default connect(mapStateToProps)(InviteMultipleUsers);
