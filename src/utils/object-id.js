import { ApiError } from './api-error.js';

export const assertValidObjectId = (id) => {
  if (typeof id !== 'string' || !/^[a-fA-F0-9]{24}$/.test(id)) {
    throw new ApiError(400, 'El identificador no es válido');
  }
};

