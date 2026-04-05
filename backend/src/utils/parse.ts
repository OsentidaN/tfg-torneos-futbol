import { AppError } from '../middlewares/error.middleware';

export const parseId = (value: string): number => {
    const id = parseInt(value);
    if (isNaN(id)) throw new AppError('ID inválido', 400);
    return id;
};