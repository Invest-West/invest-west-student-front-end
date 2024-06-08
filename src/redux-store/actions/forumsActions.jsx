import * as utils from '../../utils/utils';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import {trackActivity} from '../../firebase/realtimeDBUtils';
import * as DB_CONST from '../../firebase/databaseConsts';
import firebase from '../../firebase/firebaseApp';
import * as feedbackSnackbarActions from './feedbackSnackbarActions';

export const LOADING_FORUMS = 'LOADING_FORUMS';
export const FINISHED_LOADING_FORUMS = 'FINISHED_LOADING_FORUMS';
export const ERROR_LOADING_FORUMS = 'ERROR_LOADING_FORUMS';
export const loadForums = (mode) => {
    return (dispatch, getState) => {

        const forums = getState().manageForums.forums;
        const forumsLoaded = getState().manageForums.forumsLoaded;

        if (!forumsLoaded && forums.length === 0) {
            dispatch({
                type: LOADING_FORUMS
            });

            realtimeDBUtils
                .loadForums(mode)
                .then(forums => {
                    dispatch({
                        type: FINISHED_LOADING_FORUMS,
                        forums
                    });
                })
                .catch(error => {
                    dispatch({
                        type: FINISHED_LOADING_FORUMS,
                        forums: [],
                        error
                    });

                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not load forums.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }
    }
};

export const GO_BACK_TO_FORUMS_MAIN = 'GO_BACK_TO_FORUMS_MAIN';
export const goBackToForumsMain = () => {
    return {
        type: GO_BACK_TO_FORUMS_MAIN
    }
};

export const TOGGLE_CREATE_NEW_FORUM = 'TOGGLE_CREATE_NEW_FORUM';
export const toggleCreateNewForum = (open, forumEdited) => {
    return {
        type: TOGGLE_CREATE_NEW_FORUM,
        open, // true --> Open, false --> Close
        forumEdited // not null --> Editing a forum, null --> Creating a new forum
    }
};

export const ERROR_CREATING_NEW_FORUM = 'ERROR_CREATING_NEW_FORUM';
export const createNewForum = () => {
    return (dispatch, getState) => {
        let forumBeforeEditing = getState().manageForums.forumEdited;
        const createForumName = getState().manageForums.createForumName;
        const createForumDesc = getState().manageForums.createForumDesc;

        if (createForumName.trim().length === 0) {
            dispatch({
                type: ERROR_CREATING_NEW_FORUM
            });
            return;
        }

        const currentUser = getState().auth.user;

        // creating a new forum
        if (!forumBeforeEditing) {
            const forum = {
                name: createForumName,
                description: createForumDesc,
                dateCreated: utils.getCurrentDate(),
                author: {
                    id: currentUser.id
                }
            };

            realtimeDBUtils
                .createForum(forum)
                .then(forumID => {
                    dispatch({
                        type: TOGGLE_CREATE_NEW_FORUM,
                        open: false,
                        forumEdited: null
                    });

                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.FORUMS_CHILD,
                            interactedObjectID: forumID,
                            value: {
                                ...forum,
                                id: forumID
                            },
                            activitySummary: realtimeDBUtils
                                .ACTIVITY_SUMMARY_TEMPLATE_CREATED_A_FORUM
                                .replace("%forum%", forum.name)
                        });

                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Forum created.",
                        color: "primary",
                        position: "bottom"
                    });
                })
                .catch(error => {
                    // handle error
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not create forum.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }
        // editing a forum
        else {
            forumBeforeEditing.author = {
                id: forumBeforeEditing.author.id
            };

            // only allow super admins to edit a forum
            if (!currentUser
                || (
                    currentUser && !currentUser.superAdmin
                )
            ) {
                return;
            }

            let forumAfterEditing = JSON.parse(JSON.stringify(forumBeforeEditing));
            forumAfterEditing.name = createForumName;
            forumAfterEditing.description = createForumDesc;
            // update the edited time
            forumAfterEditing.lastEdited = utils.getCurrentDate();

            realtimeDBUtils
                .editForum(forumAfterEditing)
                .then(() => {
                    dispatch({
                        type: TOGGLE_CREATE_NEW_FORUM,
                        open: false,
                        forumEdited: null
                    });

                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.FORUMS_CHILD,
                            interactedObjectID: forumAfterEditing.id,
                            value: {
                                before: forumBeforeEditing,
                                after: forumAfterEditing
                            },
                            activitySummary: realtimeDBUtils
                                .ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_FORUM
                                .replace("%forumName%", forumAfterEditing.name)
                        });

                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Forum updated.",
                        color: "primary",
                        position: "bottom"
                    });
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not update forum.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }
    }
};

export const deleteForum = forumID => {
    return (dispatch, getState) => {

        const currentUser = getState().auth.user;

        // only allow super admins to delete a forum
        if (!currentUser
            || (
                currentUser && !currentUser.superAdmin
            )
        ) {
            return;
        }

        let forums = [...getState().manageForums.forums];
        let forumBeforeChanging = JSON.parse(JSON.stringify(forums[forums.findIndex(forum => forum.id === forumID)]));
        forumBeforeChanging.author = {
            id: forumBeforeChanging.author.id
        };

        realtimeDBUtils
            .deleteForum(forumID)
            .then(() => {
                const forumAfterChanging = {
                    ...forumBeforeChanging,
                    deleted: true
                };

                // track super admin's activity
                trackActivity({
                    userID: currentUser.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.FORUMS_CHILD,
                    interactedObjectID: forumBeforeChanging.id,
                    activitySummary: realtimeDBUtils
                        .ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_FORUM
                        .replace("%forumName%", forumBeforeChanging.name),
                    value: {
                        before: forumBeforeChanging,
                        after: forumAfterChanging
                    }
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Forum deleted.",
                    color: "primary",
                    position: "bottom"
                });
            })
            .catch(error => {
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. Could not delete forum.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
};

export const FORUMS_INPUT_CHANGED = 'FORUMS_INPUT_CHANGED';
export const handleForumsInputChanged = event => {
    return (dispatch, getState) => {
        const targetName = event.target.name;
        const targetValue = event.target.value;

        dispatch({
            type: FORUMS_INPUT_CHANGED,
            name: targetName,
            value: targetValue
        });

        switch (targetName) {
            // forumsLoadModeChanged
            case "forumsLoadMode": {
                dispatch({
                    type: LOADING_FORUMS
                });

                realtimeDBUtils
                    .loadForums(targetValue)
                    .then(forums => {
                        dispatch({
                            type: FINISHED_LOADING_FORUMS,
                            forums
                        });
                    })
                    .catch(error => {
                        dispatch({
                            type: FINISHED_LOADING_FORUMS,
                            forums: [],
                            error
                        });

                        dispatch({
                            type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                            message: "Error happened. Could not load forums.",
                            color: "error",
                            position: "bottom"
                        });
                    });

                return;
            }
            // threadsLoadMode changed
            case "threadsLoadMode": {

                const forumSelected = getState().manageForums.forumSelected;

                dispatch({
                    type: LOADING_THREADS_IN_A_FORUM,
                    forumSelected: forumSelected
                });

                realtimeDBUtils
                    .loadThreads(targetValue, forumSelected)
                    .then(threads => {
                        dispatch({
                            type: FINISHED_LOADING_THREADS_IN_A_FORUM,
                            threads
                        });
                    })
                    .catch(error => {
                        dispatch({
                            type: FINISHED_LOADING_THREADS_IN_A_FORUM,
                            threads: [],
                            error
                        });

                        dispatch({
                            type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                            message: "Error happened. Could not load threads.",
                            color: "error",
                            position: "bottom"
                        });
                    });

                return;
            }
            default:
                return;
        }
    };
};

export const LOADING_THREADS_IN_A_FORUM = 'LOADING_THREADS_IN_A_FORUM';
export const FINISHED_LOADING_THREADS_IN_A_FORUM = 'FINISHED_LOADING_THREADS_IN_A_FORUM';
export const clickOnAParticularForum = forum => {
    return (dispatch, getState) => {

        const threadsLoadMode = getState().manageForums.threadsLoadMode;

        dispatch({
            type: LOADING_THREADS_IN_A_FORUM,
            forumSelected: forum
        });

        realtimeDBUtils
            .loadThreads(threadsLoadMode, forum)
            .then(threads => {
                dispatch({
                    type: FINISHED_LOADING_THREADS_IN_A_FORUM,
                    threads
                });
            })
            .catch(error => {
                dispatch({
                    type: FINISHED_LOADING_THREADS_IN_A_FORUM,
                    threads: [],
                    error
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. Could not load threads.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
};

export const GO_BACK_TO_FORUMS_LIST = 'GO_BACK_TO_FORUMS_LIST';
export const goBackToForumsList = () => {
    return {
        type: GO_BACK_TO_FORUMS_LIST
    }
};

export const TOGGLE_CREATE_NEW_THREAD = 'TOGGLE_CREATE_NEW_THREAD';
export const toggleCreateNewThread = (open, threadEdited) => {
    return {
        type: TOGGLE_CREATE_NEW_THREAD,
        open, // true --> Open, false --> Close
        threadEdited // not null --> Editing a thread, null --> Creating a new thread
    }
};

export const ERROR_CREATING_NEW_THREAD = 'ERROR_CREATING_NEW_THREAD';
export const createNewThread = () => {
    return (dispatch, getState) => {
        let threadBeforeEditing = getState().manageForums.threadEdited;
        const forumSelected = getState().manageForums.forumSelected;
        const createThreadName = getState().manageForums.createThreadName;
        const createThreadBriefDesc = getState().manageForums.createThreadBriefDesc;
        const createThreadMessage = getState().manageForums.createThreadMessage;

        if (createThreadName.trim().length === 0
            || createThreadBriefDesc.trim().length === 0) {
            dispatch({
                type: ERROR_CREATING_NEW_THREAD
            });
            return;
        }

        const currentUser = getState().auth.user;

        // creating a new thread
        if (!threadBeforeEditing) {
            const thread = {
                forumID: forumSelected.id,
                name: createThreadName,
                message: createThreadMessage,
                description: createThreadBriefDesc,
                dateCreated: utils.getCurrentDate(),
                author: {
                    id: currentUser.id
                }
            };

            realtimeDBUtils
                .createThread(thread)
                .then(threadID => {
                    dispatch({
                        type: TOGGLE_CREATE_NEW_THREAD,
                        open: false,
                        threadEdited: null
                    });

                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.FORUM_THREADS_CHILD,
                            interactedObjectID: threadID,
                            value: {
                                ...thread,
                                id: threadID
                            },
                            activitySummary: realtimeDBUtils
                                .ACTIVITY_SUMMARY_TEMPLATE_CREATED_A_THREAD
                                .replace("%thread%", thread.name)
                                .replace("%forum%", forumSelected.name)
                        });

                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Thread created.",
                        color: "primary",
                        position: "bottom"
                    });
                })
                .catch(error => {
                    // handle error
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not create thread.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }
        // editing a thread
        else {
            threadBeforeEditing.author = {
                id: threadBeforeEditing.author.id
            };

            // only allow super admins to edit a thread
            if (!currentUser
                || (
                    currentUser && !currentUser.superAdmin
                )
            ) {
                return;
            }

            let threadAfterEditing = JSON.parse(JSON.stringify(threadBeforeEditing));
            threadAfterEditing.name = createThreadName;
            threadAfterEditing.description = createThreadBriefDesc;
            threadAfterEditing.message = createThreadMessage;
            // update the edited time
            threadAfterEditing.lastEdited = utils.getCurrentDate();

            realtimeDBUtils
                .editThread(threadAfterEditing)
                .then(() => {
                    dispatch({
                        type: TOGGLE_CREATE_NEW_THREAD,
                        open: false,
                        threadEdited: null
                    });

                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.FORUM_THREADS_CHILD,
                            interactedObjectID: threadAfterEditing.id,
                            value: {
                                before: threadBeforeEditing,
                                after: threadAfterEditing
                            },
                            activitySummary: realtimeDBUtils
                                .ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_THREAD
                                .replace("%threadName%", threadAfterEditing.name)
                                .replace("%forumName%", forumSelected.name)
                        });

                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Thread updated.",
                        color: "primary",
                        position: "bottom"
                    });
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not update thread.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }
    }
};

export const deleteThread = threadID => {
    return (dispatch, getState) => {

        const currentUser = getState().auth.user;
        const forumSelected = getState().manageForums.forumSelected;

        // only allow super admins to delete a thread
        if (!currentUser
            || (
                currentUser && !currentUser.superAdmin
            )
        ) {
            return;
        }

        let threads = [...getState().manageForums.forumThreads];
        let threadBeforeChanging = JSON.parse(JSON.stringify(threads[threads.findIndex(thread => thread.id === threadID)]));
        threadBeforeChanging.author = {
            id: threadBeforeChanging.author.id
        };

        realtimeDBUtils
            .deleteThread(threadID)
            .then(() => {
                const threadAfterChanging = {
                    ...threadBeforeChanging,
                    deleted: true
                };

                // track super admin's activity
                trackActivity({
                    userID: currentUser.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.FORUM_THREADS_CHILD,
                    interactedObjectID: threadBeforeChanging.id,
                    activitySummary: realtimeDBUtils
                        .ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_THREAD
                        .replace("%threadName%", threadBeforeChanging.name)
                        .replace("%forumName%", forumSelected.name),
                    value: {
                        before: threadBeforeChanging,
                        after: threadAfterChanging
                    }
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Thread deleted.",
                    color: "primary",
                    position: "bottom"
                });
            })
            .catch(error => {
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. Could not delete thread.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
};

export const LOADING_REPLIES_IN_A_THREAD = 'LOADING_REPLIES_IN_A_THREAD';
export const FINISHED_LOADING_REPLIES_IN_A_THREAD = 'FINISHED_LOADING_REPLIES_IN_A_THREAD';
export const clickOnAParticularThread = thread => {
    return (dispatch, getState) => {
        dispatch({
            type: LOADING_REPLIES_IN_A_THREAD,
            threadSelected: thread
        });

        realtimeDBUtils
            .loadThreadReplies(thread)
            .then(replies => {
                dispatch({
                    type: FINISHED_LOADING_REPLIES_IN_A_THREAD,
                    replies
                });
            })
            .catch(error => {
                dispatch({
                    type: FINISHED_LOADING_REPLIES_IN_A_THREAD,
                    replies: [],
                    error
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. Could not load replies.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
};

export const GO_BACK_TO_THREADS_LIST = 'GO_BACK_TO_THREADS_LIST';
export const goBackToThreadsList = () => {
    return {
        type: GO_BACK_TO_THREADS_LIST
    }
};

export const TOGGLE_THREAD_REPLY = 'TOGGLE_THREAD_REPLY';
export const toggleThreadReply = (open, threadReplyEdited) => {
    return {
        type: TOGGLE_THREAD_REPLY,
        open,
        threadReplyEdited
    }
};

export const deleteThreadReply = threadReplyID => {
    return (dispatch, getState) => {

        const currentUser = getState().auth.user;
        const forumSelected = getState().manageForums.forumSelected;
        const forumThreadSelected = getState().manageForums.forumThreadSelected;

        if (!currentUser) {
            return;
        }

        let threadReplies = [...getState().manageForums.forumThreadReplies];
        let threadReplyBeforeChanging = JSON.parse(JSON.stringify(threadReplies[threadReplies.findIndex(reply => reply.id === threadReplyID)]));
        threadReplyBeforeChanging.author = {
            id: threadReplyBeforeChanging.author.id
        };

        // this if statement ensures only super admins or the owner of the reply can delete it
        if (!currentUser.superAdmin && currentUser.id !== threadReplyBeforeChanging.author.id) {
            return;
        }

        realtimeDBUtils
            .deleteThreadReply(threadReplyID)
            .then(() => {
                const threadReplyAfterChanging = {
                    ...threadReplyBeforeChanging,
                    deleted: true
                };

                // track super admin's activity
                trackActivity({
                    userID: currentUser.id,
                    activityType: DB_CONST.ACTIVITY_TYPE_POST,
                    interactedObjectLocation: DB_CONST.FORUM_THREADS_CHILD,
                    interactedObjectID: threadReplyBeforeChanging.id,
                    activitySummary: realtimeDBUtils
                        .ACTIVITY_SUMMARY_TEMPLATE_DELETED_A_THREAD_REPLY
                        .replace("%threadName%", forumThreadSelected.name)
                        .replace("%forumName%", forumSelected.name),
                    value: {
                        before: threadReplyBeforeChanging,
                        after: threadReplyAfterChanging
                    }
                });

                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Reply deleted.",
                    color: "primary",
                    position: "bottom"
                });
            })
            .catch(error => {
                dispatch({
                    type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                    message: "Error happened. Could not delete reply.",
                    color: "error",
                    position: "bottom"
                });
            });
    }
};

export const ERROR_CREATING_THREAD_REPLY = 'ERROR_CREATING_THREAD_REPLY';
export const submitThreadReply = () => {
    return (dispatch, getState) => {
        const currentUser = getState().auth.user;
        const forumSelected = getState().manageForums.forumSelected;
        const forumThreadSelected = getState().manageForums.forumThreadSelected;
        const threadReplySubject = getState().manageForums.threadReplySubject;
        const threadReplyMessage = getState().manageForums.threadReplyMessage;

        let threadReplyBeforeEditing = getState().manageForums.threadReplyEdited;

        if (threadReplySubject.trim().length === 0 || threadReplyMessage.ops.length === 0) {
            dispatch({
                type: ERROR_CREATING_THREAD_REPLY
            });
            return;
        }

        // creating a new thread reply
        if (!threadReplyBeforeEditing) {
            const reply = {
                threadID: forumThreadSelected.id,
                subject: threadReplySubject,
                message: threadReplyMessage,
                replyDate: utils.getCurrentDate(),
                author: {
                    id: currentUser.id
                }
            };

            realtimeDBUtils
                .createThreadReply(reply)
                .then(replyID => {
                    dispatch({
                        type: TOGGLE_THREAD_REPLY,
                        open: false,
                        threadReplyEdited: null
                    });

                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.FORUM_THREAD_REPLIES_CHILD,
                            interactedObjectID: replyID,
                            value: {
                                ...reply,
                                id: replyID
                            },
                            activitySummary:
                                realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_REPLIED_TO_A_THREAD
                                    .replace("%thread%", forumThreadSelected.name)
                                    .replace("%forum%", forumSelected.name)
                        });
                })
                .catch(error => {
                    // handle error
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not create reply.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }
        // editing an existing thread reply
        else {
            threadReplyBeforeEditing.author = {
                id: threadReplyBeforeEditing.author.id
            }

            // this if statement ensures only super admins or the owner of the reply can edit it
            if (!currentUser.superAdmin && currentUser.id !== threadReplyBeforeEditing.author.id) {
                return;
            }

            let threadReplyAfterEditing = JSON.parse(JSON.stringify(threadReplyBeforeEditing));
            threadReplyAfterEditing.subject = threadReplySubject;
            threadReplyAfterEditing.message = threadReplyMessage;
            threadReplyAfterEditing.lastEdited = utils.getCurrentDate();

            realtimeDBUtils
                .editThreadReply(threadReplyAfterEditing)
                .then(() => {
                    dispatch({
                        type: TOGGLE_THREAD_REPLY,
                        open: false,
                        threadReplyEdited: null
                    });

                    realtimeDBUtils
                        .trackActivity({
                            userID: currentUser.id,
                            activityType: DB_CONST.ACTIVITY_TYPE_POST,
                            interactedObjectLocation: DB_CONST.FORUM_THREAD_REPLIES_CHILD,
                            interactedObjectID: threadReplyAfterEditing.id,
                            value: {
                                before: threadReplyBeforeEditing,
                                after: threadReplyAfterEditing
                            },
                            activitySummary:
                                realtimeDBUtils.ACTIVITY_SUMMARY_TEMPLATE_EDITED_A_THREAD_REPLY
                                    .replace("%threadName%", forumThreadSelected.name)
                                    .replace("%forumName%", forumSelected.name)
                        });

                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Reply updated.",
                        color: "primary",
                        position: "bottom"
                    });
                })
                .catch(error => {
                    dispatch({
                        type: feedbackSnackbarActions.SET_FEEDBACK_SNACKBAR_CONTENT,
                        message: "Error happened. Could not update reply.",
                        color: "error",
                        position: "bottom"
                    });
                });
        }
    }
};

export const MANAGE_FORUMS_TABLE_PAGE_CHANGED = 'MANAGE_FORUMS_TABLE_PAGE_CHANGED';
export const changePage = (table, newPage) => {
    return {
        type: MANAGE_FORUMS_TABLE_PAGE_CHANGED,
        newPage,
        table
    }
};

export const MANAGE_FORUMS_TABLE_ROWS_PER_PAGE_CHANGED = 'MANAGE_FORUMS_TABLE_ROWS_PER_PAGE_CHANGED';
export const changeRowsPerPage = (table, event) => {
    return {
        type: MANAGE_FORUMS_TABLE_ROWS_PER_PAGE_CHANGED,
        value: parseInt(event.target.value, 10),
        table
    }
};

export const FORUMS_QUILL_CHANGED = 'FORUMS_QUILL_CHANGED';
export const THREAD_CONTENT_QUILL = 'THREAD_CONTENT_QUILL';
export const THREAD_REPLY_CONTENT_QUILL = 'THREAD_REPLY_CONTENT_QUILL';
export const handleQuillChanged = (field, editor) => {
    // check if the editor is empty (or does not have any text)
    if (editor.getText().trim().length === 0) {
        return {
            type: FORUMS_QUILL_CHANGED,
            quill: {ops: []},
            field
        }
    } else {
        return {
            type: FORUMS_QUILL_CHANGED,
            quill: editor.getContents(),
            field
        }
    }
};

// Listeners -----------------------------------------------------------------------------------------------------------
let forumsListener = null;
let forumThreadsListener = null;
let forumThreadRepliesListener = null;

export const FORUMS_CHANGED = 'FORUMS_CHANGED';
export const startListeningForForumsChanged = () => {
    return (dispatch, getState) => {
        if (!forumsListener) {
            forumsListener = firebase
                .database()
                .ref(DB_CONST.FORUMS_CHILD);

            // a new forum is added
            forumsListener
                .on('child_added', snapshot => {
                    let forum = snapshot.val();

                    const currentUser = getState().auth.user;
                    const forumsLoadMode = getState().manageForums.forumsLoadMode;

                    let forums = [...getState().manageForums.forums];
                    let existingForumIndex = forums.findIndex(existingForum => existingForum.id === forum.id);

                    // only add if the forum is not in the local forums array
                    if (existingForumIndex === -1) {
                        // only add live forums
                        if (forumsLoadMode === realtimeDBUtils.LOAD_LIVE_FORUMS) {
                            if (!forum.hasOwnProperty('deleted')
                                || (
                                    forum.hasOwnProperty('deleted')
                                    && forum.deleted === false
                                )
                            ) {
                                if (forum.author.id === currentUser.id) {
                                    forum.author = currentUser;
                                    forums.push(forum);

                                    dispatch({
                                        type: FORUMS_CHANGED,
                                        forumsChanged: [...forums]
                                    });
                                } else {
                                    realtimeDBUtils
                                        .getUserBasedOnID(forum.author.id)
                                        .then(user => {
                                            forum.author = user;
                                            forums.push(forum);

                                            dispatch({
                                                type: FORUMS_CHANGED,
                                                forumsChanged: [...forums]
                                            });
                                        })
                                        .catch(error => {
                                            // handle error
                                        });
                                }
                            }
                        }
                        // only add deleted forums
                        else {
                            if (forum.hasOwnProperty('deleted') && forum.deleted === true) {
                                if (forum.author.id === currentUser.id) {
                                    forum.author = currentUser;
                                    forums.push(forum);

                                    dispatch({
                                        type: FORUMS_CHANGED,
                                        forumsChanged: [...forums]
                                    });
                                } else {
                                    realtimeDBUtils
                                        .getUserBasedOnID(forum.author.id)
                                        .then(user => {
                                            forum.author = user;
                                            forums.push(forum);

                                            dispatch({
                                                type: FORUMS_CHANGED,
                                                forumsChanged: [...forums]
                                            });
                                        })
                                        .catch(error => {
                                            // handle error
                                        });
                                }
                            }
                        }
                    }
                });

            // a forum has changed
            forumsListener
                .on('child_changed', snapshot => {
                    let forum = snapshot.val();

                    let forums = [...getState().manageForums.forums];
                    let existingForumIndex = forums.findIndex(existingForum => existingForum.id === forum.id);

                    if (existingForumIndex !== -1) {
                        if (!forum.hasOwnProperty('deleted')
                            || (
                                forum.hasOwnProperty('deleted')
                                && forum.deleted === false
                            )
                        ) {
                            forum.author = forums[existingForumIndex].author;
                            forums[existingForumIndex] = forum;
                        } else {
                            forums.splice(existingForumIndex, 1);
                        }

                        dispatch({
                            type: FORUMS_CHANGED,
                            forumsChanged: [...forums]
                        });
                    } else {
                        realtimeDBUtils
                            .getUserBasedOnID(forum.author.id)
                            .then(user => {
                                forum.author = user;
                                forums.push(forum);

                                dispatch({
                                    type: FORUMS_CHANGED,
                                    forumsChanged: [...forums]
                                });
                            })
                            .catch(error => {
                                // handle error
                            });
                    }
                });

            // a forums is removed
            forumsListener
                .on('child_removed', snapshot => {

                    let forums = [...getState().manageForums.forums];

                    let existingForumIndex = forums.findIndex(existingForum => existingForum.id === snapshot.key);
                    forums.splice(existingForumIndex, 1);

                    dispatch({
                        type: FORUMS_CHANGED,
                        forumsChanged: [...forums]
                    });
                });
        }
    }
};

export const stopListeningForForumsChanged = () => {
    return (dispatch, getState) => {
        if (forumsListener) {
            forumsListener.off('child_added');
            forumsListener.off('child_changed');
            forumsListener.off('child_removed');
            forumsListener = null;
        }
    }
};

export const THREADS_CHANGED = 'THREADS_CHANGED';
export const startListeningForThreadsChanged = () => {
    return (dispatch, getState) => {
        const forumSelected = getState().manageForums.forumSelected;

        if (!forumThreadsListener) {
            forumThreadsListener = firebase
                .database()
                .ref(DB_CONST.FORUM_THREADS_CHILD)
                .orderByChild('forumID')
                .equalTo(forumSelected.id);

            // a new thread is added
            forumThreadsListener
                .on('child_added', snapshot => {
                    let thread = snapshot.val();

                    const currentUser = getState().auth.user;
                    const threadsLoadMode = getState().manageForums.threadsLoadMode;

                    let threads = [...getState().manageForums.forumThreads];
                    let existingThreadIndex = threads.findIndex(existingThread => existingThread.id === thread.id);

                    // only add if the thread is not in the local threads array
                    if (existingThreadIndex === -1) {
                        // only add live threads
                        if (threadsLoadMode === realtimeDBUtils.LOAD_LIVE_THREADS) {
                            if (!thread.hasOwnProperty('deleted')
                                || (
                                    thread.hasOwnProperty('deleted')
                                    && thread.deleted === false
                                )
                            ) {
                                if (thread.author.id === currentUser.id) {
                                    thread.author = currentUser;
                                    threads.push(thread);

                                    dispatch({
                                        type: THREADS_CHANGED,
                                        threadsChanged: [...threads]
                                    });
                                } else {
                                    realtimeDBUtils
                                        .getUserBasedOnID(thread.author.id)
                                        .then(user => {
                                            thread.author = user;
                                            threads.push(thread);

                                            dispatch({
                                                type: THREADS_CHANGED,
                                                threadsChanged: [...threads]
                                            });
                                        })
                                        .catch(error => {
                                            // handle error
                                        });
                                }
                            }
                        }
                        // only add deleted threads
                        else {
                            if (thread.hasOwnProperty('deleted') && thread.deleted === true) {
                                if (thread.author.id === currentUser.id) {
                                    thread.author = currentUser;
                                    threads.push(thread);

                                    dispatch({
                                        type: THREADS_CHANGED,
                                        threadsChanged: [...threads]
                                    });
                                } else {
                                    realtimeDBUtils
                                        .getUserBasedOnID(thread.author.id)
                                        .then(user => {
                                            thread.author = user;
                                            threads.push(thread);

                                            dispatch({
                                                type: THREADS_CHANGED,
                                                forumsChanged: [...threads]
                                            });
                                        })
                                        .catch(error => {
                                            // handle error
                                        });
                                }
                            }
                        }
                    }
                });

            // a thread has changed
            forumThreadsListener
                .on('child_changed', snapshot => {
                    let thread = snapshot.val();

                    let threads = [...getState().manageForums.forumThreads];
                    let existingThreadIndex = threads.findIndex(existingThread => existingThread.id === thread.id);

                    if (existingThreadIndex !== -1) {
                        if (!thread.hasOwnProperty('deleted')
                            || (
                                thread.hasOwnProperty('deleted')
                                && thread.deleted === false
                            )
                        ) {
                            thread.author = threads[existingThreadIndex].author;
                            threads[existingThreadIndex] = thread;
                        } else {
                            threads.splice(existingThreadIndex, 1);
                        }

                        dispatch({
                            type: THREADS_CHANGED,
                            threadsChanged: [...threads]
                        });
                    } else {
                        realtimeDBUtils
                            .getUserBasedOnID(thread.author.id)
                            .then(user => {
                                thread.author = user;
                                threads.push(thread);

                                dispatch({
                                    type: THREADS_CHANGED,
                                    threadsChanged: [...threads]
                                });
                            })
                            .catch(error => {
                                // handle error
                            });
                    }
                });

            // a thread is removed
            forumThreadsListener
                .on('child_removed', snapshot => {

                    let threads = [...getState().manageForums.forumThreads];

                    let existingThreadIndex = threads.findIndex(existingThread => existingThread.id === snapshot.key);
                    threads.splice(existingThreadIndex, 1);

                    dispatch({
                        type: THREADS_CHANGED,
                        threadsChanged: [...threads]
                    });
                });
        }
    }
};

export const stopListeningForThreadsChanged = () => {
    return (dispatch, getState) => {
        if (forumThreadsListener) {
            forumThreadsListener.off('child_added');
            forumThreadsListener.off('child_changed');
            forumThreadsListener.off('child_removed');
            forumThreadsListener = null;
        }
    }
};

export const THREAD_REPLIES_CHANGED = 'THREAD_REPLIES_CHANGED';
export const startListeningForThreadRepliesChanged = () => {
    return (dispatch, getState) => {
        const user = getState().auth.user;
        const forumThreadSelected = getState().manageForums.forumThreadSelected;

        if (!forumThreadRepliesListener) {
            forumThreadRepliesListener = firebase
                .database()
                .ref(DB_CONST.FORUM_THREAD_REPLIES_CHILD)
                .orderByChild('threadID')
                .equalTo(forumThreadSelected.id);

            // a new reply is added
            forumThreadRepliesListener
                .on('child_added', snapshot => {
                    let reply = snapshot.val();

                    let replies = [...getState().manageForums.forumThreadReplies];
                    let existingReplyIndex = replies.findIndex(existingReply => existingReply.id === reply.id);

                    // only add if the forums is not in the local forums array
                    if (existingReplyIndex === -1) {
                        if (reply.author.id === user.id) {
                            reply.author = user;
                            replies.push(reply);

                            dispatch({
                                type: THREAD_REPLIES_CHANGED,
                                repliesChanged: [...replies]
                            });
                        } else {
                            realtimeDBUtils
                                .getUserBasedOnID(reply.author.id)
                                .then(user => {
                                    reply.author = user;
                                    replies.push(reply);

                                    dispatch({
                                        type: THREAD_REPLIES_CHANGED,
                                        repliesChanged: [...replies]
                                    });
                                })
                                .catch(error => {
                                    // handle error
                                });
                        }
                    }
                });

            // a reply has changed
            forumThreadRepliesListener
                .on('child_changed', snapshot => {
                    let reply = snapshot.val();

                    let replies = [...getState().manageForums.forumThreadReplies];
                    let existingReplyIndex = replies.findIndex(existingReply => existingReply.id === reply.id);

                    reply.author = replies[existingReplyIndex].author;
                    replies[existingReplyIndex] = reply;

                    dispatch({
                        type: THREAD_REPLIES_CHANGED,
                        repliesChanged: [...replies]
                    });
                });

            // a reply is removed
            forumThreadRepliesListener
                .on('child_removed', snapshot => {

                    let replies = [...getState().manageForums.forumThreadReplies];

                    let existingReplyIndex = replies.findIndex(existingReply => existingReply.id === snapshot.key);
                    replies.splice(existingReplyIndex, 1);

                    dispatch({
                        type: THREAD_REPLIES_CHANGED,
                        repliesChanged: [...replies]
                    });
                });
        }
    }
};

export const stopListeningForThreadRepliesChanged = () => {
    return (dispatch, getState) => {
        if (forumThreadRepliesListener) {
            forumThreadRepliesListener.off('child_added');
            forumThreadRepliesListener.off('child_changed');
            forumThreadRepliesListener.off('child_removed');
            forumThreadRepliesListener = null;
        }
    }
};

