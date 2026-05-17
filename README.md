# Sistema de Pagos

Prueba técnica backend con arquitectura de 3 componentes:

- API REST en Node.js + TypeScript
- Base de datos PostgreSQL
- Microservicio en Python FastAPI para simulación de procesamiento de pagos

## Funcionalidades

- Crear usuarios
- Autenticación con JWT
- Registrar tarjetas
- Crear pagos asociados a usuario y tarjeta
- Consultar historial de pagos de un usuario con paginación incluida
- Simulación de aprobación/rechazo de pago por FastAPI (80% aprobado, 20% rechazado)

## Estructura del proyecto

```text
.
├── api/                                   # API REST Node.js + TypeScript
├── database/
│   └── init.sql                           # Esquema PostgreSQL
├── payment-service/                       # Microservicio FastAPI
├── postman/
│   └── postman_collection.json
├── docker-compose.yml
└── README.md
```

## Requisitos de entorno

### Opción recomendada (Docker)

- Docker
- Docker Compose

### Opción local sin Docker

- Node.js 22.13+
- pnpm 11+
- Python 3.13+
- PostgreSQL 18+

## Variables de entorno

### API Node.js

Archivo de ejemplo:

- api/.env.example

Variables principales:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- DB_NAME
- JWT_SECRET
- PAYMENT_SERVICE_URL
- PORT

### Payment Service (Python)

Archivo de ejemplo:

- payment-service/.env.example

## Levantar el proyecto en local

## Opción 1: Docker Compose (recomendada)

Desde la raíz del proyecto:

```bash
docker compose up --build -d
```

Verificar estado:

```bash
docker compose ps
```

Servicios esperados:

- API Node: http://localhost:3000
- FastAPI: http://localhost:8000
- PostgreSQL: localhost:5432

Detener servicios:

```bash
docker compose down
```

Detener y eliminar volúmenes:

```bash
docker compose down -v
```

## Opción 2: Ejecución manual por servicio

### 1) Base de datos PostgreSQL

Crear base de datos y ejecutar esquema:

```bash
createdb sistema_pagos
psql -d sistema_pagos -f database/init.sql
```

### 2) API Node.js + TypeScript

Instalar dependencias:

```bash
cd api
pnpm install
```

Crear archivo de entorno:

```bash
cp .env.example .env
```

Iniciar en desarrollo:

```bash
pnpm run dev
```

Build de TypeScript:

```bash
pnpm run build
```

### 3) Payment Service (Python + FastAPI)

Instalar dependencias:

```bash
cd payment-service
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Ejecutar servicio:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## Endpoints principales

### Salud

- GET /health (API Node)
- GET /health (FastAPI)

### Autenticación

- POST /api/auth/register
- POST /api/auth/login

### Tarjetas (requiere JWT)

- POST /api/cards

### Pagos (requiere JWT)

- POST /api/payments
- GET /api/users/:id/payments?page=1&limit=10

## Probar con Postman

Se incluye colección lista para usar:

- postman/postman_collection.json

### Pasos

1. Abrir Postman
2. Importar la colección desde el archivo indicado
3. Verificar variables de colección:
	- base_url = http://localhost:3000
	- payment_service_url = http://localhost:8000
4. Ejecutar requests en este orden:
	- Health API Node
	- Health Payment Service
	- Auth - Register
	- Auth - Login
	- Tarjetas - Crear
	- Pagos - Crear
	- Pagos - Historial paginado

La colección guarda automáticamente variables token, user_id y card_id en el flujo de pruebas.

## Modelo de datos

### users

- id
- name
- email (único)
- password_hash
- created_at

### cards

- id
- user_id (FK -> users.id)
- last_four
- cardholder_name
- expiration_date
- card_type (VISA, MASTERCARD, AMEX)
- created_at

### payments

- id
- user_id (FK -> users.id)
- card_id (FK -> cards.id)
- amount
- status (APPROVED, REJECTED)
- description
- created_at

## Notas técnicas

- La API valida ownership: un usuario no puede consultar pagos de otro usuario.
- La API consulta al servicio Python al crear un pago.
- Si el servicio Python falla o no responde, el pago se registra como REJECTED.
- Solo se almacenan los últimos 4 dígitos de la tarjeta.

### Ver logs de servicios

```bash
docker compose logs -f api
docker compose logs -f payment-service
docker compose logs -f postgres
```

