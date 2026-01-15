/**
 * Email Template Actions
 *
 * Redux actions for managing email templates and SMTP settings.
 */
import { Action, ActionCreator, Dispatch } from "redux";
import Api, { ApiRoutes } from "../../api/Api";
import { AppState } from "../reducers";

/**
 * Email Template interface
 */
export interface EmailTemplate {
    id: string;
    name: string;
    slug: string;
    subject: string;
    htmlTemplate: string;
    description: string;
    variables: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * SMTP Settings interface
 */
export interface SMTPSettings {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
    fromEmail: string;
    fromName: string;
    provider: 'google' | 'custom';
}

/**
 * Email Template Events
 */
export enum EmailTemplateEvents {
    LoadingTemplates = "EmailTemplateEvents.LoadingTemplates",
    TemplatesLoaded = "EmailTemplateEvents.TemplatesLoaded",
    TemplatesError = "EmailTemplateEvents.TemplatesError",
    TemplateSaved = "EmailTemplateEvents.TemplateSaved",
    SettingsLoaded = "EmailTemplateEvents.SettingsLoaded",
    SettingsSaved = "EmailTemplateEvents.SettingsSaved",
    ConnectionTested = "EmailTemplateEvents.ConnectionTested",
    ClearState = "EmailTemplateEvents.ClearState"
}

/**
 * Action interfaces
 */
export interface EmailTemplateAction extends Action { }

export interface TemplatesLoadedAction extends EmailTemplateAction {
    templates: EmailTemplate[];
}

export interface TemplatesErrorAction extends EmailTemplateAction {
    error: string;
}

export interface TemplateSavedAction extends EmailTemplateAction {
    template: EmailTemplate;
}

export interface SettingsLoadedAction extends EmailTemplateAction {
    settings: SMTPSettings | null;
}

export interface ConnectionTestedAction extends EmailTemplateAction {
    connected: boolean;
}

/**
 * Load all email templates
 */
export const loadEmailTemplates: ActionCreator<any> = () => {
    return async (dispatch: Dispatch, getState: () => AppState) => {
        dispatch({ type: EmailTemplateEvents.LoadingTemplates });

        try {
            const response = await new Api().request('get', ApiRoutes.emailTemplatesRoute);
            const templates: EmailTemplate[] = response.data.templates || [];

            dispatch({
                type: EmailTemplateEvents.TemplatesLoaded,
                templates
            } as TemplatesLoadedAction);
        } catch (error: any) {
            dispatch({
                type: EmailTemplateEvents.TemplatesError,
                error: error.message || 'Failed to load templates'
            } as TemplatesErrorAction);
        }
    };
};

/**
 * Save email template (create or update)
 */
export const saveEmailTemplate: ActionCreator<any> = (template: Partial<EmailTemplate>) => {
    return async (dispatch: Dispatch) => {
        try {
            const response = await new Api().request('post', ApiRoutes.emailTemplatesRoute, {
                requestBody: template,
                queryParameters: null
            });

            dispatch({
                type: EmailTemplateEvents.TemplateSaved,
                template: response.data.template
            } as TemplateSavedAction);

            return { success: true, template: response.data.template };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };
};

/**
 * Load SMTP settings
 */
export const loadEmailSettings: ActionCreator<any> = () => {
    return async (dispatch: Dispatch) => {
        try {
            const response = await new Api().request('get', ApiRoutes.emailSettingsRoute);

            dispatch({
                type: EmailTemplateEvents.SettingsLoaded,
                settings: response.data.settings
            } as SettingsLoadedAction);
        } catch (error: any) {
            console.error('Error loading email settings:', error);
        }
    };
};

/**
 * Save SMTP settings
 */
export const saveEmailSettings: ActionCreator<any> = (settings: SMTPSettings) => {
    return async (dispatch: Dispatch) => {
        try {
            await new Api().request('post', ApiRoutes.emailSettingsRoute, {
                requestBody: settings,
                queryParameters: null
            });

            dispatch({
                type: EmailTemplateEvents.SettingsSaved,
                settings
            } as SettingsLoadedAction);

            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };
};

/**
 * Test SMTP connection
 */
export const testEmailConnection: ActionCreator<any> = () => {
    return async (dispatch: Dispatch) => {
        try {
            const response = await new Api().request('post', ApiRoutes.emailTestConnectionRoute, {
                requestBody: {},
                queryParameters: null
            });

            dispatch({
                type: EmailTemplateEvents.ConnectionTested,
                connected: response.data.connected
            } as ConnectionTestedAction);

            return response.data.connected;
        } catch (error: any) {
            dispatch({
                type: EmailTemplateEvents.ConnectionTested,
                connected: false
            } as ConnectionTestedAction);
            return false;
        }
    };
};

/**
 * Send test email
 */
export const sendTestEmail: ActionCreator<any> = (
    templateSlug: string,
    testEmail: string,
    testData: Record<string, any>
) => {
    return async () => {
        try {
            await new Api().request('post', ApiRoutes.emailSendTestRoute, {
                requestBody: { templateSlug, testEmail, testData },
                queryParameters: null
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };
};

/**
 * Seed default email templates
 */
export const seedDefaultTemplates: ActionCreator<any> = () => {
    return async (dispatch: Dispatch) => {
        try {
            await new Api().request('post', ApiRoutes.emailSeedTemplatesRoute, {
                requestBody: {},
                queryParameters: null
            });

            // Reload templates after seeding
            dispatch(loadEmailTemplates());
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    };
};

/**
 * Clear email template state
 */
export const clearEmailTemplateState: ActionCreator<EmailTemplateAction> = () => {
    return { type: EmailTemplateEvents.ClearState };
};
