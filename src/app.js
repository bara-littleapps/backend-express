// src/app.js

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  return res.status(200).json({
    success: true,
    code: 200,
    message: 'API is healthy',
    data: null,
    meta: null,
  });
});

// semua route API masuk sini
app.use('/api', routes);

// error handler global
app.use(errorHandler);

module.exports = app;
