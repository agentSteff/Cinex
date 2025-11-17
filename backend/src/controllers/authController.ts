// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generarToken } from '../utils/jwt';
import { UsuarioRegistro, UsuarioLogin, UsuarioPayload } from '../types';

const SALT_ROUNDS = 10;

interface UsuarioInterno extends UsuarioPayload {
  passwordHash: string;
}

// "Base de datos" en memoria
const usuarios: UsuarioInterno[] = [];

// Inicializar algunos usuarios de prueba
function inicializarUsuarios() {
  if (usuarios.length > 0) return;

  const baseUsuarios = [
    { id: 1, email: 'juan@test.com', username: 'juan' },
    { id: 2, email: 'maria@test.com', username: 'maria' },
    { id: 3, email: 'admin@cinex.com', username: 'admin' },
  ];

  for (const u of baseUsuarios) {
    const hash = bcrypt.hashSync('password123', SALT_ROUNDS);
    usuarios.push({
      ...u,
      passwordHash: hash,
    });
  }
}

inicializarUsuarios();

/* ============================================================
   POST /api/auth/register
============================================================ */
export const registrar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password }: UsuarioRegistro = req.body;

    if (!email || !username || !password) {
      res.status(400).json({ error: 'Email, username y password son requeridos' });
      return;
    }

    const yaExiste = usuarios.find(
      (u) => u.email === email || u.username === username
    );

    if (yaExiste) {
      res.status(409).json({ error: 'Email o username ya registrados' });
      return;
    }

    const hash = bcrypt.hashSync(password, SALT_ROUNDS);

    const nuevo: UsuarioInterno = {
      id: usuarios.length + 1,
      email,
      username,
      passwordHash: hash,
    };

    usuarios.push(nuevo);

    const token = generarToken({
      id: nuevo.id,
      email: nuevo.email,
      username: nuevo.username,
    });

    res.status(201).json({
      token,
      usuario: {
        id: nuevo.id,
        email: nuevo.email,
        username: nuevo.username,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/* ============================================================
   POST /api/auth/login
============================================================ */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: UsuarioLogin = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y password son requeridos' });
      return;
    }

    const usuario = usuarios.find((u) => u.email === email);

    if (!usuario) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const esCorrecta = await bcrypt.compare(password, usuario.passwordHash);
    if (!esCorrecta) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = generarToken({
      id: usuario.id,
      email: usuario.email,
      username: usuario.username,
    });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        username: usuario.username,
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

/* ============================================================
   GET /api/auth/perfil
============================================================ */
export const obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    const usuario = (req as any).usuario as UsuarioPayload | undefined;
    if (!usuario) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    res.json(usuario);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};
