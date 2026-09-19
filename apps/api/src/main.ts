import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from current directory or monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  // Use Pino Logger
  const logger = app.get(Logger);
  app.useLogger(logger);

  // Security Headers
  app.use(helmet());

  // Global API Prefix
  const apiPrefix = process.env.API_PREFIX || 'api';
  app.setGlobalPrefix(apiPrefix);

  // CORS configuration
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(`TradeForge API running on http://localhost:${port}/${apiPrefix}`);
  logger.log(`Health check available at http://localhost:${port}/${apiPrefix}/health`);
}

bootstrap();
