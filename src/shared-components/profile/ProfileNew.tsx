import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box} from "@material-ui/core";
import PersonalDetails from "./components/personal-details/PersonalDetails";
import EditImageDialog from "./components/edit-image-dialog/EditImageDialog";
import FeedbackSnackbarNew from "../feedback-snackbar/FeedbackSnackbarNew";
import BusinessProfile from "./components/business-profile/BusinessProfile";
import {hasInitiallySetCopiedUser, ProfileState} from "./ProfileReducer";
import {AuthenticationState, successfullyAuthenticated} from "../../redux-store/reducers/authenticationReducer";
import User from "../../models/user";
import {setCopiedUser} from "./ProfileActions";

interface ProfileProps {
    // this must be set when an admin is viewing a user's profile
    thirdViewUser?: User;
    AuthenticationState: AuthenticationState;
    ProfileLocalState: ProfileState;
    setCopiedUser: (user: User | null, firstTimeSetCopiedUser?: true) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        AuthenticationState: state.AuthenticationState,
        ProfileLocalState: state.ProfileLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setCopiedUser: (user: User | null, firstTimeSetCopiedUser?: true) => dispatch(setCopiedUser(user, firstTimeSetCopiedUser)),
    }
}

class ProfileNew extends Component<ProfileProps, any> {

    componentDidMount() {
        this.setCopiedUserForTheFirstTime();
    }

    componentDidUpdate(prevProps: Readonly<ProfileProps>, prevState: Readonly<any>, snapshot?: any) {
        this.setCopiedUserForTheFirstTime();
    }

    setCopiedUserForTheFirstTime = () => {
        const {
            thirdViewUser,
            AuthenticationState,
            ProfileLocalState,
            setCopiedUser
        } = this.props;

        if (!hasInitiallySetCopiedUser(ProfileLocalState)) {
            if (thirdViewUser) {
                setCopiedUser(thirdViewUser, true);
            } else if (successfullyAuthenticated(AuthenticationState)) {
                const currentUser: User = AuthenticationState.currentUser as User;
                setCopiedUser(currentUser, true);
            }
        }
    }

    render() {
        const {
            ProfileLocalState
        } = this.props;

        const copiedUser: User | undefined = ProfileLocalState.copiedUser;

        if (!copiedUser) {
            return null;
        }

        return <Box>
            <FeedbackSnackbarNew/>
            <PersonalDetails/>
            <BusinessProfile/>
            <EditImageDialog/>
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProfileNew);