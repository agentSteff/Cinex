import { NextFunction, Request, Response } from 'express';
import { Prisma, PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError, handleControllerError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// Listas predeterminadas del sistema
const LISTAS_PREDETERMINADAS = {
  POR_VER: 'por_ver',
  VISTAS: 'vistas',
  FAVORITAS: 'favoritas'
};

type ListaConDetalle = Prisma.ListaGetPayload<{
  include: {
    pelicula: {
      include: {
        _count: { select: { calificaciones: true } }
      }
    }
  }
}>;

type EntradaListaPersonalizada = Prisma.ListaPersonalizadaItemGetPayload<{
  include: {
    pelicula: {
      include: { _count: { select: { calificaciones: true } } }
    }
  }
}>;

/**
 * Obtener todas mis listas (predeterminadas + personalizadas)
 * GET /api/listas/mis-listas
 */
export const obtenerMisListas = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    // Obtener listas personalizadas reales con conteo de películas
    const listasPersonalizadas = await prisma.listaPersonalizada.findMany({
      where: { usuarioId },
      orderBy: { fechaCreada: 'desc' },
      include: {
        _count: {
          select: { entradas: true }
        }
      }
    });

    const porVerCount = await prisma.lista.count({ where: { usuarioId, tipoLista: 'por_ver' } });
    const vistasCount = await prisma.lista.count({ where: { usuarioId, tipoLista: 'vistas' } });
    const favoritasCount = await prisma.lista.count({ where: { usuarioId, tipoLista: 'favoritas' } });

    // Estructurar respuesta con listas predeterminadas y personalizadas
    const listasPredeterminadas = [
      {
        id: LISTAS_PREDETERMINADAS.POR_VER,
        nombre: 'Por Ver',
        tipo: 'predeterminada',
        count: porVerCount,
        esPredeterminada: true
      },
      {
        id: LISTAS_PREDETERMINADAS.VISTAS,
        nombre: 'Películas Vistas',
        tipo: 'predeterminada', 
        count: vistasCount,
        esPredeterminada: true
      },
      {
        id: LISTAS_PREDETERMINADAS.FAVORITAS,
        nombre: 'Favoritas',
        tipo: 'predeterminada',
        count: favoritasCount,
        esPredeterminada: true
      }
    ];

    res.json({
      listasPredeterminadas,
      listasPersonalizadas: listasPersonalizadas.map((lista) => ({
        id: lista.id,
        nombre: lista.nombre,
        descripcion: lista.descripcion,
        esPrivada: lista.esPrivada,
        tipo: 'personalizada',
        esPredeterminada: false,
        totalPeliculas: lista._count.entradas,
        fechaCreada: lista.fechaCreada
      }))
    });

  } catch (error) {
    handleControllerError(error, next, 'Error al obtener las listas');
  }
};

/**
 * Obtener detalle de una lista específica
 * GET /api/listas/:listaId
 */
export const obtenerLista = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listaId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }
    // Determinar si es lista predeterminada o personalizada
    if (Object.values(LISTAS_PREDETERMINADAS).includes(listaId as any)) {
      // Es lista predeterminada
      await obtenerListaPredeterminada(req, res, next);
    } else {
      // Es lista personalizada
      await obtenerListaPersonalizada(req, res, next);
    }

  } catch (error) {
    handleControllerError(error, next, 'Error al obtener la lista');
  }
};

/**
 * Obtener lista predeterminada (Por Ver, Vistas, Favoritas)
 */
const obtenerListaPredeterminada = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listaId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    let peliculas: ListaConDetalle[] = [];

    switch (listaId) {
      case LISTAS_PREDETERMINADAS.POR_VER:
        peliculas = await prisma.lista.findMany({
          where: { usuarioId, tipoLista: 'por_ver' },
          include: {
            pelicula: {
              include: { _count: { select: { calificaciones: true } } }
            }
          },
          orderBy: { fechaAgregada: 'desc' }
        });
        break;

      case LISTAS_PREDETERMINADAS.VISTAS:
        peliculas = await prisma.lista.findMany({
          where: { usuarioId, tipoLista: 'vistas' },
          include: {
            pelicula: {
              include: { _count: { select: { calificaciones: true } } }
            }
          },
          orderBy: { fechaAgregada: 'desc' }
        });
        break;

      case LISTAS_PREDETERMINADAS.FAVORITAS:
        peliculas = await prisma.lista.findMany({
          where: { usuarioId, tipoLista: 'favoritas' },
          include: {
            pelicula: {
              include: { _count: { select: { calificaciones: true } } }
            }
          },
          orderBy: { fechaAgregada: 'desc' }
        });
        break;
    }

    res.json({
      listaId,
      tipo: 'predeterminada',
      peliculas: peliculas
        .filter((item) => item.pelicula)
        .map((item) => ({
          ...item.pelicula!,
          fechaAgregado: item.fechaAgregada
        }))
    });
  } catch (error) {
    handleControllerError(error, next, 'Error al obtener la lista predeterminada');
  }
};

/**
 * Obtener lista personalizada
 */
const obtenerListaPersonalizada = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listaId } = req.params;
    const usuarioId = req.usuario?.id;
    const numericId = parseInt(listaId, 10);

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    if (Number.isNaN(numericId)) {
      return next(new AppError('Identificador de lista inválido', 400));
    }

    const lista = await prisma.listaPersonalizada.findFirst({
      where: { id: numericId, usuarioId },
      include: {
        entradas: {
          orderBy: { fechaAgregada: 'desc' },
          include: {
            pelicula: {
              include: { _count: { select: { calificaciones: true } } }
            }
          }
        }
      }
    });

    if (!lista) {
      return next(new AppError('Lista no encontrada', 404));
    }

    res.json({
      id: lista.id,
      nombre: lista.nombre,
      descripcion: lista.descripcion,
      esPrivada: lista.esPrivada,
      tipo: 'personalizada',
      peliculas: lista.entradas
        .filter((entrada: EntradaListaPersonalizada) => entrada.pelicula)
        .map((entrada: EntradaListaPersonalizada) => ({
          ...entrada.pelicula!,
          fechaAgregado: entrada.fechaAgregada
        }))
    });
  } catch (error) {
    handleControllerError(error, next, 'Error al obtener la lista personalizada');
  }
};

/**
 * Agregar película a lista "Por Ver"
 * POST /api/listas/por-ver/:peliculaId
 */
export const agregarAPorVer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    // Verificar que la película existe
    const pelicula = await prisma.pelicula.findUnique({
      where: { id: parseInt(peliculaId) }
    });

    if (!pelicula) {
      return next(new AppError('Película no encontrada', 404));
    }

    // Verificar si ya está en la lista
    const existeEnLista = await prisma.lista.findFirst({
      where: { usuarioId, peliculaId: parseInt(peliculaId), tipoLista: 'por_ver' }
    });

    if (existeEnLista) {
      return next(new AppError('La película ya está en tu lista "Por Ver"', 409));
    }

    // Agregar a lista "Por Ver"
    const nuevaEntrada = await prisma.lista.create({
      data: { usuarioId: usuarioId!, peliculaId: parseInt(peliculaId), tipoLista: 'por_ver', fechaAgregada: new Date() },
      include: { pelicula: true }
    });

    res.status(201).json({
      message: 'Película agregada a "Por Ver"',
      pelicula: nuevaEntrada.pelicula
    });

  } catch (error) {
    handleControllerError(error, next, 'Error al agregar película a la lista');
  }
};

/**
 * Marcar película como vista (mueve de "Por Ver" a "Vistas")
 * POST /api/listas/marcar-vista/:peliculaId
 */
export const marcarComoVista = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    // Verificar que la película existe
    const pelicula = await prisma.pelicula.findUnique({
      where: { id: parseInt(peliculaId) }
    });

    if (!pelicula) {
      return next(new AppError('Película no encontrada', 404));
    }

    // Usar transacción para asegurar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // Remover de "Por Ver" si existe
      await tx.lista.deleteMany({ where: { usuarioId, peliculaId: parseInt(peliculaId), tipoLista: 'por_ver' } });

      // Verificar si ya está en "Vistas"
      const existeEnVistas = await tx.lista.findFirst({ where: { usuarioId, peliculaId: parseInt(peliculaId), tipoLista: 'vistas' } });

      if (existeEnVistas) {
        throw new AppError('La película ya está marcada como vista', 409);
      }

      // Agregar a "Vistas"
      const nuevaVista = await tx.lista.create({ data: { usuarioId: usuarioId!, peliculaId: parseInt(peliculaId), tipoLista: 'vistas', fechaAgregada: new Date() }, include: { pelicula: true } });

      return nuevaVista;
    });

    res.json({
      message: 'Película marcada como vista',
      pelicula: resultado.pelicula
    });

  } catch (error) {
    handleControllerError(error, next, 'Error al marcar película como vista');
  }
};

/**
 * Remover película de lista "Por Ver"
 * DELETE /api/listas/por-ver/:peliculaId
 */
export const removerDePorVer = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    const resultado = await prisma.lista.deleteMany({ where: { usuarioId, peliculaId: parseInt(peliculaId), tipoLista: 'por_ver' } });

    if (resultado.count === 0) {
      return next(new AppError('Película no encontrada en la lista "Por Ver"', 404));
    }

    res.json({
      message: 'Película removida de "Por Ver"'
    });

  } catch (error) {
    handleControllerError(error, next, 'Error al remover película de la lista');
  }
};

/**
 * Crear lista personalizada
 * POST /api/listas/personalizadas
 */
export const crearListaPersonalizada = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;
    const { nombre, descripcion, esPrivada = false } = req.body;

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    if (!nombre) {
      return next(new AppError('El nombre de la lista es requerido', 400));
    }

    // Verificar si ya existe una lista con ese nombre para el usuario
    const listaExistente = await prisma.listaPersonalizada.findFirst({ where: { usuarioId, nombre } });

    if (listaExistente) {
      return next(new AppError('Ya tienes una lista con ese nombre', 409));
    }

    const nuevaLista = await prisma.listaPersonalizada.create({
      data: {
        nombre,
        descripcion: descripcion ?? null,
        esPrivada,
        usuarioId
      }
    });

    res.status(201).json({
      message: 'Lista personalizada creada exitosamente',
      lista: nuevaLista
    });

  } catch (error) {
    handleControllerError(error, next, 'Error al crear lista personalizada');
  }
};

/**
 * Agregar película a lista personalizada
 * POST /api/listas/personalizadas/:listaId/peliculas/:peliculaId
 */
export const agregarAListaPersonalizada = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listaId, peliculaId } = req.params;
    const usuarioId = req.usuario?.id;
    const numericListaId = parseInt(listaId, 10);
    const numericPeliculaId = parseInt(peliculaId, 10);

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    if (Number.isNaN(numericListaId) || Number.isNaN(numericPeliculaId)) {
      return next(new AppError('IDs inválidos', 400));
    }

    // Verificar que la lista existe y pertenece al usuario
    const lista = await prisma.listaPersonalizada.findFirst({
      where: { id: numericListaId, usuarioId }
    });

    if (!lista) {
      return next(new AppError('Lista no encontrada', 404));
    }

    // Verificar que la película existe
    const pelicula = await prisma.pelicula.findUnique({
      where: { id: numericPeliculaId }
    });

    if (!pelicula) {
      return next(new AppError('Película no encontrada', 404));
    }

    // Verificar si ya está en la lista
    const existeEnLista = await prisma.listaPersonalizadaItem.findFirst({
      where: { listaId: lista.id, peliculaId: numericPeliculaId }
    });

    if (existeEnLista) {
      return next(new AppError('La película ya está en esta lista', 409));
    }

    // Agregar a lista personalizada
    await prisma.listaPersonalizadaItem.create({
      data: {
        listaId: lista.id,
        peliculaId: numericPeliculaId
      }
    });

    res.status(201).json({
      message: 'Película agregada a la lista personalizada'
    });

  } catch (error) {
    handleControllerError(error, next, 'Error al agregar película a la lista personalizada');
  }
};

/**
 * Eliminar lista personalizada
 * DELETE /api/listas/personalizadas/:listaId
 */
export const eliminarListaPersonalizada = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { listaId } = req.params;
    const usuarioId = req.usuario?.id;
    const numericId = parseInt(listaId, 10);

    if (!usuarioId) {
      return next(new AppError('No autorizado', 401));
    }

    if (Number.isNaN(numericId)) {
      return next(new AppError('Identificador de lista inválido', 400));
    }

    // Verificar que la lista existe y pertenece al usuario
    const lista = await prisma.listaPersonalizada.findFirst({ where: { id: numericId, usuarioId } });

    if (!lista) {
      return next(new AppError('Lista no encontrada', 404));
    }

    await prisma.listaPersonalizada.delete({ where: { id: lista.id } });

    res.json({
      message: 'Lista personalizada eliminada exitosamente'
    });

  } catch (error) {
    handleControllerError(error, next, 'Error al eliminar lista personalizada');
  }
};