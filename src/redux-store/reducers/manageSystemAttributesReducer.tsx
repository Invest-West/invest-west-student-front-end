/**
 * Re-export barrel — the actual reducer and state live in the RTK slice.
 * Existing consumers can continue importing from this file without changes.
 */
export {
  default,
  isLoadingSystemAttributes,
  successfullyLoadedSystemAttributes,
  hasErrorLoadingSystemAttributes,
} from '../slices/systemAttributesSlice';
export type { ManageSystemAttributesState } from '../slices/systemAttributesSlice';
