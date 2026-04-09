export type DocumentType =
  | 'pdf'
  | 'word'
  | 'excel'
  | 'powerpoint'
  | 'image'
  | 'video'
  | 'text'
  | 'unknown';

export interface DocumentTypeInfo {
  type: DocumentType;
  canPreview: boolean;
  useIframeViewer: boolean;
  useClientSide: boolean;
  label: string;
  color: string;
  extension: string;
}

export const getDocumentType = (fileName: string): DocumentTypeInfo => {
  const extension = fileName.toLowerCase().split('.').pop() || '';

  switch (extension) {
    case 'pdf':
      return {
        type: 'pdf',
        canPreview: true,
        useIframeViewer: false,
        useClientSide: false,
        label: 'PDF Document',
        color: '#f44336',
        extension,
      };
    case 'doc':
      return {
        type: 'word',
        canPreview: false,
        useIframeViewer: false,
        useClientSide: false,
        label: 'Word Document',
        color: '#2196f3',
        extension,
      };
    case 'docx':
      return {
        type: 'word',
        canPreview: true,
        useIframeViewer: false,
        useClientSide: true,
        label: 'Word Document',
        color: '#2196f3',
        extension,
      };
    case 'xls':
      return {
        type: 'excel',
        canPreview: false,
        useIframeViewer: false,
        useClientSide: false,
        label: 'Excel Spreadsheet',
        color: '#4caf50',
        extension,
      };
    case 'xlsx':
      return {
        type: 'excel',
        canPreview: true,
        useIframeViewer: false,
        useClientSide: true,
        label: 'Excel Spreadsheet',
        color: '#4caf50',
        extension,
      };
    case 'ppt':
      return {
        type: 'powerpoint',
        canPreview: false,
        useIframeViewer: false,
        useClientSide: false,
        label: 'PowerPoint Presentation',
        color: '#ff9800',
        extension,
      };
    case 'pptx':
      return {
        type: 'powerpoint',
        canPreview: false,
        useIframeViewer: false,
        useClientSide: false,
        label: 'PowerPoint Presentation',
        color: '#ff9800',
        extension,
      };
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
      return {
        type: 'image',
        canPreview: false,
        useIframeViewer: false,
        useClientSide: false,
        label: 'Image File',
        color: '#9c27b0',
        extension,
      };
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return {
        type: 'video',
        canPreview: false,
        useIframeViewer: false,
        useClientSide: false,
        label: 'Video File',
        color: '#607d8b',
        extension,
      };
    case 'txt':
      return {
        type: 'text',
        canPreview: false,
        useIframeViewer: false,
        useClientSide: false,
        label: 'Text File',
        color: '#795548',
        extension,
      };
    default:
      return {
        type: 'unknown',
        canPreview: false,
        useIframeViewer: false,
        useClientSide: false,
        label: 'Document',
        color: '#757575',
        extension,
      };
  }
};

/**
 * In development, route Firebase Storage URLs through the CRA dev server
 * proxy (`/firebase-storage-proxy?url=...`) to avoid CORS issues.
 * In production, return the URL unchanged (requires CORS configured on the
 * Firebase Storage bucket).
 */
export const getProxiedFileUrl = (fileUrl: string): string => {
  if (
    process.env.NODE_ENV === 'development' &&
    fileUrl.startsWith('https://firebasestorage.googleapis.com/')
  ) {
    return `/firebase-storage-proxy?url=${encodeURIComponent(fileUrl)}`;
  }
  return fileUrl;
};
