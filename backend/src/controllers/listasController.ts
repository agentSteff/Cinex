import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Listas predeterminadas del sistema
const LISTAS_PREDETERMINADAS = {
  POR_VER: 'por_ver',
  VISTAS: 'vistas',
  FAVORITAS: 'favoritas'
};

/**
 * Obtener todas mis listas (predeterminadas + personalizadas)
 * GET /api/listas/mis-listas
 */
export const obtenerMisListas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;

    // Obtener listas personalizadas
    const listasPersonalizadas = await prisma.listaPersonalizada.findMany({
      where: { usuarioId },
      include: {
        _count: {
          select: { peliculas: true }
        }
      },
      orderBy: { fechaCreacion: 'desc' }
    });

    // Obtener conteos de listas predeterminadas
    const porVerCount = await prisma.listaPorVer.count({
      where: { usuarioId }
    });

    const vistasCount = await prisma.listaVistas.count({
      where: { usuarioId }
    });

    const favoritasCount = await prisma.listaFavoritas.count({
      where: { usuarioId }
    });

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
      listasPersonalizadas: listasPersonalizadas.map(lista => ({
        ...lista,
        tipo: 'personalizada',
        esPredeterminada: false
      }))
    });

  } catch (error) {
    console.error('Error obteniendo listas:', error);
    res.status(500).json({
      error: 'Error al obtener las listas'
    });
  }
};

/**
 * Obtener detalle de una lista específica
 * GET /api/listas/:listaId
 */
export const obtenerLista = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listaId } = req.params;
    const usuarioId = req.usuario?.id;

    // Determinar si es lista predeterminada o personalizada
    if (Object.values(LISTAS_PREDETERMINADAS).includes(listaId as any)) {
      // Es lista predeterminada
      await obtenerListaPredeterminada(req, res);
    } else {
      // Es lista personalizada
      await obtenerListaPersonalizada(req, res);
    }

  } catch (error) {
    console.error('Error obteniendo lista:', error);
    res.status(500).json({
      error: 'Error al obtener la lista'
    });
  }
};

/**
 * Obtener lista predeterminada (Por Ver, Vistas, Favoritas)
 */
const obtenerListaPredeterminada = async (req: AuthRequest, res: Response): Promise<void> => {
  const { listaId } = req.params;
  const usuarioId = req.usuario?.id;

  let peliculas = [];

  switch (listaId) {
    case LISTAS_PREDETERMINADAS.POR_VER:
      peliculas = await prisma.listaPorVer.findMany({
        where: { usuarioId },
        include: {
          pelicula: {
            include: {
              _count: {
                select: { calificaciones: true }
              }
            }
          }
        },
        orderBy: { fechaAgregado: 'desc' }
      });
      break;

    case LISTAS_PREDETERMINADAS.VISTAS:
      peliculas = await prisma.listaVistas.findMany({
        where: { usuarioId },
        include: {
          pelicula: {
            include: {
              _count: {
                select: { calificaciones: true }
              }
            }
          }
        },
        orderBy: { fechaVista: 'desc' }
      });
      break;

    case LISTAS_PREDETERMINADAS.FAVORITAS:
      peliculas = await prisma.listaFavoritas.findMany({
        where: { usuarioId },
        include: {
          pelicula: {
            include: {
              _count: {
                select: { calificaciones: true }
              }
            }
          }
        },
        orderBy: { fechaAgregado: 'desc' }
      });
      break;
  }

  res.json({
    listaId,
    tipo: 'predeterminada',
    peliculas: peliculas.map(item => ({
      ...item.pelicula,
      fechaAgregado: item.fechaAgregado,
      ...(listaId === LISTAS_PREDETERMINADAS.VISTAS && { fechaVista: item.fechaVista })
    }))
  });
};

/**
 * Obtener lista personalizada
 */
const obtenerListaPersonalizada = async (req: AuthRequest, res: Response): Promise<void> => {
  const { listaId } = req.params;
  const usuarioId = req.usuario?.id;

  const lista = await prisma.listaPersonalizada.findFirst({
    where: {
      id: parseInt(listaId),
      usuarioId
    },
    include: {
      peliculas: {
        include: {
          pelicula: {
            include: {
              _count: {
                select: { calificaciones: true }
              }
            }
          }
        },
        orderBy: { fechaAgregado: 'desc' }
      },
      _count: {
        select: { peliculas: true }
      }
    }
  });

  if (!lista) {
    res.status(404).json({ error: 'Lista no encontrada' });
    return;
  }

  res.json({
    ...lista,
    peliculas: lista.peliculas.map(item => ({
      ...item.pelicula,
      fechaAgregado: item.fechaAgregado
    }))
  });
};

/**
 * Agregar película a lista "Por Ver"
 * POST /api/listas/por-ver/:peliculaId
 */
export const agregarAPorVer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    // Verificar que la película existe
    const pelicula = await prisma.pelicula.findUnique({
      where: { id: parseInt(peliculaId) }
    });

    if (!pelicula) {
      res.status(404).json({ error: 'Película no encontrada' });
      return;
    }

    // Verificar si ya está en la lista
    const existeEnLista = await prisma.listaPorVer.findFirst({
      where: {
        usuarioId,
        peliculaId: parseInt(peliculaId)
      }
    });

    if (existeEnLista) {
      res.status(409).json({ error: 'La película ya está en tu lista "Por Ver"' });
      return;
    }

    // Agregar a lista "Por Ver"
    const nuevaEntrada = await prisma.listaPorVer.create({
      data: {
        usuarioId: usuarioId!,
        peliculaId: parseInt(peliculaId)
      },
      include: {
        pelicula: true
      }
    });

    res.status(201).json({
      message: 'Película agregada a "Por Ver"',
      pelicula: nuevaEntrada.pelicula
    });

  } catch (error) {
    console.error('Error agregando a Por Ver:', error);
    res.status(500).json({
      error: 'Error al agregar película a la lista'
    });
  }
};

/**
 * Marcar película como vista (mueve de "Por Ver" a "Vistas")
 * POST /api/listas/marcar-vista/:peliculaId
 */
export const marcarComoVista = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    // Verificar que la película existe
    const pelicula = await prisma.pelicula.findUnique({
      where: { id: parseInt(peliculaId) }
    });

    if (!pelicula) {
      res.status(404).json({ error: 'Película no encontrada' });
      return;
    }

    // Usar transacción para asegurar consistencia
    const resultado = await prisma.$transaction(async (tx) => {
      // Remover de "Por Ver" si existe
      await tx.listaPorVer.deleteMany({
        where: {
          usuarioId,
          peliculaId: parseInt(peliculaId)
        }
      });

      // Verificar si ya está en "Vistas"
      const existeEnVistas = await tx.listaVistas.findFirst({
        where: {
          usuarioId,
          peliculaId: parseInt(peliculaId)
        }
      });

      if (existeEnVistas) {
        throw new Error('La película ya está marcada como vista');
      }

      // Agregar a "Vistas"
      const nuevaVista = await tx.listaVistas.create({
        data: {
          usuarioId: usuarioId!,
          peliculaId: parseInt(peliculaId),
          fechaVista: new Date()
        },
        include: {
          pelicula: true
        }
      });

      return nuevaVista;
    });

    res.json({
      message: 'Película marcada como vista',
      pelicula: resultado.pelicula
    });

  } catch (error: any) {
    console.error('Error marcando como vista:', error);
    
    if (error.message.includes('ya está marcada como vista')) {
      res.status(409).json({ error: error.message });
    } else {
      res.status(500).json({
        error: 'Error al marcar película como vista'
      });
    }
  }
};

/**
 * Remover película de lista "Por Ver"
 * DELETE /api/listas/por-ver/:peliculaId
 */
export const removerDePorVer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    const resultado = await prisma.listaPorVer.deleteMany({
      where: {
        usuarioId,
        peliculaId: parseInt(peliculaId)
      }
    });

    if (resultado.count === 0) {
      res.status(404).json({ error: 'Película no encontrada en la lista "Por Ver"' });
      return;
    }

    res.json({
      message: 'Película removida de "Por Ver"'
    });

  } catch (error) {
    console.error('Error removiendo de Por Ver:', error);
    res.status(500).json({
      error: 'Error al remover película de la lista'
    });
  }
};

/**
 * Crear lista personalizada
 * POST /api/listas/personalizadas
 */
export const crearListaPersonalizada = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;
    const { nombre, descripcion, esPrivada = false } = req.body;

    if (!nombre) {
      res.status(400).json({ error: 'El nombre de la lista es requerido' });
      return;
    }

    // Verificar si ya existe una lista con ese nombre para el usuario
    const listaExistente = await prisma.listaPersonalizada.findFirst({
      where: {
        usuarioId,
        nombre
      }
    });

    if (listaExistente) {
      res.status(409).json({ error: 'Ya tienes una lista con ese nombre' });
      return;
    }

    const nuevaLista = await prisma.listaPersonalizada.create({
      data: {
        nombre,
        descripcion,
        esPrivada,
        usuarioId: usuarioId!
      }
    });

    res.status(201).json({
      message: 'Lista personalizada creada exitosamente',
      lista: nuevaLista
    });

  } catch (error) {
    console.error('Error creando lista personalizada:', error);
    res.status(500).json({
      error: 'Error al crear lista personalizada'
    });
  }
};

/**
 * Agregar película a lista personalizada
 * POST /api/listas/personalizadas/:listaId/peliculas/:peliculaId
 */
export const agregarAListaPersonalizada = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listaId, peliculaId } = req.params;
    const usuarioId = req.usuario?.id;

    // Verificar que la lista existe y pertenece al usuario
    const lista = await prisma.listaPersonalizada.findFirst({
      where: {
        id: parseInt(listaId),
        usuarioId
      }
    });

    if (!lista) {
      res.status(404).json({ error: 'Lista no encontrada' });
      return;
    }

    // Verificar que la película existe
    const pelicula = await prisma.pelicula.findUnique({
      where: { id: parseInt(peliculaId) }
    });

    if (!pelicula) {
      res.status(404).json({ error: 'Película no encontrada' });
      return;
    }

    // Verificar si ya está en la lista
    const existeEnLista = await prisma.peliculaEnLista.findFirst({
      where: {
        listaPersonalizadaId: parseInt(listaId),
        peliculaId: parseInt(peliculaId)
      }
    });

    if (existeEnLista) {
      res.status(409).json({ error: 'La película ya está en esta lista' });
      return;
    }

    // Agregar a lista personalizada
    await prisma.peliculaEnLista.create({
      data: {
        listaPersonalizadaId: parseInt(listaId),
        peliculaId: parseInt(peliculaId)
      }
    });

    res.status(201).json({
      message: 'Película agregada a la lista personalizada'
    });

  } catch (error) {
    console.error('Error agregando a lista personalizada:', error);
    res.status(500).json({
      error: 'Error al agregar película a la lista personalizada'
    });
  }
};

/**
 * Eliminar lista personalizada
 * DELETE /api/listas/personalizadas/:listaId
 */
export const eliminarListaPersonalizada = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { listaId } = req.params;
    const usuarioId = req.usuario?.id;

    // Verificar que la lista existe y pertenece al usuario
    const lista = await prisma.listaPersonalizada.findFirst({
      where: {
        id: parseInt(listaId),
        usuarioId
      }
    });

    if (!lista) {
      res.status(404).json({ error: 'Lista no encontrada' });
      return;
    }

    // Eliminar lista (las relaciones se eliminarán en cascada)
    await prisma.listaPersonalizada.delete({
      where: { id: parseInt(listaId) }
    });

    res.json({
      message: 'Lista personalizada eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando lista personalizada:', error);
    res.status(500).json({
      error: 'Error al eliminar lista personalizada'
    });
  }
};