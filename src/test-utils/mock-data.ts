/**
 * Test data factory functions.
 * Each returns a minimal valid object with sensible defaults.
 */
import User from '../models/user';
import Admin from '../models/admin';
import GroupProperties, { GroupType } from '../models/group_properties';
import Project, { ProjectInstance, PitchCover, PitchDocument } from '../models/project';
import GroupOfMembership from '../models/group_of_membership';
import {
  TYPE_ISSUER,
  TYPE_INVESTOR,
  TYPE_ADMIN,
  PROJECT_STATUS_DRAFT,
  PROJECT_STATUS_PITCH_PHASE,
  PITCH_STATUS_ON_GOING,
  PROJECT_VISIBILITY_PUBLIC,
} from '../firebase/databaseConsts';

export const createMockUser = (overrides?: Partial<User>): User => ({
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'John',
  lastName: 'Doe',
  title: 'Mr.',
  discover: 'Google',
  type: TYPE_ISSUER,
  ...overrides,
});

export const createMockInvestor = (overrides?: Partial<User>): User =>
  createMockUser({ type: TYPE_INVESTOR, id: 'investor-1', ...overrides });

export const createMockAdmin = (overrides?: Partial<Admin>): Admin => ({
  id: 'admin-1',
  anid: 'group-1',
  email: 'admin@example.com',
  superAdmin: false,
  superGroupAdmin: false,
  type: TYPE_ADMIN,
  isInvestWest: false,
  ...overrides,
});

export const createMockSuperAdmin = (overrides?: Partial<Admin>): Admin =>
  createMockAdmin({ superAdmin: true, isInvestWest: true, id: 'super-admin-1', ...overrides });

export const createMockGroup = (overrides?: Partial<GroupProperties>): GroupProperties => ({
  anid: 'group-1',
  dateAdded: 1700000000000,
  description: 'Test University',
  displayName: 'Test University',
  displayNameLower: 'test university',
  groupUserName: 'test-university',
  isInvestWest: false,
  status: 1,
  plainLogo: [{ storageID: 1, url: 'https://example.com/logo.png' }],
  settings: {
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    projectVisibility: PROJECT_VISIBILITY_PUBLIC,
    makeInvestorsContactDetailsVisibleToIssuers: false,
  },
  groupType: GroupType.UNIVERSITY,
  ...overrides,
});

export const createMockCourse = (overrides?: Partial<GroupProperties>): GroupProperties =>
  createMockGroup({
    anid: 'course-1',
    displayName: 'Computer Science MSc',
    displayNameLower: 'computer science msc',
    groupUserName: 'computer-science-msc',
    groupType: GroupType.COURSE,
    parentGroupId: 'group-1',
    ...overrides,
  });

export const createMockProject = (overrides?: Partial<Project>): Project => ({
  id: 'project-1',
  anid: 'group-1',
  issuerID: 'user-1',
  visibility: PROJECT_VISIBILITY_PUBLIC,
  status: PROJECT_STATUS_PITCH_PHASE,
  projectName: 'Test Project',
  description: 'A test project',
  sector: 'Technology',
  Pitch: {
    postedDate: 1700000000000,
    status: PITCH_STATUS_ON_GOING,
  },
  ...overrides,
});

export const createMockProjectInstance = (
  overrides?: Partial<ProjectInstance>
): ProjectInstance => ({
  projectDetail: createMockProject(),
  group: createMockGroup(),
  issuer: createMockUser(),
  pledges: [],
  rejectFeedbacks: [],
  ...overrides,
});

export const createMockGroupOfMembership = (
  overrides?: Partial<GroupOfMembership>
): GroupOfMembership => ({
  group: createMockGroup(),
  joinedDate: 1700000000000,
  isHomeGroup: false,
  userInGroupStatus: 2,
  ...overrides,
});

export const createMockPitchCover = (overrides?: Partial<PitchCover>): PitchCover => ({
  fileExtension: 'png',
  fileType: 2, // FILE_TYPE_IMAGE
  storageID: 1,
  url: 'https://example.com/cover.png',
  ...overrides,
});

export const createMockPitchDocument = (overrides?: Partial<PitchDocument>): PitchDocument => ({
  fileName: 'presentation.pdf',
  readableSize: '2.5 MB',
  storageID: 1,
  downloadURL: 'https://example.com/doc.pdf',
  ...overrides,
});
