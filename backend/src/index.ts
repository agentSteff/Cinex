import express, { Request, Response } from 'express';
import cors from 'cors';

// Importar rutas (crearemos los archivos después)
import authRoutes from './routes/auth';
import peliculasRoutes from './routes/peliculas';
import calificacionesRoutes from './routes/calificaciones';
import listasRoutes from './routes/listas';
import recomendacionesRoutes from './routes/recomendaciones';
import chatbotRoutes from './routes/chatbot';
import { appConfig, corsOptions } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

const app = express();
const PORT = appConfig.PORT;

// Middlewares globales
// Habilitar CORS para permitir peticiones desde el frontend
app.use(cors(corsOptions));
// Parsear cuerpo de peticiones JSON
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/listas', listasRoutes);
app.use('/api/recomendaciones', recomendacionesRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🎬 CineConnect API funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      peliculas: '/api/peliculas',
      calificaciones: '/api/calificaciones',
      listas: '/api/listas',
      recomendaciones: '/api/recomendaciones',
      chatbot: '/api/chatbot'
    }
  });
});

// Manejo de rutas no encontradas y errores globales
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT} (${appConfig.NODE_ENV})`);
});
