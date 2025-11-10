import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { generarToken } from '../utils/jwt';
import { UsuarioRegistro, UsuarioLogin } from '../types';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

/**
 * Registrar un nuevo usuario
 * POST /api/auth/register
 */
export const registrar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username }: UsuarioRegistro = req.body;

    // Validaciones básicas
    if (!email || !password || !username) {
      res.status(400).json({
        error: 'Email, password y username son requeridos'
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        error: 'El password debe tener al menos 6 caracteres'
      });
      return;
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
      res.status(409).json({
        error: 'El email o username ya está registrado'
      });
      return;
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
      email: nuevoUsuario.email
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
    console.error('Error en registro:', error);
    res.status(500).json({
      error: 'Error al registrar usuario'
    });
  }
};

/**
 * Login de usuario
 * POST /api/auth/login
 * TODO: Agregar rate limiting después - no dejar que hagan muchos intentos
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: UsuarioLogin = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email y password requeridos'
      });
      return;
    }

    // Buscar usuario
    const usuario = await prisma.usuario.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!usuario) {
      res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
      return;
    }

    // Validar password
    const passwordValido = await bcrypt.compare(password, usuario.password);

    if (!passwordValido) {
      res.status(401).json({
        error: 'Email o contraseña incorrectos'
      });
      return;
    }

    // Generar token
    const token = generarToken({
      id: usuario.id,
      email: usuario.email
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
    console.error('Error en login:', error);
    res.status(500).json({
      error: 'Error al iniciar sesión'
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 * GET /api/auth/perfil (protegido)
 */
export const obtenerPerfil = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.usuario) {
      res.status(401).json({ error: 'No autorizado' });
      return;
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
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json(usuario);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};
