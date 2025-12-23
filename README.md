# Biomedical Service & Sales Backend

A complete Node.js backend API for managing a biomedical machine service and sales business.

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Sequelize
- **Validation**: Zod
- **Authentication**: JWT
- **Password Hashing**: bcrypt

## Project Structure

```
.
├── src/
│   ├── server.ts          # Entry point
│   ├── app.ts             # Express app configuration
│   ├── config/            # Database configuration
│   ├── models/            # Sequelize models
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── middlewares/       # Auth, validation, error handling
│   ├── validations/       # Zod schemas
│   └── utils/             # Utilities (JWT, errors)
├── database/
│   ├── create-db.ts       # Database creation script
│   ├── seed.ts            # Seed data
│   └── migrations/        # Database migrations
├── dist/                  # Compiled JavaScript (generated)
├── .env                   # Environment variables (create from .env.example)
├── package.json
└── tsconfig.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup PostgreSQL Database

Make sure PostgreSQL is installed and running. Create a new database:

```sql
CREATE DATABASE biomedical_service;
```

Or use the provided script:

```bash
npm run db:create
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/biomedical_service?schema=public"
# OR use individual variables:
# DB_NAME=biomedical_service
# DB_USER=postgres
# DB_PASSWORD=your_password
# DB_HOST=localhost
# DB_PORT=5432

# JWT Secret (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000
```

**Important**: Replace `user` and `password` with your PostgreSQL credentials.

### 4. Initialize Database

The database tables will be automatically created when you start the server (in development mode). Alternatively, you can run:

```bash
npm run db:sync
```

### 5. Seed Database

```bash
npm run db:seed
```

### 6. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login (returns JWT token)
- `POST /api/auth/register` - Register new admin (no authentication required)

### Customers

- `GET /api/customers` - Get all customers (with pagination & search)
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

**Query Parameters:**
- `search` - Search by name, email, or phone
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

### Machines

- `GET /api/machines` - Get all machines (with pagination & status filter)
- `GET /api/machines/:id` - Get machine by ID
- `POST /api/machines` - Create machine
- `PUT /api/machines/:id` - Update machine
- `PATCH /api/machines/:id/stock` - Update stock quantity
- `DELETE /api/machines/:id` - Delete machine

**Query Parameters:**
- `status` - Filter by status (available, sold, under_service)
- `page` - Page number
- `limit` - Items per page

### Services

- `GET /api/services` - Get all services (with filters)
- `GET /api/services/:id` - Get service by ID
- `POST /api/services` - Create service
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

**Query Parameters:**
- `status` - Filter by status (pending, in_progress, completed)
- `customerId` - Filter by customer
- `startDate` - Filter by start date (ISO format)
- `endDate` - Filter by end date (ISO format)
- `page` - Page number
- `limit` - Items per page

**Note**: When a service is marked as "completed", an invoice is automatically created.

### Invoices

- `GET /api/invoices` - Get all invoices (with pagination)
- `GET /api/invoices/:id` - Get invoice by ID (includes item details)
- `POST /api/invoices` - Create invoice (auto-calculates total)
- `PUT /api/invoices/:id` - Update invoice
- `PATCH /api/invoices/:id/payment-status` - Update payment status
- `DELETE /api/invoices/:id` - Delete invoice (restores machine stock)

**Query Parameters:**
- `page` - Page number
- `limit` - Items per page

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/revenue` - Get monthly revenue data

### Health Checks

- `GET /health` - Server health check
- `GET /health/db` - Database connection check

## Authentication

All endpoints except `/api/auth/login` and `/api/auth/register` require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Default Admin Credentials

After seeding:
- **Email**: `admin@biomedical.com`
- **Password**: `admin123`

**⚠️ Change these credentials in production!**

## Example API Requests

### Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@biomedical.com",
    "password": "admin123"
  }'
```

### Create Customer

```bash
curl -X POST http://localhost:3001/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "name": "Dr. Jane Doe",
    "email": "jane@hospital.com",
    "phone": "+1234567890",
    "address": "123 Medical St",
    "hospitalOrLabName": "City Hospital"
  }'
```

### Create Invoice

```bash
curl -X POST http://localhost:3001/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "customerId": "<customer-id>",
    "invoiceDate": "2024-02-01T00:00:00Z",
    "dueDate": "2024-03-01T00:00:00Z",
    "items": [
      {
        "itemType": "service",
        "referenceId": "<service-id>",
        "quantity": 1,
        "price": 500.00
      },
      {
        "itemType": "machine",
        "referenceId": "<machine-id>",
        "quantity": 1,
        "price": 120000.00
      }
    ]
  }'
```

## Database Schema

- **users** - Admin users
- **customers** - Customer information
- **machines** - Machine inventory
- **services** - Service records
- **invoices** - Invoice records
- **invoice_items** - Invoice line items

All models are defined in `src/models/` using Sequelize.

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:create` - Create database
- `npm run db:seed` - Seed database with sample data
- `npm run db:sync` - Sync database models (creates/updates tables)

## Production Deployment

### Render.com

1. Create a new **Web Service** in Render
2. Connect your GitHub repository
3. Set **Root Directory**: (leave empty or set to `.`)
4. Set **Build Command**: `npm install && npm run build`
5. Set **Start Command**: `node dist/server.js`
6. Add environment variables:
   - `DATABASE_URL` (from PostgreSQL service)
   - `JWT_SECRET` (generate a strong secret)
   - `NODE_ENV=production`
   - `PORT=10000` (or Render's assigned port)
   - `CORS_ORIGIN` (your frontend URL)

### Railway

1. Create a new project in Railway
2. Add PostgreSQL service
3. Add Node.js service
4. Connect your GitHub repository
5. Set environment variables
6. Railway will auto-detect and deploy

### Vercel (Serverless Functions)

For Vercel, you'll need to restructure the app to use serverless functions. Consider using Render or Railway for the backend instead.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | `3001` |
| `NODE_ENV` | Environment | No | `development` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `DB_NAME` | Database name (if not using DATABASE_URL) | No | `biomedical_service` |
| `DB_USER` | Database user (if not using DATABASE_URL) | No | `postgres` |
| `DB_PASSWORD` | Database password (if not using DATABASE_URL) | No | - |
| `DB_HOST` | Database host (if not using DATABASE_URL) | No | `localhost` |
| `DB_PORT` | Database port (if not using DATABASE_URL) | No | `5432` |
| `JWT_SECRET` | Secret key for JWT tokens | Yes | - |
| `JWT_EXPIRES_IN` | JWT expiration time | No | `7d` |
| `CORS_ORIGIN` | Frontend URL for CORS | No | `http://localhost:3000` |

## License

ISC

