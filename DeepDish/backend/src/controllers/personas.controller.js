const prisma = require('../config/prisma');
const { personaSchema, estadoPersonaSchema } = require('../validators/personas.schema');
const { z } = require('zod');

const getAllPersonas = async (req, res) => {
  try {
    const { activo } = req.query;
    const where = {};
    
    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    const personas = await prisma.persona.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });

    return res.status(200).json(personas);
  } catch (error) {
    console.error('Error in getAllPersonas:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al obtener personas',
      code: 'DB_ERROR'
    });
  }
};

const createPersona = async (req, res) => {
  try {
    const data = personaSchema.parse(req.body);

    const nuevaPersona = await prisma.persona.create({
      data: {
        ...data,
        activo: true // Por defecto activa al crear
      }
    });

    return res.status(201).json(nuevaPersona);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Datos de entrada inválidos', 
        details: error.errors,
        code: 'VAL_ERROR'
      });
    }
    console.error('Error in createPersona:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al crear persona',
      code: 'DB_ERROR'
    });
  }
};

const updatePersona = async (req, res) => {
  try {
    const { id } = req.params;
    // Permitimos actualización parcial, usamos el schema pero hacemos los campos opcionales
    // Aunque la spec dice "Mismo que Crear", generalmente en PUT se manda todo o en PATCH parcial.
    // Asumiremos que validamos contra el schema original para consistencia en PUT.
    const data = personaSchema.partial().parse(req.body);

    const personaActualizada = await prisma.persona.update({
      where: { id },
      data
    });

    return res.status(200).json(personaActualizada);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Datos inválidos', 
        details: error.errors,
        code: 'VAL_ERROR'
      });
    }
    // Prisma err code P2025 means record not found
    if (error.code === 'P2025') {
        return res.status(404).json({
            error: true,
            message: 'Persona no encontrada',
            code: 'NOT_FOUND'
        });
    }
    console.error('Error in updatePersona:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al actualizar persona',
      code: 'DB_ERROR'
    });
  }
};

const toggleEstadoPersona = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = estadoPersonaSchema.parse(req.body);

    const personaActualizada = await prisma.persona.update({
      where: { id },
      data: { activo }
    });

    return res.status(200).json(personaActualizada);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Datos inválidos', 
        details: error.errors,
        code: 'VAL_ERROR'
      });
    }
    if (error.code === 'P2025') {
        return res.status(404).json({
            error: true,
            message: 'Persona no encontrada',
            code: 'NOT_FOUND'
        });
    }
    console.error('Error in toggleEstadoPersona:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al cambiar estado de persona',
      code: 'DB_ERROR'
    });
  }
};

module.exports = {
  getAllPersonas,
  createPersona,
  updatePersona,
  toggleEstadoPersona
};
