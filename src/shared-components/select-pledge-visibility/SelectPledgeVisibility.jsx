import React, {Component} from 'react';

import {FormControl, FormHelperText, MenuItem, OutlinedInput, Select} from '@material-ui/core';
import {css} from 'aphrodite';
import sharedStyles from '../../shared-js-css-styles/SharedStyles';
import * as DB_CONST from '../../firebase/databaseConsts';

import {connect} from 'react-redux';
import * as selectProjectVisibilityActions from '../../redux-store/actions/selectProjectVisibilityActions';

const mapStateToProps = state => {
    return {
        groupProperties: state.manageGroupFromParams.groupProperties,
        groupPropertiesLoaded: state.manageGroupFromParams.groupPropertiesLoaded,

        projectVisibilitySetting: state.manageSelectProjectVisibility.projectVisibilitySetting,
        project: state.manageSelectProjectVisibility.project
    }
};

const mapDispatchToProps = dispatch => {
    return {
        handleProjectVisibilityChanged: (event) => dispatch(selectProjectVisibilityActions.handleProjectVisibilityChanged(event))
    }
};

class SelectPledgeVisibility extends Component {

    render() {
        const {
            groupProperties,
            groupPropertiesLoaded,
            projectVisibilitySetting,
            project,

            handleProjectVisibilityChanged
        } = this.props;

        if (!groupPropertiesLoaded) {
            return null;
        }

        return (
            <FormControl fullWidth >
                <FormHelperText className={css(sharedStyles.black_text)} style={{ marginBottom: 6 }} >
                    Select pledge visibility
                </FormHelperText>
                <Select
                    value={
                        projectVisibilitySetting === -1
                            ?
                            !project
                                ?
                                groupProperties
                                    ?
                                    groupProperties.settings.projectVisibility
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
                        <OutlinedInput labelWidth={0} name="projectVisibilitySetting" />
                    }
                >
                    <MenuItem value={DB_CONST.PROJECT_VISIBILITY_PUBLIC} >
                        {`Public (
                        ${
                            groupProperties
                                ?
                                groupProperties.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_PUBLIC
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
                        The full pledge will be visible to all Invest West users)`}
                    </MenuItem>
                    <MenuItem value={DB_CONST.PROJECT_VISIBILITY_RESTRICTED} >
                        {`Restricted (
                        ${
                            groupProperties
                                ?
                                groupProperties.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_RESTRICTED
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
                        Restricted information from this pledge will be visible to all Invest West users. Only members of your group will see the full pledge)`}
                    </MenuItem>
                    <MenuItem value={DB_CONST.PROJECT_VISIBILITY_PRIVATE} >
                        {`Private (
                        ${
                            groupProperties
                                ?
                                groupProperties.settings.projectVisibility === DB_CONST.PROJECT_VISIBILITY_PRIVATE
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
                        Only members of this group will see this pledge)`}
                    </MenuItem>
                </Select>
            </FormControl>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectPledgeVisibility);

