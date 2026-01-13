const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');

const app = express();

// Middlewares Globales
app.use(helmet()); // Seguridad de Headers
app.use(cors());   // Habilitar CORS
app.use(express.json()); // Parsing de JSON

// Rutas API (Prefijo /api/v1)
app.use('/api/v1', routes);

// Middleware de Manejo de Errores Global (Fallback)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: true, 
    message: 'Error inesperado en el servidor', 
    code: 'INTERNAL_SERVER_ERROR' 
  });
});

module.exports = app;
