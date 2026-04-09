import exploreOffersReducer, {
  ExploreOffersState,
  maxOffersPerPage,
  hasNotFetchedOffers,
  isFetchingOffers,
  successfullyFetchedOffers,
  hasOffersForCurrentFilters,
  isSearchFilterActive,
  calculatePaginationPages,
  calculatePaginationIndices,
} from '../ExploreOffersReducer';
import { ExploreOffersEvents } from '../ExploreOffersActions';
import { createMockProjectInstance } from '../../../test-utils/mock-data';

// Mock the OfferRepository module to get the enum
jest.mock('../../../api/repositories/OfferRepository', () => ({
  FetchProjectsPhaseOptions: {
    Any: 'Any',
    Live: 'Live',
    TemporarilyClosed: 'TemporarilyClosed',
    Successful: 'Successful',
    Failed: 'Failed',
    LivePitch: 'LivePitch',
    ExpiredPitch: 'ExpiredPitch',
  },
}));

describe('exploreOffersReducer', () => {
  const getInitialState = (): ExploreOffersState =>
    exploreOffersReducer(undefined, { type: 'INIT' } as any);

  it('returns initial state', () => {
    const state = getInitialState();
    expect(state.offerInstances).toEqual([]);
    expect(state.fetchingOffers).toBe(false);
    expect(state.offersFetched).toBe(false);
    expect(state.searchFilter).toBe('');
    expect(state.currentPage).toBe(1);
  });

  describe('FetchingOffers', () => {
    it('clears offers and sets fetching flag', () => {
      const prevState = {
        ...getInitialState(),
        offerInstances: [createMockProjectInstance()],
        offersFetched: true,
      };
      const state = exploreOffersReducer(prevState, {
        type: ExploreOffersEvents.FetchingOffers,
      });
      expect(state.offerInstances).toEqual([]);
      expect(state.fetchingOffers).toBe(true);
      expect(state.offersFetched).toBe(false);
      expect(state.error).toBeUndefined();
    });
  });

  describe('CompleteFetchingOffers', () => {
    it('stores offers and clears fetching', () => {
      const offers = [createMockProjectInstance()];
      const state = exploreOffersReducer(
        { ...getInitialState(), fetchingOffers: true },
        {
          type: ExploreOffersEvents.CompleteFetchingOffers,
          offerInstances: offers,
        }
      );
      expect(state.offerInstances).toHaveLength(1);
      expect(state.fetchingOffers).toBe(false);
      expect(state.offersFetched).toBe(true);
      expect(state.currentPage).toBe(1);
    });

    it('stores error when provided', () => {
      const state = exploreOffersReducer(
        { ...getInitialState(), fetchingOffers: true },
        {
          type: ExploreOffersEvents.CompleteFetchingOffers,
          offerInstances: [],
          error: 'Network error',
        }
      );
      expect(state.error).toEqual({ detail: 'Network error' });
    });
  });

  describe('FilterChanged', () => {
    it('updates named filter and resets state', () => {
      const state = exploreOffersReducer(
        {
          ...getInitialState(),
          offerInstances: [createMockProjectInstance()],
          offersFetched: true,
          currentPage: 3,
        },
        {
          type: ExploreOffersEvents.FilterChanged,
          name: 'sectorFilter',
          value: 'Technology',
        }
      );
      expect(state.sectorFilter).toBe('Technology');
      expect(state.offerInstances).toEqual([]);
      expect(state.offersFetched).toBe(false);
      expect(state.currentPage).toBe(1);
    });
  });

  describe('ClearSearchFilter', () => {
    it('clears search filter', () => {
      const state = exploreOffersReducer(
        { ...getInitialState(), searchFilter: 'test query' },
        { type: ExploreOffersEvents.ClearSearchFilter }
      );
      expect(state.searchFilter).toBe('');
    });
  });

  describe('PaginationChanged', () => {
    it('updates current page', () => {
      const state = exploreOffersReducer(getInitialState(), {
        type: ExploreOffersEvents.PaginationChanged,
        page: 3,
      });
      expect(state.currentPage).toBe(3);
    });
  });
});

describe('exploreOffers selectors', () => {
  const base: ExploreOffersState = {
    offerInstances: [],
    fetchingOffers: false,
    offersFetched: false,
    groups: [],
    searchFilter: '',
    visibilityFilter: 'all',
    sectorFilter: 'all',
    phaseFilter: 'Live' as any,
    groupFilter: 'all',
    currentPage: 1,
  };

  describe('hasNotFetchedOffers', () => {
    it('returns true when not fetching and not fetched', () => {
      expect(hasNotFetchedOffers(base)).toBe(true);
    });

    it('returns false when fetching', () => {
      expect(hasNotFetchedOffers({ ...base, fetchingOffers: true })).toBe(false);
    });

    it('returns false when fetched', () => {
      expect(hasNotFetchedOffers({ ...base, offersFetched: true })).toBe(false);
    });
  });

  describe('isFetchingOffers', () => {
    it('returns true when fetching', () => {
      expect(isFetchingOffers({ ...base, fetchingOffers: true })).toBe(true);
    });
  });

  describe('successfullyFetchedOffers', () => {
    it('returns true when fetched with no error', () => {
      expect(successfullyFetchedOffers({ ...base, offersFetched: true })).toBe(true);
    });

    it('returns false when has error', () => {
      expect(
        successfullyFetchedOffers({
          ...base,
          offersFetched: true,
          error: { detail: 'err' },
        })
      ).toBe(false);
    });
  });

  describe('hasOffersForCurrentFilters', () => {
    it('returns true when fetched and has offers', () => {
      expect(
        hasOffersForCurrentFilters({
          ...base,
          offersFetched: true,
          offerInstances: [createMockProjectInstance()],
        })
      ).toBe(true);
    });

    it('returns false when no offers', () => {
      expect(hasOffersForCurrentFilters({ ...base, offersFetched: true })).toBe(false);
    });
  });

  describe('isSearchFilterActive', () => {
    it('returns true when search filter has content', () => {
      expect(isSearchFilterActive({ ...base, searchFilter: 'test' })).toBe(true);
    });

    it('returns false for empty or whitespace search', () => {
      expect(isSearchFilterActive({ ...base, searchFilter: '' })).toBe(false);
      expect(isSearchFilterActive({ ...base, searchFilter: '   ' })).toBe(false);
    });
  });

  describe('calculatePaginationPages', () => {
    it('returns 1 when offers <= maxOffersPerPage', () => {
      const offers = Array(maxOffersPerPage).fill(createMockProjectInstance());
      expect(calculatePaginationPages({ ...base, offerInstances: offers })).toBe(1);
    });

    it('returns correct page count for exact multiple', () => {
      const offers = Array(maxOffersPerPage * 3).fill(createMockProjectInstance());
      expect(calculatePaginationPages({ ...base, offerInstances: offers })).toBe(3);
    });

    it('returns correct page count with remainder', () => {
      const offers = Array(maxOffersPerPage + 1).fill(createMockProjectInstance());
      expect(calculatePaginationPages({ ...base, offerInstances: offers })).toBe(2);
    });

    it('returns 1 for empty offers', () => {
      expect(calculatePaginationPages(base)).toBe(1);
    });
  });

  describe('calculatePaginationIndices', () => {
    it('returns correct indices for page 1', () => {
      const offers = Array(30).fill(createMockProjectInstance());
      const { startIndex, endIndex } = calculatePaginationIndices({
        ...base,
        offerInstances: offers,
        currentPage: 1,
      });
      expect(startIndex).toBe(0);
      expect(endIndex).toBe(maxOffersPerPage - 1);
    });

    it('returns correct indices for page 2', () => {
      const offers = Array(30).fill(createMockProjectInstance());
      const { startIndex, endIndex } = calculatePaginationIndices({
        ...base,
        offerInstances: offers,
        currentPage: 2,
      });
      expect(startIndex).toBe(maxOffersPerPage);
      expect(endIndex).toBe(Math.min(maxOffersPerPage * 2 - 1, offers.length - 1));
    });

    it('clamps endIndex to last offer', () => {
      const offers = Array(maxOffersPerPage + 3).fill(createMockProjectInstance());
      const { endIndex } = calculatePaginationIndices({
        ...base,
        offerInstances: offers,
        currentPage: 2,
      });
      expect(endIndex).toBe(offers.length - 1);
    });
  });
});
