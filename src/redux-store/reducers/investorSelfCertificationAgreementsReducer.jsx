import * as investorSelfCertificationAgreementsActions from '../actions/investorSelfCertificationAgreementsActions';
import { isCertificationExpired } from '../actions/investorSelfCertificationAgreementsActions';
import * as authActions from '../actions/authActions';
import * as FIRBASE_CONST from '../../firebase/databaseConsts';

const initState = {
    userID: null,

    // type of agreement
    statementType: FIRBASE_CONST.SELF_CERTIFIED_SOPHISTICATED_INVESTOR_AGREEMENT,
    // used to control checkboxes if the user has not done this before
    checkBox1Ticked: false,
    checkBox2Ticked: false,
    checkBox3Ticked: false,

    certificationExpired: false,

    investorSelfCertificationAgreement: null,
    investorSelfCertificationAgreementLoaded: false,
    investorSelfCertificationAgreementBeingLoaded: false
};

const investorSelfCertificationAgreementsReducer = (state = initState, action) => {
    switch (action.type) {
        case authActions.LOG_OUT:
            return initState;
        case investorSelfCertificationAgreementsActions.INVESTOR_SELF_CERTIFICATION_AGREEMENT_SET_USER:
            return {
                ...initState,
                userID: action.uid
            };
        case investorSelfCertificationAgreementsActions.LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT:
            return {
                ...state,
                investorSelfCertificationAgreement: null,
                investorSelfCertificationAgreementLoaded: false,
                investorSelfCertificationAgreementBeingLoaded: true
            };
        case investorSelfCertificationAgreementsActions.FINISHED_LOADING_INVESTOR_SELF_CERTIFICATION_AGREEMENT:
            const certificationExpired = isCertificationExpired(action.result.selfCertificationTimestamp); // Add this line to check for expiration
            return {
            ...state,
            investorSelfCertificationAgreement: JSON.parse(JSON.stringify(action.result)),
            investorSelfCertificationAgreementLoaded: true,
            investorSelfCertificationAgreementBeingLoaded: false,
            certificationExpired, // Add this line to store the expiration status
            };
        case investorSelfCertificationAgreementsActions.INVESTOR_SELF_CERTIFICATION_AGREEMENT_TICK_BOX_CHANGED:
            return {
                ...state,
                [action.event.target.name]: action.event.target.checked
            };
        case investorSelfCertificationAgreementsActions.INVESTOR_SELF_CERTIFICATION_AGREEMENT_STATEMENT_TYPE_CHANGED:
            return {
                ...state,
                statementType: action.event.target.value,
                checkBox1Ticked: false,
                checkBox2Ticked: false
            };
        case investorSelfCertificationAgreementsActions.UPDATE_INVESTOR_SELF_CERTIFICATION_AGREEMENT:
            return {
                ...state,
                investorSelfCertificationAgreement: JSON.parse(JSON.stringify(action.agreement))
            };
        default:
            return state;
    }
};

export default investorSelfCertificationAgreementsReducer;