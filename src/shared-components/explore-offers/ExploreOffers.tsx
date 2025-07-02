import React, {Component, FormEvent} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Col, Row} from "react-bootstrap";
import GroupRepository from "../../api/repositories/GroupRepository";
import GroupProperties from "../../models/group_properties";
import {
    Box,
    Button, colors,
    IconButton,
    InputAdornment,
    InputBase,
    MenuItem,
    OutlinedInput,
    Paper,
    Select,
    Typography
} from "@material-ui/core";
import {
    calculatePaginationIndices,
    calculatePaginationPages,
    ExploreOffersState,
    hasNotFetchedOffers,
    hasOffersForCurrentFilters,
    isFetchingOffers,
    isSearchFilterActive,
    successfullyFetchedOffers
} from "./ExploreOffersReducer";
import {MediaQueryState} from "../../redux-store/reducers/mediaQueryReducer";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import {AuthenticationState} from "../../redux-store/reducers/authenticationReducer";
import {clearSearchFilter, fetchOffers, filterChanged, onSearchEnter, paginationChanged} from "./ExploreOffersActions";
import {ManageSystemAttributesState} from "../../redux-store/reducers/manageSystemAttributesReducer";
import {BeatLoader} from "react-spinners";
import OfferItem from "./OfferItem";
import {Pagination} from "@material-ui/lab";
import RiskWarning from "../risk-warning/RiskWarning";
import {isIssuer, isInvestor} from "../../models/user";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Routes from "../../router/routes";
import CreateIcon from "@material-ui/icons/CreateOutlined";
import RefreshIcon from "@material-ui/icons/Refresh";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {FetchProjectsOrderByOptions, FetchProjectsPhaseOptions} from "../../api/repositories/OfferRepository";
import {Close, Search} from "@material-ui/icons";

interface ExploreOffersProps {
    MediaQueryState: MediaQueryState;
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageGroupUrlState: ManageGroupUrlState;
    AuthenticationState: AuthenticationState;
    ExploreOffersLocalState: ExploreOffersState;
    onSearchEnter: (event: FormEvent) => any;
    fetchOffers: (orderBy?: string) => any;
    filterChanged: (event: any) => any;
    clearSearchFilter: () => any;
    paginationChanged: (event: React.ChangeEvent<unknown>, page: number) => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        MediaQueryState: state.MediaQueryState,
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        AuthenticationState: state.AuthenticationState,
        ExploreOffersLocalState: state.ExploreOffersLocalState,
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        onSearchEnter: (event: FormEvent) => dispatch(onSearchEnter(event)),
        fetchOffers: (orderBy?: string) => dispatch(fetchOffers(orderBy)),
        filterChanged: (event: any) => dispatch(filterChanged(event)),
        clearSearchFilter: () => dispatch(clearSearchFilter()),
        paginationChanged: (event: React.ChangeEvent<unknown>, page: number) => dispatch(paginationChanged(event, page))
    }
}

interface ExploreOffersComponentState {
    groups: GroupProperties[];
  }

  class ExploreOffers extends Component<ExploreOffersProps, ExploreOffersComponentState> {
    constructor(props: ExploreOffersProps) {
      super(props);
      this.state = {
        groups: [],
      };
    }
  
    componentDidMount() {
        if (hasNotFetchedOffers(this.props.ExploreOffersLocalState)) {
          this.props.fetchOffers(FetchProjectsOrderByOptions.Phase);
        }
        //this.fetchGroups();
      }
  
      fetchGroups = async () => {
        try {
          const response = await new GroupRepository().fetchGroups();
          this.setState({ groups: response.data });
        } catch (error) {
          console.error("Error fetching groups:", error);
        }
      };
  
    render() {
        const {
            MediaQueryState,
            ManageSystemAttributesState,
            ManageGroupUrlState,
            AuthenticationState,
            ExploreOffersLocalState,
            fetchOffers,
            filterChanged,
            clearSearchFilter,
            paginationChanged,
            onSearchEnter,
        } = this.props;

        const paginationPages = calculatePaginationPages(ExploreOffersLocalState);
        const paginationIndices = calculatePaginationIndices(ExploreOffersLocalState);

        return <Box
            paddingX={MediaQueryState.isMobile ? "20px" : "56px"}
            paddingY={MediaQueryState.isMobile ? "15px" : "40px"}
        >
            <Row>


                {/** Sector filter */}
                <Col xs={12} sm={12} md={6} lg={4} >
                    <Box paddingY="6px" >
                        <Typography variant="body1">Sector:</Typography>
                        <Box height="8px" />
                        <Paper>
                            <Select
                                fullWidth
                                variant="outlined"
                                name="sectorFilter"
                                value={ExploreOffersLocalState.sectorFilter}
                                onChange={filterChanged}
                               /* disabled={!successfullyFetchedOffers(ExploreOffersLocalState)} */
                                input={<OutlinedInput/>}
                            >
                                <MenuItem key="all" value="all">All sectors</MenuItem>

                                {
                                    !ManageSystemAttributesState.systemAttributes
                                        ? null
                                        : ManageSystemAttributesState.systemAttributes.Sectors.map((sector, index) => (
                                            <MenuItem key={index} value={sector}>{sector}</MenuItem>
                                        ))
                                }
                            </Select>
                        </Paper>
                    </Box>
                </Col>

                {/** Status filter */}
                <Col xs={12} sm={12} md={6} lg={4}>
                <Box paddingY="6px">
                    <Typography variant="body1">Status:</Typography>
                    <Box height="8px" />
                    <Paper>
                        <Select
                            fullWidth
                            variant="outlined"
                            name="phaseFilter"
                            value={ExploreOffersLocalState.phaseFilter}
                            onChange={filterChanged}
                            input={<OutlinedInput />}
                        >
                            <MenuItem key={FetchProjectsPhaseOptions.Live} value={FetchProjectsPhaseOptions.Live}>
                                Live
                            </MenuItem>
                            <MenuItem key={FetchProjectsPhaseOptions.ExpiredPitch} value={FetchProjectsPhaseOptions.ExpiredPitch}>
                                Expired
                            </MenuItem>
                        </Select>
                    </Paper>
                </Box>
            </Col>
            </Row>

            {/** Search bar */}
            <Row style={{ marginTop: 40 }} >
                <Col xs={12} sm={12} md={8} lg={4} >
                    <Box
                        width="100%"
                        height="100%"
                        bgcolor="white"
                        border={2}
                        borderColor={colors.grey[300]}
                        borderRadius="20px"
                        paddingX="5px"
                        paddingY="8px"
                    >
                        <form onSubmit={onSearchEnter} >
                            <InputBase
                                fullWidth
                                name="searchFilter"
                                value={ExploreOffersLocalState.searchFilter}
                                placeholder="Search name, course or issuer"
                                onChange={filterChanged}
                                /*disabled={!successfullyFetchedOffers(ExploreOffersLocalState)}*/
                                startAdornment={
                                    <InputAdornment position="start" >
                                        <IconButton
                                            type="submit"
                                            onClick={() => fetchOffers(FetchProjectsOrderByOptions.Phase)}
                                            /*disabled={!successfullyFetchedOffers(ExploreOffersLocalState)}*/
                                        >
                                            <Search fontSize="small"/>
                                        </IconButton>
                                    </InputAdornment>
                                }
                                endAdornment={
                                    !isSearchFilterActive(ExploreOffersLocalState)
                                        ? null
                                        : <InputAdornment position="end" >
                                            <IconButton onClick={() => clearSearchFilter()} >
                                                <Close fontSize="small"/>
                                            </IconButton>
                                        </InputAdornment>
                                }
                            />
                        </form>
                    </Box>
                </Col>
            </Row>

            {/** Loader */}
            {
                !isFetchingOffers(ExploreOffersLocalState)
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            <Box display="flex" marginY="50px" justifyContent="center" >
                                <BeatLoader color={getGroupRouteTheme(ManageGroupUrlState).palette.primary.main} />
                            </Box>
                        </Col>
                    </Row>
            }

            {/** Offers */}
            {
                !successfullyFetchedOffers(ExploreOffersLocalState)
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            {
                                !hasOffersForCurrentFilters(ExploreOffersLocalState)
                                    ? <Box marginY="80px" >
                                        <Typography align="center" variant="h5" >There are no projects available using your current filter criteria</Typography>
                                    </Box>
                                    : <Box>
                                        {/** Explore n offers + refresh button */}
                                        <Box
                                            display="flex"
                                            flexDirection="row"
                                            alignItems="center"
                                            marginTop="50px"
                                            marginBottom="25px"
                                        >
                                            <Typography variant="h6">Explore</Typography>
                                            <Typography variant="h6" color="primary">&nbsp;<b>{ExploreOffersLocalState.offerInstances.length} projects</b></Typography>
                                            <Box marginLeft="8px" >
                                                <IconButton onClick={() => fetchOffers(FetchProjectsOrderByOptions.Phase)} >
                                                    <RefreshIcon/>
                                                </IconButton>
                                            </Box>
                                        </Box>

                                        {/** Create offer button (available for issuers and investors) */}
                                        {
                                            !AuthenticationState.currentUser
                                                ? null
                                                : !isIssuer(AuthenticationState.currentUser) && !isInvestor(AuthenticationState.currentUser)
                                                ? null
                                                : <Box marginBottom="40px" >
                                                    <CustomLink
                                                        url={Routes.constructCreateProjectRoute(ManageGroupUrlState.groupNameFromUrl ?? null)}                                                  
                                                        color="none"
                                                        activeColor="none"
                                                        activeUnderline={false}
                                                        component="a"
                                                        childComponent={
                                                            <Button size="medium" variant="contained" color="primary" className={css(sharedStyles.no_text_transform)} >
                                                                <Box marginRight="8px" >
                                                                    <CreateIcon fontSize="small" />
                                                                </Box>Create new project
                                                            </Button>
                                                        }
                                                    />
                                                </Box>
                                        }

                                        {/** Offers area */}
                                        <Row>
                                            {
                                                ExploreOffersLocalState.offerInstances
                                                    .slice(paginationIndices.startIndex, paginationIndices.endIndex + 1)
                                                    .map(offerInstance => (
                                                        <Col key={offerInstance.projectDetail.id} xs={12} sm={12} md={6} lg={3} >
                                                            <Box margin="16px" >
                                                                <OfferItem offerInstance={offerInstance} />
                                                            </Box>
                                                        </Col>
                                                    ))
                                            }
                                        </Row>
                                    </Box>
                            }
                        </Col>
                    </Row>
            }

            {/** Pagination */}
            {
                !successfullyFetchedOffers(ExploreOffersLocalState)
                    ? null
                    : paginationPages === 1
                    ? null
                    : <Row noGutters >
                        <Col xs={12} sm={12} md={12} lg={12} >
                            <Box display="flex" justifyContent="center" marginTop="55px" >
                                <Pagination count={paginationPages} page={ExploreOffersLocalState.currentPage} color="primary" onChange={paginationChanged} />
                            </Box>
                        </Col>
                    </Row>
            }

        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(ExploreOffers);