/**
 * Email Template Reducer
 *
 * Redux reducer for managing email templates and SMTP settings state.
 */
import {
    EmailTemplate,
    SMTPSettings,
    EmailTemplateAction,
    EmailTemplateEvents,
    TemplatesLoadedAction,
    TemplatesErrorAction,
    TemplateSavedAction,
    SettingsLoadedAction,
    ConnectionTestedAction
} from "../actions/emailTemplateActions";

/**
 * Email Template State interface
 */
export interface EmailTemplateState {
    templates: EmailTemplate[];
    settings: SMTPSettings | null;
    loading: boolean;
    error: string | null;
    connectionStatus: boolean | null;
}

/**
 * Initial state
 */
const initialState: EmailTemplateState = {
    templates: [],
    settings: null,
    loading: false,
    error: null,
    connectionStatus: null
};

/**
 * Helper selectors
 */
export const isLoadingTemplates = (state: EmailTemplateState) => state.loading;
export const hasTemplatesError = (state: EmailTemplateState) => state.error !== null;
export const getTemplates = (state: EmailTemplateState) => state.templates;
export const getSettings = (state: EmailTemplateState) => state.settings;
export const getConnectionStatus = (state: EmailTemplateState) => state.connectionStatus;

/**
 * Find template by slug
 */
export const getTemplateBySlug = (state: EmailTemplateState, slug: string): EmailTemplate | undefined => {
    return state.templates.find(t => t.slug === slug);
};

/**
 * Email Template Reducer
 */
const emailTemplateReducer = (
    state: EmailTemplateState = initialState,
    action: EmailTemplateAction
): EmailTemplateState => {
    switch (action.type) {
        case EmailTemplateEvents.LoadingTemplates:
            return {
                ...state,
                loading: true,
                error: null
            };

        case EmailTemplateEvents.TemplatesLoaded:
            const templatesLoadedAction = action as TemplatesLoadedAction;
            return {
                ...state,
                loading: false,
                templates: templatesLoadedAction.templates,
                error: null
            };

        case EmailTemplateEvents.TemplatesError:
            const templatesErrorAction = action as TemplatesErrorAction;
            return {
                ...state,
                loading: false,
                error: templatesErrorAction.error
            };

        case EmailTemplateEvents.TemplateSaved:
            const templateSavedAction = action as TemplateSavedAction;
            const existingIndex = state.templates.findIndex(
                t => t.id === templateSavedAction.template.id
            );

            let updatedTemplates: EmailTemplate[];
            if (existingIndex >= 0) {
                // Update existing template
                updatedTemplates = state.templates.map((t, i) =>
                    i === existingIndex ? templateSavedAction.template : t
                );
            } else {
                // Add new template
                updatedTemplates = [...state.templates, templateSavedAction.template];
            }

            return {
                ...state,
                templates: updatedTemplates
            };

        case EmailTemplateEvents.SettingsLoaded:
        case EmailTemplateEvents.SettingsSaved:
            const settingsAction = action as SettingsLoadedAction;
            return {
                ...state,
                settings: settingsAction.settings
            };

        case EmailTemplateEvents.ConnectionTested:
            const connectionAction = action as ConnectionTestedAction;
            return {
                ...state,
                connectionStatus: connectionAction.connected
            };

        case EmailTemplateEvents.ClearState:
            return initialState;

        default:
            return state;
    }
};

export default emailTemplateReducer;
