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

// Response interceptor: normalize errors to match existing Api.parseError() format
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ code?: number; detail?: string; message?: string }>) => {
    let statusCode = -1;
    let message = '';

    if (error.response) {
      // Server responded with an error (4xx, 5xx)
      if (error.response.data) {
        statusCode = error.response.data.code ?? error.response.status;
        message = error.response.data.detail ?? error.response.data.message ?? '';
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
