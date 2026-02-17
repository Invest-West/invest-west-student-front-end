import {
  isProjectLive,
  isDraftProject,
  isDraftProjectNotSubmitted,
  isProjectWaitingToGoLive,
  isProjectRejectedToGoLive,
  isProjectInLivePitchPhase,
  isProjectPitchExpiredWaitingForAdminToCheck,
  isProjectWaitingForPledgeToBeCreated,
  isProjectWaitingForPledgeToBeChecked,
  isProjectInLivePledgePhase,
  isProjectSuccessful,
  isProjectFailed,
  isProjectTemporarilyClosed,
  isProjectPublic,
  isProjectRestricted,
  isProjectPrivate,
  getPitchCover,
  isImagePitchCover,
  isVideoPitchCover,
  isProjectOwner,
  doesProjectHaveRejectFeedbacks,
  isProjectCreatedByGroupAdmin,
  shouldHideProjectInformationFromUser,
} from '../project';
import {
  PROJECT_STATUS_DRAFT,
  PROJECT_STATUS_BEING_CHECKED,
  PROJECT_STATUS_REJECTED,
  PROJECT_STATUS_PITCH_PHASE,
  PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED,
  PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED,
  PROJECT_STATUS_PRIMARY_OFFER_PHASE,
  PROJECT_STATUS_SUCCESSFUL,
  PROJECT_STATUS_FAILED,
  PITCH_STATUS_ON_GOING,
  PITCH_STATUS_WAITING_FOR_ADMIN,
  PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER,
  PROJECT_VISIBILITY_PUBLIC,
  PROJECT_VISIBILITY_RESTRICTED,
  PROJECT_VISIBILITY_PRIVATE,
  FILE_TYPE_IMAGE,
  FILE_TYPE_VIDEO,
} from '../../firebase/databaseConsts';
import {
  createMockProject,
  createMockProjectInstance,
  createMockUser,
  createMockInvestor,
  createMockAdmin,
  createMockSuperAdmin,
  createMockGroupOfMembership,
  createMockPitchCover,
} from '../../test-utils/mock-data';

describe('Project model predicates', () => {
  describe('isDraftProject', () => {
    it('returns true for draft status', () => {
      const project = createMockProject({ status: PROJECT_STATUS_DRAFT });
      expect(isDraftProject(project)).toBe(true);
    });

    it('returns false for non-draft status', () => {
      const project = createMockProject({ status: PROJECT_STATUS_PITCH_PHASE });
      expect(isDraftProject(project)).toBe(false);
    });
  });

  describe('isDraftProjectNotSubmitted', () => {
    it('returns true for draft project with draft pitch status', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_DRAFT,
        Pitch: { postedDate: 0, status: PROJECT_STATUS_DRAFT },
      });
      expect(isDraftProjectNotSubmitted(project)).toBe(true);
    });

    it('returns false when project is not draft', () => {
      const project = createMockProject({ status: PROJECT_STATUS_PITCH_PHASE });
      expect(isDraftProjectNotSubmitted(project)).toBe(false);
    });
  });

  describe('isProjectWaitingToGoLive', () => {
    it('returns true for being checked status', () => {
      const project = createMockProject({ status: PROJECT_STATUS_BEING_CHECKED });
      expect(isProjectWaitingToGoLive(project)).toBe(true);
    });

    it('returns false for other statuses', () => {
      const project = createMockProject({ status: PROJECT_STATUS_PITCH_PHASE });
      expect(isProjectWaitingToGoLive(project)).toBe(false);
    });
  });

  describe('isProjectRejectedToGoLive', () => {
    it('returns true for rejected status', () => {
      const project = createMockProject({ status: PROJECT_STATUS_REJECTED });
      expect(isProjectRejectedToGoLive(project)).toBe(true);
    });

    it('returns false for non-rejected status', () => {
      const project = createMockProject({ status: PROJECT_STATUS_PITCH_PHASE });
      expect(isProjectRejectedToGoLive(project)).toBe(false);
    });
  });

  describe('isProjectInLivePitchPhase', () => {
    it('returns true for pitch phase with ongoing pitch', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_PITCH_PHASE,
        Pitch: { postedDate: 0, status: PITCH_STATUS_ON_GOING },
      });
      expect(isProjectInLivePitchPhase(project)).toBe(true);
    });

    it('returns false when pitch status is not ongoing', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_PITCH_PHASE,
        Pitch: { postedDate: 0, status: PITCH_STATUS_WAITING_FOR_ADMIN },
      });
      expect(isProjectInLivePitchPhase(project)).toBe(false);
    });
  });

  describe('isProjectPitchExpiredWaitingForAdminToCheck', () => {
    it('returns true for expired pitch waiting for admin', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED,
        Pitch: { postedDate: 0, status: PITCH_STATUS_WAITING_FOR_ADMIN },
      });
      expect(isProjectPitchExpiredWaitingForAdminToCheck(project)).toBe(true);
    });

    it('returns false when status does not match', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_PITCH_PHASE,
        Pitch: { postedDate: 0, status: PITCH_STATUS_WAITING_FOR_ADMIN },
      });
      expect(isProjectPitchExpiredWaitingForAdminToCheck(project)).toBe(false);
    });
  });

  describe('isProjectWaitingForPledgeToBeCreated', () => {
    it('returns true for expired pitch with accepted create offer', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED,
        Pitch: { postedDate: 0, status: PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER },
      });
      expect(isProjectWaitingForPledgeToBeCreated(project)).toBe(true);
    });

    it('returns true for pitch phase with accepted create offer', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_PITCH_PHASE,
        Pitch: { postedDate: 0, status: PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER },
      });
      expect(isProjectWaitingForPledgeToBeCreated(project)).toBe(true);
    });
  });

  describe('isProjectWaitingForPledgeToBeChecked', () => {
    it('returns true for primary offer waiting to be checked', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED,
      });
      expect(isProjectWaitingForPledgeToBeChecked(project)).toBe(true);
    });
  });

  describe('isProjectInLivePledgePhase', () => {
    it('returns true for primary offer phase', () => {
      const project = createMockProject({ status: PROJECT_STATUS_PRIMARY_OFFER_PHASE });
      expect(isProjectInLivePledgePhase(project)).toBe(true);
    });
  });

  describe('isProjectLive', () => {
    it('returns true for live pitch phase', () => {
      const project = createMockProject({
        status: PROJECT_STATUS_PITCH_PHASE,
        Pitch: { postedDate: 0, status: PITCH_STATUS_ON_GOING },
      });
      expect(isProjectLive(project)).toBe(true);
    });

    it('returns true for live pledge phase', () => {
      const project = createMockProject({ status: PROJECT_STATUS_PRIMARY_OFFER_PHASE });
      expect(isProjectLive(project)).toBe(true);
    });

    it('returns false for draft projects', () => {
      const project = createMockProject({ status: PROJECT_STATUS_DRAFT });
      expect(isProjectLive(project)).toBe(false);
    });
  });

  describe('isProjectSuccessful', () => {
    it('returns true for successful status', () => {
      const project = createMockProject({ status: PROJECT_STATUS_SUCCESSFUL });
      expect(isProjectSuccessful(project)).toBe(true);
    });

    it('returns false for non-successful status', () => {
      const project = createMockProject({ status: PROJECT_STATUS_FAILED });
      expect(isProjectSuccessful(project)).toBe(false);
    });
  });

  describe('isProjectFailed', () => {
    it('returns true for failed status', () => {
      const project = createMockProject({ status: PROJECT_STATUS_FAILED });
      expect(isProjectFailed(project)).toBe(true);
    });
  });

  describe('isProjectTemporarilyClosed', () => {
    it('returns true when temporarilyClosed is true', () => {
      const project = createMockProject({ temporarilyClosed: true });
      expect(isProjectTemporarilyClosed(project)).toBe(true);
    });

    it('returns false when temporarilyClosed is undefined', () => {
      const project = createMockProject();
      expect(isProjectTemporarilyClosed(project)).toBe(false);
    });

    it('returns false when temporarilyClosed is false', () => {
      const project = createMockProject({ temporarilyClosed: false });
      expect(isProjectTemporarilyClosed(project)).toBe(false);
    });
  });

  describe('visibility predicates', () => {
    it('isProjectPublic returns true for public visibility', () => {
      const project = createMockProject({ visibility: PROJECT_VISIBILITY_PUBLIC });
      expect(isProjectPublic(project)).toBe(true);
    });

    it('isProjectRestricted returns true for restricted visibility', () => {
      const project = createMockProject({ visibility: PROJECT_VISIBILITY_RESTRICTED });
      expect(isProjectRestricted(project)).toBe(true);
    });

    it('isProjectPrivate returns true for private visibility', () => {
      const project = createMockProject({ visibility: PROJECT_VISIBILITY_PRIVATE });
      expect(isProjectPrivate(project)).toBe(true);
    });
  });

  describe('doesProjectHaveRejectFeedbacks', () => {
    it('returns true when feedbacks exist', () => {
      const instance = createMockProjectInstance({
        rejectFeedbacks: [{ projectID: 'p1', sentBy: 'admin', date: 123, feedback: 'No' }],
      });
      expect(doesProjectHaveRejectFeedbacks(instance)).toBe(true);
    });

    it('returns false when feedbacks array is empty', () => {
      const instance = createMockProjectInstance({ rejectFeedbacks: [] });
      expect(doesProjectHaveRejectFeedbacks(instance)).toBe(false);
    });
  });

  describe('isProjectCreatedByGroupAdmin', () => {
    it('returns true when createdByGroupAdmin is set', () => {
      const project = createMockProject({ createdByGroupAdmin: 'admin-1' });
      expect(isProjectCreatedByGroupAdmin(project)).toBe(true);
    });

    it('returns false when createdByGroupAdmin is undefined', () => {
      const project = createMockProject();
      expect(isProjectCreatedByGroupAdmin(project)).toBe(false);
    });
  });

  describe('getPitchCover', () => {
    it('returns null when cover is undefined', () => {
      const project = createMockProject();
      expect(getPitchCover(project)).toBeNull();
    });

    it('returns null when all covers are removed', () => {
      const project = createMockProject({
        Pitch: {
          postedDate: 0,
          status: PITCH_STATUS_ON_GOING,
          cover: [createMockPitchCover({ removed: true })],
        },
      });
      expect(getPitchCover(project)).toBeNull();
    });

    it('returns the active cover', () => {
      const activeCover = createMockPitchCover({ url: 'active.png' });
      const project = createMockProject({
        Pitch: {
          postedDate: 0,
          status: PITCH_STATUS_ON_GOING,
          cover: [createMockPitchCover({ removed: true }), activeCover],
        },
      });
      expect(getPitchCover(project)).toEqual(activeCover);
    });
  });

  describe('isImagePitchCover / isVideoPitchCover', () => {
    it('isImagePitchCover returns true for image type', () => {
      expect(isImagePitchCover(createMockPitchCover({ fileType: FILE_TYPE_IMAGE }))).toBe(true);
    });

    it('isVideoPitchCover returns true for video type', () => {
      expect(isVideoPitchCover(createMockPitchCover({ fileType: FILE_TYPE_VIDEO }))).toBe(true);
    });

    it('isImagePitchCover returns false for video type', () => {
      expect(isImagePitchCover(createMockPitchCover({ fileType: FILE_TYPE_VIDEO }))).toBe(false);
    });
  });

  describe('isProjectOwner', () => {
    it('returns true when issuer owns the project', () => {
      const user = createMockUser({ id: 'user-1' });
      const project = createMockProject({ issuerID: 'user-1' });
      expect(isProjectOwner(user, project)).toBe(true);
    });

    it('returns false when issuer does not own the project', () => {
      const user = createMockUser({ id: 'user-2' });
      const project = createMockProject({ issuerID: 'user-1' });
      expect(isProjectOwner(user, project)).toBe(false);
    });

    it('returns true when group admin owns the project via anid', () => {
      const admin = createMockAdmin({ anid: 'group-1' });
      const project = createMockProject({ anid: 'group-1' });
      expect(isProjectOwner(admin, project)).toBe(true);
    });

    it('returns false for super admin (does not own projects)', () => {
      const superAdmin = createMockSuperAdmin();
      const project = createMockProject();
      expect(isProjectOwner(superAdmin, project)).toBe(false);
    });
  });

  describe('shouldHideProjectInformationFromUser', () => {
    it('does not hide from super admin', () => {
      const superAdmin = createMockSuperAdmin();
      const project = createMockProject({ visibility: PROJECT_VISIBILITY_PRIVATE });
      expect(shouldHideProjectInformationFromUser(superAdmin, [], project)).toBe(false);
    });

    it('does not hide from group admin who owns the project', () => {
      const admin = createMockAdmin({ anid: 'group-1' });
      const project = createMockProject({
        anid: 'group-1',
        visibility: PROJECT_VISIBILITY_PRIVATE,
      });
      expect(shouldHideProjectInformationFromUser(admin, [], project)).toBe(false);
    });

    it('hides private project from other group admins', () => {
      const admin = createMockAdmin({ anid: 'group-2' });
      const project = createMockProject({
        anid: 'group-1',
        visibility: PROJECT_VISIBILITY_PRIVATE,
      });
      expect(shouldHideProjectInformationFromUser(admin, [], project)).toBe(true);
    });

    it('does not hide public project from other group admins', () => {
      const admin = createMockAdmin({ anid: 'group-2' });
      const project = createMockProject({ anid: 'group-1', visibility: PROJECT_VISIBILITY_PUBLIC });
      expect(shouldHideProjectInformationFromUser(admin, [], project)).toBe(false);
    });

    it('does not hide from issuer who owns the project', () => {
      const user = createMockUser({ id: 'user-1' });
      const project = createMockProject({
        issuerID: 'user-1',
        visibility: PROJECT_VISIBILITY_PRIVATE,
      });
      expect(shouldHideProjectInformationFromUser(user, [], project)).toBe(false);
    });

    it('does not hide from member of the project group', () => {
      const user = createMockInvestor({ id: 'investor-1' });
      const membership = createMockGroupOfMembership({
        group: { anid: 'group-1' } as any,
      });
      const project = createMockProject({
        anid: 'group-1',
        visibility: PROJECT_VISIBILITY_PRIVATE,
      });
      expect(shouldHideProjectInformationFromUser(user, [membership], project)).toBe(false);
    });

    it('hides restricted project from non-member users', () => {
      const user = createMockInvestor({ id: 'investor-2' });
      const project = createMockProject({
        anid: 'group-1',
        visibility: PROJECT_VISIBILITY_RESTRICTED,
      });
      expect(shouldHideProjectInformationFromUser(user, [], project)).toBe(true);
    });

    it('does not hide public project from non-member users', () => {
      const user = createMockInvestor({ id: 'investor-2' });
      const project = createMockProject({
        anid: 'group-1',
        visibility: PROJECT_VISIBILITY_PUBLIC,
      });
      expect(shouldHideProjectInformationFromUser(user, [], project)).toBe(false);
    });
  });
});
