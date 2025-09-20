import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {
    calculatePaginationIndices,
    calculatePaginationPages,
    ExploreGroupsState,
    hasGroupsForCurrentFilters,
    hasNotFetchedGroups,
    isFetchingGroups,
    isFilteringGroupsByName,
    successfullyFetchedGroups
} from "./ExploreGroupsReducer";
import {
    Box,
    Card,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    OutlinedInput,
    Select,
    Typography
} from "@material-ui/core";
import {Col, Row} from "react-bootstrap";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Close, Refresh, Search} from "@material-ui/icons";
import {
    cancelFilteringGroupsByName,
    fetchGroups,
    filterChanged,
    filterGroupsByName,
    paginationChanged,
    removeAccessRequest,
    sendAccessRequest
} from "./ExploreGroupsActions";
import {BeatLoader} from "react-spinners";
import GroupItem from "./GroupItem";
import UniversityGroupItem from "./UniversityGroupItem";
import {buildHierarchicalGroups, isUniversity, isCourse} from "../../models/group_properties";
import {isAdmin} from "../../models/admin";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {Pagination} from "@material-ui/lab";

interface ExploreGroupsProps {
    MediaQueryState: MediaQueryState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    ExploreGroupsLocalState: ExploreGroupsState;
    fetchGroups: () => any;
    filterChanged: (event: any) => any;
    filterGroupsByName: () => any;
    cancelFilteringGroupsByName: () => any;
    paginationChanged: (event: React.ChangeEvent<unknown>, page: number) => any;
    sendAccessRequest: (groupID: string) => any;
    removeAccessRequest: (groupID: string) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        ExploreGroupsLocalState: state.ExploreGroupsLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        fetchGroups: () => dispatch(fetchGroups()),
        filterChanged: (event: any) => dispatch(filterChanged(event)),
        filterGroupsByName: () => dispatch(filterGroupsByName()),
        cancelFilteringGroupsByName: () => dispatch(cancelFilteringGroupsByName()),
        paginationChanged: (event: React.ChangeEvent<unknown>, page: number) => dispatch(paginationChanged(event, page)),
        sendAccessRequest: (groupID: string) => dispatch(sendAccessRequest(groupID)),
        removeAccessRequest: (groupID: string) => dispatch(removeAccessRequest(groupID))
    }
}

class ExploreGroups extends Component<ExploreGroupsProps, any> {

    componentDidMount() {
        if (hasNotFetchedGroups(this.props.ExploreGroupsLocalState)) {
            this.props.fetchGroups();
        }
    }

    render() {
        const {
            MediaQueryState,
            ManageGroupUrlState,
            AuthenticationState,
            ExploreGroupsLocalState,
            fetchGroups,
            filterChanged,
            filterGroupsByName,
            cancelFilteringGroupsByName,
            paginationChanged
        } = this.props;

        if (!AuthenticationState.currentUser) {
            return null;
        }

        const paginationPages = calculatePaginationPages(ExploreGroupsLocalState);
        const paginationIndices = calculatePaginationIndices(ExploreGroupsLocalState);

        return <Box paddingX={MediaQueryState.isMobile ? "20px" : "56px"} paddingY={MediaQueryState.isMobile ? "15px" : "40px"} >
            <Row noGutters >
                <Col xs={12} sm={12} md={{span: 8, offset: 2}} lg={{span: 4, offset: 4}} >
                    <Card elevation={0} >
                        <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="center"
                            bgcolor={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main}
                            color="white"
                            paddingY="28px"
                        >
                            <Typography variant="h6" align="center">Universitys on Student network</Typography>

                            <Box height="28px" />

                            <Box width="85%" height="100%" bgcolor="white" borderRadius="50px" >
                                <InputBase
                                    fullWidth
                                    name="nameFilter"
                                    value={ExploreGroupsLocalState.nameFilter}
                                    placeholder="Search course by name"
                                    onChange={filterChanged}
                                    disabled={!successfullyFetchedGroups(ExploreGroupsLocalState)}
                                    startAdornment={
                                        <InputAdornment position="start" >
                                            <IconButton
                                                onClick={() => filterGroupsByName()}
                                                disabled={!successfullyFetchedGroups(ExploreGroupsLocalState)}
                                            >
                                                <Search fontSize="small"/>
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    endAdornment={
                                        !isFilteringGroupsByName(ExploreGroupsLocalState)
                                            ? null
                                            : <InputAdornment position="end" >
                                                <IconButton onClick={() => cancelFilteringGroupsByName()} >
                                                    <Close fontSize="small"/>
                                                </IconButton>
                                            </InputAdornment>
                                    }
                                />
                            </Box>
                        </Box>
                    </Card>
                </Col>
            </Row>

            {/** Filters (only available for issuer and investor) */}
            {
                isAdmin(AuthenticationState.currentUser)
                    ? null
                    : <Row noGutters >
                        <Col xs={8} sm={8} md={3} lg={2} >
                            <Box display="flex" flexDirection="row" marginTop="48px" >
                                <Select
                                    fullWidth
                                    name="groupFilter"
                                    value={ExploreGroupsLocalState.groupFilter}
                                    variant="outlined"
                                    margin="dense"
                                    input={<OutlinedInput/>}
                                    onChange={filterChanged}
                                    disabled={!successfullyFetchedGroups(ExploreGroupsLocalState)}
                                >
                                    <MenuItem key="all" value="all">All courses</MenuItem>
                                    <MenuItem key="groupsOfMembership" value="groupsOfMembership">My courses</MenuItem>
                                    <MenuItem key="groupsOfPendingRequest" value="groupsOfPendingRequest">Pending requests</MenuItem>
                                </Select>

                                <Box width="15px" />

                                <IconButton onClick={() => fetchGroups()} >
                                    <Refresh/>
                                </IconButton>
                            </Box>
                        </Col>
                    </Row>
            }

            {/** Loader */}
            {
                !isFetchingGroups(ExploreGroupsLocalState)
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            <Box display="flex" marginY="80px" justifyContent="center" >
                                <BeatLoader color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} />
                            </Box>
                        </Col>
                    </Row>
            }

            {/** Groups area */}
            {
                !successfullyFetchedGroups(ExploreGroupsLocalState)
                    ? null
                    : !hasGroupsForCurrentFilters(ExploreGroupsLocalState)
                    ? <Box marginY="80px" >
                        <Typography align="center" variant="h5" > There are no courses available using your current filter criteria </Typography>
                    </Box>
                    : <Box marginTop="30px" >
                        <Row noGutters >
                            <Col xs={12} sm={12} md={12} lg={12} >
                                {this.renderHierarchicalGroups()}
                            </Col>
                        </Row>
                    </Box>
            }

            {/** Pagination */}
            {
                !successfullyFetchedGroups(ExploreGroupsLocalState)
                    ? null
                    : paginationPages === 1
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            <Box display="flex" justifyContent="center" marginTop="55px" >
                                <Pagination count={paginationPages} page={ExploreGroupsLocalState.currentPage} color="primary" onChange={paginationChanged} />
                            </Box>
                        </Col>
                    </Row>
            }
        </Box>;
    }

    renderHierarchicalGroups() {
        const {
            ExploreGroupsLocalState,
            ManageGroupUrlState,
            AuthenticationState
        } = this.props;

        if (!ExploreGroupsLocalState.groups) {
            return null;
        }

        const hierarchicalGroups = buildHierarchicalGroups(ExploreGroupsLocalState.groups);
        const paginationIndices = calculatePaginationIndices(ExploreGroupsLocalState);
        const paginatedGroups = hierarchicalGroups.slice(paginationIndices.startIndex, paginationIndices.endIndex + 1);

        return paginatedGroups.map(university => (
            <UniversityGroupItem
                key={university.anid}
                university={university}
            />
        ));
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreGroups);