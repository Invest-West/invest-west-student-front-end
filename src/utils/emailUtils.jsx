import axios from "axios";
import {ApiRoutes} from "../api/Api.tsx";
import firebase from "../firebase/firebaseApp";

/**
 * Check is an email address is valid
 *
 * @param email
 * @returns {boolean}
 */
export const isValidEmailAddress = (email) => {
    let RegExp = /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return RegExp.test(email.trim().toLowerCase());
}

export const EMAIL_ENQUIRY = 0;
export const EMAIL_INVITATION = 1;
export const EMAIL_CONTACT_PITCH_OWNER = 5; // Based on ClientEmailTypes.ContactPitchOwner enum position

export const sendEmail = async (
    {
        serverURL,
        emailType,
        data
    }
) => {
    return new Promise(async (resolve, reject) => {
        let requestConfig = {};

        try {
            // make authenticated request when sending invitation email
            if (emailType === EMAIL_INVITATION) {
                // Check if user is logged in
                const currentUser = firebase.auth().currentUser;
                if (!currentUser) {
                    console.error('[EMAIL_UTILS] No current user found - user may not be logged in');
                    return reject(new Error('You must be logged in to send invitations. Please refresh the page and try again.'));
                }

                // get current user's id token
                try {
                    const idToken = await currentUser.getIdToken(true);
                    console.log('[EMAIL_UTILS] Successfully obtained ID token for invitation email');

                    requestConfig = {
                        headers: {
                            'Authorization': idToken
                        }
                    };
                } catch (tokenError) {
                    console.error('[EMAIL_UTILS] Failed to get ID token:', tokenError);
                    return reject(new Error('Failed to authenticate. Please refresh the page and try again.'));
                }
            }

            console.log('[EMAIL_UTILS] Sending email request to:', `${serverURL}${ApiRoutes.sendEmailRoute}`);

            await axios
                .post(
                    `${serverURL}${ApiRoutes.sendEmailRoute}`,
                    {
                        emailType,
                        emailInfo: data
                    },
                    requestConfig
                );

            console.log('[EMAIL_UTILS] Email sent successfully');
            return resolve();
        } catch (error) {
            console.error('[EMAIL_UTILS] Error sending email:', error);
            // Provide more helpful error messages
            if (error.response) {
                const status = error.response.status;
                if (status === 401) {
                    return reject(new Error('Authentication failed. Please refresh the page and log in again.'));
                } else if (status === 403) {
                    return reject(new Error('You do not have permission to send invitations.'));
                } else if (status === 400) {
                    return reject(new Error('Invalid email data. Please check the form and try again.'));
                }
            }
            return reject(error);
        }
    });
};