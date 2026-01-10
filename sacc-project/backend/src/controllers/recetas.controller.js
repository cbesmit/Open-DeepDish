const prisma = require('../config/prisma');
const { guardarRecetaSchema, calificarRecetaSchema } = require('../validators/recetas.schema');
const { z } = require('zod');

const guardarReceta = async (req, res) => {
  try {
    const data = guardarRecetaSchema.parse(req.body);

    const nuevaReceta = await prisma.recetaGuardada.create({
      data: {
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo_comida: data.tipo_comida,
        nivel_saludable: data.nivel_saludable,
        tiempo_preparacion: data.tiempo_preparacion,
        contenido_full: data.contenido_full,
        config_snapshot: data.config_snapshot
      }
    });

    return res.status(201).json(nuevaReceta);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Datos inválidos', 
        details: error.errors,
        code: 'VAL_ERROR' 
      });
    }
    console.error('Error in guardarReceta:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al guardar receta',
      code: 'DB_ERROR'
    });
  }
};

const listarRecetas = async (req, res) => {
  try {
    const { 
      q, 
      persona_id, 
      fecha_inicio, 
      fecha_fin, 
      nivel_saludable, 
      tipo_comida, 
      tiempo,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      deleted_at: null // Solo recetas no eliminadas (si hubiera soft delete implementado globalmente, aqui se asegura)
    };

    // Filtro de Texto (Título o Descripción)
    if (q) {
      where.OR = [
        { titulo: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Filtro por Persona (Le gustó o es Indiferente)
    if (persona_id) {
      where.calificaciones = {
        some: {
          personaId: persona_id,
          valoracion: { in: ['ME_GUSTO', 'INDIFERENTE'] }
        }
      };
    }

    // Filtro por Rango de Fechas
    if (fecha_inicio || fecha_fin) {
      where.fecha_guardado = {};
      if (fecha_inicio) where.fecha_guardado.gte = new Date(fecha_inicio);
      if (fecha_fin) where.fecha_guardado.lte = new Date(fecha_fin);
    }

    // Filtros Exactos
    if (nivel_saludable) where.nivel_saludable = parseInt(nivel_saludable);
    if (tipo_comida) where.tipo_comida = tipo_comida;
    if (tiempo) where.tiempo_preparacion = tiempo; // Nota: en query param viene 'tiempo', en DB es 'tiempo_preparacion'? El spec dice 'tiempo_prep' en generador, pero query param dice 'tiempo'. Mapeo a 'tiempo_preparacion' del modelo.

    // Ejecutar consulta con paginación
    const [total, recetas] = await prisma.$transaction([
      prisma.recetaGuardada.count({ where }),
      prisma.recetaGuardada.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { fecha_guardado: 'desc' },
        include: {
           // Incluimos calificaciones para ver el feedback en la lista si es necesario, 
           // o lo dejamos ligero. El spec no especifica, pero suele ser útil.
           // Dejaremos ligero por ahora para 'listar', solo data básica.
           _count: { select: { calificaciones: true } } 
        }
      })
    ]);

    return res.status(200).json({
      data: recetas,
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('Error in listarRecetas:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al listar recetas',
      code: 'DB_ERROR'
    });
  }
};

const obtenerDetalleReceta = async (req, res) => {
  try {
    const { id } = req.params;

    const receta = await prisma.recetaGuardada.findUnique({
      where: { id },
      include: {
        calificaciones: {
          include: {
            persona: {
              select: { nombre: true } // Traemos el nombre de la persona que calificó
            }
          }
        }
      }
    });

    if (!receta) {
      return res.status(404).json({ 
        error: true, 
        message: 'Receta no encontrada',
        code: 'NOT_FOUND'
      });
    }

    return res.status(200).json(receta);
  } catch (error) {
    console.error('Error in obtenerDetalleReceta:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al obtener receta',
      code: 'DB_ERROR'
    });
  }
};

const calificarReceta = async (req, res) => {
  try {
    const { id } = req.params; // recetaId
    const { calificaciones } = calificarRecetaSchema.parse(req.body);

    // Verificar que la receta existe
    const receta = await prisma.recetaGuardada.findUnique({ where: { id } });
    if (!receta) {
      return res.status(404).json({ error: true, message: 'Receta no encontrada', code: 'NOT_FOUND' });
    }

    // Transacción interactiva para manejar el Upsert manual (ya que no hay @@unique compuesto en schema)
    await prisma.$transaction(async (tx) => {
      for (const calif of calificaciones) {
        const { persona_id, valoracion } = calif;

        // Buscar si ya existe calificación de esta persona para esta receta
        // Como no tenemos unique constraint, usamos findFirst.
        // OJO: Esto asume que la aplicación controla que no haya duplicados. 
        // Si ya hay duplicados en DB, esto podría tomar cualquiera. 
        // Idealmente deberíamos limpiar o tener unique constraint.
        const existingCalificacion = await tx.calificacion.findFirst({
          where: {
            recetaId: id,
            personaId: persona_id
          }
        });

        if (existingCalificacion) {
          // Actualizar
          await tx.calificacion.update({
            where: { id: existingCalificacion.id },
            data: { valoracion }
          });
        } else {
          // Crear
          await tx.calificacion.create({
            data: {
              recetaId: id,
              personaId: persona_id,
              valoracion
            }
          });
        }
      }
    });

    return res.status(200).json({ message: 'Calificaciones registradas exitosamente' });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Datos de calificación inválidos', 
        details: error.errors,
        code: 'VAL_ERROR' 
      });
    }
    console.error('Error in calificarReceta:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al registrar calificaciones',
      code: 'DB_ERROR'
    });
  }
};

module.exports = {
  guardarReceta,
  listarRecetas,
  obtenerDetalleReceta,
  calificarReceta
};
