import {
  isUniversity,
  isCourse,
  getUniversities,
  getCoursesForUniversity,
  buildHierarchicalGroups,
  getGroupLogo,
  getGroupDisplayPath,
  GroupType,
} from '../group_properties';
import { createMockGroup, createMockCourse } from '../../test-utils/mock-data';

describe('GroupProperties model functions', () => {
  describe('isUniversity', () => {
    it('returns true for UNIVERSITY groupType', () => {
      const group = createMockGroup({ groupType: GroupType.UNIVERSITY });
      expect(isUniversity(group)).toBe(true);
    });

    it('returns true when groupType is undefined and no parentGroupId', () => {
      const group = createMockGroup({ groupType: undefined, parentGroupId: undefined });
      expect(isUniversity(group)).toBe(true);
    });

    it('returns false for COURSE groupType', () => {
      const group = createMockCourse();
      expect(isUniversity(group)).toBe(false);
    });
  });

  describe('isCourse', () => {
    it('returns true for COURSE groupType', () => {
      const group = createMockCourse();
      expect(isCourse(group)).toBe(true);
    });

    it('returns true when groupType is undefined but has parentGroupId', () => {
      const group = createMockGroup({
        groupType: undefined,
        parentGroupId: 'parent-1',
      });
      expect(isCourse(group)).toBe(true);
    });

    it('returns false for UNIVERSITY groupType', () => {
      const group = createMockGroup({ groupType: GroupType.UNIVERSITY });
      expect(isCourse(group)).toBe(false);
    });
  });

  describe('getUniversities', () => {
    it('filters to universities only', () => {
      const groups = [
        createMockGroup({ anid: 'uni-1', groupType: GroupType.UNIVERSITY }),
        createMockCourse({ anid: 'course-1' }),
        createMockGroup({ anid: 'uni-2', groupType: GroupType.UNIVERSITY }),
      ];
      const universities = getUniversities(groups);
      expect(universities).toHaveLength(2);
      expect(universities[0].anid).toBe('uni-1');
      expect(universities[1].anid).toBe('uni-2');
    });

    it('returns empty array when no universities', () => {
      const groups = [createMockCourse()];
      expect(getUniversities(groups)).toHaveLength(0);
    });
  });

  describe('getCoursesForUniversity', () => {
    it('returns courses matching the university ID', () => {
      const groups = [
        createMockCourse({ anid: 'c1', parentGroupId: 'uni-1' }),
        createMockCourse({ anid: 'c2', parentGroupId: 'uni-2' }),
        createMockCourse({ anid: 'c3', parentGroupId: 'uni-1' }),
      ];
      const courses = getCoursesForUniversity(groups, 'uni-1');
      expect(courses).toHaveLength(2);
      expect(courses[0].anid).toBe('c1');
      expect(courses[1].anid).toBe('c3');
    });

    it('returns empty array when no courses match', () => {
      const groups = [createMockCourse({ parentGroupId: 'uni-2' })];
      expect(getCoursesForUniversity(groups, 'uni-99')).toHaveLength(0);
    });
  });

  describe('buildHierarchicalGroups', () => {
    it('builds parent-child relationships', () => {
      const university = createMockGroup({ anid: 'uni-1' });
      const course = createMockCourse({ anid: 'c1', parentGroupId: 'uni-1' });
      const result = buildHierarchicalGroups([university, course]);

      expect(result).toHaveLength(1);
      expect(result[0].childGroups).toHaveLength(1);
      expect(result[0].childGroups![0].anid).toBe('c1');
    });

    it('sets parent reference on courses', () => {
      const university = createMockGroup({ anid: 'uni-1' });
      const course = createMockCourse({ anid: 'c1', parentGroupId: 'uni-1' });
      const result = buildHierarchicalGroups([university, course]);

      expect(result[0].childGroups![0].parentGroup).toBe(result[0]);
    });

    it('creates virtual courses from availableCourses when no actual courses exist', () => {
      const university = createMockGroup({
        anid: 'uni-1',
        settings: {
          primaryColor: '#1976d2',
          secondaryColor: '#dc004e',
          projectVisibility: 3,
          makeInvestorsContactDetailsVisibleToIssuers: false,
          availableCourses: ['History MSc', 'Computer Science'],
        },
      });
      const result = buildHierarchicalGroups([university]);

      expect(result[0].childGroups).toHaveLength(2);
      expect(result[0].childGroups![0].displayName).toBe('History MSc');
      expect(result[0].childGroups![1].displayName).toBe('Computer Science');
    });

    it('sets empty childGroups when no courses and no availableCourses', () => {
      const university = createMockGroup({ anid: 'uni-1' });
      const result = buildHierarchicalGroups([university]);
      expect(result[0].childGroups).toEqual([]);
    });
  });

  describe('getGroupLogo', () => {
    it('returns null for null group', () => {
      expect(getGroupLogo(null)).toBeNull();
    });

    it('returns null when plainLogo is empty', () => {
      const group = createMockGroup({ plainLogo: [] });
      expect(getGroupLogo(group)).toBeNull();
    });

    it('returns null when all logos are removed', () => {
      const group = createMockGroup({
        plainLogo: [{ storageID: 1, url: 'old.png', removed: true }],
      });
      expect(getGroupLogo(group)).toBeNull();
    });

    it('returns the active logo URL', () => {
      const group = createMockGroup({
        plainLogo: [
          { storageID: 1, url: 'old.png', removed: true },
          { storageID: 2, url: 'current.png' },
        ],
      });
      expect(getGroupLogo(group)).toBe('current.png');
    });

    it('returns logo with removed=false as active', () => {
      const group = createMockGroup({
        plainLogo: [{ storageID: 1, url: 'active.png', removed: false }],
      });
      expect(getGroupLogo(group)).toBe('active.png');
    });
  });

  describe('getGroupDisplayPath', () => {
    it('returns just the name for a university', () => {
      const group = createMockGroup({ displayName: 'MIT' });
      expect(getGroupDisplayPath(group)).toBe('MIT');
    });

    it('returns "Parent > Child" for a course with parentGroup', () => {
      const parent = createMockGroup({ displayName: 'MIT' });
      const course = createMockCourse({
        displayName: 'CS MSc',
        parentGroup: parent,
      });
      expect(getGroupDisplayPath(course)).toBe('MIT > CS MSc');
    });

    it('returns just the name for a course without parentGroup', () => {
      const course = createMockCourse({
        displayName: 'CS MSc',
        parentGroup: undefined,
      });
      expect(getGroupDisplayPath(course)).toBe('CS MSc');
    });
  });
});
