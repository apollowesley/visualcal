/**
 * Determines if an email address is valid or not
 * @param possibleEmailAddress The email address to validate
 * @returns true if the email address is vaild, otherwise false
 */
export const isValidEmailAddress = (possibleEmailAddress: string) => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(possibleEmailAddress);
