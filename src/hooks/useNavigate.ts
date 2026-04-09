import { useHistory } from 'react-router-dom';
import { useCallback } from 'react';

/**
 * Compatibility shim: provides react-router-dom v6 useNavigate API
 * using v5 useHistory under the hood.
 */
export function useNavigate() {
  const history = useHistory();
  return useCallback(
    (to: string | number, options?: { replace?: boolean }) => {
      if (typeof to === 'number') {
        history.go(to);
      } else if (options?.replace) {
        history.replace(to);
      } else {
        history.push(to);
      }
    },
    [history]
  );
}
