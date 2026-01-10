const express = require('express');
const router = express.Router();
const generadorController = require('../controllers/generador.controller');
const authenticateToken = require('../middlewares/auth.middleware');

router.use(authenticateToken);

router.post('/crear', generadorController.generarRecetas);

module.exports = router;
