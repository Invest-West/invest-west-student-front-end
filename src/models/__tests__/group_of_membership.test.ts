import { getHomeGroup } from '../group_of_membership';
import { createMockGroupOfMembership } from '../../test-utils/mock-data';

describe('GroupOfMembership model functions', () => {
  describe('getHomeGroup', () => {
    it('returns the group with isHomeGroup true', () => {
      const groups = [
        createMockGroupOfMembership({ isHomeGroup: false }),
        createMockGroupOfMembership({ isHomeGroup: true }),
        createMockGroupOfMembership({ isHomeGroup: false }),
      ];
      const result = getHomeGroup(groups);
      expect(result).not.toBeNull();
      expect(result!.isHomeGroup).toBe(true);
    });

    it('returns null when no home group exists', () => {
      const groups = [
        createMockGroupOfMembership({ isHomeGroup: false }),
        createMockGroupOfMembership({ isHomeGroup: false }),
      ];
      expect(getHomeGroup(groups)).toBeNull();
    });

    it('returns null for empty array', () => {
      expect(getHomeGroup([])).toBeNull();
    });

    it('returns the first home group when multiple exist', () => {
      const groups = [
        createMockGroupOfMembership({ isHomeGroup: true, joinedDate: 100 }),
        createMockGroupOfMembership({ isHomeGroup: true, joinedDate: 200 }),
      ];
      const result = getHomeGroup(groups);
      expect(result!.joinedDate).toBe(100);
    });
  });
});
