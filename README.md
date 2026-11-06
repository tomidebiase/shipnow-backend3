# ShipNow API

API REST para la gestión inicial de usuarios y productos de ShipNow, desarrollada con Node.js, Express, MongoDB y Mongoose.

## Requisitos

- Node.js 20 o superior
- npm
- MongoDB local o una instancia de MongoDB Atlas

## Instalación

1. Clonar el repositorio y entrar en el proyecto.
2. Instalar las dependencias con `npm install`.
3. Copiar `.env.example` a `.env` y completar las variables:

   ```env
   PORT=8080
   MONGODB_URI=mongodb://127.0.0.1:27017/shipnow
   NODE_ENV=development
   ```

   La URI es un ejemplo para una instancia local; reemplazarla por la propia conexión cuando corresponda. El archivo `.env` está ignorado por Git.

4. Iniciar con `npm run dev` o `npm start`.
5. Ejecutar las pruebas con `npm test`.

El servidor se inicia únicamente si las variables `PORT`, `MONGODB_URI` y `NODE_ENV` son válidas y la conexión a MongoDB se establece correctamente. Si falta una variable obligatoria, se muestra un error descriptivo y la aplicación no arranca.

## Organización

```text
src/
├── app.js
├── server.js
├── config/
│   ├── index.js
│   ├── env.config.js
│   └── database.js
├── constants/
│   └── index.js
├── controllers/
│   ├── products.controller.js
│   └── users.controller.js
├── middlewares/
│   └── error-handler.js
├── models/
│   ├── product.model.js
│   └── user.model.js
├── repositories/
│   ├── products.repository.js
│   └── users.repository.js
├── routes/
│   ├── products.router.js
│   └── users.router.js
├── services/
│   ├── products.service.js
│   └── users.service.js
└── utils/
    ├── api-error.js
    └── constants.js
```

### Separación de responsabilidades

El recorrido de cada petición es **Router → Controller → Service → Repository → Model**.

- **Router:** vincula cada URL y método HTTP con el controlador correspondiente.
- **Controller:** recibe parámetros y datos de la petición, invoca el servicio y define el código HTTP de respuesta.
- **Service:** concentra las reglas del negocio. Calcula el estado de un producto según el stock, valida precios y datos de usuario y asigna el rol inicial `USER`.
- **Repository:** encapsula el acceso a MongoDB. Aplica filtros, proyecciones y ordenamiento en las consultas, sin decidir reglas comerciales ni permisos.
- **Model:** define los esquemas y restricciones básicas de los documentos almacenados.

Esta separación permite modificar consultas a la base de datos sin alterar reglas de negocio y probar los servicios de forma aislada.

Los valores fijos para roles y estados de producto están centralizados en `src/constants/index.js` mediante `Object.freeze`. `src/utils/constants.js` los reexporta para mantener una ubicación alternativa compatible con el material del módulo.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/api/products` | Listar productos disponibles |
| GET | `/api/products?includeOutOfStock=true` | Listar todos los productos |
| GET | `/api/products/:id` | Obtener un producto |
| POST | `/api/products` | Crear un producto |
| PATCH | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto |
| GET | `/api/users` | Listar usuarios |
| GET | `/api/users/:id` | Obtener un usuario |
| POST | `/api/users` | Crear un usuario |
| PATCH | `/api/users/:id` | Actualizar un usuario |
| DELETE | `/api/users/:id` | Eliminar un usuario |

### Ejemplo: crear producto

`POST http://localhost:8080/api/products`

```json
{
  "name": "Caja de embalaje",
  "description": "Caja de cartón mediana",
  "price": 1500,
  "stock": 12
}
```

El estado es `available` si el stock es mayor a cero, o `out_of_stock` si es cero. No se permite enviar el estado directamente porque se determina en el servicio.

### Ejemplo: crear usuario

`POST http://localhost:8080/api/users`

```json
{
  "firstName": "Ana",
  "lastName": "García",
  "email": "ana@example.com"
}
```

Los usuarios nuevos reciben el rol `user`. La API no permite asignar o modificar el rol mediante estas rutas.

### Respuestas

- `200`: consulta o actualización exitosa.
- `201`: creación exitosa.
- `204`: eliminación exitosa, sin cuerpo de respuesta.
- `400`: datos inválidos.
- `404`: recurso no encontrado.
- `409`: registro duplicado.
- `500`: error interno.

## Alcance

Esta primera versión organiza las entidades Products y Users y deja lista la configuración común para módulos posteriores. No incluye inicio de sesión, autenticación ni autorización; las rutas deben utilizarse en un entorno de desarrollo hasta incorporar esas protecciones.

## Pre-entrega Módulo 2 — Mocking y carga de datos

El módulo permite generar datos de prueba sin guardarlos o insertarlos en MongoDB. Conserva el esquema de usuarios existente y agrega el rol `repartidor`, pedidos con estado y prioridad, y entregas relacionadas con pedidos y repartidores.

### Estructura y relaciones

- `src/routes/mocks.router.js`: expone las rutas HTTP.
- `src/controllers/mocks.controller.js`: maneja las peticiones y respuestas.
- `src/services/mocks.generator.js`: genera usuarios, repartidores, pedidos y entregas relacionados.
- `src/services/mocks.service.js`: valida cantidades y controla las cargas.
- `src/repositories/mocks.repository.js`: encapsula las inserciones en MongoDB.
- `src/models/order.model.js` y `src/models/delivery.model.js`: modelan pedidos y entregas.

Los pedidos tienen una referencia a un usuario con rol `user`. Las entregas referencian un pedido y, si están asignadas, un usuario con rol `repartidor`. Los roles, estados y prioridades se definen como constantes inmutables y se utilizan en los esquemas.

### Datos simulados que no se guardan

Con la API levantada mediante `npm start`:

| Método | Endpoint | Descripción |
| --- | --- | --- |
| GET | `/api/mocks/users?qty=2` | Dos usuarios simulados |
| GET | `/api/mocks/couriers?qty=2` | Dos repartidores |
| GET | `/api/mocks/orders?qty=2` | Dos pedidos |
| GET | `/api/mocks/deliveries?qty=2` | Dos entregas |
| GET | `/api/mocks/bundle?qty=2` | Conjunto de usuarios, repartidores, pedidos y entregas con referencias coherentes |

```bash
curl -i "http://localhost:3000/api/mocks/users?qty=2"
curl -i "http://localhost:3000/api/mocks/bundle?qty=3"
```

Los endpoints individuales generan conjuntos independientes; para comprobar referencias entre entidades usá `/api/mocks/bundle`. Ninguna de estas consultas inserta datos en MongoDB.

El parámetro `qty` es opcional, predeterminado a 10, y acepta enteros entre 1 y 100. Un valor fuera de rango devuelve HTTP 400.

### Carga de datos de prueba en MongoDB

Carga simple: inserta usuarios simulados en `users`.

```bash
curl -i -X POST "http://localhost:3000/api/mocks/seed?qty=10"
```

Respuesta HTTP 201:

```json
{ "insertados": 10, "coleccion": "usuarios" }
```

Carga completa: inserta clientes y repartidores en `users`, pedidos en `orders` y entregas en `deliveries`.

```bash
curl -i -X POST "http://localhost:3000/api/mocks/seed/all?qty=10"
```

Respuesta HTTP 201 de ejemplo:

```json
{
  "insertados": { "usuarios": 14, "repartidores": 4, "pedidos": 10, "entregas": 10 },
  "colecciones": ["usuarios", "pedidos", "entregas"]
}
```

`repartidores` es un subconjunto de `usuarios`, no un conteo adicional. Los correos usan `example.test` y un identificador aleatorio para evitar colisiones entre tandas.

En caso de falla, el repositorio intenta retirar solo los documentos creados durante esa solicitud. Esta compensación no equivale a una transacción atómica.

La carga está bloqueada cuando `NODE_ENV=production`. En desarrollo los endpoints no tienen autenticación: no expongas públicamente el servidor. Para observar datos insertados podés usar MongoDB Atlas; las rutas GET de mocks generan nuevas muestras y no leen los registros guardados.

### Pruebas y observaciones de la entrega anterior

```bash
npm test
```

Las pruebas verifican generación de datos, roles, estados, prioridades, asociaciones, límites de cantidad, endpoints HTTP y bloqueo de inserciones en producción. La carga real de datos relacionada debe comprobarse contra MongoDB antes de la entrega.

Se agregó validación de ObjectId en los servicios para responder HTTP 400 a identificadores mal formados y HTTP 404 a registros válidos inexistentes.
