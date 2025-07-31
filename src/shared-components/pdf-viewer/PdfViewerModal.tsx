import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Box,
    Typography
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import PdfViewer from './PdfViewer';

interface PdfViewerModalProps {
    open: boolean;
    onClose: () => void;
    fileUrl: string;
    fileName: string;
    onDownload?: () => void;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
    open,
    onClose,
    fileUrl,
    fileName,
    onDownload
}) => {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                style: {
                    height: '90vh',
                    maxHeight: '90vh'
                }
            }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6" component="div" style={{ fontWeight: 'bold' }}>
                        {fileName}
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>
            
            <DialogContent style={{ padding: '0 24px', overflow: 'hidden' }}>
                <PdfViewer
                    fileUrl={fileUrl}
                    fileName={fileName}
                    onDownload={onDownload}
                />
            </DialogContent>
            
            <DialogActions>
                <Button onClick={onClose} color="primary">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PdfViewerModal;