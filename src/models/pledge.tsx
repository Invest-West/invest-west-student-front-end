/**
 * Investor pledge interface
 */
export default interface Pledge {
    id: string;
    anid: string;
    amount: number | "";
    date: number;
    investorID: string;
    projectID: string;
    status: number;
}