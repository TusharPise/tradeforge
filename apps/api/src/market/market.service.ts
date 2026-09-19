import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Asset } from '@prisma/client';
import { Decimal } from 'decimal.js';
import { NotificationService } from '../notification/notification.service';

export interface MarketPrice {
  symbol: string;
  price: Decimal;
  change24h: Decimal;
  percentChange24h: Decimal;
}

@Injectable()
export class MarketService implements OnModuleInit {
  private readonly logger = new Logger(MarketService.name);
  
  // In-memory price simulation
  private assets: Asset[] = [];
  private currentPrices = new Map<string, Decimal>();
  private basePrices = new Map<string, Decimal>();
  
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing Simulated Market Data Engine...');
    await this.loadAssets();
    
    // Start the simulation loop (updates every 3 seconds)
    setInterval(() => this.simulateMarketTick(), 3000);
  }

  private async loadAssets() {
    this.assets = await this.prisma.asset.findMany({
      where: { isActive: true },
    });
    
    for (const asset of this.assets) {
      const price = asset.currentPrice || new Decimal(100);
      this.currentPrices.set(asset.symbol, price);
      // Store a base price to calculate 24h change (simulated)
      this.basePrices.set(asset.symbol, price);
    }
    this.logger.log(`Loaded ${this.assets.length} assets into the pricing engine.`);
  }

  private simulateMarketTick() {
    for (const asset of this.assets) {
      const currentPrice = this.currentPrices.get(asset.symbol)!;
      if (!currentPrice) continue;
      
      // Random walk: -0.2% to +0.2% change per tick
      const volatility = 0.002; 
      const randomChange = (Math.random() * 2 - 1) * volatility;
      
      const newPrice = currentPrice.times(new Decimal(1).plus(randomChange));
      const finalPrice = new Decimal(newPrice.toFixed(4));
      
      // Keep precision to 4 decimals
      this.currentPrices.set(asset.symbol, finalPrice);

      // Asynchronously evaluate any price alerts set for this asset
      this.notificationService.evaluatePriceAlerts(asset.symbol, finalPrice).catch((err) => {
        this.logger.error(`Error evaluating price alerts for ${asset.symbol}: ${err.message}`);
      });
    }
  }

  async getAssets() {
    return this.assets;
  }

  async getPrices(): Promise<MarketPrice[]> {
    return this.assets.map(asset => {
      const current = this.currentPrices.get(asset.symbol)!;
      const base = this.basePrices.get(asset.symbol)!;
      
      const change24h = current.minus(base);
      const percentChange24h = change24h.dividedBy(base).times(100);

      return {
        symbol: asset.symbol,
        price: current,
        change24h: new Decimal(change24h.toFixed(4)),
        percentChange24h: new Decimal(percentChange24h.toFixed(2)),
      };
    });
  }

  async getPrice(symbol: string): Promise<Decimal | null> {
    return this.currentPrices.get(symbol.toUpperCase()) || null;
  }
}
