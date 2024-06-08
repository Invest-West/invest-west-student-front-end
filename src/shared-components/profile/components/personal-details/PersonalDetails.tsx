import React, {Component} from "react";
import {connect} from "react-redux";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {AppState} from "../../../../redux-store/reducers";
import {ProfileState} from "../../ProfileReducer";
import {handleInputFieldChanged, InputCategories} from "../../ProfileActions";
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    MenuItem,
    OutlinedInput,
    Select,
    TextField,
    Typography
} from "@material-ui/core";
import User, {getProfilePicture, UserTitles} from "../../../../models/user";
import LetterAvatar from "../../../avatars/LetterAvatar";
import {Col, Image, Row} from "react-bootstrap";
import {AuthenticationState} from "../../../../redux-store/reducers/authenticationReducer";
import Admin, {isAdmin} from "../../../../models/admin";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import * as utils from "../../../../utils/utils";
import {toggleDialog} from "../edit-image-dialog/EditImageDialogActions";

interface PersonalDetailsProps {
    AuthenticationState: AuthenticationState;
    ProfileLocalState: ProfileState;
    handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => any;
    toggleUpdateProfilePhotoDialog: (image?: string) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        AuthenticationState: state.AuthenticationState,
        ProfileLocalState: state.ProfileLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        handleInputFieldChanged: (inputCategory: InputCategories, event: React.ChangeEvent<HTMLInputElement>) => dispatch(handleInputFieldChanged(inputCategory, event)),
        toggleUpdateProfilePhotoDialog: (image?: string) => dispatch(toggleDialog(image))
    }
}

class PersonalDetails extends Component<PersonalDetailsProps, any> {

    onInputFieldChanged = (inputCategory: InputCategories) => (event: React.ChangeEvent<HTMLInputElement>) => {
        this.props.handleInputFieldChanged(inputCategory, event);
    }

    render() {
        const {
            AuthenticationState,
            ProfileLocalState,
            toggleUpdateProfilePhotoDialog
        } = this.props;

        const currentUser: User | Admin | null = AuthenticationState.currentUser;
        if (!currentUser) {
            return null;
        }

        const currentAdmin: Admin | null = isAdmin(currentUser);

        const copiedUser: User | undefined = ProfileLocalState.copiedUser;

        if (!copiedUser) {
            return null;
        }

        return <Box
            display="flex"
            flexDirection="column"
        >
            {/** Section title */}
            <Box>
                <Typography variant="h6" color="primary">Personal details</Typography>
            </Box>
            <Box height="25px"/>
            <Box display="flex" flexDirection="row">
                <Row noGutters style={{ width: "100%" }} >
                    {/** Profile picture */}
                    <Col xs={12} sm={12} md={6} lg={4} >
                        <Box display="flex" flexDirection="column" >
                            {/** Display profile picture */}
                            {
                                getProfilePicture(copiedUser) === null
                                    ? <LetterAvatar firstName={copiedUser.firstName} lastName={copiedUser.lastName} width={196} height={196} textVariant="h5" />
                                    : <Image roundedCircle thumbnail src={getProfilePicture(copiedUser) ?? ""} width={256} height={256} style={{ objectFit: "contain" }} />
                            }

                            {/** Button to update profile picture (not available when current user is an admin) */}
                            {
                                currentAdmin
                                    ? null
                                    : <Box marginY="20px" >
                                        <Button size="small" className={css(sharedStyles.no_text_transform)} variant="outlined" color="primary" onClick={() => toggleUpdateProfilePhotoDialog(getProfilePicture(copiedUser) ?? undefined)}>Update profile photo</Button>
                                    </Box>
                            }
                        </Box>
                    </Col>

                    {/** Personal information */}
                    <Col xs={12} sm={12} md={6} lg={4}>
                        <Box display="flex" flexDirection="column">
                            {/** Title */}
                            <FormControl fullWidth>
                                <FormLabel> <b>Title</b> </FormLabel>
                                <Select
                                    name="title"
                                    value={copiedUser.title}
                                    defaultValue="-1"
                                    // @ts-ignore
                                    onChange={this.onInputFieldChanged(InputCategories.PersonalDetails)}
                                    input={ <OutlinedInput/> }
                                    margin="dense"
                                >
                                    <MenuItem key="-1" value="-1">Please select</MenuItem>
                                    {
                                        UserTitles.map(title => (
                                            <MenuItem key={title} value={title}>{title}</MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>

                            <Box height="22px"/>

                            {/** First name */}
                            <FormControl fullWidth>
                                <FormLabel><b>First name</b></FormLabel>
                                <TextField name="firstName" placeholder="Enter first name" value={copiedUser.firstName} margin="dense" variant="outlined" onChange={this.onInputFieldChanged(InputCategories.PersonalDetails)} error={copiedUser.firstName.trim().length === 0} />
                            </FormControl>

                            <Box height="22px"/>

                            {/** Last name */}
                            <FormControl fullWidth>
                                <FormLabel><b>Last name</b></FormLabel>
                                <TextField name="lastName" placeholder="Enter last name" value={copiedUser.lastName} margin="dense" variant="outlined" onChange={this.onInputFieldChanged(InputCategories.PersonalDetails)} error={copiedUser.lastName.trim().length === 0}/>
                            </FormControl>
                            <Box height="22px"/>

                            {/** Email */}
                            <FormControl fullWidth>
                                <FormLabel><b>Email</b></FormLabel>
                                <TextField name="email" placeholder="Enter email" value={copiedUser.email} margin="dense" variant="outlined" onChange={this.onInputFieldChanged(InputCategories.PersonalDetails)} disabled={true} error={copiedUser.email.trim().length === 0} />
                            </FormControl>
                            <Box height="22px"/>

                            {/** LinkedIn */}
                            <FormControl fullWidth>
                                <FormLabel><b>LinkedIn</b></FormLabel>
                                <TextField name="linkedin" placeholder="Enter your LinkedIn profile" value={copiedUser.linkedin ?? ""} margin="dense" variant="outlined" onChange={this.onInputFieldChanged(InputCategories.PersonalDetails)} error={!utils.isValidLinkedInURL(copiedUser.linkedin)}/>
                            </FormControl>
                        </Box>
                    </Col>
                </Row>
            </Box>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(PersonalDetails);