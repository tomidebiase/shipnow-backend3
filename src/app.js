import express from 'express';
import productsRouter from './routes/products.router.js';
import usersRouter from './routes/users.router.js';
import mocksRouter from './routes/mocks.router.js';
import { errorHandler } from './middlewares/error-handler.js';

const app = express();

app.use(express.json());

app.use('/api/products', productsRouter);
app.use('/api/users', usersRouter);
app.use('/api/mocks', mocksRouter);

app.use((req, res) => {
  res.status(404).json({ status: 'error', error: 'Ruta no encontrada' });
});

app.use(errorHandler);

export default app;

