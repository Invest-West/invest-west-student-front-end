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
import { getDocumentType } from '../document-viewer/documentViewerUtils';
import OfficeDocumentViewer from '../document-viewer/OfficeDocumentViewer';

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
    const docType = getDocumentType(fileName);

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
                        <Typography
                            component="span"
                            variant="caption"
                            style={{
                                marginLeft: '8px',
                                color: docType.color,
                                fontWeight: 'normal'
                            }}
                        >
                            {docType.label}
                        </Typography>
                    </Typography>
                    <IconButton onClick={onClose} size="small">
                        <Close />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent style={{ padding: '0 24px', overflow: docType.type === 'pdf' ? 'hidden' : 'auto' }}>
                {docType.type === 'pdf' ? (
                    <PdfViewer
                        fileUrl={fileUrl}
                        fileName={fileName}
                        onDownload={onDownload}
                    />
                ) : docType.canPreview ? (
                    <OfficeDocumentViewer
                        fileUrl={fileUrl}
                        fileName={fileName}
                        onDownload={onDownload}
                    />
                ) : null}
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