import { body } from 'express-validator';

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

export const validateMember = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  body('area')
    .trim()
    .notEmpty()
    .withMessage('Area is required'),
  body('leader')
    .isMongoId()
    .withMessage('Valid leader ID is required'),
  body('status')
    .isIn(['Active', 'Moderate', 'Inactive'])
    .withMessage('Invalid status')
];