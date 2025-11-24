import { Request, Response, NextFunction } from 'express';
import { verificarToken } from '../utils/jwt';
import { UsuarioPayload } from '../types';

// Extender Request para incluir usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioPayload;
    }
  }
}

/**
 * Middleware para autenticar JWT
 * Verifica el token del header Authorization
 */
export const autenticarJWT = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Token no proporcionado. Use: Authorization: Bearer <token>'
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Verificar y decodificar token
    const usuario = verificarToken(token);
    
    // Agregar usuario al request
    req.usuario = usuario;
    
    next();
  } catch (error) {
    console.warn('Error en autenticación:', error instanceof Error ? error.message : error);
    res.status(401).json({
      error: 'Token inválido o expirado'
    });
  }
};

// Tipo reutilizable para requests autenticadas
export type AuthRequest = Request & { usuario?: UsuarioPayload };
