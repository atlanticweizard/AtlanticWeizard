import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import {
  insertProductSchema,
  insertOrderSchema,
  checkoutFormSchema,
  adminLoginSchema,
  USD_TO_INR_RATE,
} from "@shared/schema";
import {
  generateTxnId,
  generateOrderNumber,
  generatePayuHash,
  verifyPayuResponseHash,
  buildPayuForm,
  getPayuUrl,
} from "./payu";
import bcrypt from "bcryptjs";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    adminId: number;
  }
}

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.adminId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

import pgSession from 'connect-pg-simple';
import { pool } from './db';

const PgSession = pgSession(session);

// Validate that SESSION_SECRET is set
if (!process.env.SESSION_SECRET) {
  throw new Error(
    'SESSION_SECRET environment variable is required. Generate one with: openssl rand -base64 32'
  );
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Configure session with PostgreSQL store for persistence
  app.use(
    session({
      store: new PgSession({
        pool: pool,
        tableName: 'session',
        createTableIfMissing: true, // Auto-create session table if it doesn't exist
      }),
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: 'strict', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // =======================
  // PUBLIC ROUTES - PRODUCTS
  // =======================

  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =======================
  // PUBLIC ROUTES - ORDERS
  // =======================

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(order.id);
      const transactions = [];
      const txList = await storage.getTransactions();
      for (const tx of txList) {
        if (tx.orderId === order.id) {
          transactions.push(tx);
        }
      }

      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product: product ? { name: product.name, imageUrl: product.imageUrl } : undefined,
          };
        })
      );

      res.json({ ...order, items: itemsWithProducts, transactions });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =======================
  // CHECKOUT ROUTES
  // =======================

  app.post("/api/checkout/create", async (req, res) => {
    try {
      const data = checkoutFormSchema.parse(req.body);
      const { items } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      let totalINR = 0;
      const validatedItems: { productId: number; quantity: number; product: any }[] = [];

      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        if (product.stock < item.quantity) {
          return res.status(400).json({
            message: `Insufficient stock for ${product.name}`,
          });
        }
        const priceINR = parseFloat(product.priceBase);
        totalINR += priceINR * item.quantity;
        validatedItems.push({ productId: product.id, quantity: item.quantity, product });
      }

      let finalTotal = totalINR;
      if (data.currency === "USD") {
        finalTotal = totalINR / USD_TO_INR_RATE;
      }

      const orderNumber = generateOrderNumber();

      const order = await storage.createOrder({
        orderNumber,
        name: data.name,
        email: data.email,
        phone: data.phone,
        shippingAddress: data.shippingAddress,
        billingAddress: data.sameAsBilling ? data.shippingAddress : data.billingAddress,
        currency: data.currency,
        amountTotal: finalTotal.toFixed(2),
        status: "pending",
      });

      for (const item of validatedItems) {
        const priceINR = parseFloat(item.product.priceBase);
        let priceEach = priceINR;
        if (data.currency === "USD") {
          priceEach = priceINR / USD_TO_INR_RATE;
        }
        await storage.createOrderItem({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          priceEach: priceEach.toFixed(2),
          currency: data.currency,
          subtotal: (priceEach * item.quantity).toFixed(2),
        });
      }

      res.json({ order, message: "Order created successfully" });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/checkout/payu-init", async (req, res) => {
    try {
      const { orderId } = req.body;
      const order = await storage.getOrder(orderId);

      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const txnId = generateTxnId();
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;

      const payuParams = {
        txnid: txnId,
        amount: order.amountTotal,
        productinfo: `Order ${order.orderNumber}`,
        firstname: order.name.split(" ")[0],
        email: order.email,
        phone: order.phone,
        surl: `${baseUrl}/api/checkout/payu-callback/success`,
        furl: `${baseUrl}/api/checkout/payu-callback/failure`,
        udf1: order.id.toString(),
      };

      const hash = generatePayuHash(payuParams);
      const formParams = buildPayuForm(payuParams, hash);

      await storage.createTransaction({
        orderId: order.id,
        payuTxnId: txnId,
        amount: order.amountTotal,
        currency: order.currency,
        status: "pending",
        hashSent: hash,
        rawRequest: payuParams as any,
      });

      res.json({
        payuUrl: getPayuUrl(),
        payuParams: formParams,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/checkout/payu-callback/success", async (req, res) => {
    try {
      const params = req.body;
      const { txnid, mihpayid, status, udf1 } = params;

      const isValid = verifyPayuResponseHash(params);
      const orderId = parseInt(udf1);

      const tx = await storage.getTransactionByTxnId(txnid);

      if (tx) {
        await storage.updateTransaction(tx.id, {
          payuPaymentId: mihpayid,
          status: status === "success" ? "success" : "failure",
          hashReceived: params.hash,
          rawResponse: params as any,
        });
      }

      if (status === "success" && isValid) {
        await storage.updateOrderStatus(orderId, "paid");

        const items = await storage.getOrderItems(orderId);
        for (const item of items) {
          const product = await storage.getProduct(item.productId);
          if (product) {
            await storage.updateProduct(product.id, {
              stock: product.stock - item.quantity,
            });
          }
        }
      } else {
        await storage.updateOrderStatus(orderId, "failed");
      }

      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      res.redirect(`${baseUrl}/payment/success?orderId=${orderId}`);
    } catch (error: any) {
      console.error("PayU success callback error:", error);
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      res.redirect(`${baseUrl}/payment/failure?error=${encodeURIComponent(error.message)}`);
    }
  });

  app.post("/api/checkout/payu-callback/failure", async (req, res) => {
    try {
      const params = req.body;
      const { txnid, mihpayid, udf1, error_Message } = params;

      const orderId = parseInt(udf1);
      const tx = await storage.getTransactionByTxnId(txnid);

      if (tx) {
        await storage.updateTransaction(tx.id, {
          payuPaymentId: mihpayid,
          status: "failure",
          hashReceived: params.hash,
          rawResponse: params as any,
        });
      }

      await storage.updateOrderStatus(orderId, "failed");

      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      res.redirect(
        `${baseUrl}/payment/failure?orderId=${orderId}&error=${encodeURIComponent(error_Message || "Payment failed")}`
      );
    } catch (error: any) {
      console.error("PayU failure callback error:", error);
      const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      res.redirect(`${baseUrl}/payment/failure?error=${encodeURIComponent(error.message)}`);
    }
  });

  // =======================
  // ADMIN AUTH ROUTES
  // =======================

  app.get("/api/admin/auth/me", async (req, res) => {
    try {
      if (!req.session.adminId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      const admin = await storage.getAdminUser(req.session.adminId);
      if (!admin) {
        return res.status(401).json({ message: "Admin not found" });
      }
      res.json({ admin: { id: admin.id, email: admin.email, role: admin.role } });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/auth/login", async (req, res) => {
    try {
      const { email, password } = adminLoginSchema.parse(req.body);

      const admin = await storage.getAdminUserByEmail(email);
      if (!admin) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const isValidPassword = await bcrypt.compare(password, admin.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      req.session.adminId = admin.id;
      res.json({ admin: { id: admin.id, email: admin.email, role: admin.role } });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // =======================
  // ADMIN DASHBOARD
  // =======================

  app.get("/api/admin/dashboard/stats", isAdmin, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =======================
  // ADMIN PRODUCTS ROUTES
  // =======================

  app.get("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/products", isAdmin, async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(id, data);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProduct(id);
      res.json({ message: "Product deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =======================
  // ADMIN ORDERS ROUTES
  // =======================

  app.get("/api/admin/orders", isAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();

      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const itemsWithProducts = await Promise.all(
            items.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return {
                ...item,
                product: product ? { name: product.name, imageUrl: product.imageUrl } : undefined,
              };
            })
          );
          return { ...order, items: itemsWithProducts };
        })
      );

      res.json(ordersWithItems);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/orders/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      const items = await storage.getOrderItems(order.id);
      const itemsWithProducts = await Promise.all(
        items.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product: product ? { name: product.name, imageUrl: product.imageUrl } : undefined,
          };
        })
      );

      res.json({ ...order, items: itemsWithProducts });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/orders/:id/status", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!["pending", "paid", "failed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =======================
  // ADMIN TRANSACTIONS ROUTES
  // =======================

  app.get("/api/admin/transactions", isAdmin, async (req, res) => {
    try {
      const transactions = await storage.getTransactions();

      const txWithOrders = await Promise.all(
        transactions.map(async (tx) => {
          const order = await storage.getOrder(tx.orderId);
          return { ...tx, order };
        })
      );

      res.json(txWithOrders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/admin/transactions/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tx = await storage.getTransaction(id);
      if (!tx) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      const order = await storage.getOrder(tx.orderId);
      res.json({ ...tx, order });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // =======================
  // ADMIN USERS ROUTES
  // =======================

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const users = await storage.getAdminUsers();
      const safeUsers = users.map(({ passwordHash, ...user }) => user);
      res.json(safeUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const { email, password, role } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const existing = await storage.getAdminUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createAdminUser({
        email,
        passwordHash,
        role: role || "admin",
      });

      res.json({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.put("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { email, password, role } = req.body;

      const updateData: any = {};
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      const user = await storage.updateAdminUser(id, updateData);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ id: user.id, email: user.email, role: user.role, createdAt: user.createdAt });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (req.session.adminId === id) {
        return res.status(400).json({ message: "Cannot delete yourself" });
      }

      await storage.deleteAdminUser(id);
      res.json({ message: "User deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
