import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generarToken } from '../utils/jwt';
import { UsuarioRegistro, UsuarioLogin } from '../types';
import { AppError, handleControllerError } from '../middleware/errorHandler';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/**
 * Registrar un nuevo usuario
 * POST /api/auth/register
 */
export const registrar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, username }: UsuarioRegistro = req.body;

    // Validaciones básicas
    if (!email || !password || !username) {
      return next(new AppError('Email, password y username son requeridos', 400));
    }

    if (password.length < 6) {
      return next(new AppError('El password debe tener al menos 6 caracteres', 400));
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (usuarioExistente) {
      return next(new AppError('El email o username ya está registrado', 409));
    }

    // Hashear password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Crear usuario
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        username
      }
    });

    // Generar token
    const token = generarToken({
      id: nuevoUsuario.id,
      email: nuevoUsuario.email,
      username: nuevoUsuario.username
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        username: nuevoUsuario.username
      }
    });
  } catch (error) {
    handleControllerError(error, next, 'Error al registrar usuario');
  }
};

/**
 * Login de usuario
 * POST /api/auth/login
 * TODO: Agregar rate limiting después - no dejar que hagan muchos intentos
 */
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password }: UsuarioLogin = req.body;

    if (!email || !password) {
      return next(new AppError('Email y password requeridos', 400));
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!usuario) {
      return next(new AppError('Email o contraseña incorrectos', 401));
    }

    // Validar password
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      return next(new AppError('Email o contraseña incorrectos', 401));
    }

    // Generar token
    const token = generarToken({
      id: usuario.id,
      email: usuario.email,
      username: usuario.username
    });

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        username: usuario.username
      }
    });
  } catch (error) {
    handleControllerError(error, next, 'Error al iniciar sesión');
  }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/perfil (protegido)
 */
export const obtenerPerfil = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.usuario) {
      return next(new AppError('No autorizado', 401));
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuario.id },
      select: {
        id: true,
        email: true,
        username: true,
        fechaCreacion: true
      }
    });

    if (!usuario) {
      return next(new AppError('Usuario no encontrado', 404));
    }

    res.json(usuario);
  } catch (error) {
    handleControllerError(error, next, 'Error al obtener perfil');
  }
};
