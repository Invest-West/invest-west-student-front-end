import React, {Component} from 'react';
import {
    Button,
    Divider,
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
import AddIcon from '@material-ui/icons/Add';
import {Col, OverlayTrigger, Row, Tooltip} from 'react-bootstrap';
import FlexView from 'react-flexview';
import {HashLoader} from 'react-spinners';

import {css} from 'aphrodite';
import sharedStyles, {StyledTableCell} from '../../../shared-js-css-styles/SharedStyles';

import * as colors from '../../../values/colors';
import * as DB_CONST from '../../../firebase/databaseConsts';
import * as myUtils from '../../../utils/utils';

import {connect} from 'react-redux';
import * as addAngelNetworkDialogActions from '../../../redux-store/actions/addAngelNetworkDialogActions';
import * as angelNetworksActions from '../../../redux-store/actions/angelNetworksActions';
import {NavLink} from "react-router-dom";
import Routes from "../../../router/routes";

const mapStateToProps = state => {
    return {
        groupUserName: state.manageGroupFromParams.groupUserName,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,
        groupProperties: state.manageGroupFromParams.groupProperties,
        shouldLoadOtherData: state.manageGroupFromParams.shouldLoadOtherData,

        admin: state.auth.user,

        angelNetworks: state.manageAngelNetworks.angelNetworks,
        loadingAngelNetworks: state.manageAngelNetworks.loadingAngelNetworks,
        angelNetworksLoaded: state.manageAngelNetworks.angelNetworksLoaded,
        page: state.manageAngelNetworks.page,
        rowsPerPage: state.manageAngelNetworks.rowsPerPage,

        searchText: state.manageAngelNetworks.searchText,
        inSearchMode: state.manageAngelNetworks.inSearchMode,
        matchedAngelNetworks: state.manageAngelNetworks.matchedAngelNetworks
    }
};

const mapDispatchToProps = dispatch => {
    return {
        toggleAddAngelNetworkDialog: () => dispatch(addAngelNetworkDialogActions.toggleAddAngelNetworkDialog()),
        loadAngelNetworks: () => dispatch(angelNetworksActions.loadAngelNetworks()),
        changePage: (event, newPage) => dispatch(angelNetworksActions.changePage(event, newPage)),
        changeRowsPerPage: (event) => dispatch(angelNetworksActions.changeRowsPerPage(event)),
        handleAngelNetworksTableInputChanged: (event) => dispatch(angelNetworksActions.handleAngelNetworksTableInputChanged(event)),
        toggleSearchMode: () => dispatch(angelNetworksActions.toggleSearchMode()),
        startListeningForAngelNetworksChanged: () => dispatch(angelNetworksActions.startListeningForAngelNetworksChanged()),
        stopListeningForAngelNetworksChanged: () => dispatch(angelNetworksActions.stopListeningForAngelNetworksChanged())
    }
};

class AngelNetworks extends Component {

    componentDidMount() {
        this.loadData({inComponentDidMount: true});
        this.addListener();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const {
            shouldLoadOtherData,

            admin,

            stopListeningForAngelNetworksChanged
        } = this.props;

        // cancel all listeners if user is set to null or user is not an admin with permission
        if (!admin || (admin && !admin.superAdmin && admin.type !== DB_CONST.TYPE_ADMIN) || !shouldLoadOtherData) {
            stopListeningForAngelNetworksChanged();
            return;
        }

        this.loadData({inComponentDidMount: false});
        this.addListener();
    }

    componentWillUnmount() {
        const {
            stopListeningForAngelNetworksChanged
        } = this.props;

        stopListeningForAngelNetworksChanged();
    }

    /**
     * Load data
     */
    loadData = ({inComponentDidMount = true}) => {
        const {
            shouldLoadOtherData,

            admin,

            loadingAngelNetworks,
            angelNetworksLoaded,

            loadAngelNetworks
        } = this.props;

        if (shouldLoadOtherData) {
            if (inComponentDidMount) {
                if (admin && (admin.superAdmin || admin.type === DB_CONST.TYPE_ADMIN)) {
                    loadAngelNetworks();
                }
            } else {
                // loadAngelNetworks() is called in componentDidUpdate which happens after every state changes
                // therefore, in order to avoid unlimited calls of loadAngelNetworks, another check variable called loadingAngelNetworks
                // is added to ensure the function only gets called once.
                if (admin && (admin.superAdmin || admin.type === DB_CONST.TYPE_ADMIN) && !loadingAngelNetworks && !angelNetworksLoaded) {
                    loadAngelNetworks();
                }
            }
        }
    };

    /**
     * Add listener
     */
    addListener = () => {
        const {
            shouldLoadOtherData,

            angelNetworks,
            angelNetworksLoaded,

            startListeningForAngelNetworksChanged
        } = this.props;

        if (shouldLoadOtherData) {
            if (angelNetworks && angelNetworksLoaded) {
                startListeningForAngelNetworksChanged();
            }
        }
    };

    render() {
        const {
            toggleAddAngelNetworkDialog
        } = this.props;

        return (
            <FlexView
                column
                width="100%"
            >
                <Divider style={{marginBottom: 20}}/>
                <Row style={{marginBottom: 10}}>
                    <Col xs={12} md={5} lg={12} style={{marginBottom: 40}}>
                        <Button color="primary" variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={toggleAddAngelNetworkDialog}>
                            <AddIcon style={{marginRight: 10, width: 20, height: "auto"}}/>
                            Add new group
                        </Button>
                    </Col>
                </Row>
                {
                    this.renderAngelNetworksTable()
                }
            </FlexView>
        );
    }

    /**
     * Render angel networks table
     *
     * @returns {*}
     */
    renderAngelNetworksTable = () => {
        const {
            groupPropertiesLoaded,
            groupProperties,
            admin,
            angelNetworks,
            page,
            rowsPerPage,
            searchText,
            inSearchMode,
            loadAngelNetworks,
            changePage,
            changeRowsPerPage,
            handleAngelNetworksTableInputChanged,
            toggleSearchMode
        } = this.props;

        if (!groupPropertiesLoaded || !admin || (admin && !admin.superAdmin && admin.type !== DB_CONST.TYPE_ADMIN)) {
            return null;
        }

        // sort angel networks by added date
        angelNetworks.sort((angelNetwork1, angelNetwork2) => {
            return (angelNetwork2.dateAdded - angelNetwork1.dateAdded);
        });

        return (
            <Paper elevation={1} style={{overflowX: "auto"}}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <StyledTableCell colSpan={3} cellColor={colors.blue_gray_50}
                                component={
                                    <InputBase name="searchText" value={searchText}  onChange={handleAngelNetworksTableInputChanged} fullWidth placeholder="Search group by name" type="text"
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <OverlayTrigger trigger={['hover', 'focus']}  flip placement="bottom"
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
                            <StyledTableCell colSpan={2} cellColor={colors.blue_gray_50}
                                component={
                                    <FlexView hAlignContent="right" vAlignContent="center">
                                        <OverlayTrigger trigger={['hover', 'focus']} flip  placement="bottom"
                                            overlay={
                                                <Tooltip id={`tooltip-bottom`}>Refresh</Tooltip>
                                            }>
                                            <IconButton onClick={loadAngelNetworks} style={{marginLeft: 10}}>
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
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" className={css(sharedStyles.white_text)}  align="left">Groups</Typography>
                                }/>
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" className={css(sharedStyles.white_text)} align="left">ID</Typography>
                                }
                            />
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" className={css(sharedStyles.white_text)} align="left">
                                        Date added
                                    </Typography>
                                }
                            />
                            <StyledTableCell colSpan={1}
                                cellColor={
                                    !groupProperties
                                        ?
                                        colors.primaryColor
                                        :
                                        groupProperties.settings.primaryColor
                                }
                                textColor={colors.white}
                                component={
                                    <Typography variant="body2" className={css(sharedStyles.white_text)} align="left">Status</Typography>
                                }
                            />
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {this.renderAngelNetworkRows()}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination style={{backgroundColor: colors.blue_gray_50}} rowsPerPageOptions={[5, 10, 25]} count={angelNetworks.length} rowsPerPage={rowsPerPage}  page={page} backIconButtonProps={{'aria-label': 'Previous Page',}} nextIconButtonProps={{'aria-label': 'Next Page',}} SelectProps={{ native: true,}} onChangePage={changePage} onChangeRowsPerPage={changeRowsPerPage}/>
                        </TableRow>
                    </TableFooter>
                </Table>
            </Paper>
        );
    };

    /**
     * Render angel network rows
     *
     * @returns {*}
     */
    renderAngelNetworkRows = () => {
        const {
            groupUserName,
            groupProperties,
            angelNetworks,
            angelNetworksLoaded,
            matchedAngelNetworks,
            inSearchMode,
            page,
            rowsPerPage
        } = this.props;

        let renderedAngelNetworks = [];

        if (inSearchMode) {
            renderedAngelNetworks = matchedAngelNetworks;
        } else {
            renderedAngelNetworks = angelNetworks;
        }

        if (renderedAngelNetworks.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={5}>
                        <FlexView
                         style={{ margin: 40}} hAlignContent="center" vAlignContent="center">
                            {
                                angelNetworksLoaded
                                    ?
                                    <Typography variant="h6" align="center">
                                        {
                                            inSearchMode
                                                ?
                                                "Can't find any groups with this name."
                                                :
                                                "No groups added yet."
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
                                        }/>
                            }
                        </FlexView>
                    </TableCell>
                </TableRow>
            );
        }

        return (
            renderedAngelNetworks.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(angelNetwork => (
                <TableRow key={angelNetwork.anid} hover>
                    <TableCell colSpan={2}>
                        <NavLink to={Routes.constructGroupDetailRoute(groupUserName, null, angelNetwork.groupUserName)} className={css(sharedStyles.nav_link_hover_without_changing_text_color)}>
                            <Typography color="primary">{angelNetwork.displayName}</Typography>
                        </NavLink>
                    </TableCell>
                    <TableCell colSpan={1}>
                        <Typography color="primary">{angelNetwork.anid}</Typography>
                    </TableCell>
                    <TableCell colSpan={1}>
                        <Typography color="primary">{myUtils.dateTimeInReadableFormat(angelNetwork.dateAdded)}</Typography>
                    </TableCell>
                    <TableCell colSpan={1}>
                        <Typography
                            color={
                                angelNetwork.status === DB_CONST.GROUP_STATUS_ACTIVE
                                    ?
                                    "primary"
                                    :
                                    "error"
                            }>
                            {
                                angelNetwork.status === DB_CONST.GROUP_STATUS_ACTIVE
                                    ?
                                    "Active"
                                    :
                                    "Suspended"
                            }
                        </Typography>
                    </TableCell>
                </TableRow>
            ))
        );
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AngelNetworks);