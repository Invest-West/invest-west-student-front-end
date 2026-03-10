import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  Tab,
  Tabs,
} from '@material-ui/core';
import { GetApp, OpenInNew } from '@material-ui/icons';
import { getProxiedFileUrl } from './documentViewerUtils';

interface ExcelViewerProps {
  fileUrl: string;
  fileName: string;
  onDownload?: () => void;
}

const ExcelViewer: React.FC<ExcelViewerProps> = ({
  fileUrl,
  fileName,
  onDownload,
}) => {
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sheetHtmlMap, setSheetHtmlMap] = useState<Record<string, string>>({});
  const [activeSheet, setActiveSheet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSpreadsheet = async () => {
      try {
        setLoading(true);
        setError(null);

        const XLSX = await import('xlsx');
        const response = await fetch(getProxiedFileUrl(fileUrl));
        if (!response.ok) {
          throw new Error(
            `Failed to fetch spreadsheet: ${response.statusText}`
          );
        }
        const arrayBuffer = await response.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        if (!cancelled) {
          const htmlMap: Record<string, string> = {};
          for (const name of workbook.SheetNames) {
            const ws = workbook.Sheets[name];
            htmlMap[name] = XLSX.utils.sheet_to_html(ws);
          }
          setSheetNames(workbook.SheetNames);
          setSheetHtmlMap(htmlMap);
          setActiveSheet(0);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to load spreadsheet'
          );
          setLoading(false);
        }
      }
    };

    loadSpreadsheet();
    return () => {
      cancelled = true;
    };
  }, [fileUrl]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="400px"
      >
        <CircularProgress />
        <Typography variant="body1" style={{ marginLeft: '16px' }}>
          Loading spreadsheet...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        padding="20px"
      >
        <Typography
          variant="body1"
          color="error"
          style={{ marginBottom: '16px' }}
        >
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

  const currentSheetName = sheetNames[activeSheet];
  const currentHtml = sheetHtmlMap[currentSheetName] || '';

  return (
    <Box>
      {sheetNames.length > 1 && (
        <Tabs
          value={activeSheet}
          onChange={(_, newValue) => setActiveSheet(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          style={{ borderBottom: '1px solid #ddd', marginBottom: '8px' }}
        >
          {sheetNames.map((name, index) => (
            <Tab key={index} label={name} />
          ))}
        </Tabs>
      )}
      <Box
        style={{
          maxHeight: '600px',
          overflow: 'auto',
          border: '1px solid #ddd',
          borderRadius: '4px',
          backgroundColor: '#fff',
        }}
      >
        <style>{`
          .excel-content table { border-collapse: collapse; width: 100%; }
          .excel-content td, .excel-content th {
            border: 1px solid #ddd;
            padding: 6px 10px;
            font-size: 13px;
            white-space: nowrap;
          }
          .excel-content th { background-color: #f5f5f5; font-weight: 600; }
          .excel-content tr:nth-child(even) { background-color: #fafafa; }
          .excel-content tr:hover { background-color: #f0f0f0; }
        `}</style>
        <div
          className="excel-content"
          dangerouslySetInnerHTML={{ __html: currentHtml }}
        />
      </Box>
    </Box>
  );
};

export default ExcelViewer;
