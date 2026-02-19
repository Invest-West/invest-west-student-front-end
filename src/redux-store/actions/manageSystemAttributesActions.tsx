/**
 * Backwards-compatible action creators that delegate to the RTK slice.
 * The async thunk stays here; sync actions use the slice.
 */
import { Action, ActionCreator, Dispatch } from 'redux';
import { AppState } from '../reducers';
import Error from '../../models/error';
import { SystemAttributes } from '../../models/system_attributes';
import systemAttributesRepository from '../../api/repositories/SystemAttributesRepository';
import { setSectors } from '../../pages/admin/components/manage-sectors/ManageSectorsActions';
import { setCourses } from '../../pages/admin/components/manage-courses/ManageCoursesActions';
import {
  setLoadingSystemAttributes,
  setSystemAttributesLoaded,
} from '../slices/systemAttributesSlice';

// Re-export event names mapped to slice action types for consumers that match on them
export enum ManageSystemAttributesEvents {
  LoadingSystemAttributes = 'ManageSystemAttributesState/setLoadingSystemAttributes',
  FinishedLoadingSystemAttributes = 'ManageSystemAttributesState/setSystemAttributesLoaded',
}

export interface ManageSystemAttributesAction extends Action {}

export interface FinishedLoadingSystemAttributesAction extends ManageSystemAttributesAction {
  systemAttributes: SystemAttributes | null;
  error?: Error;
}

export const loadSystemAttributes: ActionCreator<any> = () => {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const { systemAttributes, systemAttributesLoaded, loadingSystemAttributes } =
      getState().ManageSystemAttributesState;

    if (!systemAttributesLoaded && !loadingSystemAttributes && !systemAttributes) {
      dispatch(setLoadingSystemAttributes());

      try {
        const response = await systemAttributesRepository.getSystemAttributes();
        const systemAttributes: SystemAttributes = response.data;
        dispatch(setSectors(systemAttributes.Sectors));
        dispatch(setCourses(systemAttributes.Courses || []));
        return dispatch(setSystemAttributesLoaded({ systemAttributes }));
      } catch (error) {
        return dispatch(
          setSystemAttributesLoaded({
            systemAttributes: null,
            error: { detail: error.toString() },
          })
        );
      }
    }
  };
};
