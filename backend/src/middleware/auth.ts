import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../utils/jwt';
import { UsuarioPayload } from '../types';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token no proporcionado' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verificarToken(token) as UsuarioPayload;
    (req as any).usuario = payload;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
