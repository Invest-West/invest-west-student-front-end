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
    CircularProgress,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { css } from "aphrodite";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
// @ts-ignore
import Files from "react-files";
import GroupRepository from "../../../api/repositories/GroupRepository";
import Api, { ApiRoutes } from "../../../api/Api";
import firebase from "../../../firebase/firebaseApp";

interface EditCourseImageDialogProps {
    open: boolean;
    groupUserName: string;
    courseUserName: string;
    currentImageUrl?: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface EditCourseImageDialogState {
    mode: "upload" | "url";
    imageUrl: string;
    selectedFile: File | null;
    uploading: boolean;
    updating: boolean;
    error: string | null;
}

export default class EditCourseImageDialog extends Component<EditCourseImageDialogProps, EditCourseImageDialogState> {
    constructor(props: EditCourseImageDialogProps) {
        super(props);
        this.state = {
            mode: "upload",
            imageUrl: props.currentImageUrl || "",
            selectedFile: null,
            uploading: false,
            updating: false,
            error: null
        };
    }

    handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            mode: event.target.value as "upload" | "url",
            error: null
        });
    };

    handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ imageUrl: event.target.value });
    };

    handleFileChange = (files: File[]) => {
        if (files && files.length > 0) {
            this.setState({
                selectedFile: files[0],
                error: null
            });
        }
    };

    handleFileError = (error: any, file: File) => {
        this.setState({
            error: "Error uploading file. Please make sure it's a valid image under 30MB.",
            selectedFile: null
        });
    };

    handleSave = async () => {
        const { mode, imageUrl, selectedFile } = this.state;
        const { groupUserName, courseUserName, onSuccess, onClose } = this.props;

        this.setState({ error: null });

        try {
            let finalImageUrl = imageUrl;

            // If mode is upload, first upload the file
            if (mode === "upload") {
                if (!selectedFile) {
                    this.setState({ error: "Please select a file to upload" });
                    return;
                }

                this.setState({ uploading: true });

                // Upload file to backend
                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("fileName", `${courseUserName}-logo-${Date.now()}`);
                formData.append("storageLocation", "PlainLogos");

                const idToken = await firebase.auth().currentUser?.getIdToken();
                const response = await fetch(
                    `${process.env.REACT_APP_BACK_END_BASE_URL}${ApiRoutes.uploadSingleFileRoute}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: idToken || ""
                        },
                        body: formData
                    }
                );

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Failed to upload file: ${response.status}`);
                }

                const responseText = await response.text();

                if (!responseText) {
                    throw new Error("Empty response from server");
                }

                const data = JSON.parse(responseText);
                finalImageUrl = data.url;
                this.setState({ uploading: false });
            } else {
                // Validate URL
                if (!imageUrl || imageUrl.trim() === "") {
                    this.setState({ error: "Please enter a valid image URL" });
                    return;
                }
            }

            // Update the course image
            this.setState({ updating: true });
            const groupRepository = new GroupRepository();
            await groupRepository.updateCourseImage(groupUserName, courseUserName, finalImageUrl);

            this.setState({ updating: false });
            onSuccess();
            onClose();
        } catch (error) {
            this.setState({
                error: "Failed to save image. Please try again.",
                uploading: false,
                updating: false
            });
        }
    };

    render() {
        const { open, onClose } = this.props;
        const { mode, imageUrl, selectedFile, uploading, updating, error } = this.state;

        const isProcessing = uploading || updating;

        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle style={{ margin: 0, padding: 0 }}>
                    <Box display="flex" flexDirection="row" alignItems="center" paddingX="15px" paddingY="10px">
                        <Box display="flex" flexGrow={1}>
                            <Typography variant="h6" align="left">
                                Update Course Image
                            </Typography>
                        </Box>
                        <Box display="flex" flexGrow={1} justifyContent="flex-end">
                            <IconButton onClick={onClose} disabled={isProcessing}>
                                <Close />
                            </IconButton>
                        </Box>
                    </Box>
                </DialogTitle>
                <Divider />
                <DialogContent style={{ margin: 0, padding: "20px" }}>
                    <Box display="flex" flexDirection="column">
                        {/* Mode selector */}
                        <FormControl component="fieldset">
                            <RadioGroup value={mode} onChange={this.handleModeChange} row>
                                <FormControlLabel
                                    value="upload"
                                    control={<Radio color="primary" />}
                                    label="Upload file"
                                    disabled={isProcessing}
                                />
                                <FormControlLabel
                                    value="url"
                                    control={<Radio color="primary" />}
                                    label="Enter URL"
                                    disabled={isProcessing}
                                />
                            </RadioGroup>
                        </FormControl>

                        <Box height="20px" />

                        {/* Upload mode */}
                        {mode === "upload" && (
                            <Box>
                                <Files
                                    onChange={this.handleFileChange}
                                    onError={this.handleFileError}
                                    accepts={["image/png", "image/jpg", "image/jpeg"]}
                                    maxFileSize={30000000}
                                    minFileSize={0}
                                    multiple={false}
                                    clickable
                                >
                                    <Button
                                        className={css(sharedStyles.no_text_transform)}
                                        variant="outlined"
                                        color="primary"
                                        disabled={isProcessing}
                                        fullWidth
                                    >
                                        {selectedFile ? `Selected: ${selectedFile.name}` : "Choose file"}
                                    </Button>
                                </Files>
                                {selectedFile && (
                                    <Box marginTop="10px">
                                        <Typography variant="caption" color="textSecondary">
                                            File size: {(selectedFile.size / 1024).toFixed(2)} KB
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        )}

                        {/* URL mode */}
                        {mode === "url" && (
                            <TextField
                                label="Image URL"
                                value={imageUrl}
                                onChange={this.handleUrlChange}
                                variant="outlined"
                                fullWidth
                                disabled={isProcessing}
                                placeholder="https://example.com/course-logo.png"
                            />
                        )}

                        {/* Error message */}
                        {error && (
                            <Box marginTop="15px">
                                <Typography variant="body2" color="error">
                                    {error}
                                </Typography>
                            </Box>
                        )}

                        {/* Processing indicator */}
                        {isProcessing && (
                            <Box display="flex" alignItems="center" marginTop="15px">
                                <CircularProgress size={20} />
                                <Box width="10px" />
                                <Typography variant="body2">
                                    {uploading ? "Uploading file..." : "Updating image..."}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </DialogContent>
                <Divider />
                <DialogActions style={{ margin: 0, padding: "20px" }}>
                    <Button onClick={onClose} disabled={isProcessing}>
                        Cancel
                    </Button>
                    <Button
                        className={css(sharedStyles.no_text_transform)}
                        variant="contained"
                        color="primary"
                        onClick={this.handleSave}
                        disabled={isProcessing || (mode === "upload" && !selectedFile) || (mode === "url" && !imageUrl)}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
