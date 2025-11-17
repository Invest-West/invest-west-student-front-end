import {Action, ActionCreator, Dispatch} from "redux";
import {ProjectInstance} from "../../models/project";
import {AppState} from "../../redux-store/reducers";
import User, {isInvestor, isIssuer} from "../../models/user";
import Admin, {isAdmin} from "../../models/admin";
import OfferRepository, {
    FetchProjectsOptions,
    FetchProjectsOrderByOptions
} from "../../api/repositories/OfferRepository";
import GroupOfMembership from "../../models/group_of_membership";
import GroupProperties from "../../models/group_properties";
import GroupRepository from "../../api/repositories/GroupRepository";
import Api, {ApiRoutes} from "../../api/Api";

export enum OffersTableEvents {
    SetTableUser = "OffersTableEvents.SetTableUser",
    FetchingOffers = "OffersTableEvents.FetchingOffers",
    CompleteFetchingOffers = "OffersTableEvents.CompleteFetchingOffers",
    FilterChanged = "OffersTableEvents.FilterChanged",
    FilterOffersByName = "OffersTableEvents.FilterOffersByName",
    CancelFilteringOffersByName = "OffersTableEvents.CancelFilteringOffersByName",
    ChangePage = "OffersTableEvents.ChangePage",
    ChangeRowsPerPage = "OffersTableEvents.ChangeRowsPerPage",
    ExportingCsv = "OffersTableEvents.ExportingCsv",
    CompleteExportingCsv = "OffersTableEvents.CompleteExportingCsv",
    FetchingFeedbackCount = "OffersTableEvents.FetchingFeedbackCount",
    CompleteFetchingFeedbackCount = "OffersTableEvents.CompleteFetchingFeedbackCount"
}

export interface OffersTableAction extends Action {

}

export interface SetTableUserAction extends OffersTableAction {
    user: User | Admin | undefined;
    groupsOfMembership: GroupOfMembership[] | undefined;
    groupsSelect: GroupProperties[] | undefined;
    error?: string;
}

export interface CompleteFetchingOffersAction extends OffersTableAction {
    offerInstances: ProjectInstance[];
    error?: string;
}

export interface FilterOffersByNameAction extends OffersTableAction {
    offerInstances: ProjectInstance[];
    isFilteringByName: boolean;
}

export interface FilterChangedAction extends OffersTableAction {
    name: string;
    value: any;
}

export interface ChangePageAction extends OffersTableAction {
    page: number;
}

export interface ChangeRowsPerPageAction extends OffersTableAction {
    rowsPerPage: number;
}

export interface CompleteExportingCsvAction extends OffersTableAction {
    error?: string;
}

export interface CompleteFetchingFeedbackCountAction extends OffersTableAction {
    count: number;
    error?: string;
}

export const setUser: ActionCreator<any> = (user?: User | Admin) => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentTableUser = getState().OffersTableLocalState.tableUser;
        let shouldSetTableUser: boolean = false;
        if (currentTableUser === undefined) {
            if (user !== undefined) {
                shouldSetTableUser = true;
            }
        } else {
            if (user !== undefined) {
                if (currentTableUser.id !== user.id) {
                    shouldSetTableUser = true;
                }
            } else {
                shouldSetTableUser = true;
            }
        }

        if (shouldSetTableUser) {
            const action: SetTableUserAction = {
                type: OffersTableEvents.SetTableUser,
                user: user,
                groupsOfMembership: undefined,
                groupsSelect: undefined
            }

            try {
                if (user) {
                    const groupsOfMembershipResponse = await new Api().request("get",
                        ApiRoutes.listGroupsOfMembership.replace(":uid", user.id));
                    const groupsOfMembership: GroupOfMembership[] = groupsOfMembershipResponse.data;
                    action.groupsOfMembership = groupsOfMembership;

                    const isTableAdminUser: Admin | null = isAdmin(user);

                    if (isTableAdminUser && isTableAdminUser.superAdmin) {
                        const allGroupsResponse = await new GroupRepository().fetchGroups();
                        action.groupsSelect = allGroupsResponse.data;
                    } else {
                        action.groupsSelect = groupsOfMembership.map(groupOfMembership => groupOfMembership.group);
                    }
                }
                dispatch(action);
                return dispatch(fetchOffers());
            } catch (error) {
                action.error = error.toString();
                return dispatch(action);
            }
        }
    }
}

export const fetchOffers: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            tableUser,
            tableUserGroupsOfMembership,
            visibilityFilter,
            groupFilter,
            phaseFilter
        } = getState().OffersTableLocalState;

        const currentUser = getState().AuthenticationState.currentUser;

        if (!currentUser || !tableUser) {
            return;
        }

        const currentAdmin: Admin | null = isAdmin(currentUser);

        const fetchOffersOptions: FetchProjectsOptions = {
            visibility: visibilityFilter,
            group: groupFilter,
            phase: phaseFilter
        };

        const completeAction: CompleteFetchingOffersAction = {
            type: OffersTableEvents.CompleteFetchingOffers,
            offerInstances: []
        }

        let shouldFetchOffers: boolean = false;

        // currentUser = tableUser --> issuer/investor/admin is viewing their own offers table
        if (currentUser.id === tableUser.id) {
            shouldFetchOffers = true;
        }
        // currentUser != tableUser --> admin is viewing issuer/investor/admin offers table
        else if (currentAdmin) {
            // super admin is viewing issuer/investor/admin offers table
            if (currentAdmin.superAdmin) {
                shouldFetchOffers = true;
            }
            // group admin is viewing issuer/investor offers table
            else {
                if (tableUserGroupsOfMembership !== undefined
                    && tableUserGroupsOfMembership.findIndex(groupOfMembership => groupOfMembership.group.anid === currentAdmin.anid) !== -1
                    && !isAdmin(tableUser)
                ) {
                    shouldFetchOffers = true;
                }
            }
        }

        if (shouldFetchOffers) {
            if (isIssuer(tableUser)) {
                fetchOffersOptions.issuer = tableUser.id;
                fetchOffersOptions.orderBy = FetchProjectsOrderByOptions.Issuer;
            } else if (isInvestor(tableUser)) {
                fetchOffersOptions.investor = tableUser.id;
                fetchOffersOptions.orderBy = FetchProjectsOrderByOptions.Investor;
            } else if (currentAdmin) {
                if (!currentAdmin.superAdmin) {
                    fetchOffersOptions.group = currentAdmin.anid;
                    fetchOffersOptions.orderBy = FetchProjectsOrderByOptions.Group;
                }
            } else {
                completeAction.error = "Invalid user reference.";
                return dispatch(completeAction);
            }
        } else {
            completeAction.error = "You don't have privileges to access this data.";
            return dispatch(completeAction);
        }

        dispatch({
            type: OffersTableEvents.FetchingOffers
        });

        try {
            const response = await new OfferRepository().fetchOffers(fetchOffersOptions);
            completeAction.offerInstances = response.data;

            dispatch(completeAction);
            return dispatch(filterOffersByName());
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const filterChanged: ActionCreator<any> = (event: any) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const name = event.target.name;
        const value = event.target.value;

        const action: FilterChangedAction = {
            type: OffersTableEvents.FilterChanged,
            name: name,
            value: value
        }
        dispatch(action);
        if (name !== "nameFilter") {
            dispatch(fetchOffers());
        }
    }
}

export const filterOffersByName: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const nameFilter: string = getState().OffersTableLocalState.nameFilter;
        let offerInstances: ProjectInstance[] = [...getState().OffersTableLocalState.offerInstances];

        const action: FilterOffersByNameAction = {
            type: OffersTableEvents.FilterOffersByName,
            offerInstances: offerInstances,
            isFilteringByName: false
        }

        if (nameFilter.trim().length > 0) {
            offerInstances = offerInstances.filter(
                offerInstance => offerInstance.projectDetail.projectName?.toLowerCase().includes(nameFilter.toLowerCase())
            );
            action.offerInstances = offerInstances;
            action.isFilteringByName = true;
        }
        return dispatch(action);
    }
}

export const cancelFilteringOffersByName: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        return dispatch({
            type: OffersTableEvents.CancelFilteringOffersByName
        });
    }
}

export const changePage: ActionCreator<any> = (event: any, page: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ChangePageAction = {
            type: OffersTableEvents.ChangePage,
            page: page
        }
        return dispatch(action);
    }
}

export const changeRowsPerPage: ActionCreator<any> = (event: any) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: ChangeRowsPerPageAction = {
            type: OffersTableEvents.ChangeRowsPerPage,
            rowsPerPage: parseInt(event.target.value, 10)
        }
        return dispatch(action);
    }
}

export const exportCsv: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const currentUser = getState().AuthenticationState.currentUser;
        const exportingCsv = getState().OffersTableLocalState.exportingCsv;

        if (!currentUser) {
            return;
        }

        const currentAdmin: Admin | null = isAdmin(currentUser);

        if (!currentAdmin) {
            return;
        }

        if (exportingCsv) {
            return;
        }

        dispatch({
            type: OffersTableEvents.ExportingCsv
        });

        const completeAction: CompleteExportingCsvAction = {
            type: OffersTableEvents.CompleteExportingCsv
        };

        try {
            await new OfferRepository().exportCsv(
                currentAdmin.superAdmin
                    ? undefined
                    : {group: currentAdmin.anid, orderBy: FetchProjectsOrderByOptions.Group}
            );
            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}

export const fetchDraftProjectsWithFeedbackCount: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {tableUser} = getState().OffersTableLocalState;

        if (!tableUser || !isIssuer(tableUser)) {
            return;
        }

        dispatch({
            type: OffersTableEvents.FetchingFeedbackCount
        });

        const completeAction: CompleteFetchingFeedbackCountAction = {
            type: OffersTableEvents.CompleteFetchingFeedbackCount,
            count: 0
        };

        try {
            // Fetch all draft projects for this issuer
            const fetchOptions: FetchProjectsOptions = {
                issuer: tableUser.id,
                orderBy: FetchProjectsOrderByOptions.Issuer,
                phase: 'all' // Get all phases including drafts
            };

            const response = await new OfferRepository().fetchOffers(fetchOptions);

            // Count draft projects with feedback
            const draftProjectsWithFeedback = response.data.filter((projectInstance: ProjectInstance) => {
                // Check if project is draft (status -2)
                const isDraft = projectInstance.projectDetail.status === -2;
                // Check if it has feedback
                const hasFeedback = projectInstance.rejectFeedbacks && projectInstance.rejectFeedbacks.length > 0;
                return isDraft && hasFeedback;
            });

            completeAction.count = draftProjectsWithFeedback.length;

            return dispatch(completeAction);
        } catch (error) {
            completeAction.error = error.toString();
            return dispatch(completeAction);
        }
    }
}