import http from 'http';
import { app } from './app';
import { env } from './config/env.config';
import { connectDatabase, disconnectDatabase } from './config/database.config';
import { logger } from './config/logger.config';

let server: http.Server;

const startServer = async (): Promise<void> => {
  try {
    // 1. Establish database connection
    await connectDatabase();

    // 2. Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(
        `🚀 Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`
      );
      logger.info(`📖 API Docs available at http://localhost:${env.PORT}/api/docs`);
      logger.info(`🏥 Health check at http://localhost:${env.PORT}/api/v1/health`);
    });

    // 3. Graceful Shutdown handlers
    const shutdown = async (signal: string) => {
      logger.warn(`Received ${signal}. Starting graceful shutdown...`);

      if (server) {
        server.close(async () => {
          logger.info('HTTP server closed.');
          await disconnectDatabase();
          process.exit(0);
        });

        // Force exit if shutdown takes too long (10s)
        setTimeout(() => {
          logger.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 10000);
      } else {
        await disconnectDatabase();
        process.exit(0);
      }
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // 4. Handle unexpected errors
    process.on('uncaughtException', (error: Error) => {
      logger.fatal({ error }, 'Uncaught Exception detected! Exiting...');
      process.exit(1);
    });

    process.on('unhandledRejection', (reason: unknown) => {
      logger.fatal({ reason }, 'Unhandled Promise Rejection detected! Exiting...');
      process.exit(1);
    });
  } catch (error) {
    logger.fatal({ error }, 'Failed to start server');
    process.exit(1);
  }
};

startServer();
