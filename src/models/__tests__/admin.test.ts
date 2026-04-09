import { isAdmin } from '../admin';
import { createMockUser, createMockAdmin } from '../../test-utils/mock-data';

describe('Admin model functions', () => {
  describe('isAdmin', () => {
    it('returns Admin object when user has anid property', () => {
      const admin = createMockAdmin();
      const result = isAdmin(admin);
      expect(result).not.toBeNull();
      expect(result!.anid).toBe('group-1');
    });

    it('returns null when user does not have anid property', () => {
      const user = createMockUser();
      const result = isAdmin(user);
      expect(result).toBeNull();
    });

    it('returns a clone, not the same reference', () => {
      const admin = createMockAdmin();
      const result = isAdmin(admin);
      expect(result).not.toBe(admin);
      expect(result).toEqual(admin);
    });

    it('preserves superAdmin flag', () => {
      const superAdmin = createMockAdmin({ superAdmin: true });
      const result = isAdmin(superAdmin);
      expect(result!.superAdmin).toBe(true);
    });

    it('handles null-like values gracefully', () => {
      expect(isAdmin(null as any)).toBeNull();
    });

    it('handles objects without anid', () => {
      const notAdmin = { id: '1', email: 'test@test.com', type: 1 } as any;
      expect(isAdmin(notAdmin)).toBeNull();
    });
  });
});
