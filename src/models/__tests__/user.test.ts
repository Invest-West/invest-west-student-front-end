import { isIssuer, isInvestor, hasBusinessProfile, getProfilePicture } from '../user';
import { TYPE_ISSUER, TYPE_INVESTOR } from '../../firebase/databaseConsts';
import { createMockUser, createMockInvestor, createMockAdmin } from '../../test-utils/mock-data';

describe('User model functions', () => {
  describe('isIssuer', () => {
    it('returns true for issuer type user', () => {
      const user = createMockUser({ type: TYPE_ISSUER });
      expect(isIssuer(user)).toBe(true);
    });

    it('returns false for investor type user', () => {
      const user = createMockInvestor();
      expect(isIssuer(user)).toBe(false);
    });

    it('works with Admin objects', () => {
      const admin = createMockAdmin({ type: TYPE_ISSUER });
      expect(isIssuer(admin)).toBe(true);
    });
  });

  describe('isInvestor', () => {
    it('returns true for investor type', () => {
      const user = createMockInvestor();
      expect(isInvestor(user)).toBe(true);
    });

    it('returns false for issuer type', () => {
      const user = createMockUser({ type: TYPE_ISSUER });
      expect(isInvestor(user)).toBe(false);
    });
  });

  describe('hasBusinessProfile', () => {
    it('returns true when BusinessProfile exists', () => {
      const user = createMockUser({
        BusinessProfile: {
          companyName: 'Test Corp',
          companyWebsite: 'https://test.com',
          sector: 'Tech',
          university: 'MIT',
          logo: [],
        },
      });
      expect(hasBusinessProfile(user)).toBe(true);
    });

    it('returns false when BusinessProfile is undefined', () => {
      const user = createMockUser();
      expect(hasBusinessProfile(user)).toBe(false);
    });
  });

  describe('getProfilePicture', () => {
    it('returns null when profilePicture is undefined', () => {
      const user = createMockUser();
      expect(getProfilePicture(user)).toBeNull();
    });

    it('returns null when all pictures are removed', () => {
      const user = createMockUser({
        profilePicture: [{ storageID: 1, url: 'old.png', removed: true }],
      });
      expect(getProfilePicture(user)).toBeNull();
    });

    it('returns the active profile picture URL', () => {
      const user = createMockUser({
        profilePicture: [
          { storageID: 1, url: 'old.png', removed: true },
          { storageID: 2, url: 'current.png' },
        ],
      });
      expect(getProfilePicture(user)).toBe('current.png');
    });

    it('returns the first active picture when multiple exist', () => {
      const user = createMockUser({
        profilePicture: [
          { storageID: 1, url: 'first.png' },
          { storageID: 2, url: 'second.png' },
        ],
      });
      expect(getProfilePicture(user)).toBe('first.png');
    });
  });
});
