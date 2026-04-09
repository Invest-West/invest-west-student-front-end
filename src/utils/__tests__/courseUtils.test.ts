import {
  courseDisplayNameToUrlName,
  courseUrlNameToDisplayName,
  findCourseDisplayNameByUrl,
  validateCourseUrlName,
  getAvailableCourseUrlNames,
  getDefaultCourse,
  getCourseByUserName,
  createCourseObject,
  convertAvailableCoursesToStructured,
  CourseObject,
} from '../courseUtils';

describe('courseUtils', () => {
  describe('courseDisplayNameToUrlName', () => {
    it('converts "History MSc" to "history-msc"', () => {
      expect(courseDisplayNameToUrlName('History MSc')).toBe('history-msc');
    });

    it('converts "Student Showcase" to "student-showcase"', () => {
      expect(courseDisplayNameToUrlName('Student Showcase')).toBe('student-showcase');
    });

    it('handles empty string', () => {
      expect(courseDisplayNameToUrlName('')).toBe('');
    });

    it('removes special characters', () => {
      expect(courseDisplayNameToUrlName('CS & AI')).toBe('cs--ai');
    });

    it('handles multiple spaces (collapsed by regex)', () => {
      expect(courseDisplayNameToUrlName('Computer  Science')).toBe('computer-science');
    });

    it('handles single word', () => {
      expect(courseDisplayNameToUrlName('Engineering')).toBe('engineering');
    });
  });

  describe('courseUrlNameToDisplayName', () => {
    it('converts "history-msc" to "History MSc"', () => {
      expect(courseUrlNameToDisplayName('history-msc')).toBe('History MSc');
    });

    it('converts "student-showcase" to "Student Showcase"', () => {
      expect(courseUrlNameToDisplayName('student-showcase')).toBe('Student Showcase');
    });

    it('handles empty string', () => {
      expect(courseUrlNameToDisplayName('')).toBe('');
    });

    it('handles MSc correctly', () => {
      expect(courseUrlNameToDisplayName('data-science-msc')).toBe('Data Science MSc');
    });

    it('handles PhD correctly', () => {
      expect(courseUrlNameToDisplayName('physics-phd')).toBe('Physics PhD');
    });

    it('handles BSc correctly', () => {
      expect(courseUrlNameToDisplayName('maths-bsc')).toBe('Maths BSc');
    });

    it('handles BA correctly', () => {
      expect(courseUrlNameToDisplayName('english-ba')).toBe('English BA');
    });

    it('handles MA correctly', () => {
      expect(courseUrlNameToDisplayName('history-ma')).toBe('History MA');
    });
  });

  describe('findCourseDisplayNameByUrl', () => {
    const courses = ['History MSc', 'Computer Science', 'Student Showcase'];

    it('finds matching course', () => {
      expect(findCourseDisplayNameByUrl('history-msc', courses)).toBe('History MSc');
    });

    it('returns null for no match', () => {
      expect(findCourseDisplayNameByUrl('biology-phd', courses)).toBeNull();
    });

    it('returns null for empty URL name', () => {
      expect(findCourseDisplayNameByUrl('', courses)).toBeNull();
    });

    it('returns null for null courses', () => {
      expect(findCourseDisplayNameByUrl('test', null as any)).toBeNull();
    });

    it('handles case-insensitive matching', () => {
      expect(findCourseDisplayNameByUrl('HISTORY-MSC', courses)).toBe('History MSc');
    });

    it('filters out null values from courses array', () => {
      const coursesWithNull = ['History MSc', null as any, 'Computer Science'];
      expect(findCourseDisplayNameByUrl('history-msc', coursesWithNull)).toBe('History MSc');
    });
  });

  describe('validateCourseUrlName', () => {
    const courses = ['History MSc', 'Computer Science'];

    it('returns true for valid course', () => {
      expect(validateCourseUrlName('history-msc', courses)).toBe(true);
    });

    it('returns false for invalid course', () => {
      expect(validateCourseUrlName('nonexistent', courses)).toBe(false);
    });
  });

  describe('getAvailableCourseUrlNames', () => {
    it('maps display names to URL names', () => {
      const courses = ['History MSc', 'Student Showcase'];
      expect(getAvailableCourseUrlNames(courses)).toEqual(['history-msc', 'student-showcase']);
    });

    it('returns empty array for null input', () => {
      expect(getAvailableCourseUrlNames(null as any)).toEqual([]);
    });

    it('filters out empty strings', () => {
      const courses = ['History MSc', '', '  '];
      expect(getAvailableCourseUrlNames(courses)).toEqual(['history-msc']);
    });
  });

  describe('createCourseObject', () => {
    it('creates a course with correct fields', () => {
      const course = createCourseObject('History MSc', 'A history course', true);
      expect(course.displayName).toBe('History MSc');
      expect(course.courseUserName).toBe('history-msc');
      expect(course.description).toBe('A history course');
      expect(course.isDefault).toBe(true);
      expect(course.status).toBe(1);
      expect(course.anid).toMatch(/^course_/);
    });
  });

  describe('getDefaultCourse', () => {
    it('returns the default course', () => {
      const courses: Record<string, CourseObject> = {
        'history-msc': createCourseObject('History MSc'),
        'student-showcase': createCourseObject('Student Showcase', '', true),
      };
      const result = getDefaultCourse(courses);
      expect(result).not.toBeNull();
      expect(result!.displayName).toBe('Student Showcase');
    });

    it('returns null when no default exists', () => {
      const courses: Record<string, CourseObject> = {
        'history-msc': createCourseObject('History MSc'),
      };
      expect(getDefaultCourse(courses)).toBeNull();
    });

    it('returns null for empty object', () => {
      expect(getDefaultCourse({})).toBeNull();
    });
  });

  describe('getCourseByUserName', () => {
    it('returns the matching course', () => {
      const course = createCourseObject('History MSc');
      const courses: Record<string, CourseObject> = {
        'history-msc': course,
      };
      expect(getCourseByUserName(courses, 'history-msc')).toBe(course);
    });

    it('returns null for non-existent course', () => {
      expect(getCourseByUserName({}, 'nonexistent')).toBeNull();
    });
  });

  describe('convertAvailableCoursesToStructured', () => {
    it('always includes student-showcase as default', () => {
      const result = convertAvailableCoursesToStructured([]);
      expect(result['student-showcase']).toBeDefined();
      expect(result['student-showcase'].isDefault).toBe(true);
    });

    it('adds additional courses', () => {
      const result = convertAvailableCoursesToStructured(['History MSc']);
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['history-msc']).toBeDefined();
      expect(result['history-msc'].displayName).toBe('History MSc');
    });

    it('does not duplicate Student Showcase', () => {
      const result = convertAvailableCoursesToStructured(['Student Showcase', 'History MSc']);
      expect(Object.keys(result)).toHaveLength(2);
    });
  });
});
