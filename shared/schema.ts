import { pgTable, text, serial, integer, boolean, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // in cents (ZAR)
  image: text("image").notNull(),
  category: text("category").notNull(),
  badge: text("badge"), // "New", "Hot", "Sale", etc.
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull(),
  originalPrice: integer("original_price"), // for sale items
  imei: text("imei").notNull().unique(), // IMEI number for device tracking
  purchaseDate: text("purchase_date"), // Date of purchase for warranty tracking
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  subtotal: integer("subtotal").notNull(),
  warrantyTotal: integer("warranty_total").notNull(),
  insuranceTotal: integer("insurance_total").notNull(),
  vat: integer("vat").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("pending"),
  items: json("items").$type<OrderItem[]>().notNull(),
  rootPolicyIds: json("root_policy_ids").$type<string[]>(),
});

export const claims = pgTable("claims", {
  id: serial("id").primaryKey(),
  imei: text("imei").notNull(),
  dateOfIncident: text("date_of_incident").notNull(),
  description: text("description").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  status: text("status").notNull().default("submitted"),
  createdAt: text("created_at").notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  status: true,
  rootPolicyIds: true,
});

export const insertClaimSchema = createInsertSchema(claims).omit({
  id: true,
  status: true,
  createdAt: true,
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Claim = typeof claims.$inferSelect;
export type InsertClaim = z.infer<typeof insertClaimSchema>;

export interface CartItem {
  id: string;
  productId: number;
  name: string;
  price: number;
  image: string;
  warranty?: {
    type: "5-year" | "10-year";
    price: number;
  };
  insurance?: {
    type: "comprehensive" | "theft" | "accidental";
    price: number;
  };
}

export interface OrderItem {
  productId: number;
  name: string;
  price: number;
  image: string;
  warranty?: {
    type: "5-year" | "10-year";
    price: number;
  };
  insurance?: {
    type: "comprehensive" | "theft" | "accidental";
    price: number;
  };
}

export interface RootQuoteRequest {
  productName: string;
  productValue: number;
  coverageType: "comprehensive" | "theft" | "accidental";
  customerInfo: {
    fullName: string;
    email: string;
    address: string;
    postalCode: string;
    country: string;
  };
}

export interface RootPolicyRequest extends RootQuoteRequest {
  quoteId: string;
  consent: boolean;
}
