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
