// src/utils/jwt.ts
import jwt from 'jsonwebtoken';
import { UsuarioPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

export function generarToken(payload: UsuarioPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '1d',
  });
}

export function verificarToken(token: string): UsuarioPayload {
  return jwt.verify(token, JWT_SECRET) as UsuarioPayload;
}
