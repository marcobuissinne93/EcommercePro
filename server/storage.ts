import { products, orders, claims, type Product, type InsertProduct, type Order, type InsertOrder, type Claim, type InsertClaim } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private products: Map<number, Product>;
  private orders: Map<number, Order>;
  private claims: Map<number, Claim>;
  private currentProductId: number;
  private currentOrderId: number;
  private currentClaimId: number;

  constructor() {
    this.products = new Map();
    this.orders = new Map();
    this.claims = new Map();
    this.currentProductId = 1;
    this.currentOrderId = 1;
    this.currentClaimId = 1;
    this.seedProducts();
  }

  private seedProducts() {
    const mockProducts: InsertProduct[] = [
      {
        name: "iPhone 15 Pro",
        description: "128GB - Titanium Blue",
        price: 2499900, // R 24,999.00 in cents
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "smartphone",
        badge: "New",
        rating: "4.8",
        imei: "351234567890123",
        purchaseDate: "2024-01-15",
      },
      {
        name: "Galaxy S24 Ultra",
        description: "256GB - Phantom Black",
        price: 2799900,
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "smartphone",
        badge: "Hot",
        rating: "4.9",
        imei: "352345678901234",
        purchaseDate: "2024-02-10",
      },
      {
        name: "iPad Pro 12.9\"",
        description: "512GB - Space Gray",
        price: 1999900,
        image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "tablet",
        badge: "Pro",
        rating: "4.7",
        imei: "353456789012345",
        purchaseDate: "2024-03-05",
      },
      {
        name: "MacBook Pro 14\"",
        description: "1TB - Space Gray",
        price: 4599900,
        image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "laptop",
        badge: "M3",
        rating: "4.8",
        imei: "354567890123456",
        purchaseDate: "2024-04-20",
      },
      {
        name: "Pixel 8 Pro",
        description: "256GB - Obsidian",
        price: 1899900,
        image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "smartphone",
        badge: "AI",
        rating: "4.6",
        imei: "355678901234567",
        purchaseDate: "2024-05-12",
      },
      {
        name: "Galaxy Tab S9",
        description: "256GB - Graphite",
        price: 1699900,
        image: "https://images.unsplash.com/photo-1561154464-82e9adf32764?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "tablet",
        badge: "5G",
        rating: "4.5",
        imei: "356789012345678",
        purchaseDate: "2024-06-08",
      },
      {
        name: "OnePlus 12",
        description: "256GB - Flowy Emerald",
        price: 1599900,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "smartphone",
        badge: "Fast",
        rating: "4.4",
        imei: "357890123456789",
        purchaseDate: "2024-07-15",
      },
      {
        name: "Dell XPS 13",
        description: "512GB - Platinum Silver",
        price: 2899900,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "laptop",
        badge: "Ultra",
        rating: "4.6",
        imei: "358901234567890",
        purchaseDate: "2024-08-22",
      },
      {
        name: "iPhone 14",
        description: "128GB - Purple",
        price: 1699900,
        originalPrice: 1999900,
        image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "smartphone",
        badge: "Sale",
        rating: "4.7",
        imei: "359012345678901",
        purchaseDate: "2024-09-10",
      },
      {
        name: "Surface Pro 9",
        description: "256GB - Platinum",
        price: 2299900,
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
        category: "tablet",
        badge: "2-in-1",
        rating: "4.5",
        imei: "360123456789012",
        purchaseDate: "2024-10-18",
      },
    ];

    mockProducts.forEach(product => {
      this.createProduct(product);
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductByImei(imei: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.imei === imei);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      badge: insertProduct.badge || null,
      originalPrice: insertProduct.originalPrice || null,
      purchaseDate: insertProduct.purchaseDate || null
    };
    this.products.set(id, product);
    return product;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id, 
      status: "pending",
      rootPolicyIds: null
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async updateOrderStatus(id: number, status: string, rootPolicyIds?: string[]): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder: Order = {
      ...order,
      status,
      rootPolicyIds: rootPolicyIds || order.rootPolicyIds,
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async createClaim(insertClaim: InsertClaim): Promise<Claim> {
    const id = this.currentClaimId++;
    const claim: Claim = {
      ...insertClaim,
      id,
      status: "submitted",
      createdAt: new Date().toISOString(),
      customerPhone: insertClaim.customerPhone || null,
    };
    this.claims.set(id, claim);
    return claim;
  }

  async getClaim(id: number): Promise<Claim | undefined> {
    return this.claims.get(id);
  }

  async getClaims(): Promise<Claim[]> {
    return Array.from(this.claims.values());
  }
}

export const storage = new MemStorage();
