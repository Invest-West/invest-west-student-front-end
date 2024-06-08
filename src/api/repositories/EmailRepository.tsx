import Api, {ApiRoutes} from "../Api";

export enum ClientEmailTypes {
    EnquiryEmail,
    InvitationEmail,
    PitchPublished,
    NewPitchSubmitted,
    ContactResource,
    ContactPitchOwner
}

export interface EmailData {
    emailType: number;
    emailInfo: EmailInfo;
}

export interface EmailInfo {
    receiver: string | string[];
    sender?: string;

    [others: string]: any;
}

export interface UserInvitationEmailData extends EmailInfo {
    groupName: string;
    groupLogo: string;
    groupWebsite: string;
    groupContactUs: string;
    userType: string;
    signupURL: string;
}

export interface EnquiryEmailData extends EmailInfo {
    isAuthenticatedRequest: boolean;
    subject: string;
    description: string;
    senderName: string;
    senderPhone: string;
}

export interface PitchPublishedEmailData extends EmailInfo {
    projectID: string;
}

export interface NewPitchSubmittedEmailData extends EmailInfo {
    projectID: string;
}

export interface ContactResourceEmailData extends EmailInfo {
    userName: string;
    userCompanyName?: string;
}

export interface ContactPitchOwnerEmailData extends EmailInfo {
    userName: string;
    projectName: string;
}

export default class EmailRepository {

    /**
     * Send email
     *
     * @param data
     */
    public async sendEmail(data: EmailData) {
        return await new Api()
            .request(
                "post",
                ApiRoutes.sendEmailRoute,
                {
                    queryParameters: null,
                    requestBody: data
                }
            );
    }
}