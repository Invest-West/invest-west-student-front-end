import {
    MODE_CREATE_FORUM,
    MODE_CREATE_THREAD,
    MODE_FORUMS_MAIN,
    MODE_VIEW_FORUM,
    MODE_VIEW_THREAD,
    SORT_BY_LAST
} from '../../shared-components/forums/Forums';
import * as forumsActions from '../actions/forumsActions';
import * as authActions from '../actions/authActions';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';

const initState = {
    modeForums: MODE_FORUMS_MAIN,

    forumsSortedMode: SORT_BY_LAST,
    forumsLoadMode: realtimeDBUtils.LOAD_LIVE_FORUMS,

    threadsLoadMode: realtimeDBUtils.LOAD_LIVE_THREADS,
    threadsSortedMode: SORT_BY_LAST,

    forums: [],
    forumsLoaded: false,

    forumsTablePage: 0,
    forumsTableRowsPerPage: 5,

    forumSelected: null,
    forumThreads: [],
    forumThreadsLoaded: false,

    forumThreadSelected: null,
    forumThreadReplies: [],
    forumThreadRepliesLoaded: false,

    threadsTablePage: 0,
    threadsTableRowsPerPage: 5,

    createForumName: '',
    createForumDesc: '',
    createForumAuthor: null,
    createForumError: false,
    forumEdited: null,

    createThreadName: '',
    createThreadBriefDesc: '',
    createThreadMessage: {ops: []},
    createThreadError: false,
    threadEdited: null,

    threadInReplyMode: false,
    threadReplyEdited: null,
    threadReplySubject: '',
    threadReplyMessage: {ops: []},
    createThreadReplyError: false
};

const forumsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case forumsActions.GO_BACK_TO_FORUMS_MAIN:
            return {
                ...initState,
                forums: state.forums,
                forumsLoaded: state.forumsLoaded,
                forumsSortedMode: state.forumsSortedMode,
                forumsLoadMode: state.forumsLoadMode,

                forumsTablePage: state.forumsTablePage,
                forumsTableRowsPerPage: state.forumsTableRowsPerPage
            };
        case forumsActions.LOADING_FORUMS:
            return {
                ...state,
                forums: [],
                forumsLoaded: false
            };
        case forumsActions.FINISHED_LOADING_FORUMS:
            return {
                ...state,
                forums: [...action.forums],
                forumsLoaded: true
            };
        case forumsActions.ERROR_LOADING_FORUMS:
            return {
                ...state,
                forums: [],
                forumsLoaded: true
            };
        case forumsActions.TOGGLE_CREATE_NEW_FORUM:
            return {
                ...state,
                modeForums: action.open
                    ?
                    MODE_CREATE_FORUM
                    :
                    MODE_FORUMS_MAIN
                ,
                forumEdited: action.forumEdited
                    ?
                    JSON.parse(JSON.stringify(action.forumEdited))
                    :
                    null
                ,
                createForumName:
                    action.forumEdited
                        ?
                        action.forumEdited.name
                        :
                        ''
                ,
                createForumDesc:
                    action.forumEdited
                        ?
                        action.forumEdited.description
                        :
                        ''
                ,
                createForumError: false,
                createForumAuthor: null
            };
        case forumsActions.ERROR_CREATING_NEW_FORUM:
            return {
                ...state,
                createForumError: true
            };
        case forumsActions.FORUMS_INPUT_CHANGED:
            return {
                ...state,
                [action.name]: action.value
            };
        case forumsActions.LOADING_THREADS_IN_A_FORUM:
            return {
                ...state,
                modeForums: MODE_VIEW_FORUM,
                forumSelected: JSON.parse(JSON.stringify(action.forumSelected)),
                forumThreadsLoaded: false
            };
        case forumsActions.FINISHED_LOADING_THREADS_IN_A_FORUM:
            return {
                ...state,
                forumThreads: [...action.threads],
                forumThreadsLoaded: true
            };
        case forumsActions.GO_BACK_TO_FORUMS_LIST:
            return {
                ...initState,
                forums: state.forums,
                forumsLoaded: state.forumsLoaded,
                forumsSortedMode: state.forumsSortedMode,
                forumsLoadMode: state.forumsLoadMode,

                forumsTablePage: state.forumsTablePage,
                forumsTableRowsPerPage: state.forumsTableRowsPerPage
            };
        case forumsActions.TOGGLE_CREATE_NEW_THREAD:
            return {
                ...state,
                modeForums: action.open
                    ?
                    MODE_CREATE_THREAD
                    :
                    MODE_VIEW_FORUM
                ,
                threadEdited: action.threadEdited
                    ?
                    JSON.parse(JSON.stringify(action.threadEdited))
                    :
                    null
                ,
                createThreadName: action.threadEdited
                    ?
                    action.threadEdited.name
                    :
                    ''
                ,
                createThreadBriefDesc: action.threadEdited
                    ?
                    action.threadEdited.description
                    :
                    ''
                ,
                createThreadMessage: action.threadEdited
                    ?
                    action.threadEdited.message
                    :
                    {ops: []}
                ,
                createThreadError: false
            };
        case forumsActions.ERROR_CREATING_NEW_THREAD:
            return {
                ...state,
                createThreadError: true
            };
        case forumsActions.LOADING_REPLIES_IN_A_THREAD:
            return {
                ...state,
                modeForums: MODE_VIEW_THREAD,
                forumThreadSelected: JSON.parse(JSON.stringify(action.threadSelected)),
                forumThreadRepliesLoaded: false
            };
        case forumsActions.FINISHED_LOADING_REPLIES_IN_A_THREAD:
            return {
                ...state,
                forumThreadReplies: [...action.replies],
                forumThreadRepliesLoaded: true
            };
        case forumsActions.GO_BACK_TO_THREADS_LIST:
            return {
                ...state,
                modeForums: MODE_VIEW_FORUM,
                forumThreadSelected: null,
                forumThreadReplies: [],
                forumThreadRepliesLoaded: false,

                threadInReplyMode: false,
                threadReplyMessage: {ops: []}
            };
        case forumsActions.TOGGLE_THREAD_REPLY:
            return {
                ...state,
                threadInReplyMode: action.open,
                threadReplyEdited: JSON.parse(JSON.stringify(action.threadReplyEdited)),
                threadReplySubject: action.open
                    ?
                    action.threadReplyEdited
                        ?
                        action.threadReplyEdited.subject
                        :
                        `RE: ${state.forumThreadSelected.name}`
                    :
                    ''
                ,
                threadReplyMessage: action.open
                    ?
                    action.threadReplyEdited
                        ?
                        action.threadReplyEdited.message
                        :
                        {ops: []}
                    :
                    {ops: []}
                ,
                createThreadReplyError: false
            };
        case forumsActions.ERROR_CREATING_THREAD_REPLY:
            return {
                ...state,
                createThreadReplyError: true
            };
        case forumsActions.FORUMS_QUILL_CHANGED:
            return {
                ...state,
                createThreadMessage: action.field === forumsActions.THREAD_CONTENT_QUILL ? action.quill : state.createThreadMessage,
                threadReplyMessage: action.field === forumsActions.THREAD_REPLY_CONTENT_QUILL ? action.quill : state.threadReplyMessage
            };
        case forumsActions.FORUMS_CHANGED:
            return {
                ...state,
                forums: [...action.forumsChanged]
            };
        case forumsActions.THREADS_CHANGED:
            return {
                ...state,
                forumThreads: [...action.threadsChanged]
            };
        case forumsActions.THREAD_REPLIES_CHANGED:
            return {
                ...state,
                forumThreadReplies: [...action.repliesChanged]
            };
        case forumsActions.MANAGE_FORUMS_TABLE_PAGE_CHANGED:
            return {
                ...state,
                forumsTablePage: action.table === 'forums' ? action.newPage : state.forumsTablePage,
                threadsTablePage: action.table === 'threads' ? action.newPage : state.threadsTablePage
            };
        case forumsActions.MANAGE_FORUMS_TABLE_ROWS_PER_PAGE_CHANGED:
            return {
                ...state,
                forumsTableRowsPerPage: action.table === 'forums' ? action.value : state.forumsTableRowsPerPage,
                threadsTableRowsPerPage: action.table === 'threads' ? action.value : state.threadsTableRowsPerPage,
            };
        default:
            return state;
    }
};

export default forumsReducer;