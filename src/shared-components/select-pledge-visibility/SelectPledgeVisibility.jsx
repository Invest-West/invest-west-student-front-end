import React from 'react';

import { FormControl, FormHelperText, MenuItem, OutlinedInput, Select } from '@mui/material';
import { css } from 'aphrodite';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as DB_CONST from '../../firebase/databaseConsts';

import { useAppSelector, useAppDispatch } from '../../redux-store/hooks';
import * as selectProjectVisibilityActions from '../../redux-store/actions/selectProjectVisibilityActions';

const SelectPledgeVisibility = () => {
  const dispatch = useAppDispatch();
  const groupProperties = useAppSelector((state) => state.manageGroupFromParams.groupProperties);
  const groupPropertiesLoaded = useAppSelector(
    (state) => state.manageGroupFromParams.groupPropertiesLoaded
  );
  const projectVisibilitySetting = useAppSelector(
    (state) => state.manageSelectProjectVisibility.projectVisibilitySetting
  );
  const project = useAppSelector((state) => state.manageSelectProjectVisibility.project);

  const handleProjectVisibilityChanged = (event) =>
    dispatch(selectProjectVisibilityActions.handleProjectVisibilityChanged(event));

  if (!groupPropertiesLoaded) {
    return null;
  }

  return (
    <FormControl variant="standard" fullWidth>
      <FormHelperText className={css(sharedStyles.black_text)} style={{ marginBottom: 6 }}>
        Select pledge visibility
      </FormHelperText>
      <Select
        variant="standard"
        value={
          projectVisibilitySetting === -1
            ? !project
              ? groupProperties
                ? groupProperties.settings.projectVisibility
                : project.group.settings.projectVisibility
              : project.visibility
            : projectVisibilitySetting
        }
        name="projectVisibilitySetting"
        margin="dense"
        onChange={handleProjectVisibilityChanged}
        input={<OutlinedInput labelWidth={0} name="projectVisibilitySetting" />}
      >
        <MenuItem value={DB_CONST.PROJECT_VISIBILITY_PUBLIC}>
          {`Public (
                        ${
                          groupProperties
                            ? groupProperties.settings.projectVisibility ===
                              DB_CONST.PROJECT_VISIBILITY_PUBLIC
                              ? 'Default - '
                              : ''
                            : project.group.settings.projectVisibility ===
                                DB_CONST.PROJECT_VISIBILITY_PUBLIC
                              ? 'Default - '
                              : ''
                        }
                        The full pledge will be visible to all users)`}
        </MenuItem>
        <MenuItem value={DB_CONST.PROJECT_VISIBILITY_RESTRICTED}>
          {`Restricted (
                        ${
                          groupProperties
                            ? groupProperties.settings.projectVisibility ===
                              DB_CONST.PROJECT_VISIBILITY_RESTRICTED
                              ? 'Default - '
                              : ''
                            : project.group.settings.projectVisibility ===
                                DB_CONST.PROJECT_VISIBILITY_RESTRICTED
                              ? 'Default - '
                              : ''
                        }
                        Restricted information from this pledge will be visible to all users. Only members of your course will see the full pledge)`}
        </MenuItem>
        <MenuItem value={DB_CONST.PROJECT_VISIBILITY_PRIVATE}>
          {`Private (
                        ${
                          groupProperties
                            ? groupProperties.settings.projectVisibility ===
                              DB_CONST.PROJECT_VISIBILITY_PRIVATE
                              ? 'Default - '
                              : ''
                            : project.group.settings.projectVisibility ===
                                DB_CONST.PROJECT_VISIBILITY_PRIVATE
                              ? 'Default - '
                              : ''
                        }
                        Only members of this course will see this pledge)`}
        </MenuItem>
      </Select>
    </FormControl>
  );
};

export default SelectPledgeVisibility;
