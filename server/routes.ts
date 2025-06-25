import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertClaimSchema, type RootQuoteRequest, type RootPolicyRequest } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all products
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  // Get single product
  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Generate Root Platform quote
  app.post("/api/quote", async (req, res) => {
    try {
      const quoteRequest: RootQuoteRequest = req.body;
      
      // Get Root API credentials from environment
      const rootApiKey = process.env.ROOT_API_KEY || process.env.ROOT_PLATFORM_API_KEY || "demo_key";
      const rootBaseUrl = process.env.ROOT_BASE_URL || process.env.ROOT_PLATFORM_BASE_URL || "https://api.root.co.za";

      // Call Root Platform API for quote
      const response = await fetch(`${rootBaseUrl}/v1/quotes`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${rootApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: quoteRequest.productName,
          product_value: quoteRequest.productValue,
          coverage_type: quoteRequest.coverageType,
          customer: quoteRequest.customerInfo,
        }),
      });

      if (!response.ok) {
        throw new Error(`Root API error: ${response.status}`);
      }

      const quote = await response.json();
      res.json(quote);
    } catch (error) {
      console.error("Quote generation failed:", error);
      // Return mock quote for demo purposes
      res.json({
        quote_id: `quote_${Date.now()}`,
        monthly_premium: req.body.coverageType === "comprehensive" ? 29900 : 
                        req.body.coverageType === "theft" ? 14900 : 19900,
        coverage_type: req.body.coverageType,
        product_name: req.body.productName,
      });
    }
  });

  // Create Root Platform policy
  app.post("/api/policy", async (req, res) => {
    try {
      const policyRequest: RootPolicyRequest = req.body;
      
      const rootApiKey = process.env.ROOT_API_KEY || process.env.ROOT_PLATFORM_API_KEY || "demo_key";
      const rootBaseUrl = process.env.ROOT_BASE_URL || process.env.ROOT_PLATFORM_BASE_URL || "https://api.root.co.za";

      // Call Root Platform API to create policy
      const response = await fetch(`${rootBaseUrl}/v1/policies`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${rootApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quote_id: policyRequest.quoteId,
          customer: policyRequest.customerInfo,
          consent: policyRequest.consent,
          coverage_type: policyRequest.coverageType,
        }),
      });

      if (!response.ok) {
        throw new Error(`Root API error: ${response.status}`);
      }

      const policy = await response.json();
      res.json(policy);
    } catch (error) {
      console.error("Policy creation failed:", error);
      // Return mock policy for demo purposes
      res.json({
        policy_id: `policy_${Date.now()}`,
        policy_number: `RP${Date.now().toString().slice(-8)}`,
        status: "active",
        customer: req.body.customerInfo,
        coverage_type: req.body.coverageType,
      });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedOrder = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedOrder);
      
      // Process insurance policies if any items have insurance
      const insuranceItems = order.items.filter(item => item.insurance);
      const policyIds: string[] = [];

      for (const item of insuranceItems) {
        if (item.insurance) {
          try {
            // Generate quote first
            const quoteResponse = await fetch(`${req.protocol}://${req.get('host')}/api/quote`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                productName: item.name,
                productValue: item.price,
                coverageType: item.insurance.type,
                customerInfo: {
                  fullName: order.fullName,
                  email: order.email,
                  address: order.address,
                  postalCode: order.postalCode,
                  country: order.country,
                },
              }),
            });

            if (quoteResponse.ok) {
              const quote = await quoteResponse.json();
              
              // Create policy
              const policyResponse = await fetch(`${req.protocol}://${req.get('host')}/api/policy`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  quoteId: quote.quote_id,
                  productName: item.name,
                  productValue: item.price,
                  coverageType: item.insurance.type,
                  customerInfo: {
                    fullName: order.fullName,
                    email: order.email,
                    address: order.address,
                    postalCode: order.postalCode,
                    country: order.country,
                  },
                  consent: true,
                }),
              });

              if (policyResponse.ok) {
                const policy = await policyResponse.json();
                policyIds.push(policy.policy_id);
              }
            }
          } catch (error) {
            console.error(`Failed to create policy for ${item.name}:`, error);
          }
        }
      }

      // Update order with policy IDs
      const updatedOrder = await storage.updateOrderStatus(order.id, "completed", policyIds);
      
      res.status(201).json(updatedOrder || order);
    } catch (error) {
      console.error("Order creation failed:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // Get order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  // Get product by IMEI
  app.get("/api/products/imei/:imei", async (req, res) => {
    try {
      const imei = req.params.imei;
      const product = await storage.getProductByImei(imei);
      
      if (!product) {
        return res.status(404).json({ message: "Device not found" });
      }
      
      // Calculate warranty status
      const purchaseDate = new Date(product.purchaseDate || "");
      const currentDate = new Date();
      const monthsSincePurchase = (currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      
      const warrantyStatus = {
        withinManufacturerWarranty: monthsSincePurchase <= 12,
        withinExtendedWarranty: monthsSincePurchase <= 60, // 5 years for extended
        monthsSincePurchase: Math.floor(monthsSincePurchase)
      };
      
      res.json({ ...product, warrantyStatus });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch device details" });
    }
  });

  // Create claim
  app.post("/api/claims", async (req, res) => {
    try {
      const validatedClaim = insertClaimSchema.parse(req.body);
      
      // Verify device exists
      const device = await storage.getProductByImei(validatedClaim.imei);
      if (!device) {
        return res.status(404).json({ message: "Device not found with provided IMEI" });
      }
      
      const claim = await storage.createClaim(validatedClaim);
      res.status(201).json(claim);
    } catch (error) {
      console.error("Claim creation failed:", error);
      res.status(400).json({ message: "Failed to create claim" });
    }
  });

  // Get claims
  app.get("/api/claims", async (req, res) => {
    try {
      const claims = await storage.getClaims();
      res.json(claims);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch claims" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
