import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/header";
import { ProductCard } from "@/components/product-card";
import { CartDrawer } from "@/components/cart-drawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import type { Product } from "@shared/schema";
import logo from "../assets/logo.svg";

export default function Home() {
  const [, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);


  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });



  const handleCheckout = () => {
    setLocation("/checkout");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border animate-pulse">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4" />
                  <div className="h-3 bg-slate-200 rounded w-1/2" />
                  <div className="h-6 bg-slate-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onCartClick={() => setCartOpen(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl text-black p-8 mb-8">
          <div className="max-w-3xl">
            {/* <h2 className="text-3xl font-bold mb-4">
              Premium Mobile Devices with additional insurance options underwritten by 
              <img src={logo} alt="Guardrisk Logo" className="inline-block ml-2 h-8" />
            </h2> */}
            <h2 className="text-3xl font-bold mb-4">
              Premium Hunting Gear with additional insurance options underwritten by 
              <img src={logo} alt="Guardrisk Logo" className="inline-block ml-2 h-8" />
            </h2>
            <p className="text-black-100 text-lg mb-6">
              Protect your investment with our insurance solutions. From extended warranties to comprehensive coverage.
            </p>
            <div className="flex flex-wrap gap-2">
              {/* takealot badges */}
              {/* <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                ✓ Instant Coverage
              </Badge>
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                ✓ Comprehensive Insurance
              </Badge>
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                ✓ Theft Protection
              </Badge>
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white">
                ✓ Accidental Damage
              </Badge> */}
              <Badge className="hover:bg-blue-700 text-white" style={{ backgroundColor: "rgb(223, 101, 57)" }}>
                ✓ Instant Coverage
              </Badge>
              <Badge className="hover:bg-blue-700 text-white" style={{ backgroundColor: "rgb(223, 101, 57)" }}>
                ✓ Comprehensive Insurance
              </Badge>
              <Badge className="hover:bg-blue-700 text-white" style={{ backgroundColor: "rgb(223, 101, 57)" }}>
                ✓ Theft Protection
              </Badge>
              <Badge className="hover:bg-blue-700 text-white" style={{ backgroundColor: "rgb(223, 101, 57)" }}>
                ✓ Accidental Damage
              </Badge>
              {/* <Badge className="bg-white/10 hover:bg-white/20 text-white">
                ✓ Extended Warranties
              </Badge> */}
            </div>
          </div>
        </div>

        {/* Product Catalog */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900">Our Devices</h3>
            <div className="flex items-center space-x-4">
              <Select>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Sort by Price" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="brand">Sort by Brand</SelectItem>
                  <SelectItem value="rating">Sort by Rating</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              {/* <h3 className="text-lg font-bold mb-4">Takealot</h3> */}
              <h3 className="text-lg font-bold mb-4">Safari Outdoor</h3>
              {/* <p className="text-slate-300 text-sm">
                Premium mobile devices with comprehensive insurance coverage through Guardrisk.
              </p> */}
              <p className="text-slate-300 text-sm">
                Premium hunting gear with comprehensive insurance coverage through Guardrisk.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Products</h4>
              {/* <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">Smartphones</a></li>
                <li><a href="#" className="hover:text-white">Tablets</a></li>
                <li><a href="#" className="hover:text-white">Laptops</a></li>
                <li><a href="#" className="hover:text-white">Accessories</a></li>
              </ul> */}
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">Rifles</a></li>
                <li><a href="#" className="hover:text-white">Ammunition</a></li>
                <li><a href="#" className="hover:text-white">Opticals</a></li>
                <li><a href="#" className="hover:text-white">Camo Gear</a></li>
                <li><a href="#" className="hover:text-white">Accessories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Insurance</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">Device Coverage</a></li>
                <li><a href="#" className="hover:text-white">Extended Warranty</a></li>
                <li><a href="#" className="hover:text-white">Claims Process</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-slate-300">
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Track Order</a></li>
                <li><a href="#" className="hover:text-white">Returns</a></li>
                <li><a href="#" className="hover:text-white">Help Center</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-400">
            {/* <p>&copy; 2025 Takealot SA. All rights reserved. Insurance underwritten by Guardrisk.</p> */}
            <p>&copy; 2025 Safari Outdoor. All rights reserved. Insurance underwritten by Guardrisk.</p>
          </div>
        </div>
      </footer>

      <CartDrawer 
        open={cartOpen}
        onOpenChange={setCartOpen}
        onCheckout={handleCheckout}
      />


    </div>
  );
}
