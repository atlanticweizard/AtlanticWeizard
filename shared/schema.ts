import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer, timestamp, pgEnum, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const currencyEnum = pgEnum("currency", ["INR", "USD"]);
export const orderStatusEnum = pgEnum("order_status", ["pending", "paid", "failed", "cancelled"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["success", "failure", "pending"]);
export const adminRoleEnum = pgEnum("admin_role", ["admin", "superadmin"]);

// Products table
export const products = pgTable("products", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description"),
  priceBase: numeric("price_base", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Orders table
export const orders = pgTable("orders", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  shippingAddress: text("shipping_address").notNull(),
  billingAddress: text("billing_address").notNull(),
  currency: currencyEnum("currency").notNull().default("INR"),
  amountTotal: numeric("amount_total", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  priceEach: numeric("price_each", { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull(),
  subtotal: numeric("subtotal", { precision: 10, scale: 2 }).notNull(),
});

// PayU transactions table
export const payuTransactions = pgTable("payu_transactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  payuTxnId: varchar("payu_txn_id", { length: 100 }).notNull(),
  payuPaymentId: varchar("payu_payment_id", { length: 100 }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  currency: currencyEnum("currency").notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  hashSent: text("hash_sent"),
  hashReceived: text("hash_received"),
  rawRequest: jsonb("raw_request"),
  rawResponse: jsonb("raw_response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin users table
export const adminUsers = pgTable("admin_users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").notNull().default("admin"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  transactions: many(payuTransactions),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export const payuTransactionsRelations = relations(payuTransactions, ({ one }) => ({
  order: one(orders, {
    fields: [payuTransactions.orderId],
    references: [orders.id],
  }),
}));

// Insert schemas
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertPayuTransactionSchema = createInsertSchema(payuTransactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type PayuTransaction = typeof payuTransactions.$inferSelect;
export type InsertPayuTransaction = z.infer<typeof insertPayuTransactionSchema>;

export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;

// Cart item type (for frontend use)
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

// Checkout form type
export const checkoutFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  shippingAddress: z.string().min(10, "Please enter a complete shipping address"),
  billingAddress: z.string().min(10, "Please enter a complete billing address"),
  sameAsBilling: z.boolean().default(true),
  currency: z.enum(["INR", "USD"]).default("INR"),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Admin login schema
export const adminLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type AdminLoginData = z.infer<typeof adminLoginSchema>;

// Currency conversion rate (1 USD = ~83 INR approximately)
export const USD_TO_INR_RATE = 83;
export const INR_TO_USD_RATE = 1 / USD_TO_INR_RATE;
