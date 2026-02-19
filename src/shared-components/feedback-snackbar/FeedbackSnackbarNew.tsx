import React from 'react';
import { Alert, Slide, SlideProps, Snackbar } from '@mui/material';
import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';
import { closeFeedbackSnackbar } from './FeedbackSnackbarActions';

const FeedbackSnackbarNew: React.FC = () => {
  const dispatch = useAppDispatch();
  const { open, type, message } = useAppSelector((state) => state.FeedbackSnackbarLocalState);

  const handleClose = () => dispatch(closeFeedbackSnackbar());

  return (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center',
      }}
      autoHideDuration={2500}
      onClose={handleClose}
      TransitionComponent={SlideTransitionUp}
      transitionDuration={{
        enter: 130,
        exit: 130,
      }}
    >
      <Alert variant="filled" severity={type} onClose={handleClose}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default FeedbackSnackbarNew;

/**
 * Slide transition - direction up
 *
 * @param props
 * @returns {*}
 * @constructor
 */
export const SlideTransitionUp = React.forwardRef((props: SlideProps, ref) => (
  <Slide {...props} ref={ref} direction="up" />
));
