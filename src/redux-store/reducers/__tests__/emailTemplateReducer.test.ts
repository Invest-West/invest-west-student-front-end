import emailTemplateReducer, {
  EmailTemplateState,
  isLoadingTemplates,
  hasTemplatesError,
  getTemplates,
  getSettings,
  getConnectionStatus,
  getTemplateBySlug,
} from '../emailTemplateReducer';
import {
  EmailTemplateEvents,
  EmailTemplate,
  SMTPSettings,
} from '../../actions/emailTemplateActions';

const createMockTemplate = (overrides?: Partial<EmailTemplate>): EmailTemplate => ({
  id: 'tmpl-1',
  name: 'Welcome Email',
  slug: 'welcome',
  subject: 'Welcome!',
  htmlTemplate: '<p>Hello</p>',
  description: 'Welcome email template',
  variables: ['name', 'email'],
  isActive: true,
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  ...overrides,
});

const createMockSettings = (overrides?: Partial<SMTPSettings>): SMTPSettings => ({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: { user: 'test@gmail.com', pass: 'pass' },
  fromEmail: 'noreply@test.com',
  fromName: 'Test',
  provider: 'google',
  ...overrides,
});

describe('emailTemplateReducer', () => {
  const getInitialState = (): EmailTemplateState =>
    emailTemplateReducer(undefined, { type: 'INIT' } as any);

  it('returns initial state', () => {
    const state = getInitialState();
    expect(state.templates).toEqual([]);
    expect(state.settings).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.connectionStatus).toBeNull();
  });

  describe('LoadingTemplates', () => {
    it('sets loading true and clears error', () => {
      const prevState = { ...getInitialState(), error: 'previous error' };
      const state = emailTemplateReducer(prevState, {
        type: EmailTemplateEvents.LoadingTemplates,
      });
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });
  });

  describe('TemplatesLoaded', () => {
    it('stores templates and clears loading', () => {
      const templates = [createMockTemplate()];
      const state = emailTemplateReducer(
        { ...getInitialState(), loading: true },
        { type: EmailTemplateEvents.TemplatesLoaded, templates }
      );
      expect(state.loading).toBe(false);
      expect(state.templates).toEqual(templates);
      expect(state.error).toBeNull();
    });
  });

  describe('TemplatesError', () => {
    it('stores error and clears loading', () => {
      const state = emailTemplateReducer(
        { ...getInitialState(), loading: true },
        { type: EmailTemplateEvents.TemplatesError, error: 'Failed to load' }
      );
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Failed to load');
    });
  });

  describe('TemplateSaved', () => {
    it('updates existing template by id', () => {
      const existing = createMockTemplate({ id: 'tmpl-1', subject: 'Old' });
      const updated = createMockTemplate({ id: 'tmpl-1', subject: 'New' });
      const state = emailTemplateReducer(
        { ...getInitialState(), templates: [existing] },
        { type: EmailTemplateEvents.TemplateSaved, template: updated }
      );
      expect(state.templates).toHaveLength(1);
      expect(state.templates[0].subject).toBe('New');
    });

    it('adds new template when id does not exist', () => {
      const existing = createMockTemplate({ id: 'tmpl-1' });
      const newTemplate = createMockTemplate({ id: 'tmpl-2', slug: 'reset-password' });
      const state = emailTemplateReducer(
        { ...getInitialState(), templates: [existing] },
        { type: EmailTemplateEvents.TemplateSaved, template: newTemplate }
      );
      expect(state.templates).toHaveLength(2);
    });
  });

  describe('SettingsLoaded / SettingsSaved', () => {
    it('stores SMTP settings', () => {
      const settings = createMockSettings();
      const state = emailTemplateReducer(getInitialState(), {
        type: EmailTemplateEvents.SettingsLoaded,
        settings,
      });
      expect(state.settings).toEqual(settings);
    });
  });

  describe('ConnectionTested', () => {
    it('stores connection status true', () => {
      const state = emailTemplateReducer(getInitialState(), {
        type: EmailTemplateEvents.ConnectionTested,
        connected: true,
      });
      expect(state.connectionStatus).toBe(true);
    });

    it('stores connection status false', () => {
      const state = emailTemplateReducer(getInitialState(), {
        type: EmailTemplateEvents.ConnectionTested,
        connected: false,
      });
      expect(state.connectionStatus).toBe(false);
    });
  });

  describe('ClearState', () => {
    it('resets to initial state', () => {
      const modifiedState: EmailTemplateState = {
        templates: [createMockTemplate()],
        settings: createMockSettings(),
        loading: true,
        error: 'some error',
        connectionStatus: true,
      };
      const state = emailTemplateReducer(modifiedState, {
        type: EmailTemplateEvents.ClearState,
      });
      expect(state).toEqual(getInitialState());
    });
  });
});

describe('emailTemplate selectors', () => {
  const base: EmailTemplateState = {
    templates: [],
    settings: null,
    loading: false,
    error: null,
    connectionStatus: null,
  };

  it('isLoadingTemplates', () => {
    expect(isLoadingTemplates({ ...base, loading: true })).toBe(true);
    expect(isLoadingTemplates(base)).toBe(false);
  });

  it('hasTemplatesError', () => {
    expect(hasTemplatesError({ ...base, error: 'error' })).toBe(true);
    expect(hasTemplatesError(base)).toBe(false);
  });

  it('getTemplates', () => {
    const templates = [createMockTemplate()];
    expect(getTemplates({ ...base, templates })).toBe(templates);
  });

  it('getSettings', () => {
    const settings = createMockSettings();
    expect(getSettings({ ...base, settings })).toBe(settings);
  });

  it('getConnectionStatus', () => {
    expect(getConnectionStatus({ ...base, connectionStatus: true })).toBe(true);
  });

  it('getTemplateBySlug finds by slug', () => {
    const templates = [
      createMockTemplate({ slug: 'welcome' }),
      createMockTemplate({ slug: 'reset', id: 'tmpl-2' }),
    ];
    expect(getTemplateBySlug({ ...base, templates }, 'reset')!.slug).toBe('reset');
    expect(getTemplateBySlug({ ...base, templates }, 'nonexistent')).toBeUndefined();
  });
});
