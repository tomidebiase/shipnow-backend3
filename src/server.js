import app from './app.js';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';

try {
  await connectDatabase();
  app.listen(config.port, () => {
    console.log(`ShipNow escuchando en el puerto ${config.port}`);
  });
} catch (error) {
  console.error(`No se pudo iniciar ShipNow: ${error.message}`);
  process.exitCode = 1;
}
