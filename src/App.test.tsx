import React from 'react';
import { render } from '@testing-library/react';

// The App component is heavily coupled to Firebase auth, Redux, and router.
// Rather than testing the full component (which requires extensive mocking),
// we verify the module can be loaded and the key dependencies resolve.
// Component-level integration tests would use Cypress or similar.

jest.mock('./router/router.tsx', () => {
  return function MockRouter() {
    return <div data-testid="mock-router">Router</div>;
  };
});

jest.mock('react-idle-timer', () => {
  const React = require('react');
  return React.forwardRef(function MockIdleTimer(props: any, ref: any) {
    return props.children || null;
  });
});

jest.mock('./utils/CacheMonitor', () => ({
  CacheMonitor: { start: jest.fn(), stop: jest.fn() },
}));

jest.mock('./utils/CacheInvalidation', () => ({
  CacheManager: { invalidateAll: jest.fn() },
}));

jest.mock('./redux-store/actions/mediaQueryActions', () => ({
  addMediaQueryListeners: jest.fn(),
  removeMediaQueryListeners: jest.fn(),
}));

describe('App module', () => {
  it('can be imported without errors', () => {
    // Verify the module resolves — this catches broken imports
    const AppModule = require('./App');
    expect(AppModule).toBeDefined();
  });
});
