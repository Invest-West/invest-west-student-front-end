/* eslint-disable jsx-a11y/img-redundant-alt */
import React, {Component} from "react";
import {connect} from "react-redux";
import {AppState} from "../../redux-store/reducers";
import {ThunkDispatch} from "redux-thunk";
import {AnyAction} from "redux";
import {PitchDocument} from "../../models/project";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    List,
    ListItem,
    Typography
} from "@material-ui/core";
import DescriptionIcon from '@material-ui/icons/Description';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import ImageIcon from '@material-ui/icons/Image';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import TableChartIcon from '@material-ui/icons/TableChart';
import {DocumentsDownloadState} from "./DocumentsDownloadReducer";
import {onAcceptRiskWarningClick, onCancelRiskWarningClick, onDocumentClick, onClosePdfViewer} from "./DocumentsDownloadActions";
import {css} from "aphrodite";
import sharedStyles from "../../shared-js-css-styles/SharedStyles";
import {ManageSystemAttributesState} from "../../redux-store/reducers/manageSystemAttributesReducer";
import {getGroupRouteTheme, ManageGroupUrlState} from "../../redux-store/reducers/manageGroupUrlReducer";
import CustomLink from "../../shared-js-css-styles/CustomLink";
import Routes from "../../router/routes";
import PdfViewerModal from "../pdf-viewer/PdfViewerModal";

interface DocumentsDownloadProps {
    ManageSystemAttributesState: ManageSystemAttributesState;
    ManageGroupUrlState: ManageGroupUrlState;
    documents: PitchDocument[];
    shouldShowRiskWarningOnDownload?: boolean;
    DocumentsDownloadLocalState: DocumentsDownloadState;
    onDocumentClick: (document: PitchDocument, shouldShowRiskWarning: boolean) => any;
    onAcceptRiskWarningClick: () => any;
    onCancelRiskWarningClick: () => any;
    onClosePdfViewer: () => any;
}

const mapStateToProps = (state: AppState) => {
    return {
        ManageSystemAttributesState: state.ManageSystemAttributesState,
        ManageGroupUrlState: state.ManageGroupUrlState,
        DocumentsDownloadLocalState: state.DocumentsDownloadLocalState
    }
}

const mapDispatchToProps = (dispatch: ThunkDispatch<any, any, AnyAction>) => {
    return {
        onDocumentClick: (document: PitchDocument, shouldShowRiskWarning: boolean) => dispatch(onDocumentClick(document, shouldShowRiskWarning)),
        onAcceptRiskWarningClick: () => dispatch(onAcceptRiskWarningClick()),
        onCancelRiskWarningClick: () => dispatch(onCancelRiskWarningClick()),
        onClosePdfViewer: () => dispatch(onClosePdfViewer())
    }
}

class DocumentsDownload extends Component<DocumentsDownloadProps, any> {
    
    getFileTypeInfo = (fileName: string) => {
        const extension = fileName.toLowerCase().split('.').pop();
        
        switch (extension) {
            case 'pdf':
                return { icon: PictureAsPdfIcon, color: '#f44336', label: 'PDF Document' };
            case 'doc':
            case 'docx':
                return { icon: DescriptionIcon, color: '#2196f3', label: 'Word Document' };
            case 'xls':
            case 'xlsx':
                return { icon: TableChartIcon, color: '#4caf50', label: 'Excel Spreadsheet' };
            case 'ppt':
            case 'pptx':
                return { icon: DescriptionIcon, color: '#ff9800', label: 'PowerPoint Presentation' };
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return { icon: ImageIcon, color: '#9c27b0', label: 'Image File' };
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
                return { icon: VideoLibraryIcon, color: '#607d8b', label: 'Video File' };
            case 'txt':
                return { icon: DescriptionIcon, color: '#795548', label: 'Text File' };
            default:
                return { icon: DescriptionIcon, color: '#4caf50', label: 'Document' };
        }
    };

    render() {
        const {
            ManageSystemAttributesState,
            ManageGroupUrlState,
            documents,
            shouldShowRiskWarningOnDownload,
            DocumentsDownloadLocalState,
            onDocumentClick,
            onAcceptRiskWarningClick,
            onCancelRiskWarningClick,
            onClosePdfViewer
        } = this.props;

        if (!documents || documents.length === 0) {
            return null;
        }

        if (!ManageSystemAttributesState.systemAttributes) {
            return null;
        }

        let riskWarningFooter = ManageSystemAttributesState.systemAttributes.riskWarningFooter;
        riskWarningFooter = riskWarningFooter
            .split("%groupName%")
            .join(ManageGroupUrlState.group
                ? ManageGroupUrlState.group.displayName
                : "Student Showcase"
            );

        let riskWarningTextSplits = riskWarningFooter.split("%URL%");

        return <Box
            marginTop="20px"
        >
            <List>
                {
                    documents.map((document, index) => (
                        document.removed !== undefined && document.removed
                            ? null
                            : <ListItem
                                key={index}
                                button
                                onClick={() => onDocumentClick(document, shouldShowRiskWarningOnDownload ?? false)}
                            >
                                {(() => {
                                    const fileInfo = this.getFileTypeInfo(document.fileName);
                                    const IconComponent = fileInfo.icon;
                                    return <IconComponent style={{ color: fileInfo.color, fontSize: 48 }} />;
                                })()}
                                <Box display="flex" flexDirection="column" marginLeft="12px">
                                    <Typography variant="body2" align="left">{document.fileName}</Typography>
                                    <Typography variant="body2" color="textSecondary" align="left">{document.readableSize}</Typography>
                                    {document.description && (
                                        <Typography variant="body2" color="textSecondary" align="left" style={{fontStyle: 'italic', marginTop: 4}}>
                                            {document.description}
                                        </Typography>
                                    )}
                                </Box>
                            </ListItem>
                    ))
                }
            </List>

            <Dialog
                open={DocumentsDownloadLocalState.openRiskWarningDialog}
                onClose={() => onCancelRiskWarningClick()}
            >
                <DialogTitle>Accept Risk Warning</DialogTitle>
                <DialogContent>
                    <Box marginTop="18px" whiteSpace="pre-line" >
                        <Typography variant="body1" align="justify" >
                            {riskWarningTextSplits[0]}
                            <CustomLink
                                url={Routes.nonGroupRiskWarning}
                                target="_blank"
                                color={getGroupRouteTheme(ManageGroupUrlState).palette.error.main}
                                activeColor="none"
                                activeUnderline={true}
                                component="nav-link"
                                childComponent={
                                    riskWarningTextSplits[1]
                                }
                            />
                            {riskWarningTextSplits[2]}
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Box display="flex" flexDirection="row" marginRight="4px" marginBottom="4px" >
                        <Button
                            className={css(sharedStyles.no_text_transform)}
                            onClick={() => onCancelRiskWarningClick()}
                        >Cancel</Button>
                        <Box width="14px" />
                        <Button
                            color="primary"
                            variant="contained"
                            className={css(sharedStyles.no_text_transform)}
                            onClick={() => onAcceptRiskWarningClick()}
                        >Accept</Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* PDF Viewer Modal */}
            {DocumentsDownloadLocalState.selectedDocument && (
                <PdfViewerModal
                    open={DocumentsDownloadLocalState.openPdfViewer}
                    onClose={onClosePdfViewer}
                    fileUrl={DocumentsDownloadLocalState.selectedDocument.downloadURL}
                    fileName={DocumentsDownloadLocalState.selectedDocument.fileName}
                    onDownload={() => window.open(DocumentsDownloadLocalState.selectedDocument!.downloadURL, "_blank")}
                />
            )}
        </Box>;
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(DocumentsDownload);