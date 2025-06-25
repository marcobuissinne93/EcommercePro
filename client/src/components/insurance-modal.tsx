import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/lib/cart-store";
import type { Product } from "@shared/schema";

interface InsuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const insuranceOptions = [
  {
    type: "comprehensive" as const,
    name: "Comprehensive Coverage",
    description: "Covers theft, accidental damage, and technical failure",
    price: 29900, // R 299/month
  },
  {
    type: "theft" as const,
    name: "Theft Only", 
    description: "Protection against theft and burglary",
    price: 14900, // R 149/month
  },
  {
    type: "accidental" as const,
    name: "Accidental Damage",
    description: "Covers accidental drops, spills, and screen damage", 
    price: 19900, // R 199/month
  },
];

const formatCurrency = (cents: number) => {
  return `R ${(cents / 100).toLocaleString()}`;
};

export function InsuranceModal({ open, onOpenChange, product }: InsuranceModalProps) {
  const [selectedInsurance, setSelectedInsurance] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { items, addItem, updateItemInsurance } = useCartStore();

  const handleAddInsurance = () => {
    if (!selectedInsurance || !termsAccepted || !product) return;

    const insuranceOption = insuranceOptions.find(opt => opt.type === selectedInsurance);
    if (!insuranceOption) return;

    const insurance = {
      type: insuranceOption.type,
      price: insuranceOption.price,
    };

    // Check if product is already in cart
    const existingItem = items.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Update existing item with insurance
      updateItemInsurance(existingItem.id, insurance);
    } else {
      // Add new item with insurance
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        insurance,
      });
    }

    // Reset modal state
    setSelectedInsurance("");
    setTermsAccepted(false);
    onOpenChange(false);
  };

  const canAddInsurance = selectedInsurance && termsAccepted;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Device Insurance</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-slate-600">
            Protect your device with comprehensive insurance coverage through Root Platform.
          </p>
          
          <RadioGroup value={selectedInsurance} onValueChange={setSelectedInsurance}>
            {insuranceOptions.map((option) => (
              <div key={option.type} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                <RadioGroupItem value={option.type} id={option.type} className="mt-1" />
                <Label htmlFor={option.type} className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-900">{option.name}</div>
                  <div className="text-sm text-slate-600">{option.description}</div>
                  <div className="text-sm font-medium text-blue-600">
                    +{formatCurrency(option.price)}/month
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="flex items-start space-x-3 p-3 bg-slate-50 rounded-lg">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <Label htmlFor="terms" className="text-sm text-slate-700">
              I accept the{" "}
              <a href="#" className="text-blue-600 hover:underline">
                terms and conditions
              </a>{" "}
              of the insurance policy
            </Label>
          </div>

          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAddInsurance}
              disabled={!canAddInsurance}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              Add Insurance
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
