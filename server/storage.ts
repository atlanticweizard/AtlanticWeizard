import { eq, desc, and, sql, or, ilike } from "drizzle-orm";
import { db } from "./db";
import {
  products,
  orders,
  orderItems,
  payuTransactions,
  adminUsers,
  type Product,
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type PayuTransaction,
  type InsertPayuTransaction,
  type AdminUser,
  type InsertAdminUser,
} from "@shared/schema";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(data: InsertProduct): Promise<Product>;
  updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;

  // Orders
  getOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  createOrder(data: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;

  // Order Items
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(data: InsertOrderItem): Promise<OrderItem>;

  // Transactions
  getTransactions(): Promise<PayuTransaction[]>;
  getTransaction(id: number): Promise<PayuTransaction | undefined>;
  getTransactionByTxnId(txnId: string): Promise<PayuTransaction | undefined>;
  createTransaction(data: InsertPayuTransaction): Promise<PayuTransaction>;
  updateTransaction(id: number, data: Partial<InsertPayuTransaction>): Promise<PayuTransaction | undefined>;

  // Admin Users
  getAdminUsers(): Promise<AdminUser[]>;
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByEmail(email: string): Promise<AdminUser | undefined>;
  createAdminUser(data: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: number, data: Partial<InsertAdminUser>): Promise<AdminUser | undefined>;
  deleteAdminUser(id: number): Promise<boolean>;

  // Dashboard Stats
  getDashboardStats(): Promise<{
    totalProducts: number;
    totalOrders: number;
    totalTransactions: number;
    pendingOrders: number;
    paidOrders: number;
    failedOrders: number;
    revenueINR: number;
    revenueUSD: number;
    successfulTransactions: number;
    failedTransactions: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // Products
  async getProducts(): Promise<Product[]> {
    return db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(data: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(data).returning();
    return product;
  }

  async updateProduct(id: number, data: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order;
  }

  async createOrder(data: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(data).returning();
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Order Items
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(data: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(data).returning();
    return item;
  }

  // Transactions
  async getTransactions(): Promise<PayuTransaction[]> {
    return db.select().from(payuTransactions).orderBy(desc(payuTransactions.createdAt));
  }

  async getTransaction(id: number): Promise<PayuTransaction | undefined> {
    const [tx] = await db.select().from(payuTransactions).where(eq(payuTransactions.id, id));
    return tx;
  }

  async getTransactionByTxnId(txnId: string): Promise<PayuTransaction | undefined> {
    const [tx] = await db
      .select()
      .from(payuTransactions)
      .where(eq(payuTransactions.payuTxnId, txnId));
    return tx;
  }

  async createTransaction(data: InsertPayuTransaction): Promise<PayuTransaction> {
    const [tx] = await db.insert(payuTransactions).values(data).returning();
    return tx;
  }

  async updateTransaction(
    id: number,
    data: Partial<InsertPayuTransaction>
  ): Promise<PayuTransaction | undefined> {
    const [tx] = await db
      .update(payuTransactions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(payuTransactions.id, id))
      .returning();
    return tx;
  }

  // Admin Users
  async getAdminUsers(): Promise<AdminUser[]> {
    return db.select().from(adminUsers).orderBy(desc(adminUsers.createdAt));
  }

  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user;
  }

  async getAdminUserByEmail(email: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.email, email));
    return user;
  }

  async createAdminUser(data: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(data).returning();
    return user;
  }

  async updateAdminUser(
    id: number,
    data: Partial<InsertAdminUser>
  ): Promise<AdminUser | undefined> {
    const [user] = await db
      .update(adminUsers)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(adminUsers.id, id))
      .returning();
    return user;
  }

  async deleteAdminUser(id: number): Promise<boolean> {
    await db.delete(adminUsers).where(eq(adminUsers.id, id));
    return true;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products);

    const [orderStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        pending: sql<number>`count(*) filter (where status = 'pending')::int`,
        paid: sql<number>`count(*) filter (where status = 'paid')::int`,
        failed: sql<number>`count(*) filter (where status = 'failed')::int`,
      })
      .from(orders);

    const [revenueStats] = await db
      .select({
        inr: sql<number>`coalesce(sum(case when currency = 'INR' and status = 'paid' then amount_total::numeric else 0 end), 0)`,
        usd: sql<number>`coalesce(sum(case when currency = 'USD' and status = 'paid' then amount_total::numeric else 0 end), 0)`,
      })
      .from(orders);

    const [txStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        success: sql<number>`count(*) filter (where status = 'success')::int`,
        failed: sql<number>`count(*) filter (where status = 'failure')::int`,
      })
      .from(payuTransactions);

    return {
      totalProducts: productCount?.count || 0,
      totalOrders: orderStats?.total || 0,
      totalTransactions: txStats?.total || 0,
      pendingOrders: orderStats?.pending || 0,
      paidOrders: orderStats?.paid || 0,
      failedOrders: orderStats?.failed || 0,
      revenueINR: Number(revenueStats?.inr) || 0,
      revenueUSD: Number(revenueStats?.usd) || 0,
      successfulTransactions: txStats?.success || 0,
      failedTransactions: txStats?.failed || 0,
    };
  }
}

export const storage = new DatabaseStorage();
