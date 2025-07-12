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
import { PitchDocument } from '../../models/project';

interface InlinePdfViewerProps {
    documents: PitchDocument[];
    shouldShowRiskWarningOnDownload?: boolean;
}

const InlinePdfViewer: React.FC<InlinePdfViewerProps> = ({ documents, shouldShowRiskWarningOnDownload }) => {
    const [loadingStates, setLoadingStates] = useState<{ [key: number]: boolean }>({});
    const [errorStates, setErrorStates] = useState<{ [key: number]: string | null }>({});

    const handleIframeLoad = (index: number) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
        setErrorStates(prev => ({ ...prev, [index]: null }));
    };

    const handleIframeError = (index: number) => {
        setLoadingStates(prev => ({ ...prev, [index]: false }));
        setErrorStates(prev => ({ ...prev, [index]: 'Failed to load PDF. Your browser may not support inline PDF viewing.' }));
    };

    const openInNewTab = (fileUrl: string) => {
        window.open(fileUrl, '_blank');
    };

    const downloadFile = (fileUrl: string) => {
        window.open(fileUrl, '_blank');
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

                return (
                    <Box key={index} marginBottom="30px">
                        {/* Document Header */}
                        <Paper elevation={1} style={{ padding: '12px', marginBottom: '16px' }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                                <Box display="flex" alignItems="center">
                                    <DescriptionIcon style={{ color: '#4caf50', fontSize: 24, marginRight: '8px' }} />
                                    <Box>
                                        <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                                            {document.fileName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            {document.readableSize}
                                        </Typography>
                                    </Box>
                                </Box>
                                
                                <Box display="flex" alignItems="center" style={{ gap: '8px' }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<OpenInNew />}
                                        onClick={() => openInNewTab(document.downloadURL)}
                                    >
                                        Open in New Tab
                                    </Button>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<GetApp />}
                                        onClick={() => downloadFile(document.downloadURL)}
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
                                        onClick={() => openInNewTab(document.downloadURL)}
                                    >
                                        Open in New Tab
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        startIcon={<GetApp />}
                                        onClick={() => downloadFile(document.downloadURL)}
                                    >
                                        Download PDF
                                    </Button>
                                </Box>
                            </Box>
                        ) : (
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
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default InlinePdfViewer;