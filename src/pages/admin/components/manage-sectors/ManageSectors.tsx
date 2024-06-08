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
import {isSavingSectorsChanges, ManageSectorsState} from "./ManageSectorsReducer";
import {css} from "aphrodite";
import sharedStyles from "../../../../shared-js-css-styles/SharedStyles";
import AddIcon from "@material-ui/icons/Add";
import {
    addNewSector,
    cancelSectorsChanges, deleteSector,
    onTextChanged,
    saveSectorsChanges,
    toggleAddNewSector
} from "./ManageSectorsActions";
import CloseIcon from "@material-ui/icons/Close";
import DeleteIcon from "@material-ui/icons/Delete";

interface ManageSectorsProps {
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageSectorsLocalState: ManageSectorsState;
    toggleAddNewSector: () => any;
    onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => any;
    addNewSector: () => any;
    deleteSector: (sector: string) => any;
    saveSectorsChanges: () => any;
    cancelSectorsChanges: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageSectorsLocalState: state.ManageSectorsLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        toggleAddNewSector: () => dispatch(toggleAddNewSector()),
        onTextChanged: (event: React.ChangeEvent<HTMLInputElement>) => dispatch(onTextChanged(event)),
        addNewSector: () => dispatch(addNewSector()),
        deleteSector: (sector: string) => dispatch(deleteSector(sector)),
        saveSectorsChanges: () => dispatch(saveSectorsChanges()),
        cancelSectorsChanges: () => dispatch(cancelSectorsChanges())
    }
}

class ManageSectors extends Component<ManageSectorsProps, any> {
    render() {
        const {
            ManageSystemAttributesState,
            ManageSectorsLocalState,
            toggleAddNewSector,
            onTextChanged,
            addNewSector,
            deleteSector,
            saveSectorsChanges,
            cancelSectorsChanges
        } = this.props;

        if (!successfullyLoadedSystemAttributes(ManageSystemAttributesState)) {
            return null;
        }

        return <Box>
            <Typography variant="h6" color="primary">Edit sectors</Typography>

            <Box height="15px"/>

            <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => toggleAddNewSector()}>
                {
                    !ManageSectorsLocalState.addingNewSector
                        ? <AddIcon/>
                        : <CloseIcon/>
                }

                <Box
                    width="6px"
                />
                {
                    !ManageSectorsLocalState.addingNewSector
                        ? "Add new sector"
                        : "Cancel adding new sector"
                }
            </Button>

            {
                !ManageSectorsLocalState.addingNewSector
                    ? null
                    : <Box display="flex" flexDirection="row" alignItems="center" marginTop="10px">
                        <TextField variant="outlined" margin="dense" onChange={onTextChanged}/>
                        <Box width="15px"/>
                        <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => addNewSector()}>Add</Button>
                      </Box>
            }

            <Box height="30px"/>

            {
                ManageSectorsLocalState.sectors.map(sector => (
                    <Box display="flex" flexDirection="row" alignItems="center" marginBottom="10px">
                        <Typography align="left" variant="body1">{sector}
                        </Typography>
                        <Box width="10px"/>
                        <IconButton onClick={() => deleteSector(sector)} >
                            <DeleteIcon fontSize="small"/>
                        </IconButton>
                    </Box>
                ))
            }

            <Box display="flex" flexDirection="row" marginTop="20px">
                <Button className={css(sharedStyles.no_text_transform)} variant="outlined" onClick={() => cancelSectorsChanges()}>Cancel changes</Button>
                <Box width="15px"/>
                <Button className={css(sharedStyles.no_text_transform)} variant="contained" color="primary" onClick={() => saveSectorsChanges()} disabled={isSavingSectorsChanges(ManageSectorsLocalState)}>
                    {
                        isSavingSectorsChanges(ManageSectorsLocalState)
                            ? "Saving ..."
                            : "Save changes"
                    }
                </Button>
            </Box>
        </Box>;
    }

}

export default connect(mapStateToProps, mapDispatchToProps)(ManageSectors);