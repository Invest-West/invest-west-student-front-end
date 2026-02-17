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
    Radio,
    Tabs,
    Tab
} from "@material-ui/core";
import { Close } from "@material-ui/icons";
import { css } from "aphrodite";
import sharedStyles from "../../../shared-js-css-styles/SharedStyles";
// @ts-ignore
import Files from "react-files";
import GroupRepository from "../../../api/repositories/GroupRepository";
import { ApiRoutes } from "../../../api/Api";
import firebase from "../../../firebase/firebaseApp";
import * as DB_CONST from "../../../firebase/databaseConsts";

interface EditGroupDetailsDialogProps {
    open: boolean;
    isCourse: boolean;
    groupUserName: string; // For courses, this is the parent university's groupUserName
    courseUserName?: string; // Only for courses
    groupAnid: string; // The anid of the group/course being edited
    currentName: string;
    currentLogoUrl?: string;
    currentDescription?: string;
    currentWebsite?: string;
    onClose: () => void;
    onSuccess: () => void;
}

interface EditGroupDetailsDialogState {
    activeTab: number;
    // Name
    newName: string;
    // Logo
    logoMode: "upload" | "url";
    logoUrl: string;
    selectedFile: File | null;
    // Description
    description: string;
    // Website
    website: string;
    // Status
    saving: boolean;
    uploading: boolean;
    error: string | null;
}

export default class EditGroupDetailsDialog extends Component<EditGroupDetailsDialogProps, EditGroupDetailsDialogState> {
    constructor(props: EditGroupDetailsDialogProps) {
        super(props);
        this.state = {
            activeTab: 0,
            newName: props.currentName,
            logoMode: "upload",
            logoUrl: props.currentLogoUrl || "",
            selectedFile: null,
            description: props.currentDescription || "",
            website: props.currentWebsite || "",
            saving: false,
            uploading: false,
            error: null
        };
    }

    componentDidUpdate(prevProps: EditGroupDetailsDialogProps) {
        // Reset state when dialog opens
        if (!prevProps.open && this.props.open) {
            this.setState({
                activeTab: 0,
                newName: this.props.currentName,
                logoMode: "upload",
                logoUrl: this.props.currentLogoUrl || "",
                selectedFile: null,
                description: this.props.currentDescription || "",
                website: this.props.currentWebsite || "",
                saving: false,
                uploading: false,
                error: null
            });
        }
    }

    handleTabChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
        this.setState({ activeTab: newValue, error: null });
    };

    handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ newName: event.target.value, error: null });
    };

    handleLogoModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({
            logoMode: event.target.value as "upload" | "url",
            error: null
        });
    };

    handleLogoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ logoUrl: event.target.value, error: null });
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
            error: "Error selecting file. Please make sure it's a valid image under 30MB.",
            selectedFile: null
        });
    };

    handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ description: event.target.value, error: null });
    };

    handleWebsiteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({ website: event.target.value, error: null });
    };

    handleSave = async () => {
        const { isCourse, groupUserName, courseUserName, groupAnid, currentName, currentLogoUrl, currentDescription, currentWebsite, onSuccess, onClose } = this.props;
        const { newName, logoMode, logoUrl, selectedFile, description, website } = this.state;

        this.setState({ error: null, saving: true });

        try {
            const groupRepository = new GroupRepository();
            const dbRef = isCourse ? DB_CONST.COURSES_CHILD : DB_CONST.GROUP_PROPERTIES_CHILD;

            // 1. Update name if changed
            const trimmedName = newName.trim();
            if (trimmedName && trimmedName !== currentName) {
                if (isCourse && courseUserName) {
                    await groupRepository.updateCourseName(groupUserName, courseUserName, trimmedName);
                } else {
                    await groupRepository.updateUniversityName(groupUserName, trimmedName);
                }
            }

            // 2. Update logo if changed
            if (logoMode === "upload" && selectedFile) {
                // Upload file first
                this.setState({ uploading: true });

                const formData = new FormData();
                formData.append("file", selectedFile);
                formData.append("fileName", `${isCourse ? courseUserName : groupUserName}-logo-${Date.now()}`);
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
                    throw new Error("Failed to upload logo file");
                }

                const data = await response.json();
                if (!data.url) {
                    throw new Error("Response missing URL field");
                }

                const uploadedLogoUrl: string = data.url;
                this.setState({ uploading: false });

                // Update the logo in database
                if (isCourse && courseUserName) {
                    await groupRepository.updateCourseImage(groupUserName, courseUserName, uploadedLogoUrl);
                } else {
                    await groupRepository.updateGroupLogo(groupUserName, uploadedLogoUrl);
                }
            } else if (logoMode === "url" && logoUrl && logoUrl !== currentLogoUrl) {
                // Update with new URL
                if (isCourse && courseUserName) {
                    await groupRepository.updateCourseImage(groupUserName, courseUserName, logoUrl);
                } else {
                    await groupRepository.updateGroupLogo(groupUserName, logoUrl);
                }
            }

            // 3. Update description and website directly via Firebase if changed
            const updates: { [key: string]: string } = {};
            if (description !== currentDescription) {
                updates.description = description;
            }
            if (website !== currentWebsite) {
                updates.website = website;
            }

            if (Object.keys(updates).length > 0) {
                await firebase
                    .database()
                    .ref(dbRef)
                    .child(groupAnid)
                    .update(updates);
            }

            this.setState({ saving: false });
            onSuccess();
            onClose();
        } catch (error) {
            this.setState({
                error: "Failed to save changes. Please try again.",
                saving: false,
                uploading: false
            });
        }
    };

    hasChanges = () => {
        const { currentName, currentLogoUrl, currentDescription, currentWebsite } = this.props;
        const { newName, logoMode, logoUrl, selectedFile, description, website } = this.state;

        const nameChanged = newName.trim() !== currentName;
        const logoChanged = (logoMode === "upload" && selectedFile) || (logoMode === "url" && logoUrl !== currentLogoUrl);
        const descriptionChanged = description !== (currentDescription || "");
        const websiteChanged = website !== (currentWebsite || "");

        return nameChanged || logoChanged || descriptionChanged || websiteChanged;
    };

    render() {
        const { open, onClose, isCourse, currentName, currentLogoUrl } = this.props;
        const { activeTab, newName, logoMode, logoUrl, selectedFile, description, website, saving, uploading, error } = this.state;

        const isProcessing = saving || uploading;
        const entityType = isCourse ? "Course" : "University";

        return (
            <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
                <DialogTitle style={{ margin: 0, padding: 0 }}>
                    <Box display="flex" flexDirection="row" alignItems="center" paddingX="15px" paddingY="10px">
                        <Box display="flex" flexGrow={1}>
                            <Typography variant="h6" align="left">
                                Edit {entityType} Details
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

                <Tabs
                    value={activeTab}
                    onChange={this.handleTabChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant="fullWidth"
                >
                    <Tab label="Name" disabled={isProcessing} />
                    <Tab label="Logo" disabled={isProcessing} />
                    <Tab label="About" disabled={isProcessing} />
                </Tabs>
                <Divider />

                <DialogContent style={{ margin: 0, padding: "20px", minHeight: "200px" }}>
                    {/* Name Tab */}
                    {activeTab === 0 && (
                        <Box display="flex" flexDirection="column">
                            <Typography variant="body2" color="textSecondary" style={{ marginBottom: "15px" }}>
                                Current name: <strong>{currentName}</strong>
                            </Typography>

                            <TextField
                                label={`New ${entityType} Name`}
                                value={newName}
                                onChange={this.handleNameChange}
                                variant="outlined"
                                fullWidth
                                disabled={isProcessing}
                                autoFocus
                                placeholder={`Enter new ${entityType.toLowerCase()} name`}
                            />
                        </Box>
                    )}

                    {/* Logo Tab */}
                    {activeTab === 1 && (
                        <Box display="flex" flexDirection="column">
                            {currentLogoUrl && (
                                <Box marginBottom="15px" textAlign="center">
                                    <Typography variant="body2" color="textSecondary" style={{ marginBottom: "10px" }}>
                                        Current logo:
                                    </Typography>
                                    <img
                                        src={currentLogoUrl}
                                        alt="Current logo"
                                        style={{ maxWidth: "150px", maxHeight: "100px", objectFit: "contain" }}
                                    />
                                </Box>
                            )}

                            <FormControl component="fieldset">
                                <RadioGroup value={logoMode} onChange={this.handleLogoModeChange} row>
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

                            <Box height="15px" />

                            {logoMode === "upload" && (
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

                            {logoMode === "url" && (
                                <TextField
                                    label="Logo URL"
                                    value={logoUrl}
                                    onChange={this.handleLogoUrlChange}
                                    variant="outlined"
                                    fullWidth
                                    disabled={isProcessing}
                                    placeholder="https://example.com/logo.png"
                                />
                            )}
                        </Box>
                    )}

                    {/* About Tab (Description + Website) */}
                    {activeTab === 2 && (
                        <Box display="flex" flexDirection="column">
                            <TextField
                                label="Description"
                                value={description}
                                onChange={this.handleDescriptionChange}
                                variant="outlined"
                                fullWidth
                                multiline
                                rows={4}
                                disabled={isProcessing}
                                placeholder={`Enter ${entityType.toLowerCase()} description`}
                                style={{ marginBottom: "20px" }}
                            />

                            <TextField
                                label="Website URL"
                                value={website}
                                onChange={this.handleWebsiteChange}
                                variant="outlined"
                                fullWidth
                                disabled={isProcessing}
                                placeholder="https://www.example.com"
                            />
                        </Box>
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
                                {uploading ? "Uploading logo..." : "Saving changes..."}
                            </Typography>
                        </Box>
                    )}
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
                        disabled={isProcessing || !this.hasChanges()}
                    >
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        );
    }
}
