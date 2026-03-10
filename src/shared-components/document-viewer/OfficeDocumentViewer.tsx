import React, { Suspense } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from '@material-ui/core';
import { GetApp, OpenInNew } from '@material-ui/icons';
import { getDocumentType } from './documentViewerUtils';

const WordViewer = React.lazy(() => import('./WordViewer'));
const ExcelViewer = React.lazy(() => import('./ExcelViewer'));

interface OfficeDocumentViewerProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

const OfficeDocumentViewer: React.FC<OfficeDocumentViewerProps> = ({
  fileUrl,
  fileName,
  onDownload,
}) => {
  const docType = getDocumentType(fileName);

  if (!docType.useClientSide) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        padding="40px"
      >
        <Typography
          variant="body1"
          color="textSecondary"
          style={{ marginBottom: '16px' }}
        >
          This document could not be previewed. Use the buttons below to open
          or download.
        </Typography>
        <Box display="flex" style={{ gap: '16px' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<OpenInNew />}
            onClick={() => window.open(fileUrl, '_blank')}
          >
            Open in New Tab
          </Button>
          {onDownload && (
            <Button
              variant="outlined"
              startIcon={<GetApp />}
              onClick={onDownload}
            >
              Download
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Suspense
      fallback={
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="400px"
        >
          <CircularProgress />
          <Typography variant="body1" style={{ marginLeft: '16px' }}>
            Loading {docType.label}...
          </Typography>
        </Box>
      }
    >
      {docType.type === 'word' ? (
        <WordViewer
          fileUrl={fileUrl}
          fileName={fileName}
          onDownload={onDownload}
        />
      ) : docType.type === 'excel' ? (
        <ExcelViewer
          fileUrl={fileUrl}
          fileName={fileName}
          onDownload={onDownload}
        />
      ) : null}
    </Suspense>
  );
};

export default OfficeDocumentViewer;
