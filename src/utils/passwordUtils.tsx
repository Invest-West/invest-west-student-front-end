export const PASSWORD_VERY_WEAK = 1;
export const PASSWORD_WEAK = 2;
export const PASSWORD_GOOD = 3;
export const PASSWORD_STRONG = 4;
export const PASSWORD_VERY_STRONG = 5;
const passwordBlacklist: string[] = ["12345678", "87654321", "testPassword", "testtest", "abcdefgh", "password", "sunshine", "iloveyou", "password1", "00000000",
    "superman", "asdfghjkl", "qwertyuiop", "1qaz2wsx", "1q2w3e4r", "qwertyui", "asdfghjk", "zxcvbnm,",
    "11111111", "22222222", "33333333", "44444444", "55555555", "66666666", "77777777", "88888888", "99999999"];

/**
 * This function is used to check the strength of the password.
 *
 * @param {*} password
 */
export const checkPasswordStrength = (password: string) => {
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