/**
 * Backwards-compatible action creators that delegate to the RTK slice.
 * The async thunk stays here; sync actions use the slice.
 */
import { Action, ActionCreator, Dispatch } from 'redux';
import GroupProperties from '../../models/group_properties';
import Error from '../../models/error';
import { AppState } from '../reducers';
import GroupRepository from '../../api/repositories/GroupRepository';
import Api from '../../api/Api';
import {
  setGroupUrl,
  setValidatingGroupUrl,
  setFinishedValidatingGroupUrl,
  resetGroupUrlState as _resetGroupUrlState,
} from '../slices/groupUrlSlice';

// Re-export event names mapped to slice action types for consumers that match on them
export enum ManageGroupUrlEvents {
  SetGroupUrl = 'ManageGroupUrlState/setGroupUrl',
  ValidatingGroupUrl = 'ManageGroupUrlState/setValidatingGroupUrl',
  FinishedValidatingGroupUrl = 'ManageGroupUrlState/setFinishedValidatingGroupUrl',
  ResetGroupUrlState = 'ManageGroupUrlState/resetGroupUrlState',
}

export interface ManageGroupUrlAction extends Action {
  path?: string;
  groupUserName?: string | null;
  courseUserName?: string | null;
  group?: GroupProperties | null;
  validGroupUrl?: boolean;
  error?: Error;
}

export interface SetGroupUrlAction extends ManageGroupUrlAction {
  path: string;
  groupUserName: string | null;
  courseUserName: string | null;
}

export interface ValidatingGroupUrlAction extends ManageGroupUrlAction {}

export interface FinishedValidatingGroupUrlAction extends ManageGroupUrlAction {
  group: GroupProperties | null;
  validGroupUrl: boolean;
  error?: Error;
}

export interface ResetGroupUrlStateAction extends ManageGroupUrlAction {}

export const validateGroupUrl: ActionCreator<any> = (
  path: string,
  groupUserName: string | null,
  courseUserName?: string | null
) => {
  return async (dispatch: Dispatch, getState: () => AppState) => {
    const { routePath, groupNameFromUrl, courseNameFromUrl, group, loadingGroup, groupLoaded } =
      getState().ManageGroupUrlState;

    let shouldValidateGroupUrl = false;

    if (routePath === undefined || groupNameFromUrl === undefined) {
      shouldValidateGroupUrl = true;
    } else {
      if (groupNameFromUrl !== groupUserName || courseNameFromUrl !== courseUserName) {
        shouldValidateGroupUrl = true;
      }
    }

    if (
      (!group && !loadingGroup && !groupLoaded) ||
      (!(!group && !loadingGroup && !groupLoaded) && shouldValidateGroupUrl)
    ) {
      dispatch(setGroupUrl({ path, groupUserName, courseUserName: courseUserName || null }));
      dispatch(setValidatingGroupUrl());

      if (!groupUserName) {
        return dispatch(setFinishedValidatingGroupUrl({ group: null, validGroupUrl: true }));
      }

      if (groupUserName === 'invest-west') {
        let investWestGroup: GroupProperties;
        try {
          const response = await new GroupRepository().getGroup('invest-west');
          investWestGroup = response.data;
        } catch (error) {
          investWestGroup = {
            anid: '-M2I40dBdzdI89yDCaAn',
            dateAdded: Date.now(),
            description: 'Default student showcase group',
            displayName: 'Student Showcase',
            displayNameLower: 'student showcase',
            groupUserName: 'invest-west',
            isInvestWest: true,
            status: 1,
            plainLogo: [],
            settings: {
              primaryColor: '#4F6D7A',
              secondaryColor: '#ffffff',
              projectVisibility: 1,
              makeInvestorsContactDetailsVisibleToIssuers: false,
            },
          };
        }

        if (courseUserName) {
          try {
            await new GroupRepository().getCourseByParentAndSlug(
              investWestGroup.anid,
              courseUserName
            );
          } catch (error: any) {
            // Allow validation to proceed regardless of course validation errors
          }
        }

        return dispatch(
          setFinishedValidatingGroupUrl({ group: investWestGroup, validGroupUrl: true })
        );
      }

      try {
        const response = await new GroupRepository().getGroup(groupUserName);
        const retrievedGroup: GroupProperties | null = response.data;

        if (retrievedGroup && courseUserName) {
          try {
            await new GroupRepository().getCourseByParentAndSlug(
              retrievedGroup.anid,
              courseUserName
            );
          } catch (error: any) {
            // Allow validation to proceed regardless of course validation errors
          }
        }

        return dispatch(
          setFinishedValidatingGroupUrl({
            group: retrievedGroup,
            validGroupUrl: retrievedGroup !== null,
          })
        );
      } catch (error: any) {
        try {
          let publicApiUrl: string;
          if (courseUserName) {
            publicApiUrl = `/public/uni/${groupUserName}/${courseUserName}`;
          } else {
            publicApiUrl = `/public/uni/${groupUserName}`;
          }

          const publicResponse = await Api.doGet(publicApiUrl);
          const publicData = publicResponse.data;

          if (publicData.valid || publicData.found) {
            const publicGroup: GroupProperties = {
              anid: publicData.university?.id || '',
              dateAdded: Date.now(),
              description: publicData.university?.name || '',
              displayName: publicData.university?.name || groupUserName,
              displayNameLower: (publicData.university?.name || groupUserName).toLowerCase(),
              groupUserName: publicData.university?.slug || groupUserName,
              isInvestWest: false,
              status: 1,
              plainLogo: publicData.university?.logo
                ? [
                    {
                      storageID: 0,
                      url: publicData.university.logo,
                      removed: false,
                    },
                  ]
                : [],
              settings: {
                primaryColor: '#1976d2',
                secondaryColor: '#dc004e',
                projectVisibility: 1,
                makeInvestorsContactDetailsVisibleToIssuers: false,
              },
            };

            return dispatch(
              setFinishedValidatingGroupUrl({ group: publicGroup, validGroupUrl: true })
            );
          } else {
            return dispatch(
              setFinishedValidatingGroupUrl({
                group: null,
                validGroupUrl: false,
                error: {
                  detail: publicData.error || `University "${groupUserName}" not found`,
                },
              })
            );
          }
        } catch (publicError: any) {
          return dispatch(
            setFinishedValidatingGroupUrl({
              group: null,
              validGroupUrl: false,
              error: { detail: error.toString() },
            })
          );
        }
      }
    }
  };
};

export const resetGroupUrlState: ActionCreator<any> = () => {
  return (dispatch: Dispatch) => {
    return dispatch(_resetGroupUrlState());
  };
};
