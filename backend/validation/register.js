const { check } = require("express-validator");
const handleValidationErrors = require('./handleValidationErrors');

const validateRegisterInput = [
    check('email')
        .exists({ checkFalsy: true })
        .withMessage('Please provide an email')
        .isEmail()
        .withMessage('Email is invalid'),
    check('username')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a username')
        .isLength({ min: 2, max: 30 })
        .withMessage('Username must be between 2 and 30 characters'),
    check('password')
        .exists({ checkFalsy: true })
        .withMessage('Please provide a password')
        .isLength({ min: 6, max: 30 })
        .withMessage('Password must be between 6 and 30 characters'),
    handleValidationErrors
];

module.exports = validateRegisterInput;