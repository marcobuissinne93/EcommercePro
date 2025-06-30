import { products, orders, claims, type Product, type InsertProduct, type Order, type InsertOrder, type Claim, type InsertClaim } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductByImei(imei: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Orders
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  updateOrderStatus(id: number, status: string, rootPolicyIds?: string[]): Promise<Order | undefined>;
  
  // Claims
  createClaim(claim: InsertClaim): Promise<Claim>;
  getClaim(id: number): Promise<Claim | undefined>;
  getClaims(): Promise<Claim[]>;
}



// Database Storage using Drizzle ORM
export class DatabaseStorage implements IStorage {
  async getProducts(): Promise<Product[]> {
    try {
      return await db.select().from(products);
    } catch (error) {
      console.error("❌ Error querying products:", error);
      throw error; 
    }
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductByImei(imei: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.imei, imei));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    try {
      const [order] = await db
        .insert(orders)
        .values(insertOrder)
        .returning();
      return order;
    } catch (error) {
      console.error('Database order creation error:', error);
      throw new Error(`Failed to create order: ${error}`);
    }
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async updateOrderStatus(id: number, status: string, rootPolicyIds?: string[]): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ 
        status, 
        rootPolicyIds: rootPolicyIds || null 
      })
      .where(eq(orders.id, id))
      .returning();
    return order || undefined;
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const [claim] = await db
      .insert(claims)
      .values({
        ...insertClaim,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return claim;
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    const [claim] = await db.select().from(claims).where(eq(claims.id, id));
    return claim || undefined;
  }

  async getClaims(): Promise<Claim[]> {
    return await db.select().from(claims);
  }
}

export const storage = new DatabaseStorage();
