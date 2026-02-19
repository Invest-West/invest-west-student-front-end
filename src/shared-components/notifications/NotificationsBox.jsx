import React, { useEffect, useRef, useCallback } from 'react';
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
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { Col, Container, Row } from 'react-bootstrap';
import FlexView from 'react-flexview';
import { css, StyleSheet } from 'aphrodite';
import { NavLink } from 'react-router-dom';

import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';
import * as notificationsActions from '../../redux-store/actions/notificationsActions';

import * as colors from '../../values/colors';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as utils from '../../utils/utils';
import * as ROUTES from '../../router/routes';

const NotificationsBox = () => {
  const dispatch = useAppDispatch();
  const wrapperRef = useRef(null);

  const groupUserName = useAppSelector((state) => state.manageGroupFromParams.groupUserName);
  const groupProperties = useAppSelector((state) => state.manageGroupFromParams.groupProperties);
  const groupPropertiesLoaded = useAppSelector(
    (state) => state.manageGroupFromParams.groupPropertiesLoaded
  );
  const notificationsAnchorEl = useAppSelector(
    (state) => state.manageNotifications.notificationsAnchorEl
  );
  const notificationBellRef = useAppSelector(
    (state) => state.manageNotifications.notificationBellRef
  );
  const notifications = useAppSelector((state) => state.manageNotifications.notifications);
  const loadingNotifications = useAppSelector(
    (state) => state.manageNotifications.loadingNotifications
  );
  const notificationsLoaded = useAppSelector(
    (state) => state.manageNotifications.notificationsLoaded
  );

  const handleClickOutside = useCallback(
    (event) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target) &&
        notificationBellRef &&
        !notificationBellRef.contains(event.target)
      ) {
        dispatch(notificationsActions.toggleNotifications(event));
      }
    },
    [dispatch, notificationBellRef]
  );

  // Load notifications and attach mouseup listener on mount
  useEffect(() => {
    dispatch(notificationsActions.loadNotifications());
    document.addEventListener('mouseup', handleClickOutside);

    return () => {
      dispatch(notificationsActions.stopListeningForNotificationsChanged());
      document.removeEventListener('mouseup', handleClickOutside);
    };
  }, [dispatch, handleClickOutside]);

  // Start listening when notifications are loaded
  useEffect(() => {
    if (!loadingNotifications && notificationsLoaded) {
      dispatch(notificationsActions.startListeningForNotificationsChanged());
    }
  }, [loadingNotifications, notificationsLoaded, dispatch]);

  const handleToggleNotifications = (event) =>
    dispatch(notificationsActions.toggleNotifications(event));
  const handleDeleteNotification = (notification) =>
    dispatch(notificationsActions.deleteANotification(notification));
  const handleDeleteAllNotifications = () =>
    dispatch(notificationsActions.deleteAllNotifications());

  if (!groupPropertiesLoaded) {
    return null;
  }

  return (
    <div ref={wrapperRef}>
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
            boundariesElement: 'scrollParent',
          },
        }}
        style={{
          zIndex: 100,
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper elevation={4} square>
              <Container fluid style={{ padding: 0, maxWidth: 600 }}>
                <Row noGutters>
                  <Col
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    style={{
                      paddingLeft: 15,
                      paddingRight: 15,
                      paddingTop: 6,
                      paddingBottom: 6,
                      backgroundColor: colors.kick_starter_background_color_1,
                    }}
                  >
                    <Row noGutters>
                      <Col xs={10} sm={10} md={10} lg={10}>
                        <FlexView height="100%" vAlignContent="center">
                          <Typography variant="body1">Notifications</Typography>
                        </FlexView>
                      </Col>
                      <Col xs={2} sm={2} md={2} lg={2}>
                        <FlexView hAlignContent="right">
                          <IconButton
                            style={{ width: 44, height: 44 }}
                            onClick={handleToggleNotifications}
                            size="large"
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </FlexView>
                      </Col>
                    </Row>
                  </Col>

                  <Col xs={12} sm={12} md={12} lg={12}>
                    <Divider />
                  </Col>

                  {notifications.length === 0 ? null : (
                    <Col
                      xs={12}
                      sm={12}
                      md={12}
                      lg={12}
                      style={{ paddingTop: 5, paddingBottom: 5, paddingRight: 18 }}
                    >
                      <FlexView hAlignContent="right">
                        <Button
                          variant="text"
                          className={css(sharedStyles.no_text_transform, styles.clear_all_text)}
                          size="medium"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteAllNotifications();
                          }}
                        >
                          <ClearAllIcon style={{ marginRight: 6 }} />
                          Clear all
                        </Button>
                      </FlexView>
                    </Col>
                  )}

                  {notifications.length === 0 ? null : (
                    <Col xs={12} sm={12} md={12} lg={12}>
                      <Divider />
                    </Col>
                  )}

                  <Col
                    xs={12}
                    sm={12}
                    md={12}
                    lg={12}
                    style={{
                      minHeight: notifications.length === 0 ? 300 : 'None',
                      maxHeight: 500,
                      overflowY: 'auto',
                    }}
                  >
                    {!notificationsLoaded ? (
                      <FlexView column height="100%" vAlignContent="center" hAlignContent="center">
                        <HashLoader
                          color={
                            !groupProperties
                              ? colors.primaryColor
                              : groupProperties.settings.primaryColor
                          }
                        />
                      </FlexView>
                    ) : notifications.length === 0 ? (
                      <FlexView column height="100%" vAlignContent="center" hAlignContent="center">
                        <NotificationsIcon className={css(styles.notifications_placeholder_icon)} />
                        <Typography variant="body1">Your notifications live here</Typography>
                      </FlexView>
                    ) : (
                      <List component="ul" style={{ padding: 0 }}>
                        {[...notifications]
                          .sort((notification1, notification2) => {
                            return notification2.date - notification1.date;
                          })
                          .map((notification) => (
                            <ListItem
                              component="li"
                              key={notification.id}
                              divider
                              className={css(styles.notification_item)}
                            >
                              <Row
                                noGutters
                                style={{ width: '100%', paddingTop: 13, paddingBottom: 13 }}
                              >
                                <Col xs={10} sm={10} md={11} lg={11} style={{ paddingRight: 10 }}>
                                  <NavLink
                                    to={
                                      groupUserName
                                        ? `${ROUTES.GROUP_PATH.replace(':groupUserName', groupUserName)}${notification.action}`
                                        : notification.action
                                    }
                                    className={css(
                                      sharedStyles.nav_link_hover_without_changing_text_color
                                    )}
                                    onClick={() => {
                                      handleDeleteNotification(notification);
                                      handleToggleNotifications();
                                    }}
                                  >
                                    <FlexView vAlignContent="center">
                                      <NotificationsIcon
                                        className={css(styles.notification_item_icon)}
                                      />
                                      <FlexView column marginLeft={14}>
                                        <Typography
                                          variant="body1"
                                          className={css(styles.black_text)}
                                        >
                                          {notification.title}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="textSecondary"
                                          style={{ marginTop: 4 }}
                                        >
                                          {notification.message}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          color="textSecondary"
                                          style={{ marginTop: 10 }}
                                        >
                                          <u>
                                            Sent:
                                            {utils.dateTimeInReadableFormat(notification.date)}
                                          </u>{' '}
                                        </Typography>
                                      </FlexView>
                                    </FlexView>
                                  </NavLink>
                                </Col>
                                <Col
                                  xs={2}
                                  sm={2}
                                  md={1}
                                  lg={1}
                                  style={{ paddingLeft: 8, paddingRight: 8 }}
                                >
                                  <FlexView
                                    width="100%"
                                    height="100%"
                                    vAlignContent="center"
                                    hAlignContent="center"
                                  >
                                    <IconButton
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteNotification(notification);
                                      }}
                                      size="large"
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </FlexView>
                                </Col>
                              </Row>
                            </ListItem>
                          ))}
                      </List>
                    )}
                  </Col>
                </Row>
              </Container>
            </Paper>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

export default NotificationsBox;

const styles = StyleSheet.create({
  black_text: {
    color: colors.black,
  },

  notifications_placeholder_icon: {
    width: 70,
    height: 'auto',
    color: colors.gray_300,
    marginBottom: 10,
  },

  notification_item_icon: {
    width: 36,
    height: 'auto',
    color: colors.gray_300,
  },

  clear_all_text: {
    color: colors.blue_gray_600,
  },

  notification_item: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 0,
    paddingBottom: 0,

    ':hover': {
      cursor: 'pointer',
      backgroundColor: colors.gray_200,
    },
  },
});
