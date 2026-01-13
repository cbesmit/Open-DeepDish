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
        dificultad: data.dificultad,
        objetivo_agrado: data.objetivo_agrado,
        tipo_cocina: data.tipo_cocina,
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
      persona_id, // Puede ser string "id" o string "id1,id2"
      fecha_inicio, 
      fecha_fin, 
      nivel_saludable, 
      min_salud,
      max_salud,
      tipo_comida, 
      tiempo,
      dificultad,
      objetivo_agrado,
      tipo_cocina,
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      deleted_at: null // Solo recetas no eliminadas
    };

    // Filtro de Texto (Título o Descripción)
    if (q) {
      where.OR = [
        { titulo: { contains: q, mode: 'insensitive' } },
        { descripcion: { contains: q, mode: 'insensitive' } }
      ];
    }

    // Filtro por Persona (Le gustó o es Indiferente) -> AND Logic (Deben coincidir TODOS)
    if (persona_id) {
      const personasIds = persona_id.split(',').map(id => id.trim()).filter(id => id);
      if (personasIds.length > 0) {
        where.AND = personasIds.map(pid => ({
            calificaciones: {
                some: {
                    personaId: pid,
                    valoracion: { in: ['ME_GUSTO', 'INDIFERENTE'] }
                }
            }
        }));
      }
    }

    // Filtro por Rango de Fechas
    if (fecha_inicio || fecha_fin) {
      where.fecha_guardado = {};
      if (fecha_inicio) where.fecha_guardado.gte = new Date(fecha_inicio);
      if (fecha_fin) where.fecha_guardado.lte = new Date(fecha_fin);
    }

    // Filtro de Nivel Saludable (Rango)
    // Si viene min_salud o max_salud, tienen prioridad sobre nivel_saludable exacto
    if (min_salud || max_salud) {
        where.nivel_saludable = {};
        if (min_salud) where.nivel_saludable.gte = parseInt(min_salud);
        if (max_salud) where.nivel_saludable.lte = parseInt(max_salud);
    } else if (nivel_saludable) {
        where.nivel_saludable = parseInt(nivel_saludable);
    }

    // Filtros Exactos
    if (tipo_comida) where.tipo_comida = tipo_comida;
    if (objetivo_agrado) where.objetivo_agrado = objetivo_agrado;
    if (tipo_cocina) where.tipo_cocina = tipo_cocina;

    // Filtro Tiempo / Dificultad
    // Checkea tanto el campo 'dificultad' como 'tiempo_preparacion' para compatibilidad
    if (dificultad) {
       where.OR = [
           ...(where.OR || []), // Preservar otros OR si existen (ej. busqueda texto q)
           // Esto está mal porque where.OR es array y sobrescribe.
           // Mejor usar AND si ya existe OR de texto?
           // No, Prisma OR en root nivela. Si quiero (Title OR Desc) AND (Tiempo OR Dificultad)
           // Prisma: where = { AND: [ { OR: [Title, Desc] }, { OR: [Tiempo, Dificultad] } ] }
       ];
       
       // Reestructuramos si hay busqueda de texto
       const textSearch = q ? [
            { titulo: { contains: q, mode: 'insensitive' } },
            { descripcion: { contains: q, mode: 'insensitive' } }
       ] : null;

       const difficultyFilter = [
           { dificultad: dificultad },
           { tiempo_preparacion: dificultad }
       ];

       if (textSearch) {
           where.AND = [
               ...(where.AND || []),
               { OR: textSearch },
               { OR: difficultyFilter }
           ];
           delete where.OR; // Eliminamos el root OR de texto para no conflictuar
       } else {
           where.OR = difficultyFilter;
       }
    } else if (tiempo) {
        where.tiempo_preparacion = tiempo;
    }

    // Ejecutar consulta con paginación
    const [total, recetas] = await prisma.$transaction([
      prisma.recetaGuardada.count({ where }),
      prisma.recetaGuardada.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { fecha_guardado: 'desc' },
        include: {
           calificaciones: {
             include: {
               persona: {
                 select: { nombre: true }
               }
             }
           }
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

    const receta = await prisma.recetaGuardada.findFirst({
      where: { 
        id,
        deleted_at: null 
      },
      include: {
        calificaciones: {
          include: {
            persona: {
              select: { nombre: true } 
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
    const { id } = req.params; 
    const { calificaciones } = calificarRecetaSchema.parse(req.body);

    const receta = await prisma.recetaGuardada.findUnique({ where: { id } });
    if (!receta) {
      return res.status(404).json({ error: true, message: 'Receta no encontrada', code: 'NOT_FOUND' });
    }

    await prisma.$transaction(async (tx) => {
      for (const calif of calificaciones) {
        const { persona_id, valoracion } = calif;
        const existingCalificacion = await tx.calificacion.findFirst({
          where: {
            recetaId: id,
            personaId: persona_id
          }
        });

        if (existingCalificacion) {
          await tx.calificacion.update({
            where: { id: existingCalificacion.id },
            data: { valoracion }
          });
        } else {
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

const eliminarReceta = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete
    const receta = await prisma.recetaGuardada.update({
      where: { id },
      data: { deleted_at: new Date() }
    });

    return res.status(200).json({ message: 'Receta eliminada correctamente', id: receta.id });
  } catch (error) {
    // Si no existe (Prisma lanza error P2025)
    if (error.code === 'P2025') {
       return res.status(404).json({ 
        error: true, 
        message: 'Receta no encontrada',
        code: 'NOT_FOUND'
      });
    }

    console.error('Error in eliminarReceta:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al eliminar receta',
      code: 'DB_ERROR'
    });
  }
};

module.exports = {
  guardarReceta,
  listarRecetas,
  obtenerDetalleReceta,
  calificarReceta,
  eliminarReceta
};
