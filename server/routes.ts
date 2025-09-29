import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertOrderSchema, insertClaimSchema, type RootQuoteRequest, type RootPolicyRequest } from "@shared/schema";
import { emailService } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get insurance quoate from Root 
  app.post("/api/getQuote", async (req, res) => {
    const url = 'https://sandbox.rootplatform.com/v1/insurance/quotes?version=draft';

    const options: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo='
      },
      body: JSON.stringify(req.body),
    };
    console.log("the body is:", JSON.stringify(req.body));
    
    try {
    const response = await fetch(url, options);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to get quote from Root" });
    }

    const json = await response.json();
    console.log("Quote Response:", json);
    res.status(200).json(json);

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to retrieve quote" });
  }
  });

  app.get("/api/searchPolicyHolder/:id_number", async (req, res) => {

    // First check whether the policholder already exists in Root
    const id = req.params.id_number;
    console.log("The poliyholder ID is: ", id);
    const url_get = `https://sandbox.rootplatform.com/v1/insurance/policyholders?id_number=${id}`;

    const options_get: RequestInit = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo='
      },
    };

    try {
    const response = await fetch(url_get, options_get);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to get policyholder from Root" });
    }

    const json = await response.json();
    // console.log("Policyholder Response 1:", JSON.stringify(json));
    res.status(200).json(json);

    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ error: "Failed to retrieve policyholder" });
    }
    
  });

  app.get("/api/getClaimPolicies/:search", async (req, res) => {
    const search = req.params.search;
    const url_get = `https://sandbox.rootplatform.com/v1/insurance/policies?page_size=50&page=1&search=${search}`;

    const options_get: RequestInit = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo='
      },
    };

    try {
    const response = await fetch(url_get, options_get);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to get policies from Root" });
    }

    const json = await response.json();
    // console.log("Policy Response 1:", JSON.stringify(json));
    res.status(200).json(json);

    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ error: "Failed to retrieve policies" });
    }
    
  });


  app.post("/api/createClaim", async (req, res) => {
    console.log("Now in server call", JSON.stringify(req.body));

    const url_create = "https://sandbox.rootplatform.com/v1/insurance/claims";

    const options_create: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        "Content-Type": "application/json",
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo=',
      },
      body: JSON.stringify(req.body),
    };

    try {
    const response = await fetch(url_create, options_create);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to create claim on Root" });
    }

    const json = await response.json();
    // link the claim to a policy
    // const url_link = `https://sandbox.rootplatform.com/v1/insurance/claims/${json.claim_id}/policy`;

    // console.log("The claim policy ID is:", req.body.policy_id);

    // const options_link: RequestInit = {
    //   method: 'POST',
    //   headers: {
    //     Accept: 'application/json',
    //     "Content-Type": "application/json",
    //     'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo=',
    //   },
    //   body: JSON.stringify({policy_id: req.body.policy_id}),
    // };

    // const linkClaim = await fetch(url_link, options_link);
    //   if (!linkClaim.ok) {
    //   console.error("❌ Root API error:", await linkClaim.text());
    //   return res.status(linkClaim.status).json({ error: "Failed to create claim on Root" });
    //   }

    // const json_link = await linkClaim.json();

    // console.log("Claim Response from Root is:", JSON.stringify(json_link));
    res.status(200).json(json);

    } catch (err) {
      console.error("Fetch error:", err);
      res.status(500).json({ error: "Failed to create claim" });
    }
    
  });


  app.post("/api/createPolicyHolder", async (req, res) => {

    const url_post = 'https://sandbox.rootplatform.com/v1/insurance/policyholders';
    const body = {...req.body, date_of_birth: "19900101"};

    const options_post: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo='
      },
      body: JSON.stringify(body),
    };

    try {
    const response = await fetch(url_post, options_post);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to create a Policholder on Root" });
    }

    const json = await response.json();
    console.log("Root Response:", json);
    res.status(200).json(json);

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to create Policyholder" });
  }
  });


  app.post("/api/createApplication", async (req, res) => {

    const url_post = 'https://sandbox.rootplatform.com/v1/insurance/applications';
    const options_post: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo='
      },
      body: JSON.stringify(req.body),
    };

    try {
    const response = await fetch(url_post, options_post);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to create an Application on Root" });
    }

    const json = await response.json();
    console.log("Root Response:", json);
    res.status(200).json(json);

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to create Application" });
  }
  });

  // Issue the policy on Root 
    app.post("/api/issuePolicy", async (req, res) => {

    const url_post = 'https://sandbox.rootplatform.com/v1/insurance/policies';
    const options_post: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo='
      },
      body: JSON.stringify(req.body),
    };

    try {
    const response = await fetch(url_post, options_post);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to issue the Polciy on Root" });
    }

    const json = await response.json();
    console.log("Root Response:", json);
    res.status(200).json(json);

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to issue Policy" });
  }
  });

  // Add a payment method to policyholder 
    app.post("/api/createPaymentMethod", async (req, res) => {
    const { policyHolderId, ...rest } = req.body;
    console.log("THE payment method body is: ", JSON.stringify(rest));

    const url_post = `https://sandbox.rootplatform.com/v1/insurance/policyholders/${policyHolderId}/payment-methods`;
    const options_post: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo='
      },
      body: JSON.stringify(rest),
    };

    try {
    const response = await fetch(url_post, options_post);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to create Payment Menthod on Root" });
    }

    const json = await response.json();
    console.log("Root Response:", json);
    res.status(200).json(json);

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to create Payment Method" });
  }
  });

    // Assign a payment method to policy 
    app.post("/api/assignPayMethod", async (req, res) => {
    const { policy_id, ...payment_method_id } = req.body;
    const url_post = `https://sandbox.rootplatform.com/v1/insurance/policies/${policy_id}/payment-method`;
    const options_post: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Authorization': 'Basic c2FuZGJveF9OREF3TldJNVl6QXRNek5sWkMwME1UTTNMV0kzTVRjdE1qVmpZbVkyWVRFM00yUmpMbWcwWTNkNE9YRnJhV2RQUzNWbFdGbHJkM2t5U0VKUVRXaDZPR1UzTmpoVjo='
      },
      body: JSON.stringify(payment_method_id)
    };

    try {
    const response = await fetch(url_post, options_post);

    if (!response.ok) {
      console.error("❌ Root API error:", await response.text());
      return res.status(response.status).json({ error: "Failed to assign Payment Menthod on Root" });
    }

    const json = await response.json();
    console.log("Root Response:", json);
    res.status(200).json(json);

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({ error: "Failed to assign Payment Method" });
  }
  });


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
  // app.post("/api/quote", async (req, res) => {
  //   try {
  //     const quoteRequest: RootQuoteRequest = req.body;
      
  //     // Get Root API credentials from environment
  //     const rootApiKey = process.env.ROOT_API_KEY || process.env.ROOT_PLATFORM_API_KEY || "demo_key";
  //     const rootBaseUrl = process.env.ROOT_BASE_URL || process.env.ROOT_PLATFORM_BASE_URL || "https://api.root.co.za";

  //     // Call Root Platform API for quote
  //     const response = await fetch(`${rootBaseUrl}/v1/quotes`, {
  //       method: "POST",
  //       headers: {
  //         "Authorization": `Bearer ${rootApiKey}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         product_name: quoteRequest.productName,
  //         product_value: quoteRequest.productValue,
  //         coverage_type: quoteRequest.coverageType,
  //         customer: quoteRequest.customerInfo,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Root API error: ${response.status}`);
  //     }

  //     const quote = await response.json();
  //     res.json(quote);
  //   } catch (error) {
  //     console.error("Quote generation failed:", error);
  //     // Return mock quote for demo purposes
  //     res.json({
  //       quote_id: `quote_${Date.now()}`,
  //       monthly_premium: req.body.coverageType === "comprehensive" ? 29900 : 
  //                       req.body.coverageType === "theft" ? 14900 : 19900,
  //       coverage_type: req.body.coverageType,
  //       product_name: req.body.productName,
  //     });
  //   }
  // });

  // Create Root Platform policy
  // app.post("/api/policy", async (req, res) => {
  //   try {
  //     const policyRequest: RootPolicyRequest = req.body;
      
  //     const rootApiKey = process.env.ROOT_API_KEY || process.env.ROOT_PLATFORM_API_KEY || "demo_key";
  //     const rootBaseUrl = process.env.ROOT_BASE_URL || process.env.ROOT_PLATFORM_BASE_URL || "https://api.root.co.za";

  //     // Call Root Platform API to create policy
  //     const response = await fetch(`${rootBaseUrl}/v1/policies`, {
  //       method: "POST",
  //       headers: {
  //         "Authorization": `Bearer ${rootApiKey}`,
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         quote_id: policyRequest.quoteId,
  //         customer: policyRequest.customerInfo,
  //         consent: policyRequest.consent,
  //         coverage_type: policyRequest.coverageType,
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`Root API error: ${response.status}`);
  //     }

  //     const policy = await response.json();
  //     res.json(policy);
  //   } catch (error) {
  //     console.error("Policy creation failed:", error);
  //     // Return mock policy for demo purposes
  //     res.json({
  //       policy_id: `policy_${Date.now()}`,
  //       policy_number: `RP${Date.now().toString().slice(-8)}`,
  //       status: "active",
  //       customer: req.body.customerInfo,
  //       coverage_type: req.body.coverageType,
  //     });
  //   }
  // });

    // Create list of policies per order in the DB
  app.post("/api/insertInsurance", async (req, res) => {
    const policies = req.body?.policies;
    const orderId = req.body?.orderId;
    console.log(JSON.stringify(policies));

    try {
      const updatedInsurance = await storage.updateInsurancePolicies(orderId, policies);      
      res.status(201).json(policies);
    } catch (error) {
      console.error("Insurance policies not added:", error);
      res.status(400).json({ message: "Failed to create insurance policies" });
    }
  });

  // add the policyholder's ID to the orders table
  app.post("/api/insertPolicyHolder", async (req, res) => {
    const policyHolderId = req.body?.policyHolderId;
    const orderId = req.body?.orderId;
    console.log(JSON.stringify(policyHolderId));

    try {
      const updatedInsurance = await storage.insertPolicyHolderId(orderId, policyHolderId);      
      res.status(201).json(policyHolderId);
    } catch (error) {
      console.error("Insurance policies not added:", error);
      res.status(400).json({ message: "Failed to create insurance policies" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    const applicationIds = req.body?.applicationIds;
    console.log(JSON.stringify(applicationIds));

    try {
      const validatedOrder = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedOrder);
      
      // Process insurance policies if any items have insurance

      // Update order with policy IDs
      const updatedOrder = await storage.updateOrderStatus(order.id, "completed", [], applicationIds);
      
      // Send email with insurance payment links
      const orderInsuranceItems = order.items.filter(item => item.insurance);
      let emailResult = null;
      
      if (orderInsuranceItems.length > 0) {
        emailResult = await emailService.sendInsurancePaymentLinks(
          order.id,
          order.fullName,
          order.email,
          order.items
        );
        
        if (emailResult.success) {
          console.log(`✅ Email delivery: ${emailResult.message}`);
        } else {
          console.error(`❌ Email delivery failed: ${emailResult.message}`);
        }
      }
      
      res.status(201).json({
        ...updatedOrder || order,
        emailSent: emailResult?.success || false,
        emailMessage: emailResult?.message || null
      });
    } catch (error) {
      console.error("Order creation failed:", error);
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // Get order
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
      }

      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      console.log(JSON.stringify(order.applicationIds)); // testing 
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
