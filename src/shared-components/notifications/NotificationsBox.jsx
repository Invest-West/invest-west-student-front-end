import React, {Component} from 'react';
import HashLoader from 'react-spinners/HashLoader';
import {
    Fade,
    List,
    ListItem,
    Paper,
    Popper,
    Typography,
    Divider,
    IconButton,
    Button,
    ClickAwayListener
} from '@material-ui/core';
import NotificationsIcon from '@material-ui/icons/Notifications';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseIcon from '@material-ui/icons/Close';
import ClearAllIcon from '@material-ui/icons/ClearAll';
import {
    Col,
    Container,
    Row
} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {css, StyleSheet} from 'aphrodite';
import {NavLink} from 'react-router-dom';

import {connect} from 'react-redux';
import * as notificationsActions from '../../redux-store/actions/notificationsActions';

import * as colors from '../../values/colors';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';


const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,

        notificationsAnchorEl: state.manageNotifications.notificationsAnchorEl,
        notificationBellRef: state.manageNotifications.notificationBellRef,
        notifications: state.manageNotifications.notifications,
        loadingNotifications: state.manageNotifications.loadingNotifications,
        notificationsLoaded: state.manageNotifications.notificationsLoaded
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleNotifications: (event) => dispatch(notificationsActions.toggleNotifications(event)),
        loadNotifications: () => dispatch(notificationsActions.loadNotifications()),
        deleteANotification: (notification) => dispatch(notificationsActions.deleteANotification(notification)),
        deleteAllNotifications: () => dispatch(notificationsActions.deleteAllNotifications()),

        startListeningForNotificationsChanged: () => dispatch(notificationsActions.startListeningForNotificationsChanged()),
        stopListeningForNotificationsChanged: () => dispatch(notificationsActions.stopListeningForNotificationsChanged())
    }
};

class NotificationsBox extends Component {
    constructor(props) {
        super(props);

        this.wrapperRef = React.createRef();
        this.handleClickOutside = this.handleClickOutside.bind(this);
    }

    componentDidMount() {
        const {
            loadNotifications
        } = this.props;

        loadNotifications();

        document.addEventListener('mouseup', this.handleClickOutside);
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            loadingNotifications,
            notificationsLoaded,

            startListeningForNotificationsChanged
        } = this.props;

        // notifications have been loaded
        if (!loadingNotifications && notificationsLoaded) {
            startListeningForNotificationsChanged();
        }

    }

    componentWillUnmount() {
        const {
            stopListeningForNotificationsChanged
        } = this.props;

        stopListeningForNotificationsChanged();

        document.removeEventListener('mouseup', this.handleClickOutside);
    }

    handleClickOutside(event) {
        const {
            toggleNotifications,
            notificationBellRef,
        } = this.props;

        if (this.wrapperRef && !this.wrapperRef.current.contains(event.target) && !notificationBellRef.contains(event.target) ) {
            toggleNotifications(event);
        }
    }

    render() {
        const {
            groupUserName,
            groupProperties,
            groupPropertiesLoaded,

            notificationsAnchorEl,
            notifications,
            notificationsLoaded,

            toggleNotifications,
            deleteANotification,
            deleteAllNotifications

        } = this.props;

        if (!groupPropertiesLoaded) {
            return null;
        }

        return (
            <div ref={this.wrapperRef}>
            <Popper
                open={Boolean(notificationsAnchorEl)}
                anchorEl={notificationsAnchorEl}
                placement="bottom-start"
                disablePortal={false}
                transition
                modifiers={{
                    flip: {
                        enabled: true,
                    },
                    preventOverflow: {
                        enabled: true,
                        boundariesElement: 'scrollParent'
                    }
                }}
                style={{
                    // this zIndex is to ensure the notification box is on top of all other UI elements
                    zIndex: 100
                }}
            >
                {({TransitionProps}) => (
                    <Fade {...TransitionProps} timeout={350} >
                        <Paper elevation={4} square >
                            <Container fluid style={{ padding: 0, maxWidth: 600 }} >
                                <Row noGutters >
                                    <Col xs={12} sm={12} md={12} lg={12} style={{ paddingLeft: 15, paddingRight: 15, paddingTop: 6, paddingBottom: 6, backgroundColor: colors.kick_starter_background_color_1 }} >
                                        <Row noGutters >
                                            <Col xs={10} sm={10} md={10} lg={10} >
                                                <FlexView height="100%" vAlignContent="center" >
                                                    <Typography variant="body1">Notifications</Typography>
                                                </FlexView>
                                            </Col>
                                            <Col xs={2} sm={2} md={2} lg={2} >
                                                <FlexView hAlignContent="right" >
                                                    <IconButton style={{ width: 44, height: 44 }} onClick={toggleNotifications} >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </FlexView>
                                            </Col>
                                        </Row>
                                    </Col>

                                    <Col xs={12} sm={12} md={12} lg={12} >
                                        <Divider/>
                                    </Col>

                                    {
                                        notifications.length === 0
                                            ?
                                            null
                                            :
                                            <Col xs={12} sm={12} md={12} lg={12} style={{ paddingTop: 5, paddingBottom: 5, paddingRight: 18 }} >
                                                <FlexView hAlignContent="right" >
                                                    <Button
                                                        variant="text"
                                                        className={css(sharedStyles.no_text_transform, styles.clear_all_text)}
                                                        size="medium"
                                                        onMouseDown={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            deleteAllNotifications();
                                                        }}
                                                    >
                                                        <ClearAllIcon style={{ marginRight: 6 }} />
                                                        Clear all
                                                    </Button>
                                                </FlexView>
                                            </Col>
                                    }

                                    {
                                        notifications.length === 0
                                            ?
                                            null
                                            :
                                            <Col xs={12} sm={12} md={12} lg={12} >
                                                <Divider/>
                                            </Col>
                                    }

                                    <Col xs={12} sm={12} md={12} lg={12} style={{ minHeight: notifications.length === 0 ? 300 : "None", maxHeight: 500, overflowY: "auto" }} >
                                        {
                                            !notificationsLoaded
                                                ?
                                                <FlexView column height="100%" vAlignContent="center" hAlignContent="center" >
                                                    <HashLoader
                                                        color={
                                                            !groupProperties
                                                                ?
                                                                colors.primaryColor
                                                                :
                                                                groupProperties.settings.primaryColor
                                                        }
                                                    />
                                                </FlexView>
                                                :
                                                notifications.length === 0
                                                    ?
                                                    <FlexView column height="100%" vAlignContent="center" hAlignContent="center" >
                                                        <NotificationsIcon className={css(styles.notifications_placeholder_icon)} />
                                                        <Typography variant="body1">Your notifications live here</Typography>
                                                    </FlexView>
                                                    :
                                                    <List component="ul" style={{ padding: 0 }} >
                                                        {
                                                            notifications
                                                                .sort((notification1, notification2) => {
                                                                    return (notification2.date - notification1.date)
                                                                })
                                                                .map(notification => (
                                                                    <ListItem
                                                                        component="li"
                                                                        key={notification.id}
                                                                        divider
                                                                        className={css(styles.notification_item)}
                                                                    >
                                                                        <Row noGutters style={{ width: "100%", paddingTop: 13, paddingBottom: 13 }} >
                                                                            <Col xs={10} sm={10} md={11} lg={11} style={{ paddingRight: 10 }} >
                                                                                <NavLink
                                                                                    to={
                                                                                        groupUserName
                                                                                            ?
                                                                                            `${ROUTES.GROUP_PATH.replace(":groupUserName", groupUserName)}${notification.action}`
                                                                                            :
                                                                                            notification.action
                                                                                    }
                                                                                    className={css(sharedStyles.nav_link_hover_without_changing_text_color)}
                                                                                    onClick={() => {
                                                                                        deleteANotification(notification);
                                                                                        toggleNotifications();
                                                                                    }}
                                                                                >
                                                                                    <FlexView vAlignContent="center" >
                                                                                        <NotificationsIcon className={css(styles.notification_item_icon)} />
                                                                                        <FlexView column marginLeft={14} >
                                                                                            <Typography variant="body1" className={css(styles.black_text)}>{notification.title}</Typography>
                                                                                            <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>{notification.message}</Typography>
                                                                                            <Typography variant="body2" color="textSecondary" style={{marginTop: 10}}><u>Sent:{utils.dateTimeInReadableFormat(notification.date)}</u> </Typography>
                                                                                        </FlexView>
                                                                                    </FlexView>
                                                                                </NavLink>
                                                                            </Col>
                                                                            <Col xs={2} sm={2} md={1} lg={1} style={{ paddingLeft: 8, paddingRight: 8 }} >
                                                                                <FlexView width="100%" height="100%" vAlignContent="center" hAlignContent="center" >
                                                                                    <IconButton
                                                                                        onMouseDown={(e) => {
                                                                                            e.preventDefault();
                                                                                            e.stopPropagation();
                                                                                            deleteANotification(notification);
                                                                                        }}
                                                                                    >
                                                                                        <DeleteIcon fontSize="small" />
                                                                                    </IconButton>
                                                                                </FlexView>
                                                                            </Col>
                                                                        </Row>
                                                                    </ListItem>
                                                                ))
                                                        }
                                                    </List>
                                        }
                                    </Col>
                                </Row>
                            </Container>
                        </Paper>
                    </Fade>
                )}
            </Popper>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(NotificationsBox);

const styles = StyleSheet.create({

    black_text: {
        color: colors.black
    },

    notifications_placeholder_icon: {
        width: 70,
        height: "auto",
        color: colors.gray_300,
        marginBottom: 10
    },

    notification_item_icon: {
        width: 36,
        height: "auto",
        color: colors.gray_300
    },

    clear_all_text: {
        color: colors.blue_gray_600
    },

    notification_item: {
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 0,
        paddingBottom: 0,

        ':hover': {
            cursor: 'pointer',
            backgroundColor: colors.gray_200
        }
    }
});