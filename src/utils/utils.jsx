import * as DB_CONST from '../firebase/databaseConsts';

import {QuillDeltaToHtmlConverter} from 'quill-delta-to-html';

/**
 * This function will return the current date in milliseconds.
 */
export const getCurrentDate = () => {
    const date = new Date();
    return date.getTime();
};


/**
 * This function is used to calculate the date that is n days further than today
 *
 * @param days
 * @returns {number}
 */
export const getDateWithDaysFurtherThanToday = days => {
    let neededDate = new Date();
    const currentDate = new Date();
    neededDate.setDate(currentDate.getDate() + days);
    return neededDate.getTime();
};

/**
 * This function will return a readable date format (DD/MM/YYYY)
 *
 * This function will take 1 parameter: milliseconds
 *
 * @param {*} milliseconds
 */
export const dateInReadableFormat = milliseconds => {
    const date = new Date(milliseconds);
    return date.toLocaleDateString();
};

/**
 * This function will return a readable date format (DD/MM/YYYY, HH:mm:ss)
 *
 * This function will take 1 parameter: milliseconds
 *
 * @param {*} milliseconds
 */
export const dateTimeInReadableFormat = milliseconds => {
    const date = new Date(milliseconds);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
};

/**
 * This function will return a readable date format (dayOfWeek, month date year hour)
 *
 * @param milliseconds
 */
export const fullDateTimeInReadableFormat = milliseconds => {
    const date = new Date(milliseconds);
    const dayList = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const monthList = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    let dayOfWeek = dayList[date.getDay()];
    let month = monthList[date.getMonth()];
    let hour = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    hour = (hour >= 12) ? hour - 12 : hour;
    let prepand = (hour >= 12) ? " PM " : " AM ";

    if (hour === 0 && prepand === ' PM ') {
        if (minute === 0 && second === 0) {
            hour = 12;
            prepand = ' Noon';
        } else {
            hour = 12;
            prepand = ' PM';
        }
    }
    if (hour === 0 && prepand === ' AM ') {
        if (minute === 0 && second === 0) {
            hour = 12;
            prepand = ' Midnight';
        } else {
            hour = 12;
            prepand = ' AM';
        }
    }
    return `${dayOfWeek}, ${month} ${date.getDate()} ${date.getFullYear()} ${hour}:${minute} ${prepand}`;
};

export const PASSWORD_VERY_WEAK = 1;
export const PASSWORD_WEAK = 2;
export const PASSWORD_GOOD = 3;
export const PASSWORD_STRONG = 4;
export const PASSWORD_VERY_STRONG = 5;
const passwordBlacklist = ["12345678", "87654321", "testPassword", "testtest", "abcdefgh", "password", "sunshine", "iloveyou", "password1", "00000000",
    "superman", "asdfghjkl", "qwertyuiop", "1qaz2wsx", "1q2w3e4r", "qwertyui", "asdfghjk", "zxcvbnm,",
    "11111111", "22222222", "33333333", "44444444", "55555555", "66666666", "77777777", "88888888", "99999999"];

/**
 * This function is used to check the strength of the password.
 *
 * @param {*} password
 */
export const checkPasswordStrength = password => {
    let strength = 0;
    const minLength = 8;
    // If the password length is less than or equal to minLength
    if (password.length < minLength) {
        strength = PASSWORD_VERY_WEAK;
    } else {
        strength = PASSWORD_GOOD;
    }

    // If the password length is greater than minLength and contain any lowercase alphabet or any number or any special character
    if (password.length > minLength && (password.match(/[a-z]/) || password.match(/\d+/) || password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/))) {
        // strength = PASSWORD_WEAK;
    }

    // If the password length is greater than minLength and contain alphabet,number,special character respectively
    if (password.length > minLength &&
        ((password.match(/[a-z]/) && password.match(/\d+/)) || (password.match(/\d+/)
            && password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/)) || (password.match(/[a-z]/) && password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/)))) {
        // strength = PASSWORD_GOOD;
    }

    // If the password length is greater than minLength and must contain alphabets,numbers and special characters
    if (password.length > minLength && password.match(/[a-z]/) && password.match(/\d+/) && password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/)) {
        // strength = PASSWORD_STRONG;
    }

    // If the password length is greater than 15 and must contain alphabets,numbers and special characters
    if (password.length > 15 && password.match(/[a-z]/) && password.match(/\d+/) && password.match(/.[!,@,#,$,%,^,&,*,?,_,~,-,(,)]/)) {
        // strength = PASSWORD_VERY_STRONG;
    }

    if (passwordBlacklist.findIndex(badPassword => badPassword.toLowerCase() === password.toLowerCase()) !== -1) {
        strength = PASSWORD_VERY_WEAK;
    }

    return strength;
};


/**
 * Convert a Delta object (obtained using ReactQuill to create rich text) to HTML
 *
 * @param {*} ops
 */
export const convertQuillDeltaToHTML = ops => {
    if (!ops) {
        return null;
    }
    let cfg = {};
    /**
     * Delta object obtained using ReactQuill has the following format:
     * {
     *      "ops": [
     *          {},
     *          {}
     *      ]
     * }
     *
     * This object is stored in the database.
     * However, we only need the "ops" array to convert to HTML.
     * So, after converting the JSON string to JSON, we need to retrieve the "ops" array so that the HTML tree can be created.
     */
    let converter = new QuillDeltaToHtmlConverter(ops, cfg);
    return converter.convert();
};


/**
 * This function is used to calculate the difference in date between a specified date (in milliseconds) and the current date
 *
 * @param {*} milliseconds
 */
export const dateDiff = (milliseconds) => {
    const currentDate = new Date();
    if (milliseconds - currentDate.getTime() < 0) {
        return 0;
    }
    const dateDiff = Math.abs(milliseconds - currentDate.getTime()); // difference
    return (dateDiff / (24 * 60 * 60 * 1000)).toFixed(0); //Convert values days and return value
};

/**
 * This function will find addresses based on postcode
 *
 * @param {*} postcode
 */
export const findAddress = async (postcode) => {
    const GET_ADDRESS_API_KEY = "Wbj4a1np5EejXhsnpv3RXQ19730";
    const addressQuery = `https://api.getAddress.io/find/${postcode}?api-key=${GET_ADDRESS_API_KEY}&sort=True&format=True`;

    return new Promise((resolve, reject) => {
        fetch(addressQuery)
            .then(results => {
                return results.json();
            })
            .then(data => {
                let results = {
                    apiAddresses: [], // addresses to store information to database
                    formattedAddresses: [], // displayed addresses
                    error: false
                };
                // no addresses can be found
                if (!data.addresses) {
                    results.error = true;
                    return resolve(results);
                }
                data.addresses
                    .forEach(address => {
                        results.apiAddresses.push(address);
                        // each address consists of 5 elements (address 1, address 2, address 3, town/city, postcode)
                        let formattedAddress = "";
                        address.forEach((element, index) => {
                            if (element !== "") {
                                formattedAddress += (element + ", ");
                            }
                        });
                        formattedAddress = formattedAddress.trim();
                        if (formattedAddress[formattedAddress.length - 1] === ",") {
                            formattedAddress = formattedAddress.slice(0, formattedAddress.length - 1);
                        }
                        results.formattedAddresses.push(formattedAddress);
                    });
                return resolve(results);
            });
    });
};

/**
 * This function is used to calculate the equity gain based on the amount of money pledged
 * @param moneyPledge
 * @param fundTarget
 * @param equityOffered
 */
export const calculateEquityGain = (moneyPledge, fundTarget, equityOffered) => {
    return ((moneyPledge * equityOffered) / fundTarget).toFixed(2);
};

/**
 * This function is used to calculate the amount of money pledged for this project
 *
 * @param pledges
 * @returns {number}
 */
export const calculatePledgesAmount = pledges => {

    let pledgesAmount = 0;

    if (!pledges || pledges.length === 0) {
        return pledgesAmount;
    }

    pledges.forEach(pledge => {
        if (pledge.amount !== '') {
            pledgesAmount += pledge.amount;
        }
    });

    return pledgesAmount;
};

/**
 * This function is used to convert a string to a number
 * Note: in this case, comma is considered the thousands-separator
 *
 * @param inputString
 * @returns {null|number}
 */
export const getNumberFromInputString = inputString => {

    // user enters decimal numbers
    if (inputString.includes('.')) {
        return null;
    }

    let commaSplits = inputString.split(',');

    if (commaSplits.length > 1) {
        let invalidSeparator = false;
        // check if the input string has valid comma separators
        commaSplits.forEach((part, index) => {
            if (index === 0) {
                if (part.length > 3 || part.length < 1) {
                    invalidSeparator = true;
                }
            } else {
                if (part.length !== 3) {
                    invalidSeparator = true;
                }
            }
        });

        if (invalidSeparator) {
            return null;
        }
    }

    let commaFreeString = inputString.replace(/,/g, '');
    // check if the string is a number
    if (isNaN(commaFreeString) === true) {
        return null;
    }

    let number = parseFloat(commaFreeString);
    if (number < 0) {
        return null;
    }

    return number;
};

/**
 * Construct file name to be uploaded to firebase storage
 *
 * @param document
 * @param newStorageID
 * @returns {string}
 */
export const constructStorageFileName = (document, newStorageID) => {

    let constructedName = '';

    let originalName = document.file.name;
    let nameSplits = originalName.split(DB_CONST.STORAGE_FILE_NAME_ID_SPLIT);
    // file downloaded from invest west server
    if (nameSplits.length > 1) {
        constructedName = newStorageID + DB_CONST.STORAGE_FILE_NAME_ID_SPLIT + nameSplits[1];
    }
    // file from user's computer
    else {
        constructedName = newStorageID + DB_CONST.STORAGE_FILE_NAME_ID_SPLIT + originalName;
    }

    return constructedName;
};

/**
 * Check if a LinkedIn URL is valid
 *
 * @param url
 * @returns {boolean|boolean | *}
 */
export const isValidLinkedInURL = url => {
    if (!url) {
        return true;
    }
    return url.startsWith("https://www.linkedin.com/in/");
};

export const GET_PLAIN_LOGO = 1;
export const GET_LOGO_WITH_TEXT = 2;
export const getLogoFromGroup = (getLogoType, groupProperties) => {
    if (!groupProperties) {
        return null;
    }

    switch (getLogoType) {
        case GET_PLAIN_LOGO:
            if (!groupProperties.hasOwnProperty('plainLogo')
                || (groupProperties.hasOwnProperty('plainLogo') && groupProperties.plainLogo === null)
            ) {
                return null;
            }
            return groupProperties.plainLogo[groupProperties.plainLogo.findIndex(logo => !logo.hasOwnProperty('removed'))].url;
        case GET_LOGO_WITH_TEXT:
            if (!groupProperties.hasOwnProperty('logoWithText')
                || (groupProperties.hasOwnProperty('logoWithText') && groupProperties.logoWithText === null)
            ) {
                return null;
            }
            return groupProperties.logoWithText[groupProperties.logoWithText.findIndex(logo => !logo.hasOwnProperty('removed'))].url;
        default:
            return null;
    }
};

/**
 * Get the user's home group
 *
 * @param groupsUserIsIn
 * @returns {*}
 */
export const getUserHomeGroup = groupsUserIsIn => {
    const index = groupsUserIsIn.findIndex(group => group.invitedUser.requestedToJoin === false);
    if (index !== -1) {
        return groupsUserIsIn[index];
    } else {
        return null;
    }
};

/**
 * Check if a project can be edited
 *
 * @param user
 * @param project
 * @returns {boolean}
 */
export const shouldAProjectBeEdited = (user, project) => {
    if (user.type === DB_CONST.TYPE_INVESTOR) {
        return false;
    }

    if (user.type === DB_CONST.TYPE_ADMIN) {
        return !(project.status === DB_CONST.PROJECT_STATUS_SUCCESSFUL
            || project.status === DB_CONST.PROJECT_STATUS_FAILED
            || project.status === DB_CONST.PROJECT_STATUS_REJECTED
        );
    }

    // user is an issuer, but not the owner of the project
    if (user.id !== project.issuerID) {
        return false;
    }

    if (project.status === DB_CONST.PROJECT_STATUS_DRAFT
        || project.status === DB_CONST.PROJECT_STATUS_BEING_CHECKED
    ) {
        return true;
    }

    if (project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE) {
        return project.Pitch.status === DB_CONST.PITCH_STATUS_ON_GOING;
    }

    return false;
};

/**
 * Check if a hex color code is valid
 *
 * @param hexColorCode
 * @returns {boolean}
 */
export const isValidHexColorCode = (hexColorCode) => {
    let RegExp = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i;
    return RegExp.test(hexColorCode);
};

/**
 * Check if a website URL is valid
 *
 * @param url
 * @returns {boolean}
 */
export const isValidWebURL = (url) => {
    let RegExp = /^(http|https):\/\/(([a-zA-Z0-9$\-_.+!*'(),;:&=]|%[0-9a-fA-F]{2})+@)?(((25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])(\.(25[0-5]|2[0-4][0-9]|[0-1][0-9][0-9]|[1-9][0-9]|[0-9])){3})|localhost|([a-zA-Z0-9\-\u00C0-\u017F]+\.)+([a-zA-Z]{2,}))(:[0-9]+)?(\/(([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*(\/([a-zA-Z0-9$\-_.+!*'(),;:@&=]|%[0-9a-fA-F]{2})*)*)?(\?([a-zA-Z0-9$\-_.+!*'(),;:@&=/?]|%[0-9a-fA-F]{2})*)?(#([a-zA-Z0-9$\-_.+!*'(),;:@&=/?]|%[0-9a-fA-F]{2})*)?)?$/;
    return RegExp.test(url);
};

/**
 * Check is an email address is valid
 *
 * @param email
 * @returns {boolean}
 */
export const isValidEmailAddress = (email) => {
    let RegExp = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return RegExp.test(email.trim().toLowerCase());
}

/**
 * Check if a project is live
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectLive = project => {
    return isProjectInLivePitchPhase(project) || isProjectInLivePledgePhase(project);
};

/**
 * Check if a project is a draft
 *
 * @param project
 * @returns {boolean}
 */
export const isDraftProject = project => {
    return project.status === DB_CONST.PROJECT_STATUS_DRAFT;
};

/**
 * Check if a project is waiting to go live
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectWaitingToGoLive = project => {
    return project.status === DB_CONST.PROJECT_STATUS_BEING_CHECKED;
};

/**
 * Check if a project is rejected to go live
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectRejectedToGoLive = project => {
    return project.status === DB_CONST.PROJECT_STATUS_REJECTED;
};

/**
 * Check if a project is in live project phase
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectInLivePitchPhase = project => {
    return project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE
        && project.Pitch.status === DB_CONST.PITCH_STATUS_ON_GOING;
};

/**
 * Check if the project has expired and waiting for admin to make decision
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectPitchExpiredWaitingForAdminToCheck = project => {
    return project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED
        && project.Pitch.status === DB_CONST.PITCH_STATUS_WAITING_FOR_ADMIN;
};

/**
 * Check if a project has been moved to pledge phase and waiting for the pledge page to be created
 *
 * @param project
 * @returns {boolean|boolean}
 */
export const isProjectWaitingForPledgeToBeCreated = project => {
    return (project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE_EXPIRED_WAITING_TO_BE_CHECKED
            && project.Pitch.status === DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER
        )
        || (
            project.status === DB_CONST.PROJECT_STATUS_PITCH_PHASE
            && project.Pitch.status === DB_CONST.PITCH_STATUS_ACCEPTED_CREATE_PRIMARY_OFFER
        );
}

/**
 * Check if a project's pledge is waiting to be checked
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectWaitingForPledgeToBeChecked = project => {
    return project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_CREATED_WAITING_TO_BE_CHECKED;
}

/**
 * Check if a project is in live pledge phase
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectInLivePledgePhase = project => {
    return project.status === DB_CONST.PROJECT_STATUS_PRIMARY_OFFER_PHASE;
};

/**
 * Check if a project has ended with at least 1 pledge
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectSuccessful = project => {
    return project.status === DB_CONST.PROJECT_STATUS_SUCCESSFUL;
};

/**
 * Check if a project has ended with no pledges
 * @param project
 * @returns {boolean}
 */
export const isProjectFailed = project => {
    return project.status === DB_CONST.PROJECT_STATUS_FAILED;
};

/**
 * Check if a project is temporarily closed
 *
 * @param project
 * @returns {boolean}
 */
export const isProjectTemporarilyClosed = project => {
    return project.hasOwnProperty('temporarilyClosed') && project.temporarilyClosed === true;
};