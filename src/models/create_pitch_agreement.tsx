/**
 * Create pitch agreement
 * --> The issuer must agree to the T&Cs before they can submit a pitch.
 */
export default interface CreatePitchAgreement {
    issuerID: string;
    projectID: string;
    date: number;

    /**
     * This field specifies if the issuer agrees to let the group or Invest West share their pitch publicly
     * --> optional field because it is added later in the development process
     * --> Assumption: all the CreatePitchAgreement objects that don't have this field will assume that this
     * field is set to TRUE
     */
    agreedToShareRaisePublicly?: boolean;
}