import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import PersonalDetails from './components/personal-details/PersonalDetails';
import EditImageDialog from './components/edit-image-dialog/EditImageDialog';
import FeedbackSnackbarNew from '../feedback-snackbar/FeedbackSnackbarNew';
import BusinessProfile from './components/business-profile/BusinessProfile';
import { hasInitiallySetCopiedUser } from './ProfileReducer';
import { successfullyAuthenticated } from '../../redux-store/reducers/authenticationReducer';
import User from '../../models/user';
import { setCopiedUser } from './ProfileActions';
import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';

interface ProfileProps {
  // this must be set when an admin is viewing a user's profile
  thirdViewUser?: User;
}

const ProfileNew: React.FC<ProfileProps> = ({ thirdViewUser }) => {
  const dispatch = useAppDispatch();
  const AuthenticationState = useAppSelector((state) => state.AuthenticationState);
  const ProfileLocalState = useAppSelector((state) => state.ProfileLocalState);

  useEffect(() => {
    if (!hasInitiallySetCopiedUser(ProfileLocalState)) {
      if (thirdViewUser) {
        dispatch(setCopiedUser(thirdViewUser, true));
      } else if (successfullyAuthenticated(AuthenticationState)) {
        const currentUser: User = AuthenticationState.currentUser as User;
        dispatch(setCopiedUser(currentUser, true));
      }
    }
  }, [thirdViewUser, AuthenticationState, ProfileLocalState, dispatch]);

  const copiedUser: User | undefined = ProfileLocalState.copiedUser;

  if (!copiedUser) {
    return null;
  }

  return (
    <Box>
      <FeedbackSnackbarNew />
      <PersonalDetails />
      <BusinessProfile />
      <EditImageDialog />
    </Box>
  );
};

export default ProfileNew;
