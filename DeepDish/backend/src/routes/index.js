const express = require('express');
const router = express.Router();
const authRoutes = require('./auth.routes');
const personasRoutes = require('./personas.routes');
const ingredientesRoutes = require('./ingredientes.routes');
const generadorRoutes = require('./generador.routes');
const recetasRoutes = require('./recetas.routes');

// Rutas Públicas
router.use('/auth', authRoutes);

// Rutas Protegidas
router.use('/personas', personasRoutes);
router.use('/ingredientes', ingredientesRoutes);
router.use('/generador', generadorRoutes);
router.use('/recetas', recetasRoutes);

module.exports = router;
