import React, {Component} from 'react';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';
import {
    AppBar,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    TextField,
    Toolbar,
    Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import {KeyboardDatePicker} from '@material-ui/pickers';
import {Col, Container, Row} from 'react-bootstrap';

import SelectPledgeVisibility from '../select-pledge-visibility/SelectPledgeVisibility';

import * as utils from '../../utils/utils';
import * as DB_CONST from '../../firebase/databaseConsts';
import sharedStyles, {SlideTransitionUp} from '../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as creatPledgeDialogActions from '../../redux-store/actions/createPledgeDialogActions';

export const CREATE_PLEDGE_STATUS_NONE = 0;
export const CREATE_PLEDGE_STATUS_VALID = 1;
export const CREATE_PLEDGE_STATUS_MISSING_FIELDS = 2;
export const CREATE_PLEDGE_STATUS_INVALID_FUND = 3;
export const CREATE_PLEDGE_STATUS_INVALID_DATE = 4;

const mapStateToProps = state => {
    return {
        currentUser: state.auth.user,

        open: state.manageCreatePledgeDialog.open,
        project: state.manageCreatePledgeDialog.project,
        postMoneyValuation: state.manageCreatePledgeDialog.postMoneyValuation,
        expiredDate: state.manageCreatePledgeDialog.expiredDate,
        extraNotes: state.manageCreatePledgeDialog.extraNotes,
        createStatus: state.manageCreatePledgeDialog.createStatus
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleCreatePledgeDialog: () => dispatch(creatPledgeDialogActions.toggleCreatePledgeDialog()),
        handleInputChanged: (event) => dispatch(creatPledgeDialogActions.handleInputChanged(event)),
        handleDateChanged: (date) => dispatch(creatPledgeDialogActions.handleDateChanged(date)),
        createPledge: () => dispatch(creatPledgeDialogActions.createPledge())
    }
};

class CreatePledgeDialog extends Component {
  render() {
    const {
      forwardedRef,
      currentUser,
      user,
      project,
      postMoneyValuation,
      expiredDate,
      extraNotes,
      createStatus,
      toggleCreatePledgeDialog,
      handleInputChanged,
      handleDateChanged,
      createPledge,
      ...other
    } = this.props;

    // If currentUser is undefined or null, decide how to handle
    if (!currentUser) {
      // Optionally, you can render a message prompting the user to sign in
      return (
        <Dialog
          ref={forwardedRef}
          fullScreen
          onClose={toggleCreatePledgeDialog}
          TransitionComponent={SlideTransitionUp}
          {...other}
        >
          <DialogTitle>
            <AppBar elevation={0}>
              <Toolbar>
                <IconButton color="inherit" onClick={toggleCreatePledgeDialog} aria-label="Close">
                  <CloseIcon />
                </IconButton>
                <FlexView marginLeft={10}>
                  <Typography variant="h6" color="inherit">Create Pledge</Typography>
                </FlexView>
              </Toolbar>
            </AppBar>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Please sign in to create a pledge.
            </Typography>
          </DialogContent>
        </Dialog>
      );
    }

    // Additional checks if necessary
    if (currentUser.type !== DB_CONST.TYPE_ADMIN && currentUser.type !== DB_CONST.TYPE_INVESTOR) {
      // Render nothing or a message if the user doesn't have permission
      return null;
    }

    // Ensure that 'project' exists before rendering
    if (!project) {
      return (
        <Dialog
          ref={forwardedRef}
          fullScreen
          onClose={toggleCreatePledgeDialog}
          TransitionComponent={SlideTransitionUp}
          {...other}
        >
          <DialogTitle>
            <AppBar elevation={0}>
              <Toolbar>
                <IconButton color="inherit" onClick={toggleCreatePledgeDialog} aria-label="Close">
                  <CloseIcon />
                </IconButton>
                <FlexView marginLeft={10}>
                  <Typography variant="h6" color="inherit">Create Pledge</Typography>
                </FlexView>
              </Toolbar>
            </AppBar>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Project details are unavailable.
            </Typography>
          </DialogContent>
        </Dialog>
      );
    }

    // Main render
    return (
      <Dialog
        ref={forwardedRef}
        fullScreen
        onClose={toggleCreatePledgeDialog}
        TransitionComponent={SlideTransitionUp}
        {...other}
      >
        <DialogTitle>
          <AppBar elevation={0}>
            <Toolbar>
              <IconButton color="inherit" onClick={toggleCreatePledgeDialog} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <FlexView marginLeft={10}>
                <Typography variant="h6" color="inherit">Create Pledge</Typography>
              </FlexView>
            </Toolbar>
          </AppBar>
        </DialogTitle>
        <DialogContent>
          <Container fluid style={{ marginTop: 40 }}>
            <Row noGutters>
              <Col xs={12} sm={12} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }}>
                {/* Project Details */}
                <TextField
                  disabled
                  label="Project name"
                  value={project.projectName || ""}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  disabled
                  label="Total fund needs raising (£)"
                  value={project.Pitch?.totalRaise || ""}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  disabled
                  label="Fund required (£)"
                  value={project.Pitch?.fundRequired || ""}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  disabled
                  label="Investors committed"
                  value={project.Pitch?.investorsCommitted || "None"}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                />
                <TextField
                  label="Post money valuation (£)"
                  name="postMoneyValuation"
                  value={postMoneyValuation}
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  onChange={handleInputChanged}
                />
                <FlexView marginTop={15} width="100%">
                  <KeyboardDatePicker
                    autoOk
                    variant="dialog"
                    inputVariant="outlined"
                    label="Choose expired date"
                    format="dd/MM/yyyy"
                    minDate={utils.getDateWithDaysFurtherThanToday(1)}
                    value={expiredDate}
                    InputAdornmentProps={{ position: "start" }}
                    onChange={handleDateChanged}
                  />
                </FlexView>
                <TextField
                  label="Your extra notes"
                  value={extraNotes}
                  name="extraNotes"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  onChange={handleInputChanged}
                />
              </Col>

              {currentUser.type === DB_CONST.TYPE_ADMIN && (
                <Col xs={12} sm={12} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }} style={{ marginTop: 10 }}>
                  <SelectPledgeVisibility />
                </Col>
              )}

              <Col xs={12} sm={12} md={{ span: 8, offset: 2 }} lg={{ span: 6, offset: 3 }} style={{ marginTop: 40, marginBottom: 50 }}>
                <FlexView hAlignContent="center" marginBottom={30}>
                  {this.renderCreatePledgeError()}
                </FlexView>
                <FlexView width="100%" hAlignContent="center">
                  <Button
                    size="large"
                    className={css(sharedStyles.no_text_transform)}
                    variant="outlined"
                    color="primary"
                    onClick={createPledge}
                  >
                    Create Pledge
                  </Button>
                </FlexView>
              </Col>
            </Row>
          </Container>
        </DialogContent>
      </Dialog>
    );
  }
  

    /**
     * Render error (if has) when the user clicks on the Create button
     *
     * @returns {null|*}
     */
    renderCreatePledgeError = () => {
        const {
            createStatus
        } = this.props;

        let msg = "";

        switch (createStatus) {
            case CREATE_PLEDGE_STATUS_NONE:
                return null;
            case CREATE_PLEDGE_STATUS_VALID:
                return null;
            case CREATE_PLEDGE_STATUS_MISSING_FIELDS:
                msg = "Please fill in all the fields.";
                break;
            case CREATE_PLEDGE_STATUS_INVALID_FUND:
                msg = "Please enter a valid fund.";
                break;
            case CREATE_PLEDGE_STATUS_INVALID_DATE:
                msg = "Please enter a valid date.";
                break;
            default:
                return null;
        }

        return (
            <Typography align="center" variant="subtitle1" color="error">{msg}</Typography>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(React.forwardRef(
    (props, ref) => <CreatePledgeDialog {...props} forwardedRef={ref}/>));