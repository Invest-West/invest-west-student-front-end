import {
  getCurrentDate,
  getDateWithDaysFurtherThanToday,
  dateInReadableFormat,
  dateTimeInReadableFormat,
  checkPasswordStrength,
  calculateEquityGain,
  calculatePledgesAmount,
  getNumberFromInputString,
  isValidLinkedInURL,
  PASSWORD_VERY_WEAK,
  PASSWORD_GOOD,
} from '../utils';

describe('utils', () => {
  describe('getCurrentDate', () => {
    it('returns a number', () => {
      expect(typeof getCurrentDate()).toBe('number');
    });

    it('returns a value close to Date.now()', () => {
      const result = getCurrentDate();
      expect(Math.abs(result - Date.now())).toBeLessThan(1000);
    });
  });

  describe('getDateWithDaysFurtherThanToday', () => {
    it('returns a future timestamp', () => {
      const result = getDateWithDaysFurtherThanToday(7);
      expect(result).toBeGreaterThan(Date.now());
    });

    it('returns approximately 7 days in the future for 7 days', () => {
      const result = getDateWithDaysFurtherThanToday(7);
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      expect(Math.abs(result - Date.now() - sevenDaysMs)).toBeLessThan(1000);
    });

    it('handles 0 days (returns approximately now)', () => {
      const result = getDateWithDaysFurtherThanToday(0);
      expect(Math.abs(result - Date.now())).toBeLessThan(1000);
    });
  });

  describe('dateInReadableFormat', () => {
    it('returns a string for valid milliseconds', () => {
      const result = dateInReadableFormat(1700000000000);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('dateTimeInReadableFormat', () => {
    it('returns a string containing both date and time', () => {
      const result = dateTimeInReadableFormat(1700000000000);
      expect(typeof result).toBe('string');
      // Should contain a space separating date and time
      expect(result).toContain(' ');
    });
  });

  describe('checkPasswordStrength', () => {
    it('returns PASSWORD_VERY_WEAK for short passwords', () => {
      expect(checkPasswordStrength('abc')).toBe(PASSWORD_VERY_WEAK);
    });

    it('returns PASSWORD_VERY_WEAK for blacklisted passwords', () => {
      expect(checkPasswordStrength('password')).toBe(PASSWORD_VERY_WEAK);
      expect(checkPasswordStrength('12345678')).toBe(PASSWORD_VERY_WEAK);
      expect(checkPasswordStrength('iloveyou')).toBe(PASSWORD_VERY_WEAK);
    });

    it('returns PASSWORD_GOOD for passwords >= 8 chars', () => {
      expect(checkPasswordStrength('MySecure1!')).toBe(PASSWORD_GOOD);
    });

    it('is case-insensitive for blacklist check', () => {
      expect(checkPasswordStrength('PASSWORD')).toBe(PASSWORD_VERY_WEAK);
      expect(checkPasswordStrength('Password')).toBe(PASSWORD_VERY_WEAK);
    });

    it('returns PASSWORD_GOOD for exactly 8 character password', () => {
      expect(checkPasswordStrength('abcd1234')).toBe(PASSWORD_GOOD);
    });
  });

  describe('calculateEquityGain', () => {
    it('calculates correctly', () => {
      // 10000 pledge / 100000 fund * 10 equity = 1.00
      expect(calculateEquityGain(10000, 100000, 10)).toBe('1.00');
    });

    it('returns "0.00" for zero pledge', () => {
      expect(calculateEquityGain(0, 100000, 10)).toBe('0.00');
    });

    it('handles decimal results', () => {
      expect(calculateEquityGain(3333, 100000, 10)).toBe('0.33');
    });
  });

  describe('calculatePledgesAmount', () => {
    it('sums pledge amounts', () => {
      const pledges = [{ amount: 1000 }, { amount: 2000 }, { amount: 500 }];
      expect(calculatePledgesAmount(pledges)).toBe(3500);
    });

    it('returns 0 for empty pledges', () => {
      expect(calculatePledgesAmount([])).toBe(0);
    });

    it('returns 0 for null pledges', () => {
      expect(calculatePledgesAmount(null)).toBe(0);
    });

    it('skips pledges with empty amount', () => {
      const pledges = [{ amount: 1000 }, { amount: '' }, { amount: 500 }];
      expect(calculatePledgesAmount(pledges)).toBe(1500);
    });
  });

  describe('getNumberFromInputString', () => {
    it('parses simple number', () => {
      expect(getNumberFromInputString('1000')).toBe(1000);
    });

    it('parses comma-formatted number', () => {
      expect(getNumberFromInputString('1,000')).toBe(1000);
    });

    it('parses large comma-formatted number', () => {
      expect(getNumberFromInputString('1,000,000')).toBe(1000000);
    });

    it('returns null for decimal numbers', () => {
      expect(getNumberFromInputString('10.5')).toBeNull();
    });

    it('returns null for non-numeric strings', () => {
      expect(getNumberFromInputString('abc')).toBeNull();
    });

    it('returns null for negative numbers', () => {
      expect(getNumberFromInputString('-100')).toBeNull();
    });

    it('returns null for invalid comma placement', () => {
      expect(getNumberFromInputString('10,00')).toBeNull();
    });

    it('returns null for too many digits before first comma', () => {
      expect(getNumberFromInputString('1234,000')).toBeNull();
    });

    it('returns 0 for "0"', () => {
      expect(getNumberFromInputString('0')).toBe(0);
    });
  });

  describe('isValidLinkedInURL', () => {
    it('returns true for valid LinkedIn URL', () => {
      expect(isValidLinkedInURL('https://www.linkedin.com/in/johndoe')).toBe(true);
    });

    it('returns true for null/undefined (not required field)', () => {
      expect(isValidLinkedInURL(null)).toBe(true);
      expect(isValidLinkedInURL(undefined)).toBe(true);
      expect(isValidLinkedInURL('')).toBe(true);
    });

    it('returns false for non-LinkedIn URL', () => {
      expect(isValidLinkedInURL('https://twitter.com/johndoe')).toBe(false);
    });

    it('returns false for LinkedIn company URL', () => {
      expect(isValidLinkedInURL('https://www.linkedin.com/company/test')).toBe(false);
    });
  });
});
