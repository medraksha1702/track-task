import app from './app';
import { sequelize } from './models';

const PORT = process.env.PORT || 3001;

// Test database connection and sync models
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models (use { alter: true } in development, or if AUTO_SYNC_DB is set)
    if (process.env.NODE_ENV === 'development' || process.env.AUTO_SYNC_DB === 'true') {
      await sequelize.sync({ alter: true });
      console.log('✅ Database models synchronized.');
    } else {
      console.log('ℹ️  Auto-sync disabled. Run migrations manually if needed.');
    }

    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('SIGTERM signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        sequelize.close().then(() => {
          console.log('Database connection closed');
          process.exit(0);
        });
      });
    });

    process.on('SIGINT', async () => {
      console.log('SIGINT signal received: closing HTTP server');
      server.close(() => {
        console.log('HTTP server closed');
        sequelize.close().then(() => {
          console.log('Database connection closed');
          process.exit(0);
        });
      });
    });
  } catch (error) {
    console.error('❌ Unable to start server:', error);
    process.exit(1);
  }
};

startServer();

