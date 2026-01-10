const prisma = require('../config/prisma');
const { ingredienteSchema } = require('../validators/ingredientes.schema');
const { z } = require('zod');

const getAllIngredientes = async (req, res) => {
  try {
    const ingredientes = await prisma.ingredienteLocal.findMany({
      orderBy: { nombre: 'asc' }
    });
    return res.status(200).json(ingredientes);
  } catch (error) {
    console.error('Error in getAllIngredientes:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al obtener ingredientes',
      code: 'DB_ERROR'
    });
  }
};

const createIngrediente = async (req, res) => {
  try {
    const data = ingredienteSchema.parse(req.body);

    const nuevoIngrediente = await prisma.ingredienteLocal.create({
      data: {
        ...data,
        activo: true // Por defecto disponible
      }
    });

    return res.status(201).json(nuevoIngrediente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: true, 
        message: 'Datos inválidos', 
        details: error.errors,
        code: 'VAL_ERROR'
      });
    }
    console.error('Error in createIngrediente:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al crear ingrediente',
      code: 'DB_ERROR'
    });
  }
};

const toggleDisponibilidad = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: true, message: 'ID inválido', code: 'VAL_ERROR' });
    }

    // Primero obtenemos el estado actual
    const ingrediente = await prisma.ingredienteLocal.findUnique({
      where: { id }
    });

    if (!ingrediente) {
      return res.status(404).json({ 
        error: true, 
        message: 'Ingrediente no encontrado', 
        code: 'NOT_FOUND' 
      });
    }

    const actualizado = await prisma.ingredienteLocal.update({
      where: { id },
      data: { activo: !ingrediente.activo }
    });

    return res.status(200).json(actualizado);
  } catch (error) {
    console.error('Error in toggleDisponibilidad:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al actualizar ingrediente',
      code: 'DB_ERROR'
    });
  }
};

const deleteIngrediente = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).json({ error: true, message: 'ID inválido', code: 'VAL_ERROR' });
    }

    await prisma.ingredienteLocal.delete({
      where: { id }
    });

    return res.status(204).send(); // No Content
  } catch (error) {
    if (error.code === 'P2025') {
        return res.status(404).json({
            error: true,
            message: 'Ingrediente no encontrado',
            code: 'NOT_FOUND'
        });
    }
    console.error('Error in deleteIngrediente:', error);
    return res.status(500).json({ 
      error: true, 
      message: 'Error al eliminar ingrediente',
      code: 'DB_ERROR'
    });
  }
};

module.exports = {
  getAllIngredientes,
  createIngrediente,
  toggleDisponibilidad,
  deleteIngrediente
};
