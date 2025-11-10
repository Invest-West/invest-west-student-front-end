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
import {apiCache, CacheKeys} from "../../utils/CacheManager";
import {CacheInvalidationManager} from "../../utils/CacheInvalidation";
import {monitorCacheHit, monitorCacheMiss} from "../../utils/CacheMonitor";

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

// Debounce timeout reference
let searchTimeout: NodeJS.Timeout | null = null;

export const onSearchEnter: ActionCreator<any> = (event: FormEvent) => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        event.preventDefault();
        return dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase))
    }
}

export const debouncedSearch: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }
        
        searchTimeout = setTimeout(() => {
            dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase));
        }, 300); // 300ms debounce
    }
}

export const refreshOffers: ActionCreator<any> = () => {
    return (dispatch: Dispatch, getState: () => AppState) => {
        // Force refresh by clearing cache first
        CacheInvalidationManager.invalidateOffersCache('manual refresh');
        return dispatch(fetchOffers(FetchProjectsOrderByOptions.Phase));
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

        console.log('[ExploreOffersActions] fetchOffers called with state:', {
            groupFilter,
            searchFilter,
            visibilityFilter,
            sectorFilter,
            phaseFilter
        });

        // Get group and course info from URL
        const { ManageGroupUrlState } = getState();
        const groupNameFromUrl = ManageGroupUrlState.groupNameFromUrl;
        const courseNameFromUrl = ManageGroupUrlState.courseNameFromUrl;

        console.log('[ExploreOffersActions] URL info from ManageGroupUrlState:', {
            groupNameFromUrl,
            courseNameFromUrl,
            fullState: ManageGroupUrlState
        });

        // Determine orderBy based on phaseFilter and potentially other conditions
        let orderBy;
        if (groupFilter === "all") {
            orderBy = phaseFilter === FetchProjectsPhaseOptions.ExpiredPitch ? FetchProjectsOrderByOptions.Group : FetchProjectsOrderByOptions.Phase;
        } else {
            // If not 'all' groups, maintain existing logic
            orderBy = phaseFilter === FetchProjectsPhaseOptions.ExpiredPitch ? FetchProjectsOrderByOptions.Group : FetchProjectsOrderByOptions.Phase;
        }

        // Don't filter by group when on course-based URLs - show all projects
        let effectiveGroupFilter = groupFilter;
        // Check if the groupFilter is a groupUserName that should be undefined for API
        // The backend now accepts both anid and groupUserName, but we should still log this
        if (effectiveGroupFilter && effectiveGroupFilter !== "all") {
            console.log('[ExploreOffersActions] WARNING: Group filter is set to:', effectiveGroupFilter,
                '- this should be either "all" or a Firebase anid for best compatibility');
        }

        const fetchOffersOptions: FetchProjectsOptions = {
            search: searchFilter.trim().length === 0 ? undefined : searchFilter,
            visibility: visibilityFilter,
            group: effectiveGroupFilter === "all" ? undefined : effectiveGroupFilter,
            sector: sectorFilter === "all" ? undefined : sectorFilter,
            phase: phaseFilter,
            orderBy,
        };

        // Use advanced caching system
        const cacheKey = CacheKeys.offers(fetchOffersOptions);
        
        try {
            const cachedOffers = apiCache.get<ProjectInstance[]>(cacheKey);
            if (cachedOffers) {
                monitorCacheHit('api');
                dispatch({
                    type: ExploreOffersEvents.CompleteFetchingOffers,
                    offerInstances: cachedOffers,
                });
                return;
            }

            monitorCacheMiss('api');

            dispatch({ type: ExploreOffersEvents.FetchingOffers });

            const response = await new OfferRepository().fetchOffers(fetchOffersOptions);

            // Cache the response with smart TTL based on filter complexity
            const ttl = searchFilter.trim().length > 0 ? 2 * 60 * 1000 : 5 * 60 * 1000; // 2min for search, 5min for browse
            apiCache.set(cacheKey, response.data, ttl);

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

