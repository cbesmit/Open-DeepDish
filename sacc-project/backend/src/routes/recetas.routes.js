const express = require('express');
const router = express.Router();
const recetasController = require('../controllers/recetas.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.post('/', recetasController.guardarReceta);
router.get('/', recetasController.listarRecetas);
router.get('/:id', recetasController.obtenerDetalleReceta);
router.post('/:id/calificar', recetasController.calificarReceta);

module.exports = router;
