import { describe, it, expect } from 'vitest';
import { parseId } from './parse';
import { AppError } from '../middlewares/error.middleware';

describe('parseId utility', () => {
    it('should correctly parse a valid numeric string', () => {
        expect(parseId('123')).toBe(123);
    });

    it('should throw an AppError for non-numeric strings', () => {
        expect(() => parseId('abc')).toThrow(AppError);
        expect(() => parseId('abc')).toThrow('ID inválido');
    });

    it('should throw an AppError for empty strings', () => {
        expect(() => parseId('')).toThrow(AppError);
    });

    it('should parse valid IDs with spaces', () => {
        expect(parseId(' 456 ')).toBe(456);
    });
});
