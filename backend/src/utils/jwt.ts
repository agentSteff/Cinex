import jwt from 'jsonwebtoken';
import { UsuarioPayload } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'cinex_default_secret_key';
const JWT_EXPIRES_IN = '7d'; // Token expira en 7 días

export const generarToken = (payload: UsuarioPayload): string => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

export const verificarToken = (token: string): UsuarioPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as UsuarioPayload;
  } catch (error) {
    throw new Error('Token inválido o expirado');
  }
};
