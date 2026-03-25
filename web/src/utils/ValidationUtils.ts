export const ValidationUtils = {
    /**
     * Validates that the input contains only letters and spaces.
     * @param name The name to validate
     * @returns true if valid, false otherwise
     */
    isValidName: (name: string): boolean => {
        return /^[A-Za-z\s]*$/.test(name);
    },

    /**
     * Filters a string to keep only letters and spaces.
     * Useful for onChange handlers.
     */
    filterName: (name: string): string => {
        return name.replace(/[^A-Za-z\s]/g, '');
    },

    /**
     * Validates that the mobile number is exactly 10 digits and starts with 6, 7, 8, or 9.
     * @param phone The phone number to validate
     * @returns true if valid, false otherwise
     */
    isValidPhone: (phone: string): boolean => {
        return /^[6789]\d{9}$/.test(phone);
    },

    /**
     * Filters a string to keep only digits.
     * Useful for onChange handlers.
     */
    filterPhone: (phone: string): string => {
        return phone.replace(/\D/g, '').slice(0, 10);
    }
};
