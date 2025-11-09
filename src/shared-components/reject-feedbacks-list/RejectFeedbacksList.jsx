import React, { Component } from 'react';
import FlexView from 'react-flexview';
import { StyleSheet, css } from 'aphrodite';
import {
    Paper,
    Typography,
    Divider,
    Avatar,
    Chip
} from "@material-ui/core";
import WarningIcon from '@material-ui/icons/Warning';
import PersonIcon from '@material-ui/icons/Person';
import * as colors from '../../values/colors';
import * as utils from '../../utils/utils';

/**
 * Component to display admin reject feedbacks for a project
 * Shows all feedback given by admins when sending a project back to the issuer
 */
export default class RejectFeedbacksList extends Component {

    render() {
        const { rejectFeedbacks } = this.props;

        // If no feedbacks, don't show anything
        if (!rejectFeedbacks || rejectFeedbacks.length === 0) {
            return null;
        }

        return (
            <FlexView column marginTop={30}>
                <Paper elevation={3} className={css(styles.feedbackContainer)}>
                    {/* Header */}
                    <FlexView
                        className={css(styles.header)}
                        vAlignContent="center"
                        hAlignContent="left"
                    >
                        <WarningIcon className={css(styles.warningIcon)} />
                        <Typography variant="h6" className={css(styles.headerText)}>
                            Admin Feedback - Action Required
                        </Typography>
                    </FlexView>

                    <Divider />

                    {/* Feedbacks List */}
                    <FlexView column className={css(styles.feedbacksContent)}>
                        {rejectFeedbacks.map((feedback, index) => (
                            <FlexView key={feedback.id || index} column className={css(styles.feedbackItem)}>
                                {/* Feedback Header - Admin info and date */}
                                <FlexView vAlignContent="center" marginBottom={10}>
                                    <Avatar className={css(styles.avatar)}>
                                        <PersonIcon />
                                    </Avatar>
                                    <FlexView column marginLeft={12}>
                                        <Typography variant="subtitle2" className={css(styles.adminName)}>
                                            {feedback.admin ? feedback.admin.displayName || 'Admin' : 'Admin'}
                                        </Typography>
                                        <Typography variant="caption" className={css(styles.date)}>
                                            {utils.dateInReadableFormat(feedback.date)}
                                        </Typography>
                                    </FlexView>
                                </FlexView>

                                {/* Feedback Message */}
                                <Paper elevation={0} className={css(styles.feedbackMessage)}>
                                    <Typography variant="body1" className={css(styles.feedbackText)}>
                                        {feedback.feedback}
                                    </Typography>
                                </Paper>

                                {/* Divider between feedbacks if not the last one */}
                                {index < rejectFeedbacks.length - 1 && (
                                    <Divider className={css(styles.itemDivider)} />
                                )}
                            </FlexView>
                        ))}
                    </FlexView>

                    {/* Footer message */}
                    <Divider />
                    <FlexView className={css(styles.footer)}>
                        <Typography variant="body2" className={css(styles.footerText)}>
                            Please address the feedback above and resubmit your project when ready.
                        </Typography>
                    </FlexView>
                </Paper>
            </FlexView>
        );
    }
}

const styles = StyleSheet.create({
    feedbackContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderLeft: `4px solid ${colors.primaryColor}`,
    },

    header: {
        padding: '16px 20px',
        backgroundColor: '#fff5f5',
    },

    warningIcon: {
        color: colors.primaryColor,
        marginRight: 12,
        fontSize: 28,
    },

    headerText: {
        color: colors.primaryColor,
        fontWeight: 600,
    },

    feedbacksContent: {
        padding: '0px',
    },

    feedbackItem: {
        padding: '20px',
    },

    avatar: {
        backgroundColor: colors.primaryColor,
        width: 40,
        height: 40,
    },

    adminName: {
        fontWeight: 600,
        color: colors.dark_green,
    },

    date: {
        color: colors.gray_600,
    },

    feedbackMessage: {
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: 8,
        border: '1px solid #e9ecef',
    },

    feedbackText: {
        color: colors.gray_700,
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap',
    },

    itemDivider: {
        marginTop: 20,
    },

    footer: {
        padding: '12px 20px',
        backgroundColor: '#f8f9fa',
    },

    footerText: {
        color: colors.gray_600,
        fontStyle: 'italic',
    },
});
