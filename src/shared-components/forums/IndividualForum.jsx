import React, {Component} from 'react';
import {
    Button,
    ButtonBase,
    Divider,
    FormControl,
    IconButton,
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
import HashLoader from 'react-spinners/HashLoader';
import FlexView from 'react-flexview';
import * as colors from '../../values/colors';
import * as utils from '../../utils/utils';
import * as DB_CONST from '../../firebase/databaseConsts';
import {css} from 'aphrodite';
import sharedStyles, {StyledTableCell} from '../../shared-js-css-styles/SharedStyles';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/CreateOutlined';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import AddIcon from '@material-ui/icons/Add';
import {Col, Container, Row} from 'react-bootstrap';
import * as realtimeDBUtils from '../../firebase/realtimeDBUtils';
import {SORT_BY_CURRENT_USER, SORT_BY_LAST, SORT_BY_OLDEST} from './Forums';

import {connect} from 'react-redux';
import * as forumsActions from '../../redux-store/actions/forumsActions';

const mapStateToProps = state => {
    return {
        groupProperties: state.manageGroupFromParams.groupProperties,

        currentUser: state.auth.user,

        forumSelected: state.manageForums.forumSelected,
        forumThreads: state.manageForums.forumThreads,
        forumThreadsLoaded: state.manageForums.forumThreadsLoaded,
        threadsTablePage: state.manageForums.threadsTablePage,
        threadsTableRowsPerPage: state.manageForums.threadsTableRowsPerPage,

        threadsLoadMode: state.manageForums.threadsLoadMode,
        threadsSortedMode: state.manageForums.threadsSortedMode
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleCreateNewThread: (open, threadEdited) => dispatch(forumsActions.toggleCreateNewThread(open, threadEdited)),
        deleteThread: (threadID) => dispatch(forumsActions.deleteThread(threadID)),
        goBackToForumsList: () => dispatch(forumsActions.goBackToForumsList()),
        clickOnAParticularThread: (thread) => dispatch(forumsActions.clickOnAParticularThread(thread)),
        handleForumsInputChanged: (event) => dispatch(forumsActions.handleForumsInputChanged(event)),
        tableChangePage: (table, newPage) => dispatch(forumsActions.changePage(table, newPage)),
        tableChangeRowsPerPage: (table, event) => dispatch(forumsActions.changeRowsPerPage(table, event))
    }
};

class IndividualForum extends Component {

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

    /**
     * Render threads table
     *
     * @returns {*[]}
     */
    renderThreads = () => {
        const {
            groupProperties,
            currentUser,
            forumThreadsLoaded,
            forumThreads,
            threadsSortedMode,
            threadsTablePage,
            threadsTableRowsPerPage,

            toggleCreateNewThread,
            deleteThread,
            clickOnAParticularThread
        } = this.props;

        if (!forumThreadsLoaded) {
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

        let sortedThreads = [];

        switch (threadsSortedMode) {
            case SORT_BY_CURRENT_USER:
                sortedThreads = forumThreads.filter(thread => thread.author.id === currentUser.id);
                sortedThreads.sort((thread1, thread2) => {
                    return (thread2.dateCreated - thread1.dateCreated);
                });
                break;
            case SORT_BY_LAST:
                forumThreads.sort((thread1, thread2) => {
                    return (thread2.dateCreated - thread1.dateCreated);
                });
                sortedThreads = forumThreads;
                break;
            case SORT_BY_OLDEST:
                forumThreads.sort((thread1, thread2) => {
                    return (thread1.dateCreated - thread2.dateCreated);
                });
                sortedThreads = forumThreads;
                break;
            default:
                break;
        }

        if (sortedThreads.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4} >
                        <Typography variant="body1" align="center" style={{ marginTop: 20, marginBottom: 20 }}>No threads created.</Typography>
                    </TableCell>
                </TableRow>
            );
        }

        return (
            sortedThreads
                .slice(threadsTablePage * threadsTableRowsPerPage, threadsTablePage * threadsTableRowsPerPage + threadsTableRowsPerPage)
                .map(thread => (
                        <TableRow
                            key={thread.id}
                            hover
                        >
                            <TableCell>
                                <Typography align="left" variant="body2" >{utils.dateTimeInReadableFormat(thread.dateCreated)}</Typography>
                            </TableCell>
                            <TableCell style={{ maxWidth: 400 }} >
                                <FlexView column hAlignContent="left" >
                                    <ButtonBase onClick={() => clickOnAParticularThread(thread)} >
                                        <Typography align="left" variant="body2" color="primary" noWrap>{thread.name}</Typography>
                                    </ButtonBase>
                                    {
                                        currentUser.type === DB_CONST.TYPE_ADMIN
                                        && currentUser.superAdmin
                                        && (
                                            !thread.hasOwnProperty('deleted')
                                            || (
                                                thread.hasOwnProperty('deleted')
                                                && thread.deleted === false
                                            )
                                        )
                                            ?
                                            <FlexView marginTop={12} >
                                                <Button
                                                    variant="outlined"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    size="small"
                                                    color="secondary"
                                                    onClick={() => deleteThread(thread.id)}
                                                    style={{ marginRight: 10 }}
                                                >Delete
                                                    <DeleteIcon fontSize="small" style={{ marginLeft: 6 }}/>
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    className={css(sharedStyles.no_text_transform)}
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => toggleCreateNewThread(true, JSON.parse(JSON.stringify(thread)))}
                                                > Edit
                                                    <EditIcon fontSize="small" style={{ marginLeft: 6 }} />
                                                </Button>
                                            </FlexView>
                                            :
                                            null
                                    }
                                </FlexView>
                            </TableCell>
                            <TableCell style={{ maxWidth: 400 }} >
                                <Typography align="left" variant="body2" noWrap>{thread.description}</Typography>
                            </TableCell>
                            <TableCell style={{ maxWidth: 200 }} >
                                <Typography align="left" variant="body2" noWrap >
                                    {
                                        thread.author.type !== DB_CONST.TYPE_ADMIN
                                            ?
                                            // normal users
                                            `${thread.author.firstName} ${thread.author.lastName}`
                                            :
                                            thread.author.superAdmin
                                                ?
                                                // super admins
                                                "Student Super Admin"
                                                :
                                                // group admins
                                                `${thread.author.groupDetails.displayName} Admin`
                                    }
                                </Typography>
                            </TableCell>
                        </TableRow>
                    )
                )
        );
    };

    render() {
        const {
            groupProperties,

            currentUser,

            forumSelected,
            forumThreads,

            threadsTablePage,
            threadsTableRowsPerPage,

            threadsLoadMode,
            threadsSortedMode,

            toggleCreateNewThread,
            handleForumsInputChanged,
            goBackToForumsList
        } = this.props;

        let sortedThreads = [...forumThreads];

        if (threadsSortedMode === SORT_BY_CURRENT_USER) {
            sortedThreads = forumThreads.filter(thread => thread.author.id === currentUser.id);
            sortedThreads.sort((thread1, thread2) => {
                return (thread2.dateCreated - thread1.dateCreated);
            });
        }

        return (
            <FlexView column >
                <FlexView vAlignContent="center" >
                    <IconButton color="primary" aria-label="Back" onClick={goBackToForumsList} >
                        <ArrowBackIcon/>
                    </IconButton>
                    <FlexView marginLeft={8} >
                        <Typography color="primary" variant="h6">{`Forum: ${forumSelected.name}`}</Typography>
                    </FlexView>
                </FlexView>

                <FlexView marginTop={12} marginBottom={24} >
                    <Typography variant="body2" align="left" >
                        {
                            !forumSelected.hasOwnProperty('lastEdited')
                                ?
                                `Created on: ${utils.dateTimeInReadableFormat(forumSelected.dateCreated)}`
                                :
                                `Last edited: ${utils.dateTimeInReadableFormat(forumSelected.lastEdited)}`
                        }
                    </Typography>
                </FlexView>

                <Typography variant="body1" align="left"><b><u>Description:</u></b></Typography>

                <Typography variant="body1" align="left" style={{ whiteSpace: "pre-line", marginTop: 6 }}>{forumSelected.description}</Typography>

                <Divider style={{ height: 2, marginTop: 35, marginBottom: 35, backgroundColor: colors.blue_gray_100 }} />

                <FlexView marginBottom={35} >
                    <Button
                        variant="outlined"
                        color="primary"
                        className={css(sharedStyles.no_text_transform)}
                        onClick={() => toggleCreateNewThread(true, null)}
                    >
                        <AddIcon fontSize="small" style={{ marginRight: 10 }}/>Create thread
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
                                                    value={threadsLoadMode}
                                                    onChange={handleForumsInputChanged}
                                                    margin="dense"
                                                    input={
                                                        <OutlinedInput labelWidth={0} name="threadsLoadMode" />
                                                    }
                                                >
                                                    <MenuItem value={realtimeDBUtils.LOAD_LIVE_THREADS}>Live threads</MenuItem>
                                                    <MenuItem value={realtimeDBUtils.LOAD_DELETED_THREADS}>Deleted threads</MenuItem>
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
                                            value={threadsSortedMode}
                                            onChange={handleForumsInputChanged}
                                            margin="dense"
                                            input={
                                                <OutlinedInput labelWidth={0} name="threadsSortedMode" />
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

                {/** Threads table */}
                <Paper style={{ overflowX: "auto" }}>
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
                                        <Typography align="left" variant="body2" className={css(sharedStyles.white_text)}><b>Thread</b></Typography>
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
                                this.renderThreads()
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    style={{
                                        backgroundColor: colors.blue_gray_50
                                    }}
                                    rowsPerPageOptions={[5, 20, 50]}
                                    count={sortedThreads.length}
                                    rowsPerPage={threadsTableRowsPerPage}
                                    page={threadsTablePage}
                                    backIconButtonProps={{
                                        'aria-label': 'Previous Page',
                                    }}
                                    nextIconButtonProps={{
                                        'aria-label': 'Next Page',
                                    }}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    onChangePage={this.tableChangePage('threads')}
                                    onChangeRowsPerPage={this.tableChangeRowsPerPage('threads')}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>
            </FlexView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(IndividualForum);