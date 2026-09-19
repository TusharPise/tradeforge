import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    // Only attempt eager connection if DATABASE_URL doesn't contain the unconfigured placeholder
    const databaseUrl = process.env.DATABASE_URL || '';
    if (databaseUrl.includes('<PASSWORD>')) {
      this.logger.warn(
        'DATABASE_URL contains <PASSWORD> placeholder. Database connection skipped until password is provided.',
      );
      return;
    }

    try {
      await this.$connect();
      this.logger.log('Successfully connected to PostgreSQL database via Prisma.');
    } catch (error) {
      this.logger.error('Failed to connect to PostgreSQL database:', error);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Disconnected from database.');
  }
}
