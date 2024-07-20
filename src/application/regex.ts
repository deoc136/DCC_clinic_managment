export const onlyLettersRegex = new RegExp(/^[a-zA-ZÀ-ÖØ-öø-ÿ\s]+$/);

export const onlyNumbersRegex = new RegExp(/^[0-9\s]+$/);

export const passwordRegex = new RegExp(/^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*\W).{8,}$/);
