import React, { Component } from 'react';
import FlexView from 'react-flexview';
import { StyleSheet, css } from 'aphrodite';
import { 
    Button, 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    List, 
    ListItem, 
    ListItemText, 
    Avatar }
    from "@material-ui/core";
import { MuiThemeProvider, createMuiTheme } from "@material-ui/core/styles";
import green from "@material-ui/core/colors/teal";

import * as colors from '../../../values/colors';

export default class FeedbacksList extends Component {

    handleClose = () => {
        this.props.onClose();
    }

    getFeedbacks = () => {
        const votesObj = this.props.votesObj;
        let feedbacks = [];
        for (let investorID in votesObj) {
            const feedback = votesObj[investorID].feedback;
            // feedback object is not null
            if (feedback) {
                feedbacks.push(feedback);
            }
        }
        return feedbacks;
    }

    renderFeedbacks = () => {
        const feedbacks = this.getFeedbacks();
        if (feedbacks.length === 0) {
            return (
                <List>
                    <ListItem>
                        <ListItemText primary="No feedbacks for this project." />
                    </ListItem>
                </List>
            );
        }
        return (
            <List>
                {this.getFeedbacks().map((feedback, index) => (
                    <ListItem key={index}>
                        <Avatar>
                            <i className="fas fa-user-tie" style={{fontSize: 23}}></i>
                        </Avatar>
                        <ListItemText primary={feedback} />
                    </ListItem>
                ))}
            </List>
        );
    }


    render() {
        const { onClose, votesObj, ...other } = this.props;
        return (
            <MuiThemeProvider theme={theme}>
                <Dialog fullWidth maxWidth='sm' onClose={this.handleClose} {...other}>
                    <DialogTitle>
                        <p className={css(styles.title, styles.no_margin)}>Feedbacks</p>
                    </DialogTitle>
                    <DialogContent>
                        {this.renderFeedbacks()}
                    </DialogContent>
                    <DialogActions>
                        <FlexView marginRight={20} marginBottom={10}>
                            <Button variant="contained" color="primary" onClick={this.handleClose}>Close</Button>
                        </FlexView>
                    </DialogActions>
                </Dialog>
            </MuiThemeProvider>
        );
    }
}

const theme = createMuiTheme({
    palette: {
      primary: green
    },
    typography: {
        useNextVariants: true,
    }
});

const styles = StyleSheet.create({
    no_margin: {
        margin: 0
    },

    title: {
        color: colors.dark_green,
        fontSize: 24
    }
});
