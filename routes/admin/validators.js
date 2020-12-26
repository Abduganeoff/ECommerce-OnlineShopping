const {check} = require('express-validator');
const userRepo = require('../../repositories/users');

module.exports = {

    requireTitle: check('title')
        .trim()
        .isLength({ min: 5, max: 40 })
        .withMessage('Title must be between 5 and 40 characters!'),
    
    requirePrice: check('price')
        .trim()
        .toFloat()
        .isFloat({ min: 1 })
        .withMessage('Invalid input'),

    requireEmail: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async (email) => {
            const existedEmail = await userRepo.getOneBy({ email });

            if (existedEmail) {
                throw new Error('Email in use!');
            }
    }),

    requirePassword: check('password')
        .trim()
        .isLength({ min: 4, max: 15 })
        .withMessage('Password must be between 4 and 14 characters'),

    requirePasswordConfirmation: check('passwordConfirmation')
        .trim()
        .isLength({ min: 4, max: 15 })
        .withMessage('Password must be between 4 and 14 characters')
        .custom((passwordConfirmation, { req }) => {
            if (passwordConfirmation !== req.body.password) {
                throw new Error('Passwords not match!');
            } else {
                return true;
            }
    }),

    requireEmailExist: check('email')
        .trim()
        .normalizeEmail()
        .isEmail()
        .withMessage('Must be a valid email')
        .custom(async (email) => {
            const user = await userRepo.getOneBy({ email });
            if (!user) {
                throw new Error('Email not found');
            }
    }),
    
    requireValidPassword: check('password')
        .trim()
        .custom(async (password, { req }) => {

            const user = await userRepo.getOneBy({ email: req.body.email });

            if (!user) {
                throw new Error('Invalid password!');
            }

            const signedIn = await userRepo.comparePasswords(user.password, password);

            if (!signedIn) {
                throw new Error('Invalid password!');
            }
    })
};