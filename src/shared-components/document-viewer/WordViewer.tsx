import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@material-ui/core';
import { GetApp, OpenInNew } from '@material-ui/icons';
import { getProxiedFileUrl } from './documentViewerUtils';

interface WordViewerProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

const WordViewer: React.FC<WordViewerProps> = ({ fileUrl, fileName, onDownload }) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        const mammoth = await import('mammoth/mammoth.browser');
        const response = await fetch(getProxiedFileUrl(fileUrl));
        if (!response.ok) {
          throw new Error(`Failed to fetch document: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });

        if (!cancelled) {
          setHtmlContent(result.value);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load document');
          setLoading(false);
        }
      }
    };

    loadDocument();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
        <Typography variant="body1" style={{ marginLeft: '16px' }}>
          Loading Word document...
        </Typography>
      </Box>
    );
  }

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
            onClick={() => window.open(fileUrl, '_blank')}
          >
            Open in New Tab
          </Button>
          {onDownload && (
            <Button variant="outlined" startIcon={<GetApp />} onClick={onDownload}>
              Download
            </Button>
          )}
        </Box>
      </Box>
    );
  }

  return (
    <Box
      style={{
        padding: '24px',
        maxHeight: '600px',
        overflow: 'auto',
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '4px',
      }}
    >
      <style>{`
        .mammoth-content p { margin: 0 0 10px 0; line-height: 1.6; }
        .mammoth-content h1 { font-size: 2em; margin: 16px 0 8px; }
        .mammoth-content h2 { font-size: 1.5em; margin: 14px 0 6px; }
        .mammoth-content h3 { font-size: 1.17em; margin: 12px 0 4px; }
        .mammoth-content table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        .mammoth-content td, .mammoth-content th { border: 1px solid #ddd; padding: 8px; }
        .mammoth-content img { max-width: 100%; height: auto; }
        .mammoth-content ul, .mammoth-content ol { margin: 8px 0; padding-left: 24px; }
      `}</style>
      <div className="mammoth-content" dangerouslySetInnerHTML={{ __html: htmlContent }} />
    </Box>
  );
};

export default WordViewer;
