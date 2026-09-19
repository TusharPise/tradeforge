import { PrismaClient } from '@prisma/client';
import { AssetType } from '@tradeforge/types';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with assets...');

  const assets = [
    // US Equities
    { symbol: 'AAPL', name: 'Apple Inc.', type: AssetType.STOCK, currentPrice: 150.0 },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: AssetType.STOCK, currentPrice: 300.0 },
    { symbol: 'TSLA', name: 'Tesla, Inc.', type: AssetType.STOCK, currentPrice: 200.0 },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', type: AssetType.STOCK, currentPrice: 130.0 },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: AssetType.STOCK, currentPrice: 400.0 },
    
    // Crypto
    { symbol: 'BTC', name: 'Bitcoin', type: AssetType.CRYPTO, currentPrice: 35000.0 },
    { symbol: 'ETH', name: 'Ethereum', type: AssetType.CRYPTO, currentPrice: 2000.0 },
    { symbol: 'SOL', name: 'Solana', type: AssetType.CRYPTO, currentPrice: 45.0 },
    
    // ETFs
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF Trust', type: AssetType.ETF, currentPrice: 450.0 },
    { symbol: 'QQQ', name: 'Invesco QQQ Trust', type: AssetType.ETF, currentPrice: 370.0 },
  ];

  for (const asset of assets) {
    await prisma.asset.upsert({
      where: { symbol: asset.symbol },
      update: {
        currentPrice: asset.currentPrice,
        isActive: true,
      },
      create: {
        symbol: asset.symbol,
        name: asset.name,
        type: asset.type,
        currentPrice: asset.currentPrice,
        isActive: true,
      },
    });
    console.log(`Upserted asset: ${asset.symbol}`);
  }

  console.log('Database seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
