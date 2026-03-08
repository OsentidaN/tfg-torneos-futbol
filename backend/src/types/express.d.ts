// Extend Express Request type to include user property
declare namespace Express {
    export interface Request {
        user?: {
            id: number;
            email: string;
            name: string;
        };
    }
}

export {};