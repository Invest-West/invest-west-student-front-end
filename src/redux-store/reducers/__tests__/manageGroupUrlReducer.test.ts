import manageGroupUrlReducer, {
  ManageGroupUrlState,
  isValidatingGroupUrl,
  routeContainsGroupName,
  successfullyValidatedGroupUrl,
  hasGroupValidationError,
  getGroupRouteTheme,
} from '../manageGroupUrlReducer';
import { ManageGroupUrlEvents } from '../../actions/manageGroupUrlActions';
import { createMockGroup } from '../../../test-utils/mock-data';

// Mock Material-UI theme creation
jest.mock('@material-ui/core/styles', () => ({
  createMuiTheme: jest.fn((config) => ({ ...config, __isMockTheme: true })),
  responsiveFontSizes: jest.fn((theme) => theme),
}));

jest.mock('../../../values/defaultThemes', () => ({
  defaultTheme: { __isDefaultTheme: true },
}));

describe('manageGroupUrlReducer', () => {
  const getInitialState = (): ManageGroupUrlState =>
    manageGroupUrlReducer(undefined, { type: 'INIT' } as any);

  it('returns initial state', () => {
    const state = getInitialState();
    expect(state.routePath).toBeUndefined();
    expect(state.group).toBeNull();
    expect(state.groupLoaded).toBe(false);
    expect(state.loadingGroup).toBe(false);
    expect(state.validGroupUrl).toBe(false);
  });

  describe('SetGroupUrl', () => {
    it('sets route path, group name, and course name', () => {
      const state = manageGroupUrlReducer(getInitialState(), {
        type: ManageGroupUrlEvents.SetGroupUrl,
        path: '/groups/test-uni/cs-msc',
        groupUserName: 'test-uni',
        courseUserName: 'cs-msc',
      });
      expect(state.routePath).toBe('/groups/test-uni/cs-msc');
      expect(state.groupNameFromUrl).toBe('test-uni');
      expect(state.courseNameFromUrl).toBe('cs-msc');
    });
  });

  describe('ValidatingGroupUrl', () => {
    it('sets loadingGroup to true', () => {
      const state = manageGroupUrlReducer(getInitialState(), {
        type: ManageGroupUrlEvents.ValidatingGroupUrl,
      });
      expect(state.loadingGroup).toBe(true);
      expect(state.groupLoaded).toBe(false);
      expect(state.group).toBeNull();
      expect(state.validGroupUrl).toBe(false);
    });
  });

  describe('FinishedValidatingGroupUrl', () => {
    it('sets group and validGroupUrl on success', () => {
      const group = createMockGroup();
      const state = manageGroupUrlReducer(getInitialState(), {
        type: ManageGroupUrlEvents.FinishedValidatingGroupUrl,
        group,
        validGroupUrl: true,
      });
      expect(state.groupLoaded).toBe(true);
      expect(state.loadingGroup).toBe(false);
      expect(state.validGroupUrl).toBe(true);
      // group is deep cloned via JSON.parse(JSON.stringify(...))
      expect(state.group).toBeDefined();
    });

    it('sets null group and false validGroupUrl on failure', () => {
      const state = manageGroupUrlReducer(getInitialState(), {
        type: ManageGroupUrlEvents.FinishedValidatingGroupUrl,
        group: null,
        validGroupUrl: false,
        error: { detail: 'Not found' },
      });
      expect(state.group).toBeNull();
      expect(state.validGroupUrl).toBe(false);
      expect(state.error).toEqual({ detail: 'Not found' });
    });
  });

  describe('ResetGroupUrlState', () => {
    it('returns to initial state', () => {
      // First set some state
      let state = manageGroupUrlReducer(getInitialState(), {
        type: ManageGroupUrlEvents.SetGroupUrl,
        path: '/test',
        groupUserName: 'test',
        courseUserName: null,
      });
      // Then reset
      state = manageGroupUrlReducer(state, {
        type: ManageGroupUrlEvents.ResetGroupUrlState,
      });
      expect(state.routePath).toBeUndefined();
      expect(state.group).toBeNull();
      expect(state.groupLoaded).toBe(false);
    });
  });
});

describe('manageGroupUrl selectors', () => {
  const base: ManageGroupUrlState = {
    routePath: undefined,
    groupNameFromUrl: undefined,
    courseNameFromUrl: undefined,
    courseUserName: undefined,
    group: null,
    groupLoaded: false,
    loadingGroup: false,
    validGroupUrl: false,
    groupRouteTheme: { __isDefaultTheme: true } as any,
  };

  describe('isValidatingGroupUrl', () => {
    it('returns true when loading', () => {
      expect(isValidatingGroupUrl({ ...base, loadingGroup: true })).toBe(true);
    });

    it('returns true when not yet loaded and not loading', () => {
      expect(isValidatingGroupUrl({ ...base })).toBe(true);
    });

    it('returns false when group is loaded', () => {
      expect(
        isValidatingGroupUrl({
          ...base,
          group: createMockGroup(),
          groupLoaded: true,
        })
      ).toBe(false);
    });
  });

  describe('routeContainsGroupName', () => {
    it('returns true when groupNameFromUrl is set', () => {
      expect(routeContainsGroupName({ ...base, groupNameFromUrl: 'test' })).toBe(true);
    });

    it('returns false when groupNameFromUrl is null', () => {
      expect(routeContainsGroupName({ ...base, groupNameFromUrl: null })).toBe(false);
    });
  });

  describe('successfullyValidatedGroupUrl', () => {
    it('returns true when valid and no error', () => {
      expect(successfullyValidatedGroupUrl({ ...base, validGroupUrl: true })).toBe(true);
    });

    it('returns false when has error', () => {
      expect(
        successfullyValidatedGroupUrl({
          ...base,
          validGroupUrl: true,
          error: { detail: 'error' },
        })
      ).toBe(false);
    });
  });

  describe('hasGroupValidationError', () => {
    it('returns true when error exists', () => {
      expect(hasGroupValidationError({ ...base, error: { detail: 'error' } })).toBe(true);
    });

    it('returns false when no error', () => {
      expect(hasGroupValidationError(base)).toBe(false);
    });
  });

  describe('getGroupRouteTheme', () => {
    it('returns the theme when set', () => {
      const theme = { palette: {} } as any;
      expect(getGroupRouteTheme({ ...base, groupRouteTheme: theme })).toBe(theme);
    });

    it('returns default theme when undefined', () => {
      expect(getGroupRouteTheme({ ...base, groupRouteTheme: undefined as any })).toEqual({
        __isDefaultTheme: true,
      });
    });
  });
});
