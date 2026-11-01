
import { ApiError } from '../utils/api-error.js';

export const errorHandler = (error, req, res, next) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      status: 'error',
      error: 'El JSON enviado no es válido'
    });
  }

  if (error instanceof ApiError) {
    return res.status(error.statusCode).json({
      status: 'error',
      error: error.message
    });
  }

  if (error.code === 11000) {
    return res.status(409).json({
      status: 'error',
      error: 'El registro ya existe'
    });
  }

  if (error.name === 'ValidationError' || error.name === 'CastError') {
    return res.status(400).json({
      status: 'error',
      error: 'Los datos enviados son inválidos'
    });
  }

  console.error(error);

  return res.status(500).json({
    status: 'error',
    error: 'Error interno del servidor'
  });
};
