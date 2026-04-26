import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorMiddleware } from './middlewares/error.middleware';

const app: Application = express();

// ============================================
// MIDDLEWARES
// ============================================

// Seguridad básica
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // Límite de 100 peticiones por ventana por IP
    message: {
        status: 'fail',
        message: 'Demasiadas peticiones desde esta IP, por favor inténtalo de nuevo en 15 minutos'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Aplicar a todas las rutas de la API
app.use('/api', limiter);

// CORS
const allowedOrigin = process.env.FRONTEND_URL;
if(!allowedOrigin){
    console.error('❌ FRONTEND_URL no definida');
    process.exit(1);
}
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Body parsers con límites de tamaño
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

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