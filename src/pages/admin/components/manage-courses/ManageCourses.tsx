import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {Box, Button, IconButton, TextField, Typography} from "@material-ui/core";
import {
    ManageSystemAttributesState,
    successfullyLoadedSystemAttributes
} from "../../../../redux-store/reducers/manageSystemAttributesReducer";
import {isSavingCoursesChanges, ManageCoursesState} from "./ManageCoursesReducer";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import AddIcon from "@material-ui/icons/Add";
import {
    addNewCourse,
    cancelCoursesChanges, deleteCourse,
    onTextChanged,
    saveCoursesChanges,
    toggleAddNewCourse
} from "./ManageCoursesActions";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";

interface ManageCoursesProps {
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageCoursesLocalState: ManageCoursesState;
    toggleAddNewCourse: () => any;
    onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => any;
    addNewCourse: () => any;
    deleteCourse: (course: string) => any;
    saveCoursesChanges: () => any;
    cancelCoursesChanges: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageCoursesLocalState: state.ManageCoursesLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleAddNewCourse: () => dispatch(toggleAddNewCourse()),
        onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(onTextChanged(event)),
        addNewCourse: () => dispatch(addNewCourse()),
        deleteCourse: (course: string) => dispatch(deleteCourse(course)),
        saveCoursesChanges: () => dispatch(saveCoursesChanges()),
        cancelCoursesChanges: () => dispatch(cancelCoursesChanges())
    }
}

class ManageCourses extends Component<ManageCoursesProps, any> {
    render() {
        const {
            ManageSystemAttributesState,
            ManageCoursesLocalState,
            toggleAddNewCourse,
            onTextChanged,
            addNewCourse,
            deleteCourse,
            saveCoursesChanges,
            cancelCoursesChanges
        } = this.props;

        if (!successfullyLoadedSystemAttributes(ManageSystemAttributesState)) {
            return null;
        }

        return <Box>
            <Typography variant="h6" color="primary">Edit courses</Typography>

            <Box height="15px"/>

            <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => toggleAddNewCourse()}>
                {
                    !ManageCoursesLocalState.addingNewCourse
                        ? <AddIcon/>
                        : <CloseIcon/>
                }

                <Box
                    width="6px"
                />
                {
                    !ManageCoursesLocalState.addingNewCourse
                        ? "Add new course"
                        : "Cancel adding new course"
                }
            </Button>

            {
                !ManageCoursesLocalState.addingNewCourse
                    ? null
                    : <Box display="flex" flexDirection="row" alignItems="center" marginTop="10px">
                        <TextField variant="outlined" margin="dense" onChange={onTextChanged}/>
                        <Box width="15px"/>
                        <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => addNewCourse()}>Add</Button>
                      </Box>
            }

            <Box height="30px"/>

            {
                ManageCoursesLocalState.courses.map(course => (
                    <Box display="flex" flexDirection="row" alignItems="center" marginBottom="10px">
                        <Typography align="left" variant="body1">{course}
                        </Typography>
                        <Box width="10px"/>
                        <IconButton onClick={() => deleteCourse(course)} >
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                ))
            }

            <Box display="flex" flexDirection="row" marginTop="20px">
                <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => cancelCoursesChanges()}>Cancel changes</Button>
                <Box width="15px"/>
                <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => saveCoursesChanges()} disabled={isSavingCoursesChanges(ManageCoursesLocalState)}>
                    {
                        isSavingCoursesChanges(ManageCoursesLocalState)
                            ? "Saving ..."
                            : "Save changes"
                    }
                </Button>
            </Box>
        </Box>;
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(ManageCourses);