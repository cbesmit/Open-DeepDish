const express = require('express');
const router = express.Router();
const ingredientesController = require('../controllers/ingredientes.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.get('/', ingredientesController.getAllIngredientes);
router.post('/', ingredientesController.createIngrediente);
router.patch('/:id/toggle', ingredientesController.toggleDisponibilidad);
router.delete('/:id', ingredientesController.deleteIngrediente);

module.exports = router;
