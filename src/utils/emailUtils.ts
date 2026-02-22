import emailRepository, { EmailInfo } from '../api/repositories/EmailRepository';

/**
 * Check if an email address is valid
 */
export const isValidEmailAddress = (email: string): boolean => {
  const RegExp =
    /^(([^<>()\]\\.,;:\s@"]+(\.[^<>()\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return RegExp.test(email.trim().toLowerCase());
};

export const EMAIL_ENQUIRY = 0;
export const EMAIL_INVITATION = 1;
export const EMAIL_CONTACT_PITCH_OWNER = 5; // Based on ClientEmailTypes.ContactPitchOwner enum position

export const sendEmail = async ({
  emailType,
  data,
}: {
  emailType: number;
  data: EmailInfo;
}): Promise<unknown> => {
  return emailRepository.sendEmail({ emailType, emailInfo: data });
};
