import axios, { AxiosError } from 'axios';
import firebase from '../firebase/firebaseApp';

/**
 * Wait for Firebase auth to be ready and return the current user.
 * Ensures we don't make API calls before Firebase has restored the auth state.
 */
const waitForFirebaseAuth = (): Promise<firebase.default.User | null> => {
  return new Promise((resolve) => {
    const currentUser = firebase.auth().currentUser;
    if (currentUser) {
      resolve(currentUser);
      return;
    }

    // If no current user, wait for auth state to change (max 5 seconds)
    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, 5000);

    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      clearTimeout(timeout);
      unsubscribe();
      resolve(user);
    });
  });
};

/**
 * Centralized Axios instance for all internal backend API calls.
 * Handles Firebase auth token attachment and error normalization via interceptors.
 */
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_BACK_END_BASE_URL,
  timeout: 20000,
});

// Request interceptor: attach Firebase auth token
apiClient.interceptors.request.use(async (config) => {
  const currentUser = await waitForFirebaseAuth();

  if (currentUser) {
    try {
      const idToken = await currentUser.getIdToken();
      config.headers.Authorization = idToken;
    } catch {
      // If token retrieval fails, try to force refresh once
      try {
        const idToken = await currentUser.getIdToken(true);
        config.headers.Authorization = idToken;
      } catch {
        throw new Error(
          'Authentication token could not be retrieved. Please try logging in again.'
        );
      }
    }
  }

  return config;
});

// Response interceptor: unwrap envelope format and normalize errors
apiClient.interceptors.response.use(
  (response) => {
    // Detect new envelope format: { success: true, data: ... }
    // Unwrap so consumers see response.data as the inner payload
    if (response.data && typeof response.data === 'object' && response.data.success !== undefined) {
      return { ...response, data: response.data.data ?? response.data };
    }
    return response;
  },
  (
    error: AxiosError<{
      success?: boolean;
      error?: { code?: number; message?: string; detail?: string };
      code?: number;
      detail?: string;
      message?: string;
    }>
  ) => {
    let statusCode = -1;
    let message = '';

    if (error.response) {
      const data = error.response.data;
      if (data) {
        // New envelope format: { success: false, error: { code, message, detail } }
        if (data.success === false && data.error) {
          statusCode = data.error.code ?? error.response.status;
          message = data.error.detail ?? data.error.message ?? '';
        } else {
          // Legacy format: { code, detail, message }
          statusCode = data.code ?? error.response.status;
          message = data.detail ?? data.message ?? '';
        }
      }
    } else if (error.request) {
      // No response received
      message = 'Server is not responding.';
    } else {
      message = 'Unexpected error.';
    }

    return Promise.reject(new Error(`${statusCode} ${message}`));
  }
);

export default apiClient;
