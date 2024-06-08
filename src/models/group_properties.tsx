/**
 * Group properties interface
 */
export default interface GroupProperties {
    anid: string;
    dateAdded: number;
    description: string;
    displayName: string;
    displayNameLower: string;
    groupUserName: string;
    isInvestWest: boolean;
    status: number;
    website?: string;
    logoWithText?: GroupLogo[];
    plainLogo: GroupLogo[];
    settings: GroupSettings;
}

/**
 * This should always be returned when a group is queried by an unauthenticated user
 */
export interface PublicGroupProperties {
    description: string;
    displayName: string;
    groupUserName: string;
}

/**
 * Group settings interface
 */
export interface GroupSettings {
    primaryColor: string;
    secondaryColor: string;
    projectVisibility: number;
    makeInvestorsContactDetailsVisibleToIssuers: boolean;
    PledgeFAQs?: GroupPledgeFAQ[];
}

/**
 * Group logo interface
 */
export interface GroupLogo {
    storageID: number;
    url: string;
    removed?: boolean;
}

/**
 * Group pledge faq interface
 */
export interface GroupPledgeFAQ {
    id: string;
    question: string;
    answer: string;
}

export const getGroupLogo = (group: GroupProperties | null) => {
    if (!group) {
        return null;
    }
    if (group.plainLogo.length === 0) {
        return null;
    }
    return group.plainLogo[group.plainLogo.findIndex(logo => logo.removed === undefined)].url;
}