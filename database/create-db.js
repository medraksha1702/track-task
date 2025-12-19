"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Parse DATABASE_URL or use individual environment variables
const getDatabaseConfig = () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (databaseUrl) {
        try {
            const url = new URL(databaseUrl);
            return {
                database: url.pathname.slice(1),
                username: url.username,
                password: url.password,
                host: url.hostname,
                port: parseInt(url.port) || 5432,
            };
        }
        catch (error) {
            console.error('Error parsing DATABASE_URL:', error);
        }
    }
    return {
        database: process.env.DB_NAME || 'biomedical_service',
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
    };
};
const config = getDatabaseConfig();
async function createDatabase() {
    // Connect to default 'postgres' database to create our target database
    const adminSequelize = new sequelize_1.Sequelize('postgres', config.username, config.password, {
        host: config.host,
        port: config.port,
        dialect: 'postgres',
        logging: false,
    });
    try {
        await adminSequelize.authenticate();
        console.log('✅ Connected to PostgreSQL server');
        // Check if database exists
        const [results] = await adminSequelize.query(`SELECT 1 FROM pg_database WHERE datname = '${config.database}'`);
        if (Array.isArray(results) && results.length > 0) {
            console.log(`ℹ️  Database "${config.database}" already exists`);
        }
        else {
            // Create database
            await adminSequelize.query(`CREATE DATABASE "${config.database}"`);
            console.log(`✅ Database "${config.database}" created successfully`);
        }
        await adminSequelize.close();
    }
    catch (error) {
        console.error('❌ Error creating database:', error.message);
        console.log('\n💡 You can also create it manually with:');
        console.log(`   createdb -U ${config.username} ${config.database}`);
        console.log(`   or`);
        console.log(`   psql -U ${config.username} -c "CREATE DATABASE ${config.database};"`);
        process.exit(1);
    }
}
createDatabase();
//# sourceMappingURL=create-db.js.map