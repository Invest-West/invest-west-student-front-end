import {Action, ActionCreator, Dispatch} from "redux";
import {ProjectInstance} from "../../models/project";
import React, {FormEvent} from "react";
import {AppState} from "../../redux-store/reducers";
import {PROJECT_VISIBILITY_PUBLIC, PROJECT_VISIBILITY_RESTRICTED} from "../../firebase/databaseConsts";
import OfferRepository, {
    FetchProjectsOptions,
    FetchProjectsOrderByOptions,
    FetchProjectsPhaseOptions
} from "../../api/repositories/OfferRepository";

export enum ExploreOffersEvents {
    FetchingOffers = "ExploreOffersEvents.FetchingOffers",
    CompleteFetchingOffers = "ExploreOffersEvents.CompleteFetchingOffers",
    FilterChanged = "ExploreOffersEvents.FilterChanged",
    ClearSearchFilter = "ExploreOffersEvents.ClearSearchFilter",
    PaginationChanged = "ExploreOffersEvents.PaginationChanged"
}

export interface ExploreOffersAction extends Action {

}

export interface CompleteFetchingOffersAction extends ExploreOffersAction {
    offerInstances: ProjectInstance[];
    error?: string;
}

export interface FilterChangedAction extends ExploreOffersAction {
    name: string;
    value: any;
}

export interface PaginationChangedAction extends ExploreOffersAction {
    page: number;
}

export const onSearchEnter: ActionCreator<any> = (event: FormEvent) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        event.preventDefault();
        return dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase))
    }
}

export const fetchOffers: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        const {
            searchFilter,
            visibilityFilter,
            sectorFilter,
            phaseFilter,
            groupFilter,
        } = getState().ExploreOffersLocalState;

        // Determine orderBy based on phaseFilter and potentially other conditions
        let orderBy;
        if (groupFilter === "all") {
            orderBy = phaseFilter === FetchProjectsPhaseOptions.ExpiredPitch ? FetchProjectsOrderByOptions.Group : FetchProjectsOrderByOptions.Phase;
        } else {
            // If not 'all' groups, maintain existing logic
            orderBy = phaseFilter === FetchProjectsPhaseOptions.ExpiredPitch ? FetchProjectsOrderByOptions.Group : FetchProjectsOrderByOptions.Phase;
        }

        const fetchOffersOptions: FetchProjectsOptions = {
            search: searchFilter.trim().length === 0 ? undefined : searchFilter,
            visibility: visibilityFilter,
            group: groupFilter === "all" ? undefined : groupFilter,
            sector: sectorFilter === "all" ? undefined : sectorFilter,
            phase: phaseFilter,
            orderBy,
        };

        dispatch({ type: ExploreOffersEvents.FetchingOffers });

        try {
            const response = await new OfferRepository().fetchOffers(fetchOffersOptions);
            dispatch({
                type: ExploreOffersEvents.CompleteFetchingOffers,
                offerInstances: response.data,
            });
        } catch (error) {
            dispatch({
                type: ExploreOffersEvents.CompleteFetchingOffers,
                error: error.toString(),
                offerInstances: [],
            });
        }
    };
};

export const filterChanged: ActionCreator<any> = (event: React.ChangeEvent<HTMLInputElement>) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const name = event.target.name;
        const value = event.target.value;

        const action: FilterChangedAction = {
            type: ExploreOffersEvents.FilterChanged,
            name: name,
            value: value
        }
        dispatch(action);

        switch (name) {
            case "searchFilter":
                return;
            case "visibilityFilter":
                if (value === "all" || value.toString() === PROJECT_VISIBILITY_PUBLIC.toString() || value.toString() === PROJECT_VISIBILITY_RESTRICTED.toString()) {
                    return dispatch(fetchOffers(FetchProjectsOrderByOptions.Visibility));
                }
                return dispatch(fetchOffers(FetchProjectsOrderByOptions.Group));
            case "sectorFilter":
                return dispatch(fetchOffers(FetchProjectsOrderByOptions.Sector));
            case "phaseFilter":
                return dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase));
            case "groupFilter":
                return dispatch(fetchOffers(value === "all" ? undefined : FetchProjectsOrderByOptions.Group));
            default:
                return;
        }
    }
}

export const clearSearchFilter: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({
            type: ExploreOffersEvents.ClearSearchFilter
        });
        return dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase))
    }
}

export const paginationChanged: ActionCreator<any> = (event: React.ChangeEvent<unknown>, page: number) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        const action: PaginationChangedAction = {
            type: ExploreOffersEvents.PaginationChanged,
            page: page
        }
        return dispatch(action);
    }
}

