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
                // get current user's id token
                const idToken = await firebase.auth().currentUser.getIdToken(true);

                requestConfig = {
                    headers: {
                        'Authorization': idToken
                    }
                };
            }

            await axios
                .post(
                    `${serverURL}${ApiRoutes.sendEmailRoute}`,
                    {
                        emailType,
                        emailInfo: data
                    },
                    requestConfig
                );

            return resolve();
        } catch (error) {
            return reject(error);
        }
    });
};