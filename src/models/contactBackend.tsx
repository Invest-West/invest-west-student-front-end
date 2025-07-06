import {error400, error403, error404, error500} from "../../api/error/error_dict";
import * as verifyAuthEndPoint from "../auth/auth_viewsets";
import firebaseAdmin from "../../firebase/admin";
import * as DB_CONST from "../../firebase/database_consts";
import sgMail from "@sendgrid/mail";
import User from "../../models/user";
import Admin, {isAdmin} from "../../models/admin";
import {Request, Response} from "express";
import admin from "firebase-admin";
import {ProjectInstance} from "../../models/project";
import {fetchGroupAdmins, getProject} from "../../firebase/realtime_database";
import DataSnapshot = admin.database.DataSnapshot;

/**
 * SendGrid message interface
 */
interface SendGridEmailMessage {
    cc?: string | string[];
    from: string;
    to: string | string[];
    templateId: string;
    dynamic_template_data: any;
}

export enum ClientEmailTypes {
    EnquiryEmail,
    InvitationEmail,
    PitchPublished,
    NewPitchSubmitted,
    ContactResource,
    ContactPitchOwner
}

export enum ServerEmailTypes {
    inviteSuperGroupAdmin,
    inviteNormalGroupAdmin,
    sendProjectBackToIssuer,
    welcomePublicRegistrationUser,
    resetPassword
}

/**
 * Email data interface
 * --> Specify the format of the data the server should receive.
 */
interface EmailData {
    emailType: number;
    emailInfo: EmailInfo;
}

export interface EmailInfo {
    receiver: string | string[];
    sender?: string;

    [others: string]: any;
}

interface UserInvitationEmailData extends EmailInfo {
    groupName: string;
    groupLogo: string;
    groupWebsite: string;
    groupContactUs: string;
    userType: string;
    signupURL: string;
}

interface EnquiryEmailData extends EmailInfo {
    isAuthenticatedRequest: boolean;
    subject: string;
    description: string;
    senderName: string;
    senderPhone: string;
}

interface PitchPublishedEmailData extends EmailInfo {
    projectID: string;
}

interface NewPitchSubmittedEmailData extends EmailInfo {
    projectID: string;
}

interface ContactResourceEmailData extends EmailInfo {
    userName: string;
    userCompanyName?: string;
}

interface ContactPitchOwnerEmailData extends EmailInfo {
    userName: string;
    projectName: string;
}

/**
 * Send email for client
 *
 * @param request
 * @param res
 */
export const sendEmailClient = async (request: Request, res: Response) => {
    // get query parameters from the request
    const emailData: EmailData = request.body;

    if (emailData.emailType === undefined || emailData.emailInfo === undefined) {
        // bad request
        return res.status(error400.code).send(error400);
    }

    try {
        // verify authentication if making request to send invitation email
        if (emailData.emailType === ClientEmailTypes.InvitationEmail.valueOf()) {
            // verify if the request is an authenticated one
            let user: User | Admin = await verifyAuthEndPoint.verifyAuth(request);

            // do not allow non-admin users to send invitation email
            if (user.type !== DB_CONST.TYPE_ADMIN) {
                return res.status(error403.code).send(error403);
            }
        }
            // don't need to verify authentication if making request to send enquiry email
        // because unauthenticated users can also perform this action
        else {
            // do nothing
        }

        // message to be sent in the email
        let message: SendGridEmailMessage;

        switch (emailData.emailType) {
            // enquiry email from users to group group-admins
            case ClientEmailTypes.EnquiryEmail: {
                // get email info
                const emailInfo: EmailInfo = emailData.emailInfo;
                const enquiryEmailData: EnquiryEmailData = (emailInfo as EnquiryEmailData);

                if (!enquiryEmailData.sender) {
                    return res.status(error400.code).send(error400);
                }

                message = {
                    from: enquiryEmailData.sender,
                    to: enquiryEmailData.receiver, // anid of the receiving group or "superAdmin" if sending from the original Invest West page
                    templateId: "d-340523b8bd0b470bae6eaf203f78daf4",
                    dynamic_template_data: {
                        senderEmail: enquiryEmailData.sender,
                        senderName:
                            enquiryEmailData.senderName.trim().length === 0 ? "Not provided" : enquiryEmailData.senderName,
                        senderPhone:
                            enquiryEmailData.senderPhone.trim().length === 0 ? "Not provided" : enquiryEmailData.senderPhone,
                        subject: enquiryEmailData.subject,
                        description: enquiryEmailData.description.split("\n").join("<br>")
                    }
                };

                let firebaseRef: any = firebaseAdmin.database();

                if (enquiryEmailData.receiver === "InvestWestSupport") {
                    firebaseRef = firebaseRef
                        .ref(DB_CONST.CLUB_ATTRIBUTES_CHILD)
                        .child("supportEmail");
                } else {
                    firebaseRef = firebaseRef
                        .ref(DB_CONST.ADMINISTRATORS_CHILD)
                        .orderByChild("anid")
                        .equalTo(emailInfo.receiver);
                }

                const snapshots: DataSnapshot = await firebaseRef.once("value");

                if (!snapshots.val()
                    || (emailInfo.receiver !== "InvestWestSupport"
                        && snapshots.val()
                        && snapshots.numChildren() === 0
                    )
                ) {
                    return res.status(error404.code).send(error404);
                }

                let receiverEmail = "";

                // send to super admin
                if (snapshots.numChildren() === 0) {
                    receiverEmail = snapshots.val();
                }
                // send to group admin
                else {
                    snapshots.forEach((snapshot: any) => {
                        receiverEmail = snapshot.val().email;
                    });
                }

                message.to = receiverEmail;
                break;
            }
            // user invitation email
            case ClientEmailTypes.InvitationEmail: {
                // get data from the request
                const emailInfo: EmailInfo = emailData.emailInfo;
                const invitationEmailData: UserInvitationEmailData = (emailInfo as UserInvitationEmailData);

                if (!invitationEmailData.sender) {
                    return res.status(error400.code).send(error400);
                }

                message = {
                    from: invitationEmailData.sender,
                    to: invitationEmailData.receiver,
                    templateId: "d-a8203c44105c428c9572ac721d5b1280",
                    dynamic_template_data: {
                        groupName: invitationEmailData.groupName,
                        groupLogo: invitationEmailData.groupLogo,
                        groupWebsite: invitationEmailData.groupWebsite,
                        groupContactUs: invitationEmailData.groupContactUs,
                        userName: invitationEmailData.receiverName,
                        userType: invitationEmailData.userType,
                        signupURL: invitationEmailData.signupURL
                    }
                };
                break;
            }
            case ClientEmailTypes.PitchPublished: {
                // get data from the request
                const emailInfo: EmailInfo = emailData.emailInfo;
                const pitchPublishedEmailData: PitchPublishedEmailData = (emailInfo as PitchPublishedEmailData);

                const projectInstance: ProjectInstance = await getProject(pitchPublishedEmailData.projectID);
                if (!projectInstance) {
                    return res.status(error404.code).send(error404);
                }

                const issuer: User | Admin = projectInstance.issuer;
                const adminIssuer: Admin | null = isAdmin(issuer);
                // don't need to send email to admins
                if (adminIssuer) {
                    return res.status(200).send();
                }

                message = {
                    from: "support@investwest.online",
                    to: issuer.email,
                    templateId: "d-93dffdb984ef4070a471aba7074c1e38",
                    dynamic_template_data: {
                        projectName: projectInstance.projectDetail.projectName,
                        projectUrl: `${process.env.FRONT_END_BASE_URL}/groups/${projectInstance.group.groupUserName}/projects/${projectInstance.projectDetail.id}`
                    }
                };
                break;
            }
            case ClientEmailTypes.NewPitchSubmitted: {
                // get data from the request
                const emailInfo: EmailInfo = emailData.emailInfo;
                const newPitchSubmittedEmailData: NewPitchSubmittedEmailData = (emailInfo as NewPitchSubmittedEmailData);

                const projectInstance: ProjectInstance = await getProject(newPitchSubmittedEmailData.projectID);
                if (!projectInstance) {
                    return res.status(error404.code).send(error404);
                }

                const issuer: User | Admin = projectInstance.issuer;
                const adminIssuer: Admin | null = isAdmin(issuer);
                // don't need to send email to admins
                if (adminIssuer) {
                    return res.status(200).send();
                }

                const groupAdmins: Admin[] = await fetchGroupAdmins(projectInstance.group.anid);
                if (groupAdmins.length === 0) {
                    return res.status(error400.code).send(error400);
                }

                message = {
                    from: "support@investwest.online",
                    to: groupAdmins.map(groupAdmin => groupAdmin.email),
                    templateId: "d-cf26380982e0483db9dcb5596c2d40eb",
                    dynamic_template_data: {
                        projectUrl: `${process.env.FRONT_END_BASE_URL}/groups/${projectInstance.group.groupUserName}/projects/${projectInstance.projectDetail.id}`
                    }
                };
                break;
            }
            case ClientEmailTypes.ContactResource: {
                // get data from the request
                const emailInfo: EmailInfo = emailData.emailInfo;
                const contactResourceEmailData: ContactResourceEmailData = (emailInfo as ContactResourceEmailData);

                if (!contactResourceEmailData.sender) {
                    return res.status(error400.code).send(error400);
                }

                message = {
                    from: contactResourceEmailData.sender,
                    to: contactResourceEmailData.receiver,
                    templateId: "d-6d2e169b85364e4898af291f08eda814",
                    cc: "support@investwest.online", // cc Invest West
                    dynamic_template_data: {
                        userName: contactResourceEmailData.userName,
                        userCompanyName: contactResourceEmailData.userCompanyName,
                        userEmail: contactResourceEmailData.sender
                    }
                };
                break;
            }
            case ClientEmailTypes.ContactPitchOwner: {
                // get data from the request
                const emailInfo: EmailInfo = emailData.emailInfo;
                const contactPitchOwnerEmailData: ContactPitchOwnerEmailData = (emailInfo as ContactPitchOwnerEmailData);

                if (!contactPitchOwnerEmailData.sender) {
                    return res.status(error400.code).send(error400);
                }

                message = {
                    from: "support@investwest.online", // Use support email as sender
                    to: contactPitchOwnerEmailData.receiver,
                    templateId: "d-a051ed1251054a96a27aa9ba801d4e01",
                    dynamic_template_data: {
                        userName: contactPitchOwnerEmailData.userName,
                        projectName: contactPitchOwnerEmailData.projectName,
                        senderEmail: contactPitchOwnerEmailData.sender,
                        senderName: contactPitchOwnerEmailData.userName
                    }
                };
                break;
            }
            default:
                // bad request
                return res.status(error400.code).send(error400);
        }

        await sendSendGridEmail(message);
        return res.status(200).send();
    } catch (error) {
        console.error('Error in sendEmailClient:', error);
        if (error.hasOwnProperty("code")) {
            return res.status(error.code).send(error);
        } else {
            return res.status(error500.code).send(error500);
        }
    }
}
//----------------------------------------------------------------------------------------------------------------------

/**
 * Send email for server
 *
 */
export const sendEmailServer = async (data: EmailData): Promise<void> => {
    const emailData: EmailData = data;
    let message: SendGridEmailMessage;

    switch (emailData.emailType) {
        case ServerEmailTypes.inviteSuperGroupAdmin:
            message = {
                to: emailData.emailInfo.receiver,
                from: "support@investwest.online",
                templateId: "d-0a6759f7a6c34736847b289609dbe702",
                dynamic_template_data: {
                    groupName: emailData.emailInfo.groupName,
                    groupLogo: emailData.emailInfo.groupLogo,
                    email: emailData.emailInfo.receiver,
                    password: emailData.emailInfo.password,
                    website: emailData.emailInfo.website
                }
            };
            break;
        case ServerEmailTypes.inviteNormalGroupAdmin:
            if (!emailData.emailInfo.sender) {
                throw error400;
            }
            message = {
                to: emailData.emailInfo.receiver,
                from: emailData.emailInfo.sender,
                templateId: "d-237e9d5f76384b52a861e5a0676d11a4",
                dynamic_template_data: {
                    groupName: emailData.emailInfo.groupName,
                    groupLogo: emailData.emailInfo.groupLogo,
                    email: emailData.emailInfo.receiver,
                    password: emailData.emailInfo.password,
                    website: emailData.emailInfo.website
                }
            };
            break;
        case ServerEmailTypes.sendProjectBackToIssuer:
            message = {
                to: emailData.emailInfo.receiver,
                from: "support@investwest.online",
                templateId: "d-3a370bac1005427fb68e2f92c6522f53",
                dynamic_template_data: {
                    project: emailData.emailInfo.projectName,
                    feedback: emailData.emailInfo.feedback.split("\n").join("<br>")
                }
            };
            break;
        case ServerEmailTypes.welcomePublicRegistrationUser:
            message = {
                to: emailData.emailInfo.receiver,
                from: "support@investwest.online",
                templateId: "d-d720512e81274a99a46ba9b38cc7ee61",
                dynamic_template_data: {
                    userName: emailData.emailInfo.userName,
                    groupName: emailData.emailInfo.groupName,
                    groupLogo: emailData.emailInfo.groupLogo,
                    groupWebsite: emailData.emailInfo.groupWebsite,
                    groupContactUs: emailData.emailInfo.groupContactUs,
                    signInURL: emailData.emailInfo.signInURL
                }
            };
            break;
        case ServerEmailTypes.resetPassword:
            message = {
                to: emailData.emailInfo.receiver,
                from: "support@investwest.online",
                templateId: "d-04b2585dcce94520a8c6861b4c4422d6",
                dynamic_template_data: {
                    resetPasswordLink: emailData.emailInfo.resetPasswordLink
                }
            };
            break;
        default:
            throw error400;
    }
    
    try {
        await sendSendGridEmail(message);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
}
//----------------------------------------------------------------------------------------------------------------------

/**
 * Send email via SendGrid api
 *
 * @param message The SendGrid email message to be sent.
 * @returns {Promise<void>}
 */
export const sendSendGridEmail = async (message: SendGridEmailMessage): Promise<void> => {
    console.log('Preparing to send email...');

    sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");
    console.log(`Set SendGrid API Key: ${process.env.SENDGRID_API_KEY ? 'API key is set' : 'API key is missing'}`);

    try {
        console.log(`Sending email to: ${message.to}`);
        console.log(`Email template ID: ${message.templateId}`);
        console.log(`Email data:`, message.dynamic_template_data);
        
        const response = await sgMail.send(message);
        console.log(`Email sent successfully. Response: ${JSON.stringify(response)}`);
    } catch (error) {
        console.error(`Error sending email: ${error}`);
        // Log detailed error information if available
        if (error.response) {
            console.error(`Response body: ${JSON.stringify(error.response.body)}`);
            console.error(`Status Code: ${error.response.statusCode}`);
            console.error(`Headers: ${JSON.stringify(error.response.headers)}`);
        }
        // Re-throw the error or handle it as needed for your application
        throw error;
    }
};
//----------------------------------------------------------------------------------------------------------------------