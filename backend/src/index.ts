import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';   // <– dentro de src, por eso "./routes"

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
