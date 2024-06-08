import Api, {ApiRoutes} from "../Api";

export default class InvestorSelfCertificationRepository {

    /**
     * Get investor self certification
     *
     * @param userID
     */
    public async getInvestorSelfCertification(userID: string) {
        return await new Api()
            .request(
                "get",
                ApiRoutes.retrieveInvestorSelfCertificationRoute,
                {
                    requestBody: null,
                    queryParameters: {
                        userID
                    }
                }
            );
    }

    /**
     * Update investor self certification
     *
     * @param userID
     * @param updatedAgreedDate
     */
    public async updateInvestorSelfCertification(userID: string, updatedAgreedDate: string) {
        return await new Api()
            .request(
                "patch",
                ApiRoutes.updateInvestorSelfCertificationRoute,
                {
                    requestBody: {
                        userID,
                        updatedAgreedDate
                    },
                    queryParameters: {} // Add this empty object
                }
            );
    }
}