import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { generarToken } from '../utils/jwt';
import { UsuarioRegistro, UsuarioLogin, UsuarioPayload } from '../types';

const SALT_ROUNDS = 10;

interface UsuarioInterno extends UsuarioPayload {
  passwordHash: string;
}

const usuarios: UsuarioInterno[] = [];

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

// POST /api/auth/register
export const registrar = async (req: Request, res: Response): Promise<void> => {
  // valida, crea usuario en memoria, devuelve token
};

// POST /api/auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  // valida, compara contraseña con bcrypt, devuelve token
};

// GET /api/auth/perfil
export const obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
  // usa req.usuario cargado por el middleware
};
