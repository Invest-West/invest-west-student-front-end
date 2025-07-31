import React, { useState } from 'react';
import { Box, Button, Typography, CircularProgress, Paper } from '@material-ui/core';
import { GetApp, OpenInNew } from '@material-ui/icons';

interface PdfViewerProps {
    fileUrl: string;
    fileName: string;
    onDownload?: () => void;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl, fileName, onDownload }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleIframeLoad = () => {
        setLoading(false);
        setError(null);
    };

    const handleIframeError = () => {
        setLoading(false);
        setError('Failed to load PDF. Your browser may not support inline PDF viewing.');
    };

    const openInNewTab = () => {
        window.open(fileUrl, '_blank');
    };

    if (error) {
        return (
            <Box display="flex" flexDirection="column" alignItems="center" padding="20px">
                <Typography variant="body1" color="error" style={{ marginBottom: '16px' }}>
                    {error}
                </Typography>
                <Box display="flex" style={{ gap: '16px' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<OpenInNew />}
                        onClick={openInNewTab}
                    >
                        Open in New Tab
                    </Button>
                    <Button
                        variant="outlined"
                        startIcon={<GetApp />}
                        onClick={onDownload}
                    >
                        Download PDF
                    </Button>
                </Box>
            </Box>
        );
    }

    return (
        <Box>
            {/* PDF Controls */}
            <Paper elevation={1} style={{ padding: '8px', marginBottom: '16px' }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap">
                    <Typography variant="body1" style={{ fontWeight: 'bold' }}>
                        {fileName}
                    </Typography>
                    
                    <Box display="flex" alignItems="center" style={{ gap: '8px' }}>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<OpenInNew />}
                            onClick={openInNewTab}
                        >
                            Open in New Tab
                        </Button>
                        <Button
                            size="small"
                            variant="outlined"
                            startIcon={<GetApp />}
                            onClick={onDownload}
                        >
                            Download
                        </Button>
                    </Box>
                </Box>
            </Paper>

            {/* Loading indicator */}
            {loading && (
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
                    display: loading ? 'none' : 'block',
                    height: '70vh',
                    width: '100%'
                }}
            >
                <iframe
                    src={`${fileUrl}#toolbar=1&navpanes=1&scrollbar=1&view=FitH`}
                    width="100%"
                    height="100%"
                    style={{ border: 'none' }}
                    onLoad={handleIframeLoad}
                    onError={handleIframeError}
                    title={fileName}
                />
            </Box>
        </Box>
    );
};

export default PdfViewer;