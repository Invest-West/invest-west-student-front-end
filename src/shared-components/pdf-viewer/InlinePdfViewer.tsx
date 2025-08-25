import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Paper,
    List,
    ListItem
} from '@material-ui/core';
import { GetApp, OpenInNew } from '@material-ui/icons';
import DescriptionIcon from '@material-ui/icons/Description';
import PictureAsPdfIcon from '@material-ui/icons/PictureAsPdf';
import ImageIcon from '@material-ui/icons/Image';
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary';
import TableChartIcon from '@material-ui/icons/TableChart';
import { PitchDocument } from '../../models/project';

interface InlinePdfViewerProps {
    documents: PitchDocument[];
    shouldShowRiskWarningOnDownload?: boolean;
}

const InlinePdfViewer: React.FC<InlinePdfViewerProps> = ({ documents, shouldShowRiskWarningOnDownload }) => {
    const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
    const [errorStates, setErrorStates] = useState<{ [key: number]: string | null }>({});

    const getFileTypeInfo = (fileName: string) => {
        const extension = fileName.toLowerCase().split('.').pop();
        
        switch (extension) {
            case 'pdf':
                return { icon: PictureAsPdfIcon, color: '#f44336', label: 'PDF Document', isPdf: true };
            case 'doc':
            case 'docx':
                return { icon: DescriptionIcon, color: '#2196f3', label: 'Word Document', isPdf: false };
            case 'xls':
            case 'xlsx':
                return { icon: TableChartIcon, color: '#4caf50', label: 'Excel Spreadsheet', isPdf: false };
            case 'ppt':
            case 'pptx':
                return { icon: DescriptionIcon, color: '#ff9800', label: 'PowerPoint Presentation', isPdf: false };
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
            case 'bmp':
                return { icon: ImageIcon, color: '#9c27b0', label: 'Image File', isPdf: false };
            case 'mp4':
            case 'avi':
            case 'mov':
            case 'wmv':
                return { icon: VideoLibraryIcon, color: '#607d8b', label: 'Video File', isPdf: false };
            case 'txt':
                return { icon: DescriptionIcon, color: '#795548', label: 'Text File', isPdf: false };
            default:
                return { icon: DescriptionIcon, color: '#4caf50', label: 'Document', isPdf: false };
        }
    };

    const handleIframeLoad = (index: number) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
        setErrorStates(prev => ({ ...prev, [index]: null }));
    };

    const handleIframeError = (index: number) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
        setErrorStates(prev => ({ ...prev, [index]: 'Failed to load PDF. Your browser may not support inline PDF viewing.' }));
    };

    const openInNewTab = (fileUrl: string, fileName: string) => {
        const fileInfo = getFileTypeInfo(fileName);
        if (fileInfo.isPdf) {
            // For PDFs, open in new tab
            window.open(fileUrl, '_blank');
        } else {
            // For non-PDFs, open in new tab but don't force download
            window.open(fileUrl, '_blank');
        }
    };

    const downloadFile = (fileUrl: string, fileName: string) => {
        const fileInfo = getFileTypeInfo(fileName);
        if (fileInfo.isPdf) {
            // For PDFs, open in new tab for download
            window.open(fileUrl, '_blank');
        } else {
            // For non-PDF files, create a temporary link to force download
            const link = document.createElement('a');
            link.href = fileUrl;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    if (!documents || documents.length === 0) {
        return null;
    }

    const validDocuments = documents.filter(doc => doc.removed !== true);

    if (validDocuments.length === 0) {
        return null;
    }

    return (
        <Box marginTop="20px">
            {validDocuments.map((document, index) => {
                const isLoading = loadingStates[index] !== false;
                const error = errorStates[index];
                const fileInfo = getFileTypeInfo(document.fileName);
                const IconComponent = fileInfo.icon;

                return (
                    <Box key={index} marginBottom="30px">
                        {/* Document Header */}
                        <Paper elevation={1} style={{ padding: '12px', marginBottom: '16px' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                                <Box display="flex" alignItems="center">
                                    <IconComponent style={{ color: fileInfo.color, fontSize: 24, marginRight: '8px' }} />
                                    <Box>
                                        <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                            {document.fileName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {document.readableSize} • {fileInfo.label}
                                        </Typography>
                                        {document.description && (
                                            <Typography variant="body2" color="textSecondary" style={{fontStyle: 'italic', marginTop: '4px'}}>
                                                {document.description}
                                            </Typography>
                                        )}
                                    </Box>
                                </Box>
                                
                                <Box display="flex" alignItems="center" style={{ gap: '8px' }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<OpenInNew />}
                                        onClick={() => openInNewTab(document.downloadURL, document.fileName)}
                                    >
                                        Open in New Tab
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<GetApp />}
                                        onClick={() => downloadFile(document.downloadURL, document.fileName)}
                                    >
                                        Download
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>

                        {/* PDF Content */}
                        {error ? (
                            <Box display="flex" flexDirection="column" alignItems="center" padding="20px">
                                <Typography variant="body1" color="error" style={{ marginBottom: '16px' }}>
                                    {error}
                                </Typography>
                                <Box display="flex" style={{ gap: '16px' }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<OpenInNew />}
                                        onClick={() => openInNewTab(document.downloadURL, document.fileName)}
                                    >
                                        Open in New Tab
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<GetApp />}
                                        onClick={() => downloadFile(document.downloadURL, document.fileName)}
                                    >
                                        Download {fileInfo.label}
                                    </Button>
                                </Box>
                            </Box>
                        ) : fileInfo.isPdf ? (
                            <>
                                {/* Loading indicator */}
                                {isLoading && (
                                    <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                                        <CircularProgress />
                                        <Typography variant="body1" style={{ marginLeft: '16px' }}>
                                            Loading PDF...
                                        </Typography>
                                    </Box>
                                )}

                                {/* PDF Iframe */}
                                <Box 
                                    style={{ 
                                        display: isLoading ? 'none' : 'block',
                                        height: '600px',
                                        width: '100%',
                                        border: '1px solid #ddd',
                                        borderRadius: '4px'
                                    }}
                                >
                                    <iframe
                                        src={`${document.downloadURL}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none', borderRadius: '4px' }}
                                        onLoad={() => handleIframeLoad(index)}
                                        onError={() => handleIframeError(index)}
                                        title={document.fileName}
                                    />
                                </Box>
                            </>
                        ) : (
                            <Box display="flex" flexDirection="column" alignItems="center" padding="40px">
                                <IconComponent style={{ fontSize: 64, color: fileInfo.color, marginBottom: '16px' }} />
                                <Typography variant="h6" style={{ marginBottom: '8px' }}>
                                    {fileInfo.label}
                                </Typography>
                                <Typography variant="body2" color="textSecondary" style={{ marginBottom: '24px' }}>
                                    This file type cannot be previewed in the browser. Use the buttons above to open or download.
                                </Typography>
                            </Box>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default InlinePdfViewer;