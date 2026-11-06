import { ApiError } from '../utils/api-error.js';
import {
  generateMockUsers,
  generateMockCouriers,
  generateMockBundle
} from './mocks.generator.js';

const MAX_QTY = 100;
const DEFAULT_QTY = 10;

export const parseMockQuantity = (value) => {
  if (value === undefined) return DEFAULT_QTY;

  if (typeof value !== 'string' || !/^[1-9][0-9]*$/.test(value)) {
    throw new ApiError(400, 'qty debe ser un número entero positivo');
  }

  const qty = Number(value);
  if (!Number.isSafeInteger(qty) || qty > MAX_QTY) {
    throw new ApiError(400, `qty debe estar entre 1 y ${MAX_QTY}`);
  }

  return qty;
};

export const createMocksService = (repository, { allowSeed = true } = {}) => ({
  getUsers(qty) {
    return generateMockUsers(parseMockQuantity(qty));
  },
  getCouriers(qty) {
    return generateMockCouriers(parseMockQuantity(qty));
  },
  getBundle(qty) {
    return generateMockBundle(parseMockQuantity(qty));
  },
  getOrders(qty) {
    return generateMockBundle(parseMockQuantity(qty)).orders;
  },
  getDeliveries(qty) {
    return generateMockBundle(parseMockQuantity(qty)).deliveries;
  },
  async seedUsers(qty) {
    if (!allowSeed) throw new ApiError(403, 'La carga de prueba no está disponible en producción');
    const users = generateMockUsers(parseMockQuantity(qty));
    const inserted = await repository.insertUsers(users);
    return { insertados: inserted, coleccion: 'usuarios' };
  },
  async seedBundle(qty) {
    if (!allowSeed) throw new ApiError(403, 'La carga de prueba no está disponible en producción');
    const bundle = generateMockBundle(parseMockQuantity(qty));
    const totals = await repository.insertBundle(bundle);
    return { insertados: totals, colecciones: ['usuarios', 'pedidos', 'entregas'] };
  }
});

