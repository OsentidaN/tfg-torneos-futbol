import { Request, Response, NextFunction } from 'express';
const { validationResult } = require('express-validator');
import { AppError } from './error.middleware';

export const validateRequest = (req: Request, _res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err: any) => err.msg).join(', ');
        throw new AppError(`Error de validación: ${errorMessages}`, 400);
    }
    next();
};
