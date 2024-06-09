import React, {Component} from 'react';
import {css} from 'aphrodite';
import {Col, Container, Row} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {
    Button,
    ButtonBase,
    FormControl,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/CreateOutlined';
import 'react-quill/dist/quill.snow.css';
import HashLoader from 'react-spinners/HashLoader';

import {connect} from 'react-redux';
import * as forumsActions from '../../redux-store/actions/forumsActions';
import CreateForum from './CreateForum';
import CreateThread from './CreateThread';
import IndividualForum from './IndividualForum';
import IndividualThread from './IndividualThread';
import './Forums.scss';

import * as DB_CONST from '../../firebase/databaseConsts';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import * as utils from '../../utils/utils';
import * as colors from '../../values/colors';
import sharedStyles, {StyledTableCell} from '../../shared-js-css-styles/SharedStyles';

export const MODE_FORUMS_MAIN = 0;
export const MODE_CREATE_FORUM = 1;
export const MODE_VIEW_FORUM = 2;
export const MODE_CREATE_THREAD = 3;
export const MODE_VIEW_THREAD = 4;

export const SORT_BY_CURRENT_USER = 0;
export const SORT_BY_LAST = 1;
export const SORT_BY_OLDEST = 2;

const mapStateToProps = state => {
    return {
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        currentUser: state.auth.user,

        modeForums: state.manageForums.modeForums,

        forumsSortedMode: state.manageForums.forumsSortedMode,
        forumsLoadMode: state.manageForums.forumsLoadMode,

        forums: state.manageForums.forums,
        forumsLoaded: state.manageForums.forumsLoaded,

        forumSelected: state.manageForums.forumSelected,
        forumThreads: state.manageForums.forumThreads,
        forumThreadsLoaded: state.manageForums.forumThreadsLoaded,
        forumsTablePage: state.manageForums.forumsTablePage,
        forumsTableRowsPerPage: state.manageForums.forumsTableRowsPerPage,

        forumThreadSelected: state.manageForums.forumThreadSelected,
        forumThreadReplies: state.manageForums.forumThreadReplies,
        forumThreadRepliesLoaded: state.manageForums.forumThreadRepliesLoaded,

        threadInReplyMode: state.manageForums.threadInReplyMode,
        threadReplySubject: state.manageForums.threadReplySubject,
        threadReplyMessage: state.manageForums.threadReplyMessage,
        createThreadReplyError: state.manageForums.createThreadReplyError
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadForums: (mode) => dispatch(forumsActions.loadForums(mode)),
        startListeningForForumsChanged: () => dispatch(forumsActions.startListeningForForumsChanged()),
        stopListeningForForumsChanged: () => dispatch(forumsActions.stopListeningForForumsChanged()),
        startListeningForThreadsChanged: () => dispatch(forumsActions.startListeningForThreadsChanged()),
        stopListeningForThreadsChanged: () => dispatch(forumsActions.stopListeningForThreadsChanged()),
        startListeningForThreadRepliesChanged: () => dispatch(forumsActions.startListeningForThreadRepliesChanged()),
        stopListeningForThreadRepliesChanged: () => dispatch(forumsActions.stopListeningForThreadRepliesChanged()),

        toggleCreateNewForum: (open, forumEdited) => dispatch(forumsActions.toggleCreateNewForum(open, forumEdited)),
        clickOnAParticularForum: (forum) => dispatch(forumsActions.clickOnAParticularForum(forum)),
        deleteForum: (forumID) => dispatch(forumsActions.deleteForum(forumID)),

        handleForumsInputChanged: (event) => dispatch(forumsActions.handleForumsInputChanged(event)),

        tableChangePage: (table, newPage) => dispatch(forumsActions.changePage(table, newPage)),
        tableChangeRowsPerPage: (table, event) => dispatch(forumsActions.changeRowsPerPage(table, event))
    }
};

class Forums extends Component {

    /**
     * Handle table change page
     *
     * @param table
     * @returns {function(...[*]=)}
     */
    tableChangePage = table => (event, newPage) => {
        this.props.tableChangePage(table, newPage);
    };

    /**
     * Handle table change rows per page
     *
     * @param table
     * @returns {function(...[*]=)}
     */
    tableChangeRowsPerPage = table => event => {
        this.props.tableChangeRowsPerPage(table, event);
    };

    componentDidMount() {
        const {
            loadForums
        } = this.props;

        // load forums when this component is displayed
        loadForums(realtimeDBUtils.LOAD_LIVE_FORUMS);

        // call add and remove listeners here because when switching to another tab, all the listeners will be removed,
        // but when switching back to the Forums tab, the componentDidUpdate won't be called. As a result, the listeners
        // will not be added according to the state of the forum components.
        // Therefore, we call add and remove listeners explicitly in this componentDidMount to ensure
        // the listeners will be added accordingly to the Forums state.
        this.addAndRemoveListeners();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.addAndRemoveListeners();
    }

    /**
     * Add and remove listeners accordingly to the Forums state
     */
    addAndRemoveListeners = () => {
        const {
            forums,
            forumsLoaded,

            forumSelected,
            forumThreads,
            forumThreadsLoaded,

            forumThreadSelected,
            forumThreadReplies,
            forumThreadRepliesLoaded,

            startListeningForForumsChanged,
            startListeningForThreadsChanged,
            stopListeningForThreadsChanged,
            startListeningForThreadRepliesChanged,
            stopListeningForThreadRepliesChanged
        } = this.props;

        // forums have been loaded
        if (forums && forumsLoaded) {
            startListeningForForumsChanged();
        }

        // if the user is viewing threads of a particular forum
        // and all the threads have been loaded
        if (forumSelected && forumThreads && forumThreadsLoaded) {
            startListeningForThreadsChanged();
        }

        // remove threads listener when the user is not viewing the threads
        if (!forumSelected && !forumThreadsLoaded) {
            stopListeningForThreadsChanged();
        }

        // if the user is viewing the replies within a particular thread
        // and all replies have been loaded
        if (forumThreadSelected && forumThreadReplies && forumThreadRepliesLoaded) {
            startListeningForThreadRepliesChanged();
        }

        // remove replies listener when the user is not viewing the replies
        if (!forumThreadSelected && !forumThreadRepliesLoaded) {
            stopListeningForThreadRepliesChanged();
        }
    };

    /**
     * Render content of the Forums tab
     *
     * @returns {null|*}
     */
    renderContent = () => {
        const {
            groupProperties,

            currentUser,
            modeForums,

            forums,

            forumsSortedMode,
            forumsLoadMode,

            forumsTablePage,
            forumsTableRowsPerPage,

            toggleCreateNewForum,
            handleForumsInputChanged
        } = this.props;

        if (!currentUser) {
            return null;
        }

        switch (modeForums) {
            case MODE_FORUMS_MAIN: {

                let sortedForums = [...forums];

                if (forumsSortedMode === SORT_BY_CURRENT_USER) {
                    sortedForums = forums.filter(forum => forum.author.id === currentUser.id);
                    sortedForums.sort((forum1, forum2) => {
                        return (forum2.dateCreated - forum1.dateCreated)
                    });
                }

                return (
                    <FlexView column >
                        <Typography variant="body2" color="textSecondary" align="left" >
                            Forums are made up of individual discussion threads that can be organised around a
                            particular subject.
                            Create forums to organise discussions.
                            <br/>
                            <u>Note that all forums are visible across the Student Invest West network.</u>
                        </Typography>
                        <FlexView marginTop={35} marginBottom={35} >
                            <Button
                                color="primary"
                                variant="outlined"
                                className={css(sharedStyles.no_text_transform)}
                                onClick={() => toggleCreateNewForum(true, null)}
                            >
                                <AddIcon fontSize="small" style={{ marginRight: 10 }} />
                                Create forum
                            </Button>
                        </FlexView>

                        {/** Filters */}
                        <Container fluid style={{ padding: 0, marginBottom: 40 }} >
                            <Row>
                                {
                                    currentUser.type === DB_CONST.TYPE_ADMIN
                                    && currentUser.superAdmin
                                        ?
                                        <Col xs={12} sm={12} md={4} lg={2} >
                                            <FlexView column >
                                                <Typography variant="body2" align="left" style={{ marginBottom: 4 }}>Mode</Typography>
                                                <Paper>
                                                    <FormControl fullWidth >
                                                        <Select
                                                            value={forumsLoadMode}
                                                            onChange={handleForumsInputChanged}
                                                            margin="dense"
                                                            input={
                                                                <OutlinedInput labelWidth={0} name="forumsLoadMode" /> }
                                                        >
                                                            <MenuItem value={realtimeDBUtils.LOAD_LIVE_FORUMS}>Live forums</MenuItem>
                                                            <MenuItem value={realtimeDBUtils.LOAD_DELETED_FORUMS}>Deleted forums</MenuItem>
                                                        </Select>
                                                    </FormControl>
                                                </Paper>
                                            </FlexView>
                                        </Col>
                                        :
                                        null
                                }
                                <Col xs={12} sm={12} md={4} lg={2} >
                                    <FlexView column >
                                        <Typography variant="body2" align="left" style={{ marginBottom: 4 }}>Sort by</Typography>
                                        <Paper>
                                            <FormControl fullWidth >
                                                <Select
                                                    value={forumsSortedMode}
                                                    onChange={handleForumsInputChanged}
                                                    margin="dense"
                                                    input={
                                                        <OutlinedInput labelWidth={0} name="forumsSortedMode" />
                                                    }
                                                >
                                                    <MenuItem value={SORT_BY_LAST}>Newest</MenuItem>
                                                    <MenuItem value={SORT_BY_CURRENT_USER}>Mine</MenuItem>
                                                    <MenuItem value={SORT_BY_OLDEST}>Oldest</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Paper>
                                    </FlexView>
                                </Col>
                            </Row>
                        </Container>

                        {/** Forums table */}
                        <Paper style={{ overflowX: "auto" }} >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <StyledTableCell
                                            colSpan={1}
                                            cellColor={
                                                !groupProperties
                                                    ?
                                                    colors.primaryColor
                                                    :
                                                    groupProperties.settings.primaryColor
                                            }
                                            component={
                                                <Typography align="left" variant="body2" className={css(sharedStyles.white_text)}><b>Date</b></Typography>
                                            }
                                        />
                                        <StyledTableCell
                                            colSpan={1}
                                            cellColor={
                                                !groupProperties
                                                    ?
                                                    colors.primaryColor
                                                    :
                                                    groupProperties.settings.primaryColor
                                            }
                                            component={
                                                <Typography align="left" variant="body2" className={css(sharedStyles.white_text)}><b>Forum</b></Typography>
                                            }
                                        />
                                        <StyledTableCell
                                            colSpan={1}
                                            cellColor={
                                                !groupProperties
                                                    ?
                                                    colors.primaryColor
                                                    :
                                                    groupProperties.settings.primaryColor
                                            }
                                            component={
                                                <Typography align="left" variant="body2" className={css(sharedStyles.white_text)}><b>Description</b></Typography>
                                            }
                                        />
                                        <StyledTableCell
                                            colSpan={1}
                                            cellColor={
                                                !groupProperties
                                                    ?
                                                    colors.primaryColor
                                                    :
                                                    groupProperties.settings.primaryColor
                                            }
                                            component={
                                                <Typography align="left" variant="body2" className={css(sharedStyles.white_text)}><b>Author</b></Typography>
                                            }
                                        />
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        this.renderForums()
                                    }
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TablePagination
                                            style={{
                                                backgroundColor: colors.blue_gray_50
                                            }}
                                            rowsPerPageOptions={[5, 20, 50]}
                                            count={sortedForums.length}
                                            rowsPerPage={forumsTableRowsPerPage}
                                            page={forumsTablePage}
                                            backIconButtonProps={{
                                                'aria-label': 'Previous Page',
                                            }}
                                            nextIconButtonProps={{
                                                'aria-label': 'Next Page',
                                            }}
                                            SelectProps={{
                                                native: true,
                                            }}
                                            onChangePage={this.tableChangePage('forums')}
                                            onChangeRowsPerPage={this.tableChangeRowsPerPage('forums')}
                                        />
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </Paper>
                    </FlexView>
                );
            }

            case MODE_CREATE_FORUM:
                return (
                    <CreateForum/>
                );

            case MODE_VIEW_FORUM:
                return (
                    <IndividualForum/>
                );

            case MODE_CREATE_THREAD:
                return (
                    <CreateThread/>
                );

            case MODE_VIEW_THREAD:
                return (
                    <IndividualThread/>
                );

            default:
                return null;
        }
    };

    /**
     * Render forums table
     *
     * @returns {*[]}
     */
    renderForums = () => {
        const {
            groupProperties,
            currentUser,

            forums,
            forumsLoaded,
            forumsSortedMode,
            forumsTablePage,
            forumsTableRowsPerPage,

            clickOnAParticularForum,
            deleteForum,
            toggleCreateNewForum
        } = this.props;

        if (!forumsLoaded) {
            return (
                <TableRow>
                    <TableCell colSpan={4} >
                        <FlexView hAlignContent="center" marginTop={20} marginBottom={20} >
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
                    </TableCell>
                </TableRow>
            );
        }

        let sortedForums = [];

        switch (forumsSortedMode) {
            case SORT_BY_CURRENT_USER:
                sortedForums = forums.filter(forum => forum.author.id === currentUser.id);
                sortedForums.sort((forum1, forum2) => {
                    return (forum2.dateCreated - forum1.dateCreated)
                });
                break;
            case SORT_BY_LAST:
                forums.sort((forum1, forum2) => {
                    return (forum2.dateCreated - forum1.dateCreated)
                });
                sortedForums = forums;
                break;
            case SORT_BY_OLDEST:
                forums.sort((forum1, forum2) => {
                    return (forum1.dateCreated - forum2.dateCreated)
                });
                sortedForums = forums;
                break;
            default:
                break;
        }

        if (sortedForums.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4} >
                        <Typography variant="body1" align="center" style={{ marginTop: 20, marginBottom: 20 }}>No forums created.</Typography>
                    </TableCell>
                </TableRow>
            );
        }

        return (
            sortedForums
                .slice(forumsTablePage * forumsTableRowsPerPage, forumsTablePage * forumsTableRowsPerPage + forumsTableRowsPerPage)
                .map(forum => (
                        <ForumRow
                            currentUser={currentUser}
                            key={forum.id}
                            forum={forum}
                            onForumClick={clickOnAParticularForum}
                            deleteForum={deleteForum}
                            toggleEditForum={toggleCreateNewForum}
                        />
                    )
                )
        );
    };

    /**
     * Main render
     *
     * @returns {*}
     */
    render() {
        const {
            groupPropertiesLoaded,
        } = this.props;

        if (!groupPropertiesLoaded) {
            return null;
        }

        return (
            <Container fluid style={{ padding: 30 }} >
                {
                    this.renderContent()
                }
            </Container>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Forums);


/**
 * Forum row component ------------------------------------------------------------------------------------------------------------------
 */
class ForumRow extends Component {

    onForumClick = forum => {
        this.props.onForumClick(forum);
    };

    render() {

        const {
            currentUser,
            forum,

            deleteForum,
            toggleEditForum
        } = this.props;

        return (
            <TableRow hover >
                <TableCell> <Typography align="left" variant="body2">{utils.dateTimeInReadableFormat(forum.dateCreated)}</Typography>
                </TableCell>
                <TableCell style={{ maxWidth: 400 }} >
                    <FlexView column hAlignContent="left" >
                        <ButtonBase onClick={() => this.onForumClick(forum)} >
                            <Typography align="left" variant="body2" color="primary" noWrap>{forum.name}</Typography>
                        </ButtonBase>
                        {
                            currentUser.type === DB_CONST.TYPE_ADMIN
                            && currentUser.superAdmin
                            && (
                                !forum.hasOwnProperty('deleted')
                                || (
                                    forum.hasOwnProperty('deleted')
                                    && forum.deleted === false
                                )
                            )
                                ?
                                <FlexView marginTop={12} >
                                    <Button
                                        variant="outlined"
                                        className={css(sharedStyles.no_text_transform)}
                                        size="small"
                                        color="secondary"
                                        onClick={() => deleteForum(forum.id)}
                                        style={{ marginRight: 10 }}
                                    >Delete
                                        <DeleteIcon fontSize="small" style={{ marginLeft: 6 }} />
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        className={css(sharedStyles.no_text_transform)}
                                        size="small"
                                        color="primary"
                                        onClick={() => toggleEditForum(true, JSON.parse(JSON.stringify(forum)))}
                                    >Edit
                                        <EditIcon fontSize="small" style={{ marginLeft: 6 }}/>
                                    </Button>
                                </FlexView>
                                :
                                null
                        }
                    </FlexView>
                </TableCell>
                <TableCell style={{ maxWidth: 400 }}>
                    <Typography variant="body2" align="left" noWrap>{forum.description}</Typography>
                </TableCell>
                <TableCell style={{ maxWidth: 200 }} >
                    <Typography align="left" variant="body2" noWrap >
                        {
                            forum.author.type !== DB_CONST.TYPE_ADMIN
                                ?
                                // normal users
                                `${forum.author.firstName} ${forum.author.lastName}`
                                :
                                forum.author.superAdmin
                                    ?
                                    // super admins
                                    "Teacher Super Admin"
                                    :
                                    // group admins
                                    `${forum.author.groupDetails.displayName} Admin`
                        }
                    </Typography>
                </TableCell>
            </TableRow>
        )
    }
}
