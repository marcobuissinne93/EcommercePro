import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

const formatCurrency = (cents: number) => {
  return `R ${(cents / 100).toLocaleString()}`;
};

const getBadgeColor = (badge: string) => {
  const colors: Record<string, string> = {
    "New": "bg-emerald-500",
    "Hot": "bg-orange-500", 
    "Pro": "bg-purple-500",
    "M3": "bg-gray-500",
    "AI": "bg-green-500",
    "5G": "bg-blue-500",
    "Fast": "bg-red-500",
    "Ultra": "bg-indigo-500",
    "Sale": "bg-yellow-500",
    "2-in-1": "bg-teal-500",
  };
  return colors[badge] || "bg-gray-500";
};

export function ProductCard({ product }: ProductCardProps) {
  const [selectedWarranty, setSelectedWarranty] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  const calculate5YearWarranty = () => Math.round(product.price * 0.1);
  const calculate10YearWarranty = () => Math.round(product.price * 0.2);

  const handleAddToCart = async () => {
    setIsAdding(true);
    
    let warranty = undefined;
    if (selectedWarranty === "5-year") {
      warranty = {
        type: "5-year" as const,
        price: calculate5YearWarranty(),
      };
    } else if (selectedWarranty === "10-year") {
      warranty = {
        type: "10-year" as const,
        price: calculate10YearWarranty(),
      };
    }

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      warranty,
    });

    // Show success feedback
    setTimeout(() => setIsAdding(false), 1000);
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img 
        src={product.image} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-slate-900">{product.name}</h4>
          {product.badge && (
            <Badge className={`${getBadgeColor(product.badge)} text-white text-xs px-2 py-1`}>
              {product.badge}
            </Badge>
          )}
        </div>
        
        <p className="text-slate-600 text-sm mb-3">{product.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {product.originalPrice && (
              <span className="text-lg text-slate-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
            <span className="text-2xl font-bold text-slate-900">
              {formatCurrency(Math.round(product.price * 1.15))}
            </span>
            <span className="text-xs text-slate-500 ml-2">VAT incl.</span>
          </div>
          <div className="flex items-center text-yellow-400">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-sm font-medium text-slate-600 ml-1">
              {product.rating}
            </span>
          </div>
        </div>

        {/* Warranty Options */}
        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
          <h5 className="font-medium text-slate-900 mb-2">Extended Warranty</h5>
          <RadioGroup value={selectedWarranty} onValueChange={setSelectedWarranty}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5-year" id={`warranty-5-${product.id}`} />
              <Label htmlFor={`warranty-5-${product.id}`} className="text-sm">
                5-year warranty (+{formatCurrency(Math.round(calculate5YearWarranty() * 1.15))} VAT incl.)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10-year" id={`warranty-10-${product.id}`} />
              <Label htmlFor={`warranty-10-${product.id}`} className="text-sm">
                10-year warranty (+{formatCurrency(Math.round(calculate10YearWarranty() * 1.15))} VAT incl.)
              </Label>
            </div>
          </RadioGroup>
        </div>

        <Button 
          onClick={handleAddToCart}
          className="w-full bg-blue-600 text-white hover:bg-blue-700"
          disabled={isAdding}
        >
          {isAdding ? "Added!" : "Add to Cart"}
        </Button>
      </CardContent>
    </Card>
  );
}
