import { Injectable } from '@nestjs/common';
import { ApiResponse } from '@tradeforge/types';

export interface HealthStatus {
  service: string;
  status: 'online' | 'degraded';
  version: string;
  environment: string;
  timestamp: string;
}

@Injectable()
export class AppService {
  getHealth(): ApiResponse<HealthStatus> {
    return {
      success: true,
      message: 'TradeForge API is operational',
      data: {
        service: 'tradeforge-api',
        status: 'online',
        version: '0.1.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    };
  }
}
