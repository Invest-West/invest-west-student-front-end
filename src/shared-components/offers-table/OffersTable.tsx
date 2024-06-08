import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {
    Box,
    Button,
    colors,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableFooter,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from "@material-ui/core";
import {Close, CreateOutlined, ImportExportOutlined, Refresh, Search} from "@material-ui/icons";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {ManageSystemAttributesState} from "../../redux-store/reducers/manageSystemAttributesReducer";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {
    hasErrorExportingCsv,
    hasErrorFetchingOffers,
    hasGroupsSelect,
    hasOffersForCurrentFilters,
    isExportingCsv,
    isFetchingOffers,
    isFilteringOffersByName,
    OffersTableStates,
    successfullyFetchedOffers
} from "./OffersTableReducer";
import User, {isInvestor, isIssuer} from "../../models/user";
import Admin, {isAdmin} from "../../models/admin";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {
    cancelFilteringOffersByName,
    changePage,
    changeRowsPerPage,
    exportCsv,
    fetchOffers,
    filterChanged,
    filterOffersByName,
    setUser
} from "./OffersTableActions";
import {Col, Row} from "react-bootstrap";
import {BeatLoader} from "react-spinners";
import PublicIcon from "@material-ui/icons/Public";
import RestrictedIcon from "@material-ui/icons/VpnLock";
import PrivateIcon from "@material-ui/icons/LockOutlined";
import {
    isDraftProject,
    isProjectPitchExpiredWaitingForAdminToCheck,
    isProjectPublic,
    isProjectRestricted,
    isProjectTemporarilyClosed,
    isProjectWaitingToGoLive
} from "../../models/project";
import Routes from "../../router/routes";
import {dateInReadableFormat, isProjectInLivePitchPhase} from "../../utils/utils";
import {FetchProjectsPhaseOptions} from "../../api/repositories/OfferRepository";
import {
    PROJECT_STATUS_BEING_CHECKED,
    PROJECT_STATUS_DRAFT,
    PROJECT_VISIBILITY_PRIVATE,
    PROJECT_VISIBILITY_PUBLIC,
    PROJECT_VISIBILITY_RESTRICTED
} from "../../firebase/databaseConsts";
import {toRGBWithOpacity} from "../../utils/colorUtils";

interface OffersTableProps {
    // table user set by passing this prop to the OffersTable component when used
    directTableUser?: User | Admin;

    MediaQueryState: MediaQueryState;
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    OffersTableLocalState: OffersTableStates;
    setUser: (user?: User | Admin) => any;
    fetchOffers: () => any;
    filterChanged: (event: any) => any;
    filterOffersByName: () => any;
    cancelFilteringOffersByName: () => any;
    changePage: (event: any, page: number) => any;
    changeRowsPerPage: (event: any) => any;
    exportCsv: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        OffersTableLocalState: state.OffersTableLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        setUser: (user?: User | Admin) => dispatch(setUser(user)),
        fetchOffers: () => dispatch(fetchOffers()),
        filterChanged: (event: any) => dispatch(filterChanged(event)),
        filterOffersByName: () => dispatch(filterOffersByName()),
        cancelFilteringOffersByName: () => dispatch(cancelFilteringOffersByName()),
        changePage: (event: any, page: number) => dispatch(changePage(event, page)),
        changeRowsPerPage: (event: any) => dispatch(changeRowsPerPage(event)),
        exportCsv: () => dispatch(exportCsv())
    }
}

class OffersTable extends Component<OffersTableProps, any> {

    componentDidMount() {
        const {
            directTableUser,
            AuthenticationState,
            setUser
        } = this.props;
        setUser(directTableUser ?? AuthenticationState.currentUser ?? undefined);
    }

    render() {
        const {
            ManageGroupUrlState,
            AuthenticationState,
            OffersTableLocalState,
            fetchOffers,
            filterChanged,
            filterOffersByName,
            cancelFilteringOffersByName,
            changePage,
            changeRowsPerPage,
            exportCsv
        } = this.props;

        if (!AuthenticationState.currentUser) {
            return null;
        }

        const currentUser: User | Admin = AuthenticationState.currentUser;
        const tableUser: User | Admin | undefined = OffersTableLocalState.tableUser;

        if (!currentUser || !tableUser) {
            return null;
        }

        const currentAdmin: Admin | null = isAdmin(currentUser);
        const tableAdmin: Admin | null = isAdmin(tableUser);

        return <TableContainer
            component={Paper}
        >
            <Table
                color="black"
            >
                {/** Table header */}
                <TableHead>
                    {/** Export csv button (only available for admin */}
                    {
                        !(currentAdmin && tableAdmin && currentAdmin.id === tableAdmin.id)
                            ? null
                            : <TableRow>
                                <TableCell colSpan={5} >
                                    <Box>
                                        <Button variant="outlined" className={css(sharedStyles.no_text_transform)} onClick={() => exportCsv()} >
                                            <ImportExportOutlined fontSize="small" />
                                            <Box width="10px" />
                                            {
                                                isExportingCsv(OffersTableLocalState)
                                                    ? "Exporting ..."
                                                    : "Export csv"
                                            }
                                        </Button>

                                        {
                                            !hasErrorExportingCsv(OffersTableLocalState)
                                                ? null
                                                : <Box marginTop="12px" >
                                                    <Typography variant="body2" color="error" >
                                                        {`${OffersTableLocalState.errorExportingCsv?.detail}. Please retry.`}
                                                    </Typography>
                                                </Box>
                                        }
                                    </Box>
                                </TableCell>
                            </TableRow>
                    }

                    {/** Create new offer button (only available for issuers and admins) */}
                    {
                        isInvestor(currentUser) || (currentAdmin && currentAdmin.superAdmin)
                            ? null
                            : <TableRow>
                                <TableCell
                                    colSpan={5}
                                >
                                    <CustomLink
                                        url={
                                            isIssuer(currentUser) || (currentAdmin && tableAdmin && currentAdmin.id === tableAdmin.id)
                                                // issuer creates offer for themselves
                                                // group admin creates offer for their own group
                                                ? Routes.constructCreateProjectRoute(ManageGroupUrlState.groupNameFromUrl ?? null)
                                                : (currentAdmin && isIssuer(tableUser))
                                                // group admin creates offer for an issuer in their group
                                                ? Routes.constructCreateProjectRoute(ManageGroupUrlState.groupNameFromUrl ?? null, {
                                                    admin: currentAdmin.id,
                                                    issuer: tableUser.id
                                                })
                                                : ""
                                        }                                        
                                        color="none"
                                        activeColor="none"
                                        activeUnderline={false}
                                        component="a"
                                        childComponent={
                                            <Button variant="contained" color="primary" className={css(sharedStyles.no_text_transform)} >
                                                <CreateOutlined fontSize="small" />
                                                <Box width="10px" /> Create new offer
                                            </Button>
                                        }
                                    />
                                </TableCell>
                            </TableRow>
                    }

                    {/** Search offer by name + refresh button */}
                    <TableRow>
                        <TableCell colSpan={5} >
                            <Row>
                                {/** Search by name field */}
                                <Col xs={11} sm={11} md={8} lg={6} >
                                    <Box
                                        display="flex"
                                        height="100%"
                                        alignItems="center"
                                        bgcolor={
                                            !isFilteringOffersByName(OffersTableLocalState)
                                                ? colors.grey["200"]
                                                : toRGBWithOpacity(getGroupRouteTheme(ManageGroupUrlState).palette.primary.main, 0.18)
                                        }
                                        borderRadius="10px"
                                    >
                                        <InputBase
                                            fullWidth
                                            name="nameFilter"
                                            value={OffersTableLocalState.nameFilter}
                                            placeholder="Search offer by name"
                                            onChange={filterChanged}
                                            disabled={!successfullyFetchedOffers(OffersTableLocalState)}
                                            startAdornment={
                                                <InputAdornment
                                                    position="start"
                                                >
                                                    <IconButton
                                                        onClick={() => filterOffersByName()}
                                                        disabled={!successfullyFetchedOffers(OffersTableLocalState)}
                                                    >
                                                        <Search fontSize="small"/>
                                                    </IconButton>
                                                </InputAdornment>
                                            }
                                            endAdornment={
                                                !isFilteringOffersByName(OffersTableLocalState)
                                                    ? null
                                                    : <InputAdornment
                                                        position="end"
                                                    >
                                                        <IconButton onClick={() => cancelFilteringOffersByName()} >
                                                            <Close fontSize="small"/>
                                                        </IconButton>
                                                    </InputAdornment>
                                            }
                                        />
                                    </Box>
                                </Col>

                                {/** Refresh button */}
                                <Col xs={1} sm={1} md={4} lg={6} >
                                    <Box display="flex" height="100%" justifyContent="flex-end" alignItems="center" >
                                        <IconButton onClick={() => fetchOffers()} disabled={!successfullyFetchedOffers(OffersTableLocalState)} >
                                            <Refresh/>
                                        </IconButton>
                                    </Box>
                                </Col>
                            </Row>
                        </TableCell>
                    </TableRow>

                    {/** Filters */}
                    <TableRow>
                        <TableCell colSpan={5} >
                            <Row>
                                {/** Visibility filter */}
                                <Col xs={12} sm={12} md={6} lg={4} >
                                    <Box paddingY="4px" >
                                        <Typography variant="body2" >Visibility:</Typography>
                                        <Box
                                            height="8px"
                                        />
                                        <Select
                                            fullWidth
                                            name="visibilityFilter"
                                            value={OffersTableLocalState.visibilityFilter}
                                            variant="outlined"
                                            margin="dense"
                                            input={<OutlinedInput/>}
                                            onChange={filterChanged}
                                            disabled={!successfullyFetchedOffers(OffersTableLocalState)}
                                        >
                                            <MenuItem key="all" value="all" >All</MenuItem>
                                            <MenuItem key={PROJECT_VISIBILITY_PUBLIC} value={PROJECT_VISIBILITY_PUBLIC}>Public</MenuItem>
                                            <MenuItem key={PROJECT_VISIBILITY_RESTRICTED} value={PROJECT_VISIBILITY_RESTRICTED}>Restricted</MenuItem>
                                            <MenuItem key={PROJECT_VISIBILITY_PRIVATE} value={PROJECT_VISIBILITY_PRIVATE}>Private</MenuItem>
                                        </Select>
                                    </Box>
                                </Col>

                                {/** Group filter */}
                                <Col xs={12} sm={12} md={6} lg={4} >
                                    <Box paddingY="4px" >
                                        <Typography variant="body2" >Group:</Typography>
                                        <Box height="8px" />
                                        <Select
                                            fullWidth
                                            name="groupFilter"
                                            value={OffersTableLocalState.groupFilter}
                                            variant="outlined"
                                            margin="dense"
                                            input={<OutlinedInput/>}
                                            onChange={filterChanged}
                                            disabled={!successfullyFetchedOffers(OffersTableLocalState)}
                                        >
                                            <MenuItem key="all" value="all" >All</MenuItem>
                                            {
                                                !hasGroupsSelect(OffersTableLocalState)
                                                || !OffersTableLocalState.groupsSelect
                                                    ? null
                                                    : OffersTableLocalState.groupsSelect.map(group =>
                                                        <MenuItem
                                                            key={group.anid}
                                                            value={group.anid}
                                                        >
                                                            {group.displayName}
                                                        </MenuItem>
                                                    )
                                            }
                                        </Select>
                                    </Box>
                                </Col>

                                {/** Phase (status) filter */}
                                <Col xs={12} sm={12} md={6} lg={4} >
                                    <Box paddingY="4px" >
                                        <Typography variant="body2">Status:</Typography>
                                        <Box height="8px" />
                                        <Select
                                            fullWidth
                                            name="phaseFilter"
                                            value={OffersTableLocalState.phaseFilter}
                                            variant="outlined"
                                            margin="dense"
                                            input={<OutlinedInput/>}
                                            onChange={filterChanged}
                                            disabled={!successfullyFetchedOffers(OffersTableLocalState)}
                                        >
                                            <MenuItem key="all" value="all" >All</MenuItem>
                                            <MenuItem key={FetchProjectsPhaseOptions.LivePitch} value={FetchProjectsPhaseOptions.LivePitch}>Live</MenuItem>
                                            <MenuItem key={PROJECT_STATUS_BEING_CHECKED} value={PROJECT_STATUS_BEING_CHECKED} >Submitted - awaiting review</MenuItem>
                                            <MenuItem key={FetchProjectsPhaseOptions.TemporarilyClosed} value={FetchProjectsPhaseOptions.TemporarilyClosed}>Temporarily closed</MenuItem>
                                            <MenuItem key={FetchProjectsPhaseOptions.ExpiredPitch} value={FetchProjectsPhaseOptions.ExpiredPitch}>Expired</MenuItem>
                                            <MenuItem key={PROJECT_STATUS_DRAFT} value={PROJECT_STATUS_DRAFT} >Draft</MenuItem>
                                        </Select>
                                    </Box>
                                </Col>
                            </Row>
                        </TableCell>
                    </TableRow>

                    {/** Column headers */}
                    <TableRow>
                        <TableCell colSpan={2} >
                            <Typography variant="body2" color="primary" >Project</Typography>
                        </TableCell>
                        <TableCell colSpan={1} >
                            <Typography variant="body2" color="primary" >Goal</Typography>
                        </TableCell>
                        <TableCell colSpan={1} >
                            <Typography variant="body2" color="primary" >Posted / expiry dates</Typography>
                        </TableCell>
                        <TableCell colSpan={1} >
                            <Typography variant="body2" color="primary" >Status</Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>

                {/** Table body */}
                <TableBody>
                    {
                        // Fetching offers
                        isFetchingOffers(OffersTableLocalState)
                            ? <TableRow>
                                <TableCell colSpan={5} >
                                    <Box display="flex" justifyContent="center" alignItems="center" height="120px" >
                                        <BeatLoader color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} />
                                    </Box>
                                </TableCell>
                            </TableRow>
                            // Error setting table user / fetching offers
                            : hasErrorFetchingOffers(OffersTableLocalState)
                            ? <TableRow>
                                <TableCell colSpan={5} >
                                    <Box display="flex" justifyContent="center" alignItems="center" height="120px" >
                                        <Typography variant="h6" align="center" color="error">Error. Please retry.</Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                            // Not successfully fetching offers
                            : !successfullyFetchedOffers(OffersTableLocalState)
                                ? null
                                // No offers available for current filters
                                : !hasOffersForCurrentFilters(OffersTableLocalState)
                                    ? <TableRow>
                                        <TableCell colSpan={5} >
                                            <Box display="flex" justifyContent="center" alignItems="center" height="120px" >
                                                <Typography variant="h6" align="center" >There are no offers available using your current filter criteria.</Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                    // Render offers
                                    : OffersTableLocalState.offerInstancesFilteredByName
                                        .slice(OffersTableLocalState.currentPage * OffersTableLocalState.rowsPerPage, OffersTableLocalState.currentPage * OffersTableLocalState.rowsPerPage + OffersTableLocalState.rowsPerPage)
                                        .map(
                                            offerInstance => <TableRow
                                                key={offerInstance.projectDetail.id}
                                                hover
                                            >
                                                {/** Offer name */}
                                                <TableCell colSpan={2} >
                                                    <Box display="flex" flexDirection="column" justifyContent="center" >
                                                        {/** Visibility + Name */}
                                                        <Box display="flex" flexDirection="row" >
                                                            {
                                                                isProjectPublic(offerInstance.projectDetail)
                                                                    ? <PublicIcon fontSize="small"/>
                                                                    : isProjectRestricted(offerInstance.projectDetail)
                                                                    ? <RestrictedIcon fontSize="small"/>
                                                                    : <PrivateIcon fontSize="small"/>
                                                            }
                                                            <Box width="15px" />
                                                            <CustomLink
                                                                url={
                                                                    isDraftProject(offerInstance.projectDetail)
                                                                        ? Routes.constructCreateProjectRoute(ManageGroupUrlState.groupNameFromUrl ?? null, {edit: offerInstance.projectDetail.id})
                                                                        : Routes.constructProjectDetailRoute(ManageGroupUrlState.groupNameFromUrl ?? null, offerInstance.projectDetail.id)
                                                                }
                                                                target={
                                                                    isDraftProject(offerInstance.projectDetail)
                                                                        ? "_blank"
                                                                        : ""
                                                                }
                                                                color="black"
                                                                activeColor={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                                                                activeUnderline={false}
                                                                component="nav-link"
                                                                childComponent={
                                                                    <Typography
                                                                        variant="body2"
                                                                        align="left"
                                                                    >
                                                                        {offerInstance.projectDetail.projectName ?? ""}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </Box>

                                                        {/** Created by (not available for issuers who are looking at their own offers table) */}
                                                        {
                                                            isIssuer(currentUser)
                                                            && OffersTableLocalState.tableUser !== undefined
                                                            && currentUser.id === OffersTableLocalState.tableUser.id
                                                                ? null
                                                                : <Box marginTop="10px" >
                                                                    <Typography variant="body2" align="left" color="textSecondary" >
                                                                        <i>
                                                                            {
                                                                                offerInstance.projectDetail.createdByGroupAdmin
                                                                                    ? `Created by ${offerInstance.group.displayName} admin`
                                                                                    : `Created by ${(offerInstance.issuer as User).firstName} ${(offerInstance.issuer as User).lastName}`
                                                                            }
                                                                        </i>
                                                                    </Typography>
                                                                </Box>
                                                        }

                                                        {/** Edit button (only available for draft project) */}
                                                        {
                                                            isInvestor(currentUser)
                                                                ? null
                                                                : !isDraftProject(offerInstance.projectDetail)
                                                                ? null
                                                                : <Box marginTop="18px" >
                                                                    <CustomLink
                                                                        url={
                                                                            Routes.constructCreateProjectRoute(ManageGroupUrlState.groupNameFromUrl ?? null, {edit: offerInstance.projectDetail.id})
                                                                        }
                                                                        target="_blank"
                                                                        color="none"
                                                                        activeColor="none"
                                                                        activeUnderline={false}
                                                                        component="nav-link"
                                                                        childComponent={
                                                                            <Button variant="outlined" size="small" className={css(sharedStyles.no_text_transform)} >
                                                                                <CreateOutlined fontSize="small" />
                                                                                <Box width="8px" />
                                                                                Edit
                                                                            </Button>
                                                                        }
                                                                    />
                                                                </Box>
                                                        }
                                                    </Box>
                                                </TableCell>

                                                {/** Goal */}
                                                <TableCell colSpan={1} >
                                                    <Typography variant="body2" align="left" >
                                                        {
                                                            !offerInstance.projectDetail.Pitch.fundRequired
                                                                ? ""
                                                                : `£${Number(offerInstance.projectDetail.Pitch.fundRequired.toFixed(0)).toLocaleString()}`
                                                        }
                                                    </Typography>
                                                </TableCell>

                                                {/** Posted / expiry dates */}
                                                <TableCell colSpan={1} >
                                                    <Box display="flex" flexDirection="column" >
                                                        <Typography variant="body2" align="left" >
                                                            {`Posted date: ${dateInReadableFormat(offerInstance.projectDetail.Pitch.postedDate)}`}
                                                        </Typography>
                                                        <Box height="12px" />
                                                        <Typography variant="body2" align="left" >
                                                            {
                                                                !offerInstance.projectDetail.Pitch.expiredDate
                                                                    ? "Expiry date: unknown"
                                                                    : `Expiry date: ${dateInReadableFormat(offerInstance.projectDetail.Pitch.expiredDate)}`
                                                            }
                                                        </Typography>
                                                    </Box>
                                                </TableCell>

                                                {/** Status */}
                                                <TableCell colSpan={1} >
                                                    <Typography variant="body2" align="left" >
                                                        {
                                                            isDraftProject(offerInstance.projectDetail)
                                                                ? "Draft"
                                                                : isProjectWaitingToGoLive(offerInstance.projectDetail)
                                                                ? "Submitted. Awaiting group admin review"
                                                                : isProjectInLivePitchPhase(offerInstance.projectDetail)
                                                                    ? isProjectTemporarilyClosed(offerInstance.projectDetail)
                                                                        ? "Temporarily closed"
                                                                        : "Live"
                                                                    : isProjectPitchExpiredWaitingForAdminToCheck(offerInstance.projectDetail)
                                                                        ? "Expired. Awaiting group admin review"
                                                                        : "Closed"
                                                        }
                                                    </Typography>
                                                </TableCell>
                                            </TableRow>
                                        )
                    }
                </TableBody>

                {/** Table footer */}
                <TableFooter>
                    <TableRow>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 15]}
                            count={OffersTableLocalState.offerInstancesFilteredByName.length}
                            rowsPerPage={OffersTableLocalState.rowsPerPage}
                            page={OffersTableLocalState.currentPage}
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
        </TableContainer>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(OffersTable);