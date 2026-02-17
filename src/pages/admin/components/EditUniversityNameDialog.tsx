import React, { Component } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    TextField,
    Typography,
    CircularProgress
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { css } from "aphrodite";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
import GroupRepository from "../../../api/repositories/GroupRepository";

interface EditUniversityNameDialogProps {
    open: boolean;
    groupUserName: string;
    currentName: string;
    onClose: () => void;
    onSuccess: (newName: string) => void;
}

interface EditUniversityNameDialogState {
    newName: string;
    updating: boolean;
    error: string | null;
}

export default class EditUniversityNameDialog extends Component<EditUniversityNameDialogProps, EditUniversityNameDialogState> {
    constructor(props: EditUniversityNameDialogProps) {
        super(props);
        this.state = {
            newName: props.currentName,
            updating: false,
            error: null
        };
    }

    componentDidUpdate(prevProps: EditUniversityNameDialogProps) {
        if (prevProps.currentName !== this.props.currentName) {
            this.setState({ newName: this.props.currentName });
        }
        if (!prevProps.open && this.props.open) {
            this.setState({
                newName: this.props.currentName,
                error: null
            });
        }
    }

    handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ newName: event.target.value, error: null });
    };

    handleSave = async () => {
        const { newName } = this.state;
        const { groupUserName, currentName, onSuccess, onClose } = this.props;

        const trimmedName = newName.trim();

        if (!trimmedName) {
            this.setState({ error: "Please enter a university name" });
            return;
        }

        if (trimmedName === currentName) {
            this.setState({ error: "New name is the same as current name" });
            return;
        }

        this.setState({ error: null, updating: true });

        try {
            const groupRepository = new GroupRepository();
            await groupRepository.updateUniversityName(groupUserName, trimmedName);

            this.setState({ updating: false });
            onSuccess(trimmedName);
            onClose();
        } catch (error) {
            console.error("Error updating university name:", error);
            this.setState({
                error: "Failed to update university name. Please try again.",
                updating: false
            });
        }
    };

    render() {
        const { open, onClose, currentName } = this.props;
        const { newName, updating, error } = this.state;

        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle style={{ margin: 0, padding: 0 }}>
                    <Box display="flex" flexDirection="row" alignItems="center" paddingX="15px" paddingY="10px">
                        <Box display="flex" flexGrow={1}>
                            <Typography variant="h6" align="left">
                                Edit University Name
                            </Typography>
                        </Box>
                        <Box display="flex" flexGrow={1} justifyContent="flex-end">
                            <IconButton onClick={onClose} disabled={updating}>
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
                <Divider />
                <DialogContent style={{ margin: 0, padding: "20px" }}>
                    <Box display="flex" flexDirection="column">
                        <Typography variant="body2" color="textSecondary" style={{ marginBottom: "15px" }}>
                            Current name: <strong>{currentName}</strong>
                        </Typography>

                        <TextField
                            label="New University Name"
                            value={newName}
                            onChange={this.handleNameChange}
                            variant="outlined"
                            fullWidth
                            disabled={updating}
                            autoFocus
                            placeholder="Enter new university name"
                        />

                        {error && (
                            <Box marginTop="15px">
                                <Typography variant="body2" color="error">
                                    {error}
                                </Typography>
                            </Box>
                        )}

                        {updating && (
                            <Box display="flex" alignItems="center" marginTop="15px">
                                <CircularProgress size={20} />
                                <Box width="10px" />
                                <Typography variant="body2">
                                    Updating university name...
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions style={{ margin: 0, padding: "20px" }}>
                    <Button onClick={onClose} disabled={updating}>
                        Cancel
                    </Button>
                    <Button
                        className={css(sharedStyles.no_text_transform)}
                        variant="contained"
                        color="primary"
                        onClick={this.handleSave}
                        disabled={updating || !newName.trim() || newName.trim() === currentName}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
