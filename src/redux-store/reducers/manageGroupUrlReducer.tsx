/**
 * Re-export barrel — the actual reducer and state live in the RTK slice.
 * Existing consumers can continue importing from this file without changes.
 */
export {
  default,
  isValidatingGroupUrl,
  routeContainsGroupName,
  successfullyValidatedGroupUrl,
  hasGroupValidationError,
  getGroupRouteTheme,
} from '../slices/groupUrlSlice';
export type { ManageGroupUrlState } from '../slices/groupUrlSlice';
