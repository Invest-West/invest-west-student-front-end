import Error from "../../models/error";
import {
    CompleteFetchingOffersAction,
    ExploreOffersAction,
    ExploreOffersEvents,
    FilterChangedAction,
    PaginationChangedAction
} from "./ExploreOffersActions";
import {ProjectInstance} from "../../models/project";
import GroupProperties from "../../models/group_properties";
import {FetchProjectsPhaseOptions} from "../../api/repositories/OfferRepository";

export const maxOffersPerPage: number = 12;

export interface ExploreOffersState {
    offerInstances: ProjectInstance[];
    fetchingOffers: boolean;
    offersFetched: boolean;

    groups: GroupProperties[];

    searchFilter: string;
    visibilityFilter: number | "all";
    sectorFilter: string | "all";
    phaseFilter: FetchProjectsPhaseOptions;
    groupFilter: string | "all";
    currentPage: number;

    error?: Error;
}

const initialState: ExploreOffersState = {
    offerInstances: [],
    fetchingOffers: false,
    offersFetched: false,
    groups: [],
    searchFilter: "",
    visibilityFilter: "all",
    sectorFilter: "all",
    phaseFilter: FetchProjectsPhaseOptions.Live,
    groupFilter: "all",
    currentPage: 1
}

export const hasNotFetchedOffers = (state: ExploreOffersState) => {
    return !state.fetchingOffers && !state.offersFetched;
}

export const isFetchingOffers = (state: ExploreOffersState) => {
    return state.fetchingOffers;
}

export const successfullyFetchedOffers = (state: ExploreOffersState) => {
    return state.offersFetched && !state.fetchingOffers && state.error === undefined;
}

export const hasOffersForCurrentFilters = (state: ExploreOffersState) => {
    return successfullyFetchedOffers(state) && state.offerInstances.length > 0;
}

export const isSearchFilterActive = (state: ExploreOffersState) =>  {
    return state.searchFilter.trim().length > 0;
}

export const calculatePaginationPages = (state: ExploreOffersState) => {
    if (state.offerInstances.length <= maxOffersPerPage) {
        return 1;
    }
    if (state.offerInstances.length % maxOffersPerPage === 0) {
        return (state.offerInstances.length / maxOffersPerPage) | 0;
    }
    return ((state.offerInstances.length / maxOffersPerPage) | 0) + 1;
}

export const calculatePaginationIndices = (state: ExploreOffersState) => {
    let startIndex, endIndex;
    startIndex = (state.currentPage - 1) * maxOffersPerPage;
    endIndex = startIndex + maxOffersPerPage - 1;
    if (endIndex > state.offerInstances.length - 1) {
        endIndex = state.offerInstances.length - 1;
    }
    return {
        startIndex,
        endIndex
    };
}

const exploreOffersReducer = (state: ExploreOffersState = initialState, action: ExploreOffersAction) => {
    console.log("Current state:", state);
    console.log("Received action:", action);
    switch (action.type) {
        case ExploreOffersEvents.FetchingOffers:
            return {
                ...state,
                offerInstances: [],
                fetchingOffers: true,
                offersFetched: false,
                error: undefined
            }
        case ExploreOffersEvents.CompleteFetchingOffers:
            const completeFetchingOffersAction: CompleteFetchingOffersAction = action as CompleteFetchingOffersAction;
            return {
                ...state,
                offerInstances: [...completeFetchingOffersAction.offerInstances],
                fetchingOffers: false,
                offersFetched: true,
                currentPage: 1,
                error: completeFetchingOffersAction.error !== undefined
                    ? {detail: completeFetchingOffersAction.error} : state.error
            }
        case ExploreOffersEvents.FilterChanged:
            const filterChangedAction: FilterChangedAction = action as FilterChangedAction;
            return {
                ...state,
                [filterChangedAction.name]: filterChangedAction.value,
                offerInstances: [],
                fetchingOffers: false,
                offersFetched: false,
                currentPage: 1,
                error: undefined
            };
        case ExploreOffersEvents.ClearSearchFilter:
            return {
                ...state,
                searchFilter: ""
            }
        case ExploreOffersEvents.PaginationChanged:
            const paginationChangedAction: PaginationChangedAction = action as PaginationChangedAction;
            return {
                ...state,
                currentPage: paginationChangedAction.page
            }
        default:
            return state;
    }
}

export default exploreOffersReducer;