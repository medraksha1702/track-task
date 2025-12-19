import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Parse DATABASE_URL or use individual environment variables
const getDatabaseConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (databaseUrl) {
    // Parse PostgreSQL URL: postgresql://user:password@host:port/database
    try {
      const url = new URL(databaseUrl);
      return {
        database: url.pathname.slice(1), // Remove leading '/'
        username: url.username,
        password: url.password,
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        dialect: 'postgres' as const,
      };
    } catch (error) {
      console.error('Error parsing DATABASE_URL:', error);
    }
  }

  // Fallback to individual environment variables
  return {
    database: process.env.DB_NAME || 'biomedical_service',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    dialect: 'postgres' as const,
  };
};

const config = getDatabaseConfig();

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

export default sequelize;

