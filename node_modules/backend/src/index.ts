import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Importar rutas (crearemos los archivos después)
import authRoutes from './routes/auth';
import peliculasRoutes from './routes/peliculas';
import calificacionesRoutes from './routes/calificaciones';
import listasRoutes from './routes/listas';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/peliculas', peliculasRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/listas', listasRoutes);

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: '🎬 CineConnect API funcionando!',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      peliculas: '/api/peliculas',
      calificaciones: '/api/calificaciones',
      listas: '/api/listas'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
