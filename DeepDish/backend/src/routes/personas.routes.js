const express = require('express');
const router = express.Router();
const personasController = require('../controllers/personas.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas de este router
router.use(authenticateToken);

router.get('/', personasController.getAllPersonas);
router.post('/', personasController.createPersona);
router.put('/:id', personasController.updatePersona);
router.patch('/:id/estado', personasController.toggleEstadoPersona);

module.exports = router;
