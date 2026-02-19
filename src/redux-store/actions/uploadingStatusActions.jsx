/**
 * Backwards-compatible action creators that delegate to the RTK slice.
 * Consumers can continue to import from this file without changes.
 */
import {
  setUploading as _setUploading,
  dismissUploadingStatus as _dismiss,
} from '../slices/uploadingStatusSlice';

// Re-export action type strings for any consumers that match on them
export const UPLOADING = _setUploading.type;
export const DISMISS_UPLOADING_STATUS = _dismiss.type;

// Adapter: convert positional args to payload object
export const uploading = (mode, progress) => _setUploading({ mode, progress });

export const dismissUploadingStatus = () => _dismiss();
