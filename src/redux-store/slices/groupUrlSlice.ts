import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import GroupProperties from '../../models/group_properties';
import Error from '../../models/error';
import { colors, adaptV4Theme } from '@mui/material';
import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles';
import { defaultTheme } from '../../values/defaultThemes';

export interface ManageGroupUrlState {
  routePath: string | undefined;
  groupNameFromUrl: string | null | undefined;
  courseNameFromUrl: string | null | undefined;
  courseUserName: string | null | undefined;

  group: GroupProperties | null;
  groupLoaded: boolean;
  loadingGroup: boolean;

  validGroupUrl: boolean;

  groupRouteTheme: Theme;

  error?: Error;
}

const initialState: ManageGroupUrlState = {
  routePath: undefined,
  groupNameFromUrl: undefined,
  courseNameFromUrl: undefined,
  courseUserName: undefined,

  group: null,
  groupLoaded: false,
  loadingGroup: false,

  groupRouteTheme: defaultTheme,

  validGroupUrl: false,
};

export const isValidatingGroupUrl = (state: ManageGroupUrlState) => {
  return (
    (!state.group && !state.groupLoaded && state.loadingGroup) ||
    (!state.group && !state.groupLoaded && !state.loadingGroup)
  );
};

export const routeContainsGroupName = (state: ManageGroupUrlState) => {
  return state.groupNameFromUrl !== null;
};

export const successfullyValidatedGroupUrl = (state: ManageGroupUrlState) => {
  return state.validGroupUrl && state.error === undefined;
};

export const hasGroupValidationError = (state: ManageGroupUrlState) => {
  return state.error !== undefined;
};

export const getGroupRouteTheme = (state: ManageGroupUrlState): Theme => {
  if (state.groupRouteTheme === undefined) {
    return defaultTheme;
  }
  return state.groupRouteTheme;
};

const groupUrlSlice = createSlice({
  name: 'ManageGroupUrlState',
  initialState,
  reducers: {
    setGroupUrl(
      state,
      action: PayloadAction<{
        path: string;
        groupUserName: string | null;
        courseUserName: string | null;
      }>
    ) {
      state.routePath = action.payload.path;
      state.groupNameFromUrl = action.payload.groupUserName;
      state.courseNameFromUrl = action.payload.courseUserName;
      state.courseUserName = action.payload.courseUserName;
    },
    setValidatingGroupUrl(state) {
      state.group = null;
      state.groupLoaded = false;
      state.loadingGroup = true;
      state.validGroupUrl = false;
    },
    setFinishedValidatingGroupUrl(
      state,
      action: PayloadAction<{
        group: GroupProperties | null;
        validGroupUrl: boolean;
        error?: Error;
      }>
    ) {
      const { group, validGroupUrl, error } = action.payload;
      state.group = group ? JSON.parse(JSON.stringify(group)) : null;
      state.groupLoaded = true;
      state.loadingGroup = false;
      state.validGroupUrl = validGroupUrl;
      state.error = error;
      state.groupRouteTheme =
        validGroupUrl && group
          ? responsiveFontSizes(
              createTheme(
                adaptV4Theme({
                  palette: {
                    primary: {
                      main: group.settings.primaryColor,
                    },
                    secondary: {
                      main: group.settings.secondaryColor,
                    },
                    text: {
                      secondary: colors.blueGrey['700'],
                    },
                  },
                  typography: {
                    fontFamily: 'Muli, sans-serif',
                  },
                })
              )
            )
          : defaultTheme;
    },
    resetGroupUrlState() {
      return { ...initialState };
    },
  },
});

export const {
  setGroupUrl,
  setValidatingGroupUrl,
  setFinishedValidatingGroupUrl,
  resetGroupUrlState,
} = groupUrlSlice.actions;

export default groupUrlSlice.reducer;
