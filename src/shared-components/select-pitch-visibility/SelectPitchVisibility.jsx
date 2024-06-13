import React, {Component} from 'react';

import {FormControl, FormHelperText, MenuItem, OutlinedInput, Select} from "@material-ui/core";
import {css} from 'aphrodite';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as DB_CONST from '../../firebase/databaseConsts';

import {connect} from 'react-redux';
import * as selectProjectVisibilityActions from '../../redux-store/actions/selectProjectVisibilityActions';
import {isValidatingGroupUrl, successfullyValidatedGroupUrl} from "../../redux-store/reducers/manageGroupUrlReducer";

const mapStateToProps = state => {
    return {
        ManageGroupUrlState: state.ManageGroupUrlState,

        projectVisibilitySetting: state.manageSelectProjectVisibility.projectVisibilitySetting,
        project: state.manageSelectProjectVisibility.project
    }
};

const mapDispatchToProps = dispatch => {
    return {
        handleProjectVisibilityChanged: (event) => dispatch(selectProjectVisibilityActions.handleProjectVisibilityChanged(event))
    }
};

class SelectPitchVisibility extends Component {

    render() {
        const {
            ManageGroupUrlState,

            projectVisibilitySetting,
            project,

            handleProjectVisibilityChanged
        } = this.props;

        if (isValidatingGroupUrl(ManageGroupUrlState)) {
            return null;
        }

        return (
            <FormControl fullWidth >
                <FormHelperText className={css(sharedStyles.black_text)} style={{ marginBottom: 6 }}>Select pitch visibility</FormHelperText>
                <Select
                    value={
                        projectVisibilitySetting === -1
                            ?
                            !project
                                ?
                                successfullyValidatedGroupUrl(ManageGroupUrlState)
                                    ?
                                    ManageGroupUrlState.group && ManageGroupUrlState.group.settings.projectVisibility
                                    :
                                    project.group.settings.projectVisibility
                                :
                                project.visibility
                            :
                            projectVisibilitySetting
                    }
                    name="projectVisibilitySetting"
                    margin="dense"
                    onChange={handleProjectVisibilityChanged}
                    input={
                        <OutlinedInput labelWidth={0} name="projectVisibilitySetting"/>
                    }
                >
                    <MenuItem value={DB_CONST.PROJECT_VISIBILITY_PUBLIC}>
                        {`Public (
                        ${
                            successfullyValidatedGroupUrl(ManageGroupUrlState)
                                ?
                                ManageGroupUrlState.group && ManageGroupUrlState.group.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_PUBLIC
                                    ?
                                    "Default - "
                                    :
                                    ""
                                :
                                project.group.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_PUBLIC
                                    ?
                                    "Default - "
                                    :
                                    ""
                        }
                        The full pitch will be visible to all students)`}
                    </MenuItem>
                    <MenuItem
                        value={DB_CONST.PROJECT_VISIBILITY_RESTRICTED}
                    >
                        {`Restricted (
                        ${
                            successfullyValidatedGroupUrl(ManageGroupUrlState)
                                ?
                                ManageGroupUrlState.group && ManageGroupUrlState.group.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_RESTRICTED
                                    ?
                                    "Default - "
                                    :
                                    ""
                                :
                                project.group.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_RESTRICTED
                                    ?
                                    "Default - "
                                    :
                                    ""
                        }
                        Restricted information from this pitch will be visible to all Invest West users. Only members of your course will see the full pitch)`}
                    </MenuItem>
                    <MenuItem
                        value={DB_CONST.PROJECT_VISIBILITY_PRIVATE}
                    >
                        {`Private (
                        ${
                            successfullyValidatedGroupUrl(ManageGroupUrlState)
                                ?
                                ManageGroupUrlState.group && ManageGroupUrlState.group.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_PRIVATE
                                    ?
                                    "Default - "
                                    :
                                    ""
                                :
                                project.group.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_PRIVATE
                                    ?
                                    "Default - "
                                    :
                                    ""
                        }
                        Only members of this course will see this pitch)`}
                    </MenuItem>
                </Select>
            </FormControl>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectPitchVisibility);

