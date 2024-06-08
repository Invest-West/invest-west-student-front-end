import React, {Component} from 'react';
import {
    Paper,
    Table,
    TableHead,
    TableBody,
    TableFooter,
    TableRow,
    TableCell,
    Typography,
    Button,
    InputBase,
    TablePagination,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import AddIcon from '@material-ui/icons/Add';
import {
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';
import {
    HashLoader,
    BeatLoader
} from 'react-spinners';
import {css} from 'aphrodite';
import FlexView from 'react-flexview';

import * as utils from '../../../utils/utils';
import * as colors from '../../../values/colors';
import sharedStyles, {StyledTableCell} from '../../../shared-js-css-styles/SharedStyles';

import {connect} from 'react-redux';
import * as groupAdminsTableActions from '../../../redux-store/actions/groupAdminsTableActions';

export const ADD_NEW_GROUP_ADMIN_STATUS_NONE = 0;
export const ADD_NEW_GROUP_ADMIN_STATUS_MISSING_EMAIL = 1;
export const ADD_NEW_GROUP_ADMIN_STATUS_CHECKING = 2;
export const ADD_NEW_GROUP_ADMIN_STATUS_EMAIL_USED = 3;
export const ADD_NEW_GROUP_ADMIN_STATUS_SUCCESS = 4;

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,
        currentUser: state.auth.user,
        tableGroup: state.manageGroupAdminsTable.tableGroup,
        groupAdmins: state.manageGroupAdminsTable.groupAdmins,
        groupAdminsLoaded: state.manageGroupAdminsTable.groupAdminsLoaded,
        loadingGroupAdmins: state.manageGroupAdminsTable.loadingGroupAdmins,
        page: state.manageGroupAdminsTable.page,
        rowsPerPage: state.manageGroupAdminsTable.rowsPerPage,
        searchText: state.manageGroupAdminsTable.searchText,
        inSearchMode: state.manageGroupAdminsTable.inSearchMode,

        addNewGroupAdminDialogOpen: state.manageGroupAdminsTable.addNewGroupAdminDialogOpen,
        newGroupAdminEmail: state.manageGroupAdminsTable.newGroupAdminEmail,
        addNewGroupAdminStatus: state.manageGroupAdminsTable.addNewGroupAdminStatus
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadGroupAdmins: () => dispatch(groupAdminsTableActions.loadGroupAdmins()),
        changePage: (event, newPage) => dispatch(groupAdminsTableActions.changePage(event, newPage)),
        changeRowsPerPage: (event) => dispatch(groupAdminsTableActions.changeRowsPerPage(event)),
        handleInputChanged: (event) => dispatch(groupAdminsTableActions.handleInputChanged(event)),
        toggleSearchMode: () => dispatch(groupAdminsTableActions.toggleSearchMode()),
        startListeningForGroupAdminsChanged: () => dispatch(groupAdminsTableActions.startListeningForGroupAdminsChanged()),
        stopListeningForGroupAdminsChanged: () => dispatch(groupAdminsTableActions.stopListeningForGroupAdminsChanged()),
        handleAddNewGroupAdmin: () => dispatch(groupAdminsTableActions.handleAddNewGroupAdmin()),

        toggleAddNewGroupAdminDialog: () => dispatch(groupAdminsTableActions.toggleAddNewGroupAdminDialog())
    }
};

class GroupAdminsTable extends Component {

    componentDidMount() {
        this.loadData();
        this.addListeners();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {

        const {
            shouldLoadOtherData,
            tableGroup,
            stopListeningForGroupAdminsChanged
        } = this.props;

        // cancel all listeners if tableGroup is set to null
        if (!tableGroup || !shouldLoadOtherData) {
            stopListeningForGroupAdminsChanged();
            return;
        }

        this.loadData();
        this.addListeners();
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            shouldLoadOtherData,
            tableGroup,
            loadingGroupAdmins,
            groupAdminsLoaded,
            loadGroupAdmins
        } = this.props;

        if (shouldLoadOtherData) {
            if (tableGroup && !loadingGroupAdmins && !groupAdminsLoaded) {
                loadGroupAdmins();
            }
        }
    };

    /**
     * Add listener
     */
    addListeners = () => {
        const {
            shouldLoadOtherData,
            groupAdmins,
            groupAdminsLoaded,
            startListeningForGroupAdminsChanged
        } = this.props;

        if (shouldLoadOtherData) {
            if (groupAdmins && groupAdminsLoaded) {
                startListeningForGroupAdminsChanged();
            }
        }
    };

    render() {
        const {
            groupProperties,
            currentUser,
            tableGroup,
            page,
            rowsPerPage,
            searchText,
            inSearchMode,
            addNewGroupAdminDialogOpen,
            newGroupAdminEmail,
            addNewGroupAdminStatus,
            changePage,
            changeRowsPerPage,
            loadGroupAdmins,
            handleInputChanged,
            toggleSearchMode,
            handleAddNewGroupAdmin,

            toggleAddNewGroupAdminDialog
        } = this.props;

        return (
            <div>
                <Paper elevation={1} style={{overflowX: "auto"}}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell colSpan={3} cellColor={colors.blue_gray_50}
                                    component={
                                        <InputBase name="searchText" value={searchText} onChange={handleInputChanged} fullWidth placeholder="Search by email" type="text"
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" fli
                                                        overlay={
                                                            <Tooltip id={`tooltip-bottom`}>
                                                                {
                                                                    inSearchMode
                                                                        ?
                                                                        "Exit search mode"
                                                                        :
                                                                        "Enter search mode"
                                                                }
                                                            </Tooltip>
                                                        }>
                                                        <IconButton onClick={toggleSearchMode}>
                                                            {
                                                                inSearchMode
                                                                    ?
                                                                    <CloseIcon/>
                                                                    :
                                                                    <SearchIcon/>
                                                            }
                                                        </IconButton>
                                                    </OverlayTrigger>
                                                </InputAdornment>
                                            }
                                        />
                                    }
                                />
                                <StyledTableCell colSpan={2} cellColor={colors.blue_gray_50} component={
                                        <FlexView hAlignContent="right" vAlignContent="center">
                                            {
                                                currentUser.superGroupAdmin
                                                && tableGroup !== null
                                                && currentUser.anid === tableGroup.anid
                                                    ?
                                                    <Button variant="outlined" color="primary" className={css(sharedStyles.no_text_transform)} onClick={toggleAddNewGroupAdminDialog} style={{ marginRight: 8}}>Add new group admin</Button>
                                                    :
                                                    null
                                            }
                                            <OverlayTrigger trigger={['hover', 'focus']} placement="bottom" flip
                                                overlay={
                                                    <Tooltip id={`tooltip-bottom`}>Refresh</Tooltip>}>
                                                <IconButton onClick={loadGroupAdmins} style={{marginLeft: 10}}>
                                                    <RefreshIcon/>
                                                </IconButton>
                                            </OverlayTrigger>
                                        </FlexView>
                                    }
                                />
                            </TableRow>
                            <TableRow>
                                <StyledTableCell colSpan={2}
                                    cellColor={
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Email</Typography>}/>
                                <StyledTableCell colSpan={1}
                                    cellColor={
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left"  className={css(sharedStyles.white_text)}>Type</Typography>}/>
                                <StyledTableCell colSpan={1}
                                    cellColor={
                                        !groupProperties
                                            ?
                                            colors.primaryColor
                                            :
                                            groupProperties.settings.primaryColor
                                    }
                                    component={
                                        <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Date added</Typography>}/>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {
                                this.renderTableRows()
                            }
                        </TableBody>
                        <TableFooter>
                            <TableRow>
                                <TablePagination
                                    style={{backgroundColor: colors.blue_gray_50}}
                                    rowsPerPageOptions={[10, 30, 50]}
                                    count={this.getRenderedGroupAdmins().length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    backIconButtonProps={{
                                        'aria-label': 'Previous Page',
                                    }}
                                    nextIconButtonProps={{
                                        'aria-label': 'Next Page',
                                    }}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    onChangePage={changePage}
                                    onChangeRowsPerPage={changeRowsPerPage}
                                />
                            </TableRow>
                        </TableFooter>
                    </Table>
                </Paper>

                <AddGroupAdminDialog
                    groupProperties={groupProperties}
                    addNewGroupAdminDialogOpen={addNewGroupAdminDialogOpen}
                    newGroupAdminEmail={newGroupAdminEmail}
                    addNewGroupAdminStatus={addNewGroupAdminStatus}
                    toggleAddNewGroupAdminDialog={toggleAddNewGroupAdminDialog}
                    handleInputChanged={handleInputChanged}
                    handleAddNewGroupAdmin={handleAddNewGroupAdmin}
                />
            </div>
        );
    }

    /**
     * Render table rows
     *
     * @returns {*[]|*}
     */
    renderTableRows = () => {
        const {
            groupProperties,
            groupAdminsLoaded,
            page,
            rowsPerPage,
            inSearchMode
        } = this.props;

        if (this.getRenderedGroupAdmins().length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={4}>
                        <FlexView hAlignContent="center" vAlignContent="center" style={{margin: 20}}>
                            {
                                groupAdminsLoaded
                                    ?
                                    <Typography variant="body1" align="center">
                                        {
                                            inSearchMode
                                                ?
                                                "No group admins found."
                                                :
                                                "No group admins."
                                        }
                                    </Typography>
                                    :
                                    <HashLoader
                                        color={
                                            !groupProperties
                                                ?
                                                colors.primaryColor
                                                :
                                                groupProperties.settings.primaryColor
                                        }
                                    />
                            }
                        </FlexView>
                    </TableCell>
                </TableRow>
            );
        }

        return (
            this.getRenderedGroupAdmins()
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(groupAdmin => (
                    <TableRow key={groupAdmin.id} hover>
                        <TableCell colSpan={2}>
                            <Typography variant="body2" align="left">
                                {groupAdmin.email}
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Typography variant="body2" align="left">
                                {
                                    groupAdmin.superGroupAdmin
                                        ?
                                        "Super group admin"
                                        :
                                        "Group admin"
                                }
                            </Typography>
                        </TableCell>
                        <TableCell colSpan={1}>
                            <Typography variant="body2" align="left">
                                {utils.dateTimeInReadableFormat(groupAdmin.dateAdded)}
                            </Typography>
                        </TableCell>
                    </TableRow>
                )
            )
        );
    };

    /**
     * Get rendered group admins
     *
     * @returns {*[]}
     */
    getRenderedGroupAdmins = () => {
        const {
            searchText,
            inSearchMode,
            groupAdmins
        } = this.props;

        let searchedGroupAdmins = [...groupAdmins];

        if (inSearchMode) {
            searchedGroupAdmins = searchedGroupAdmins
                .filter(groupAdmin => groupAdmin.email.includes(searchText.toLowerCase()));
        }

        return searchedGroupAdmins.sort((groupAdmin1, groupAdmin2) => {
            return groupAdmin2.time - groupAdmin1.time;
        });
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupAdminsTable);

class AddGroupAdminDialog extends Component {
    render() {
        const {
            forwardedRef,
            addNewGroupAdminDialogOpen,
            newGroupAdminEmail,
            toggleAddNewGroupAdminDialog,
            handleInputChanged,
            handleAddNewGroupAdmin
        } = this.props;

        return (
            <Dialog open={addNewGroupAdminDialogOpen} ref={forwardedRef} fullWidth maxWidth="md" onClose={toggleAddNewGroupAdminDialog}>
                <DialogTitle disableTypography>
                    <FlexView vAlignContent="center">
                        <FlexView grow={4}>
                            <Typography variant='h6' color='primary' align="left">Add new group admin
                            </Typography>
                        </FlexView>
                        <FlexView grow={1} hAlignContent="right">
                            <IconButton onClick={toggleAddNewGroupAdminDialog}>
                                <CloseIcon/>
                            </IconButton>
                        </FlexView>
                    </FlexView>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        variant="outlined"
                        label="Email"
                        name="newGroupAdminEmail"
                        placeholder="Write email here"
                        value={newGroupAdminEmail}
                        onChange={handleInputChanged}
                        fullWidth
                        required
                        style={{ marginTop: 10}}/>
                </DialogContent>
                <DialogActions>
                    <FlexView width="100%" marginRight={25} marginBottom={15} marginTop={20} hAlignContent="right" vAlignContent="center">
                        {
                            this.renderStatusMessage()
                        }
                        <Button variant="outlined" color="primary" onClick={handleAddNewGroupAdmin} size="medium" className={css(sharedStyles.no_text_transform)} style={{marginLeft: 20}}>Add<AddIcon fontSize="small" style={{ marginLeft: 8}}/>
                        </Button>
                    </FlexView>
                </DialogActions>
            </Dialog>
        );
    }

    /**
     * Render status message
     *
     * @returns {null|*}
     */
    renderStatusMessage = () => {
        const {
            addNewGroupAdminStatus,
            groupProperties
        } = this.props;

        let msg = {
            text: '',
            color: ''
        };

        switch (addNewGroupAdminStatus) {
            case ADD_NEW_GROUP_ADMIN_STATUS_NONE:
                return null;
            case ADD_NEW_GROUP_ADMIN_STATUS_MISSING_EMAIL:
                msg.tex = "Please fill in the email.";
                msg.color = "error";
                break;
            case ADD_NEW_GROUP_ADMIN_STATUS_CHECKING:
                return (
                    <BeatLoader size={10}
                        color={
                            !groupProperties
                                ?
                                colors.primaryColor
                                :
                                groupProperties.settings.primaryColor
                        }
                    />
                );
            case ADD_NEW_GROUP_ADMIN_STATUS_EMAIL_USED:
                msg.text = "This email has been used by another account.";
                msg.color = "error";
                break;
            case ADD_NEW_GROUP_ADMIN_STATUS_SUCCESS:
                return null;
            default:
                return null;
        }

        return (
            <Typography color={msg.color} variant="body1" align="left">
                {msg.text}
            </Typography>
        );
    }
}