export enum UserRole {
  ADMIN = 'ADMIN',
  TRADER = 'TRADER',
  VIEWER = 'VIEWER',
}

export enum AccountType {
  PAPER = 'PAPER',
  SIMULATION = 'SIMULATION',
}

export enum AssetType {
  STOCK = 'STOCK',
  CRYPTO = 'CRYPTO',
  FOREX = 'FOREX',
  COMMODITY = 'COMMODITY',
  ETF = 'ETF',
}

export enum OrderType {
  MARKET = 'MARKET',
  LIMIT = 'LIMIT',
  STOP = 'STOP',
  STOP_LIMIT = 'STOP_LIMIT',
}

export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  OPEN = 'OPEN',
  PARTIALLY_FILLED = 'PARTIALLY_FILLED',
  FILLED = 'FILLED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

export enum TimeInForce {
  DAY = 'DAY',
  GTC = 'GTC', // Good 'Til Cancelled
  IOC = 'IOC', // Immediate or Cancel
  FOK = 'FOK', // Fill or Kill
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRADE_BUY = 'TRADE_BUY',
  TRADE_SELL = 'TRADE_SELL',
  FEE = 'FEE',
  DIVIDEND = 'DIVIDEND',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum ExpenseCategory {
  HOUSING = 'HOUSING',
  FOOD = 'FOOD',
  TRANSPORTATION = 'TRANSPORTATION',
  UTILITIES = 'UTILITIES',
  HEALTHCARE = 'HEALTHCARE',
  ENTERTAINMENT = 'ENTERTAINMENT',
  INVESTMENTS = 'INVESTMENTS',
  EDUCATION = 'EDUCATION',
  SAVINGS = 'SAVINGS',
  OTHER = 'OTHER',
}

export enum AlertCondition {
  ABOVE = 'ABOVE',
  BELOW = 'BELOW',
}

export enum NotificationType {
  PRICE_ALERT = 'PRICE_ALERT',
  ORDER_FILLED = 'ORDER_FILLED',
  SECURITY = 'SECURITY',
  SYSTEM = 'SYSTEM',
}
