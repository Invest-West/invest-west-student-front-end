import React, {Component} from 'react';
import {
    IconButton,
    InputAdornment,
    InputBase,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import RefreshIcon from '@material-ui/icons/Refresh';
import {
    OverlayTrigger,
    Tooltip
} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {css} from 'aphrodite';
import {HashLoader} from 'react-spinners';
import {NavLink} from 'react-router-dom';

import {connect} from 'react-redux';
import * as pledgesTableActions from '../../redux-store/actions/pledgesTableActions';

import sharedStyles, {StyledTableCell} from '../../shared-js-css-styles/SharedStyles';
import * as colors from '../../values/colors';
import * as ROUTES from '../../router/routes';
import * as utils from '../../utils/utils';
import * as DB_CONST from '../../firebase/databaseConsts';

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        user: state.auth.user,

        project: state.managePledgesTable.project,
        pledges: state.managePledgesTable.pledges,
        pledgesLoaded: state.managePledgesTable.pledgesLoaded,
        loadingPledges: state.managePledgesTable.loadingPledges,

        searchText: state.managePledgesTable.searchText,
        inSearchMode: state.managePledgesTable.inSearchMode,
        matchedPledges: state.managePledgesTable.matchedPledges,

        page: state.managePledgesTable.page,
        rowsPerPage: state.managePledgesTable.rowsPerPage
    }
};

const mapDispatchToProps = dispatch => {
    return {
        loadPledges: () => dispatch(pledgesTableActions.loadPledges()),
        toggleSearchMode: () => dispatch(pledgesTableActions.toggleSearchMode()),
        changePage: (event, newPage) => dispatch(pledgesTableActions.changePage(event, newPage)),
        changeRowsPerPage: (event) => dispatch(pledgesTableActions.changeRowsPerPage(event)),
        handlePledgesTableInputChanged: (event) => dispatch(pledgesTableActions.handlePledgesTableInputChanged(event)),
        startListeningForPledgesChanged: () => dispatch(pledgesTableActions.startListeningForPledgesChanged()),
        stopListeningForPledgesChanged: () => dispatch(pledgesTableActions.stopListeningForPledgesChanged())
    }
};

class PledgesTable extends Component {

    componentDidMount() {
        this.loadData();
        this.attachListener();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            shouldLoadOtherData,

            user,

            stopListeningForPledgesChanged
        } = this.props;

        // cancel all listeners if user is set to null
        if (!user || !shouldLoadOtherData) {
            stopListeningForPledgesChanged();
            return;
        }

        this.loadData();
        this.attachListener();
    }

    componentWillUnmount() {
        // const {
        //     stopListeningForPledgesChanged
        // } = this.props;
        //
        // stopListeningForPledgesChanged();
    }

    /**
     * Load data
     */
    loadData = () => {
        const {
            shouldLoadOtherData,

            user,
            project,

            loadingPledges,
            pledgesLoaded,

            loadPledges
        } = this.props;

        if (shouldLoadOtherData) {
            if (user && project) {
                if (!loadingPledges && !pledgesLoaded) {
                    loadPledges();
                }
            }
        }
    };

    /**
     * Attach listener
     */
    attachListener = () => {
        const {
            shouldLoadOtherData,

            pledges,
            pledgesLoaded,

            startListeningForPledgesChanged
        } = this.props;

        if (shouldLoadOtherData) {
            if (pledges && pledgesLoaded) {
                startListeningForPledgesChanged();
            }
        }
    };

    render() {
        const {
            groupProperties,
            groupPropertiesLoaded,

            user,

            project,
            pledges,

            searchText,
            inSearchMode,

            page,
            rowsPerPage,

            loadPledges,
            toggleSearchMode,
            changePage,
            changeRowsPerPage,
            handlePledgesTableInputChanged
        } = this.props;

        if (!groupPropertiesLoaded || !user || !project) {
            return null;
        }

        if (user.type === DB_CONST.TYPE_INVESTOR) {
            return null;
        }

        if (user.type === DB_CONST.TYPE_ISSUER && user.id !== project.issuerID) {
            return null;
        }

        // sort pledges by date (recent pledges come first)
        pledges.sort((pledge1, pledge2) => {
            return (pledge2.date - pledge1.date);
        });

        return (
            <Paper elevation={1} style={{ width: "100%", overflowX: "auto", marginTop: 20 }} >
                <Table>
                    <TableHead>
                        <TableRow>
                            {
                                user.type !== DB_CONST.TYPE_ADMIN
                                    ?
                                    null
                                    :
                                    <StyledTableCell
                                        colSpan={3}
                                        cellColor={colors.blue_gray_50}
                                        component={
                                            <InputBase
                                                name="searchText"
                                                value={searchText}
                                                onChange={handlePledgesTableInputChanged}
                                                fullWidth
                                                placeholder="Search investor by name"
                                                type="text"
                                                startAdornment={
                                                    <InputAdornment position="start" >
                                                        <OverlayTrigger
                                                            trigger={['hover', 'focus']}
                                                            flip
                                                            placement="bottom"
                                                            overlay={
                                                                <Tooltip id={`tooltip-bottom`} >
                                                                    {
                                                                        inSearchMode
                                                                            ?
                                                                            "Exit search mode"
                                                                            :
                                                                            "Enter search mode"
                                                                    }
                                                                </Tooltip>
                                                            }>
                                                            <IconButton
                                                                onClick={toggleSearchMode}
                                                            >
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
                            }
                            <StyledTableCell
                                colSpan={5}
                                cellColor={colors.blue_gray_50}
                                component={
                                    <FlexView hAlignContent="right" vAlignContent="center" >
                                        <OverlayTrigger
                                            trigger={['hover', 'focus']}
                                            flip
                                            placement="bottom"
                                            overlay={
                                                <Tooltip id={`tooltip-bottom`}>Refresh</Tooltip>
                                            }>
                                            <IconButton onClick={loadPledges} style={{ marginLeft: 10 }}>
                                                <RefreshIcon/>
                                            </IconButton>
                                        </OverlayTrigger>
                                    </FlexView>
                                }
                            />
                        </TableRow>
                        <TableRow>
                            <StyledTableCell
                                colSpan={2}
                                cellColor={
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Name</Typography>
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
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Email</Typography>
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
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Pledge amount</Typography>
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
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" align="left" className={css(sharedStyles.white_text)}>Pledged on</Typography>
                                }
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {
                            this.renderPledgesRows()
                        }
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[10, 20, 50]}
                                colSpan={5}
                                count={pledges.length}
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
        );
    }

    /**
     * Render join requests table rows
     *
     * @returns {*}
     */
    renderPledgesRows = () => {
        const {
            user,

            groupUserName,
            groupProperties,

            pledges,
            pledgesLoaded,

            matchedPledges,
            inSearchMode,

            page,
            rowsPerPage
        } = this.props;

        let renderedPledges = [];

        if (inSearchMode) {
            renderedPledges = matchedPledges;
        } else {
            renderedPledges = pledges;
        }

        if (renderedPledges.length === 0) {
            return (
                <TableRow>
                    <TableCell
                        colSpan={5}
                    >
                        <FlexView style={{ margin: 40 }} hAlignContent="center" vAlignContent="center">
                            {
                                pledgesLoaded
                                    ?
                                    <Typography variant="h6" align="center" >
                                        {
                                            inSearchMode
                                                ?
                                                "Can't find any investors with this name."
                                                :
                                                "No pledges listed yet."
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
            renderedPledges.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(pledge => (
                <TableRow key={pledge.id} hover >
                    <TableCell colSpan={2} >
                        <FlexView column >
                            {
                                user.type === DB_CONST.TYPE_ADMIN
                                || utils.getUserHomeGroup(pledge.groupsInvestorIsIn).groupDetails.settings.makeInvestorsContactDetailsVisibleToIssuers
                                    ?
                                    <NavLink
                                        to={
                                            groupUserName
                                                ?
                                                `${ROUTES.USER_PROFILE.replace(":groupUserName", groupUserName).replace(":userID", pledge.investor.id)}`
                                                :
                                                `${ROUTES.USER_PROFILE_INVEST_WEST_SUPER.replace(":userID", pledge.investor.id)}`
                                        }
                                        className={css(sharedStyles.nav_link_hover)}
                                    >
                                        <Typography align="left" variant="body2" color="primary" >{`${pledge.investor.title} ${pledge.investor.firstName} ${pledge.investor.lastName}`}</Typography>
                                    </NavLink>
                                    :
                                    <Typography align="left" variant="body2" color="primary" >
                                        {`Made anonymous by ${utils.getUserHomeGroup(pledge.groupsInvestorIsIn).groupDetails.displayName}.`}
                                    </Typography>
                            }
                        </FlexView>
                    </TableCell>
                    <TableCell colSpan={1} >
                        <Typography align="left" variant="body2" >
                            {
                                user.type === DB_CONST.TYPE_ADMIN
                                || utils.getUserHomeGroup(pledge.groupsInvestorIsIn).groupDetails.settings.makeInvestorsContactDetailsVisibleToIssuers
                                    ?
                                    `${pledge.investor.email}`
                                    :
                                    `Made anonymous by ${utils.getUserHomeGroup(pledge.groupsInvestorIsIn).groupDetails.displayName}.`
                            }
                        </Typography>
                    </TableCell>
                    <TableCell colSpan={1} >
                        <Typography align="left" variant="body2" >£{Number(pledge.amount.toFixed(2)).toLocaleString()}</Typography>
                    </TableCell>
                    <TableCell colSpan={1} >
                        <Typography align="left" variant="body2" >{utils.dateInReadableFormat(pledge.date)}</Typography>
                    </TableCell>
                </TableRow>
            ))
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(PledgesTable);