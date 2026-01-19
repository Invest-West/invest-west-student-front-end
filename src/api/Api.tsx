import axios, {AxiosError, AxiosRequestConfig, AxiosResponse, Method} from "axios";
import firebase from "../firebase/firebaseApp";
import HttpResponseError from "./ResponseError";

/**
 * Api routes
 */

export class ApiRoutes {
    static systemAttributesBaseRoute = "/system-attributes";
    static retrieveSystemAttributesRoute = ApiRoutes.systemAttributesBaseRoute + "/retrieve";
    static updateSystemAttributesRoute = ApiRoutes.systemAttributesBaseRoute + "/update";

    static authBaseRoute = "/auth";
    static requestResetPasswordRoute = ApiRoutes.authBaseRoute + "/request-reset-password";
    static verifyAuthRoute = ApiRoutes.authBaseRoute + "/verify";
    

    static emailBaseRoute = "/email";
    static sendEmailRoute = ApiRoutes.emailBaseRoute + "/send";

    // Email template management routes (super admin only)
    static emailTemplatesRoute = ApiRoutes.emailBaseRoute + "/templates";
    static emailSettingsRoute = ApiRoutes.emailBaseRoute + "/settings";
    static emailTestConnectionRoute = ApiRoutes.emailBaseRoute + "/test-connection";
    static emailSendTestRoute = ApiRoutes.emailBaseRoute + "/send-test";
    static emailPreviewRoute = ApiRoutes.emailBaseRoute + "/preview";
    static emailSeedTemplatesRoute = ApiRoutes.emailBaseRoute + "/seed-templates";

    static usersBaseRoute = "/users";
    static createUser = ApiRoutes.usersBaseRoute + "/create";
    static retrieveUser = ApiRoutes.usersBaseRoute + "/:uid/retrieve";
    static retrieveInvitedUser = ApiRoutes.usersBaseRoute + "/:invitedUserID/retrieve-invited";
    static updateUser = ApiRoutes.usersBaseRoute + "/update";
    static listGroupsOfMembership = ApiRoutes.usersBaseRoute + "/:uid/groups-of-membership";
    static exportUsersCsvRoute = ApiRoutes.usersBaseRoute + "/export";

    static groupsBaseRoute = "/groups";
    static listGroups = ApiRoutes.groupsBaseRoute + "/list";
    static retrieveGroup = ApiRoutes.groupsBaseRoute + "/:groupUserName";
    static updateGroupLogo = ApiRoutes.groupsBaseRoute + "/:groupUserName/update-logo";
    static updateCourseImage = ApiRoutes.groupsBaseRoute + "/:groupUserName/courses/:courseUserName/update-image";
    static updateCourseName = ApiRoutes.groupsBaseRoute + "/:groupUserName/courses/:courseUserName/update-name";
    static deleteUniversity = ApiRoutes.groupsBaseRoute + "/:groupUserName/delete";
    static deleteCourse = ApiRoutes.groupsBaseRoute + "/:groupUserName/courses/:courseUserName/delete";
    static addMembersToGroup = ApiRoutes.groupsBaseRoute + "/:group/add-members";
    static listGroupMembers = ApiRoutes.groupsBaseRoute + "/:group/list-members";

    static projectsBaseRoute = "/projects";
    static listProjectsRoute = ApiRoutes.projectsBaseRoute + "/list";
    static sendProjectBackToIssuerRoute = ApiRoutes.projectsBaseRoute + "/send-back-to-issuer";
    static exportProjectsToCsvRoute = ApiRoutes.projectsBaseRoute + "/export";

    static groupAdminsBaseRoute = "/group-admins";
    static addGroupAdminRoute = ApiRoutes.groupAdminsBaseRoute + "/add";

    static accessRequestsBaseRoute = "/access-requests";
    static listAccessRequestsRoute = ApiRoutes.accessRequestsBaseRoute + "/list";
    static createAccessRequestRoute = ApiRoutes.accessRequestsBaseRoute + "/create";
    static removeAccessRequestRoute = ApiRoutes.createAccessRequestRoute + "/remove";

    static courseRequestsBaseRoute = "/course-requests";
    static listCourseRequestsRoute = ApiRoutes.courseRequestsBaseRoute + "/list";
    static createCourseRequestRoute = ApiRoutes.courseRequestsBaseRoute + "/create";
    static approveCourseRequestRoute = ApiRoutes.courseRequestsBaseRoute + "/approve";
    static rejectCourseRequestRoute = ApiRoutes.courseRequestsBaseRoute + "/reject";

    static adminAccessRequestsBaseRoute = "/admin-access-requests";
    static listAdminAccessRequestsRoute = ApiRoutes.adminAccessRequestsBaseRoute + "/list";
    static createAdminAccessRequestRoute = ApiRoutes.adminAccessRequestsBaseRoute + "/create";
    static approveAdminAccessRequestRoute = ApiRoutes.adminAccessRequestsBaseRoute + "/approve";
    static rejectAdminAccessRequestRoute = ApiRoutes.adminAccessRequestsBaseRoute + "/reject";

    static fileBaseRoute = "/file";
    static uploadSingleFileRoute = ApiRoutes.fileBaseRoute + "/upload-single";

    static testRoute = "/test";
}

export interface RequestOptionalParams {
    requestBody: any | null;
    queryParameters: any | null;
}

/**
 * Api class
 */
export default class Api {
    baseUrl: string | undefined = process.env.REACT_APP_BACK_END_BASE_URL;

    /**
     * Build request URL
     *
     * @param endPoint
     * @param queryParameters
     * @private
     */
    private buildUrl(endPoint: string, queryParameters: any): string {
        const queryString = Api.buildQueryParameters(queryParameters);
        let fullUrl = this.baseUrl + endPoint + queryString;

        if (endPoint.includes('projects')) {
            console.log('[API] Building URL for projects endpoint:', {
                endPoint,
                queryParameters,
                queryString,
                fullUrl
            });
        }

        return encodeURI(fullUrl);
    }

    /**
     * Build query parameters
     *
     * @param queryParameters
     * @private
     */
    private static buildQueryParameters(queryParameters: any): string {
        if (queryParameters === null) {
            return "";
        }

        let result: string = "?";

        for (let key in queryParameters) {
            if (queryParameters.hasOwnProperty(key)) {
                let value = queryParameters[key];
                if (value !== undefined && value !== null) {
                    if (!result.endsWith("?")) {
                        result += "&";
                    }
                    result += `${key}=${value.toString()}`;
                }
            }
        }

        if (result.endsWith("?")) {
            result = "";
        }

        return result;
    }

    /**
     * Build form data
     *
     * @param data
     * @private
     */
    private static buildFormData(data: any): FormData | null {
        if (data === null) {
            return null;
        }

        const formData = new FormData();

        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                let value = data[key];
                if (value !== undefined && value !== null) {
                    formData.append(key, value);
                }
            }
        }

        return formData;
    }

    /**
     * Send request
     *
     * @param requestType
     * @param endPoint
     * @param optionalParams
     * @param formDataRequest
     */
    public async request(requestType: Method,
                         endPoint: string,
                         optionalParams?: RequestOptionalParams | null,
                         formDataRequest?: boolean
    ): Promise<AxiosResponse> {
        if (endPoint === null || endPoint.length === 0) {
            throw new Error("Empty url");
        }

        const url: string = this.buildUrl(
            endPoint,
            optionalParams !== undefined && optionalParams !== null && optionalParams.queryParameters !== null
                ? optionalParams.queryParameters
                : null
        );

        let currentUser: firebase.default.User | null = firebase.auth().currentUser;

        try {
            let idToken: string | null = null;

            if (currentUser) {
                try {
                    // Get ID token - Firebase will auto-refresh if expired
                    idToken = await currentUser.getIdToken();
                } catch (tokenError) {
                    console.error('Failed to get ID token:', tokenError);
                    // If token retrieval fails, try to force refresh once
                    try {
                        idToken = await currentUser.getIdToken(true);
                    } catch (refreshError) {
                        console.error('Failed to refresh ID token:', refreshError);
                        throw new Error('Authentication token could not be retrieved. Please try logging in again.');
                    }
                }
            }

            let bodyData: any;

            if (formDataRequest !== undefined && formDataRequest) {
                bodyData = optionalParams !== undefined && optionalParams !== null
                && optionalParams.requestBody !== null
                    ? Api.buildFormData(optionalParams.requestBody)
                    : null;
            }
            else {
                bodyData = optionalParams !== undefined && optionalParams !== null
                && optionalParams.requestBody !== null
                    ? optionalParams.requestBody
                    : null;
            }

            const config: AxiosRequestConfig = {
                method: requestType,
                url: url,
                data: bodyData,
                timeout: 20000 // timeout in 20 seconds
            };

            if (idToken) {
                config.headers = {
                    "Authorization": idToken
                }

                if (formDataRequest !== undefined && formDataRequest) {
                    config.headers = {
                        ...config.headers,
                        // @ts-ignore
                        "Content-Type": `multipart/form-data; boundary=${bodyData._boundary}`
                    }
                }
            }

            let response: AxiosResponse = await axios.request(config);

            return this.parseResponse(response);
        } catch (exception) {
            const error = Api.parseError(exception);
            console.log(`Failed to request. Status code: ${error.statusCode}. Cause: ${error.message}`);
            throw new Error(error.statusCode + " " + error.message);
        }
    }

    /**
     * Parse response
     *
     * @param response
     * @private
     */
    private parseResponse(response: AxiosResponse) {
        if (response === null) {
            throw new Error("Null response.");
        }

        if (this.isRequestSuccessful(response)) {
            return response;
        }

        throw new Error("Response error.");
    }

    /**
     * Parse error
     *
     * @param error
     * @private
     */
    private static parseError(error: AxiosError) {
        let httpError: HttpResponseError = {
            statusCode: -1,
            message: ""
        };

        // client received an error response (5xx, 4xx) form the server
        if (error.response) {
            if (error.response.data) {
                httpError = {
                    statusCode: error.response.data.code,
                    message: error.response.data.detail ?? error.response.data.message
                }
            }
        }
        // client never received a response, or request never left
        else if (error.request) {
            httpError = {
                statusCode: -1,
                message: "Server is not responding."
            }
        }
        // anything else
        else {
            httpError = {
                statusCode: -1,
                message: "Unexpected error."
            }
        }

        return httpError;
    }

    /**
     * Check if a request is successful by checking the response code
     *
     * @param response
     */
    public isRequestSuccessful(response: AxiosResponse): boolean {
        return response != null && response.status >= 200 && response.status < 300;
    }

    // Static instance for convenience methods
    private static instance = new Api();

    /**
     * Convenience method for GET requests
     */
    public static async doGet(endpoint: string, queryParameters?: any): Promise<AxiosResponse> {
        return Api.instance.request('GET', endpoint, { requestBody: null, queryParameters });
    }

    /**
     * Convenience method for POST requests
     */
    public static async doPost(endpoint: string, requestBody?: any, queryParameters?: any): Promise<AxiosResponse> {
        return Api.instance.request('POST', endpoint, { requestBody, queryParameters });
    }

    /**
     * Convenience method for PUT requests
     */
    public static async doPut(endpoint: string, requestBody?: any, queryParameters?: any): Promise<AxiosResponse> {
        return Api.instance.request('PUT', endpoint, { requestBody, queryParameters });
    }

    /**
     * Convenience method for DELETE requests
     */
    public static async doDelete(endpoint: string, queryParameters?: any): Promise<AxiosResponse> {
        return Api.instance.request('DELETE', endpoint, { requestBody: null, queryParameters });
    }
}