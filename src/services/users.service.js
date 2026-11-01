import { usersRepository } from '../repositories/users.repository.js';
import { USER_ROLES } from '../constants/index.js';
import { ApiError } from '../utils/api-error.js';

const allowedFields = ['firstName', 'lastName', 'email'];
const hasField = (data, key) => Object.prototype.hasOwnProperty.call(data, key);

const normalizeUser = (input, partial = false) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new ApiError(400, 'Los datos del usuario son inválidos');
  }

  const unknownFields = Object.keys(input).filter((key) => !allowedFields.includes(key));
  if (unknownFields.length > 0) {
    throw new ApiError(400, `Campos no permitidos: ${unknownFields.join(', ')}`);
  }

  const result = {};

  for (const field of ['firstName', 'lastName']) {
    if (!partial || hasField(input, field)) {
      if (typeof input[field] !== 'string' || !input[field].trim()) {
        throw new ApiError(400, `El campo ${field} es obligatorio`);
      }
      result[field] = input[field].trim();
    }
  }

  if (!partial || hasField(input, 'email')) {
    if (typeof input.email !== 'string') {
      throw new ApiError(400, 'El correo electrónico es obligatorio');
    }
    const email = input.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(400, 'El correo electrónico es inválido');
    }
    result.email = email;
  }

  if (partial && Object.keys(result).length === 0) {
    throw new ApiError(400, 'No se enviaron campos para actualizar');
  }

  return result;
};

export const createUsersService = (repository) => ({
  async getAll() {
    return repository.findAll();
  },

  async getById(id) {
    const user = await repository.findById(id);
    if (!user) throw new ApiError(404, 'Usuario no encontrado');
    return user;
  },

  async create(data) {
    const userData = normalizeUser(data);
    const existing = await repository.findByEmail(userData.email);
    if (existing) throw new ApiError(409, 'El correo electrónico ya está registrado');
    return repository.create({ ...userData, role: USER_ROLES.USER });
  },

  async update(id, data) {
    const updated = await repository.updateById(id, normalizeUser(data, true));
    if (!updated) throw new ApiError(404, 'Usuario no encontrado');
    return updated;
  },

  async remove(id) {
    const deleted = await repository.deleteById(id);
    if (!deleted) throw new ApiError(404, 'Usuario no encontrado');
  }
});

export const usersService = createUsersService(usersRepository);
