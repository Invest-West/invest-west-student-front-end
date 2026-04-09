import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import FlexView from 'react-flexview';
import { css } from 'aphrodite';
import { useAppSelector, useAppDispatch } from '../../../redux-store/hooks';
import * as courseRequestDialogActions from '../../../redux-store/actions/courseRequestDialogActions';
import sharedStyles from '../../../shared-js-css-styles/SharedStyles';

export const REQUEST_STATUS_NONE = 0;
export const REQUEST_STATUS_SUBMITTING = 1;
export const REQUEST_STATUS_SUCCESS = 2;
export const REQUEST_STATUS_ERROR = 3;

const AddCourseRequestDialog = React.forwardRef(({ onSuccess, ...other }, ref) => {
  const dispatch = useAppDispatch();
  const dialogOpen = useAppSelector((state) => state.manageCourseRequestDialog.dialogOpen);
  const courseName = useAppSelector((state) => state.manageCourseRequestDialog.courseName);
  const submitStatus = useAppSelector((state) => state.manageCourseRequestDialog.submitStatus);
  const errorMessage = useAppSelector((state) => state.manageCourseRequestDialog.errorMessage);
  const addButtonClicked = useAppSelector(
    (state) => state.manageCourseRequestDialog.addButtonClicked
  );

  const toggleDialog = () => dispatch(courseRequestDialogActions.toggleCourseRequestDialog());
  const handleInputChanged = (event) =>
    dispatch(courseRequestDialogActions.handleInputChanged(event));
  const submitCourseRequest = (callback) =>
    dispatch(courseRequestDialogActions.submitCourseRequest(callback));

  const renderStatusMessage = () => {
    let message = '';
    let color = 'primary';

    switch (submitStatus) {
      case REQUEST_STATUS_NONE:
        return null;
      case REQUEST_STATUS_SUBMITTING:
        message = 'Submitting your course request...';
        color = 'primary';
        break;
      case REQUEST_STATUS_SUCCESS:
        message = 'Course request submitted successfully! A super admin will review it.';
        color = 'primary';
        break;
      case REQUEST_STATUS_ERROR:
        message = errorMessage || 'Error submitting request. Please try again.';
        color = 'error';
        break;
      default:
        return null;
    }

    return (
      <Typography color={color} variant="subtitle1" align="left">
        {message}
      </Typography>
    );
  };

  return (
    <Dialog ref={ref} open={dialogOpen} fullWidth maxWidth="sm" onClose={toggleDialog} {...other}>
      <DialogTitle>
        <FlexView vAlignContent="center">
          <FlexView grow={4}>
            <Typography variant="h6" color="primary" align="left">
              Request New Course
            </Typography>
          </FlexView>
          <FlexView grow={1} hAlignContent="right">
            <IconButton onClick={toggleDialog} size="large">
              <CloseIcon />
            </IconButton>
          </FlexView>
        </FlexView>
      </DialogTitle>
      <DialogContent style={{ marginTop: 10, marginBottom: 20 }}>
        <Typography variant="body2" color="textSecondary" paragraph>
          Submit a request to create a new course under your university. A super admin will review
          and approve your request.
        </Typography>

        <TextField
          label="Course name"
          placeholder="e.g., Computer Science, Business Management, etc."
          name="courseName"
          value={courseName}
          fullWidth
          margin="dense"
          variant="outlined"
          required
          error={addButtonClicked && courseName.trim().length === 0}
          helperText={
            addButtonClicked && courseName.trim().length === 0 ? 'Course name is required' : ''
          }
          onChange={handleInputChanged}
        />
      </DialogContent>
      <DialogActions>
        <FlexView
          width="100%"
          marginRight={25}
          marginBottom={15}
          marginTop={15}
          hAlignContent="right"
          vAlignContent="center"
        >
          {renderStatusMessage()}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => submitCourseRequest(onSuccess)}
            size="large"
            className={css(sharedStyles.no_text_transform)}
            disabled={courseName.trim().length === 0 || submitStatus === REQUEST_STATUS_SUBMITTING}
            style={{ marginLeft: 35 }}
          >
            {submitStatus === REQUEST_STATUS_SUBMITTING ? 'Submitting...' : 'Submit Request'}
            <AddIcon fontSize="small" style={{ marginLeft: 8 }} />
          </Button>
        </FlexView>
      </DialogActions>
    </Dialog>
  );
});

export default AddCourseRequestDialog;
