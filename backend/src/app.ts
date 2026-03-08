import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app: Application = express();

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad
app.use(helmet());

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// ============================================
// RUTAS
// ============================================

// Health check
app.get('/health', (_req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// API routes
app.use('/api', routes);

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Ruta ${req.originalUrl} no encontrada`
    });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorMiddleware);

export default app;