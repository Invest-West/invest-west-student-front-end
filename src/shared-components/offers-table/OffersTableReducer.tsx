import {
    ChangePageAction,
    ChangeRowsPerPageAction,
    CompleteExportingCsvAction,
    CompleteFetchingFeedbackCountAction,
    CompleteFetchingOffersAction,
    FilterChangedAction,
    FilterOffersByNameAction,
    OffersTableAction,
    OffersTableEvents,
    SetTableUserAction
} from "./OffersTableActions";
import {ProjectInstance} from "../../models/project";
import User from "../../models/user";
import Admin from "../../models/admin";
import Error from "../../models/error";
import GroupOfMembership from "../../models/group_of_membership";
import GroupProperties from "../../models/group_properties";
import {AuthenticationEvents} from "../../redux-store/actions/authenticationActions";

export interface OffersTableStates {
    offerInstances: ProjectInstance[];
    offerInstancesFilteredByName: ProjectInstance[];
    fetchingOffers: boolean;
    offersFetched: boolean;

    tableUser?: User | Admin;
    tableUserGroupsOfMembership?: GroupOfMembership[];

    nameFilter: string;
    visibilityFilter: number | "all";
    groupFilter: string | "all";
    groupsSelect?: GroupProperties[];
    phaseFilter: string | number | "all";
    filteringOffersByName: boolean;

    currentPage: number;
    rowsPerPage: number;

    exportingCsv: boolean;
    errorExportingCsv?: Error;

    // Count of draft projects with admin feedback
    draftProjectsWithFeedbackCount: number;
    fetchingFeedbackCount: boolean;

    error?: Error
}

const initialState: OffersTableStates = {
    offerInstances: [],
    offerInstancesFilteredByName: [],
    fetchingOffers: false,
    offersFetched: false,

    nameFilter: "",
    visibilityFilter: "all",
    groupFilter: "all",
    phaseFilter: "all",
    filteringOffersByName: false,

    currentPage: 0,
    rowsPerPage: 5,

    exportingCsv: false,

    draftProjectsWithFeedbackCount: 0,
    fetchingFeedbackCount: false
}

export const isFetchingOffers = (state: OffersTableStates) => {
    return !state.offersFetched && state.fetchingOffers;
}

export const successfullyFetchedOffers = (state: OffersTableStates) => {
    return state.offersFetched && !state.fetchingOffers && state.error === undefined;
}

export const hasOffersForCurrentFilters = (state: OffersTableStates) => {
    return successfullyFetchedOffers(state) && state.offerInstancesFilteredByName.length > 0;
}

export const isFilteringOffersByName = (state: OffersTableStates) => {
    return state.filteringOffersByName;
}

export const hasErrorFetchingOffers = (state: OffersTableStates) => {
    return state.error !== undefined;
}

export const isExportingCsv = (state: OffersTableStates) => {
    return state.exportingCsv;
}

export const hasErrorExportingCsv = (state: OffersTableStates) => {
    return state.errorExportingCsv !== undefined;
}

export const hasGroupsSelect = (state: OffersTableStates) => {
    return state.groupsSelect !== undefined && state.groupsSelect.length > 0;
}

const offersTableReducer = (state = initialState, action: OffersTableAction) => {
    switch (action.type) {
        case AuthenticationEvents.SignOut:
            return initialState;
        case OffersTableEvents.SetTableUser:
            const setTableUserAction: SetTableUserAction = action as SetTableUserAction;
            return {
                ...initialState,
                tableUser: setTableUserAction.user !== undefined
                    ? JSON.parse(JSON.stringify(setTableUserAction.user))
                    : undefined,
                tableUserGroupsOfMembership: setTableUserAction.groupsOfMembership !== undefined
                    ? [...setTableUserAction.groupsOfMembership]
                    : undefined,
                groupsSelect: setTableUserAction.groupsSelect !== undefined
                    ? [...setTableUserAction.groupsSelect]
                    : undefined,
                error: setTableUserAction.error !== undefined ? {detail: setTableUserAction.error} : state.error,
            }
        case OffersTableEvents.FetchingOffers:
            return {
                ...state,
                offerInstances: [],
                offerInstancesFilteredByName: [],
                fetchingOffers: true,
                offersFetched: false,
                error: undefined
            }
        case OffersTableEvents.CompleteFetchingOffers:
            const completeFetchingOffersAction: CompleteFetchingOffersAction = action as CompleteFetchingOffersAction;
            return {
                ...state,
                offerInstances: [...completeFetchingOffersAction.offerInstances],
                fetchingOffers: false,
                offersFetched: true,
                currentPage: 0,
                error: completeFetchingOffersAction.error !== undefined
                    ? {detail: completeFetchingOffersAction.error} : state.error
            }
        case OffersTableEvents.FilterChanged:
            const filterChangedAction: FilterChangedAction = action as FilterChangedAction;
            return {
                ...state,
                [filterChangedAction.name]: filterChangedAction.value,
                currentPage: 0
            }
        case OffersTableEvents.FilterOffersByName:
            const filterOffersByNameAction: FilterOffersByNameAction = action as FilterOffersByNameAction;
            return {
                ...state,
                offerInstancesFilteredByName: [...filterOffersByNameAction.offerInstances],
                filteringOffersByName: filterOffersByNameAction.isFilteringByName,
                currentPage: 0
            }
        case OffersTableEvents.CancelFilteringOffersByName:
            return {
                ...state,
                offerInstancesFilteredByName: [...state.offerInstances],
                nameFilter: "",
                filteringOffersByName: false,
                currentPage: 0
            }
        case OffersTableEvents.ChangePage:
            const changePageAction: ChangePageAction = action as ChangePageAction;
            return {
                ...state,
                currentPage: changePageAction.page
            }
        case OffersTableEvents.ChangeRowsPerPage:
            const changeRowsPerPageAction: ChangeRowsPerPageAction = action as ChangeRowsPerPageAction;
            return {
                ...state,
                rowsPerPage: changeRowsPerPageAction.rowsPerPage,
                currentPage: 0
            }
        case OffersTableEvents.ExportingCsv:
            return {
                ...state,
                exportingCsv: true,
                errorExportingCsv: undefined
            }
        case OffersTableEvents.CompleteExportingCsv:
            const completeExportingCsvAction: CompleteExportingCsvAction = action as CompleteExportingCsvAction;
            return {
                ...state,
                exportingCsv: false,
                errorExportingCsv: completeExportingCsvAction.error !== undefined
                    ? {detail: completeExportingCsvAction.error} : state.errorExportingCsv
            }
        case OffersTableEvents.FetchingFeedbackCount:
            return {
                ...state,
                fetchingFeedbackCount: true
            }
        case OffersTableEvents.CompleteFetchingFeedbackCount:
            const completeFetchingFeedbackCountAction: CompleteFetchingFeedbackCountAction = action as CompleteFetchingFeedbackCountAction;
            return {
                ...state,
                fetchingFeedbackCount: false,
                draftProjectsWithFeedbackCount: completeFetchingFeedbackCountAction.count
            }
        default:
            return state;
    }
}

export default offersTableReducer;