import { check, validationResult } from 'express-validator';

export const userSignupValidator = [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email')
        .isEmail()
        .withMessage('Email must be valid')
        .isLength({ min: 3, max: 32 })
        .withMessage('Email must be between 3 to 32 characters'),
    check('password', 'Password is required').notEmpty(),
    check('password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        next();
    }
];
