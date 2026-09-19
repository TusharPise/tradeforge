import {
  UserRole,
  AccountType,
  AssetType,
  OrderType,
  OrderSide,
  OrderStatus,
  TimeInForce,
  TransactionType,
  ExpenseCategory,
  AlertCondition,
  NotificationType,
} from './enums';

export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface User extends BaseEntity {
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  googleId?: string | null;
  _count?: {
    linkedAccounts: number;
  };
}

export interface Account extends BaseEntity {
  userId: string;
  name: string;
  type: AccountType;
  currency: string;
  /** Exact monetary amount as decimal string to prevent floating-point loss */
  balance: string;
  isDefault: boolean;
}

export interface Asset extends BaseEntity {
  symbol: string;
  name: string;
  type: AssetType;
  currency: string;
  currentPrice?: string | null;
  isActive: boolean;
}

export interface Portfolio extends BaseEntity {
  userId: string;
  name: string;
  description?: string | null;
  currency: string;
}

export interface Position extends BaseEntity {
  portfolioId: string;
  assetId: string;
  /** Quantity of units held (exact decimal string) */
  quantity: string;
  /** Average cost per unit (exact decimal string) */
  averageCost: string;
}

export interface Order extends BaseEntity {
  portfolioId: string;
  assetId: string;
  type: OrderType;
  side: OrderSide;
  status: OrderStatus;
  timeInForce: TimeInForce;
  /** Ordered quantity (exact decimal string) */
  quantity: string;
  /** Filled quantity (exact decimal string) */
  filledQuantity: string;
  /** Target price for limit/stop orders (exact decimal string) */
  price?: string | null;
  /** Average execution price (exact decimal string) */
  averageExecutionPrice?: string | null;
}

export interface Transaction extends BaseEntity {
  accountId: string;
  type: TransactionType;
  /** Exact financial amount (exact decimal string) */
  amount: string;
  currency: string;
  referenceId?: string | null;
  description?: string | null;
}

export interface AuditLog extends BaseEntity {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
}

export interface Expense extends BaseEntity {
  userId: string;
  category: ExpenseCategory;
  amount: string;
  currency: string;
  date: Date | string;
  description?: string | null;
}

export interface PriceAlert extends BaseEntity {
  userId: string;
  assetId: string;
  asset?: Asset;
  targetPrice: string;
  condition: AlertCondition;
  isTriggered: boolean;
  isActive: boolean;
}

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, unknown> | null;
}

export interface LinkedAccount extends BaseEntity {
  userId: string;
  bankName: string;
  last4: string;
  isDefault: boolean;
}
