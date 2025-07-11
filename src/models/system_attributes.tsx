export interface SystemAttributes {
    PledgeFAQs: PledgeFAQ[];
    Sectors: string[];
    Courses: string[];
    allowVideoUpload: boolean;
    privacyPolicy: any;
    termsOfUse: any;
    createPitchTermsAndConditions: any;
    marketingPreferences: any;
    riskWarningFooter: string;
}

export interface PledgeFAQ {
    id: string;
    question: string;
    answer: string;
}