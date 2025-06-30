import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/lib/cart-store";
import type { CartItem, Product } from "@shared/schema";
import { api } from "@/lib/api";

interface InsuranceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

const getInsuranceQuote = async (cover_type: string, price: number) => {
  const response = await fetch("http://localhost:8000/api/getQuote", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "gr_device",
      devices: [{ device_type: "cellphone", value: price }],
      cover_type: cover_type.toLowerCase().replace(/ /g, "_"),
      excess: "R100",
      // loaner_device: false, //fix this - cannot have `loaner device` in the body if not Comprehensive
      area_code: "0181",
      claims_history: "0",
    }),
  });

  const json = await response.json();
  console.log(JSON.stringify(json))
  return json;
};

// // get product JSON by ID
// function getItemByProductId(jsonString: CartItem[], productId: number) {
//   try {
//     const parsed = JSON.parse(jsonString);
//     const items = parsed.state?.items || [];

//     return items.find((item: any) => item.productId === productId) || null;
//   } catch (error) {
//     console.error("Invalid JSON:", error);
//     return null;
//   }
// }

const insuranceOptions = [
  {
    type: "comprehensive" as const,
    name: "Comprehensive Coverage",
    description: "Covers theft, accidental damage, and technical failure",
    price: 19000, // R 299/month
  },
  {
    type: "theft" as const,
    name: "Theft Only", 
    description: "Protection against theft and burglary",
    price: 10000, // R 149/month
  },
  {
    type: "accidental_damage" as const,
    name: "Accidental Damage",
    description: "Covers accidental drops, spills, and screen damage", 
    price: 15000, // R 199/month
  },
];

const formatCurrency = (cents?: number): string => {
  if (cents === undefined) {
    return '';
  }

  return `R ${(cents / 100).toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// items["state"][0]["price"]
// cart-storage	{"state":{"items":[{"productId":3,"name":"iPad Pro 12.9\"","price":1999900,"image":"https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300","id":"item_1751050968306_0vv5vq87y"}]},"version":0}
export function InsuranceModal({ open, onOpenChange, product }: InsuranceModalProps) {
  const selectedProductId: number = product?.id ?? 0;
  // console.log(`The selected product ID is: ${price}`);
  const [quoteValue, setQuoteValue] = useState<number>();
  const [selectedInsurance, setSelectedInsurance] = useState<string>("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const { items, addItem, updateItemInsurance, getPrice } = useCartStore();
  const [showQuotePrice, setShowQuotePrice] = useState(false);
  // const [open, setOpen] = useState(false);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSelectedInsurance("");
      setShowQuotePrice(false);
      onOpenChange(false);
      // You can run cleanup, reset form, update state, etc.
    }
    // return false;
  };

  const handleAddInsurance = () => {
    if (!selectedInsurance || !termsAccepted || !product) return;

    const insuranceOption = insuranceOptions.find(opt => opt.type === selectedInsurance);
    if (!insuranceOption) return;

    const insurance = {
      type: insuranceOption.type,
      price: quoteValue //insuranceOption.price, 
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
    handleClose(false);
  };

  const canAddInsurance = selectedInsurance && termsAccepted;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <DialogTitle>Device Insurance</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <p className="text-slate-600">
            Protect your device with comprehensive insurance coverage.
          </p>
          
          {/* <RadioGroup value={selectedInsurance} onValueChange={setSelectedInsurance}>
            {insuranceOptions.map((option) => (
              <div key={option.type} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50">
                <RadioGroupItem value={option.type} id={option.type} className="mt-1" />
                <Label htmlFor={option.type} className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-900">{option.name}</div>
                  <div className="text-sm text-slate-600">{option.description}</div>
                  <div className="text-sm font-medium text-blue-600">
                    From {formatCurrency(option.price)}/month via debit order
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup> */}
          <RadioGroup
            value={selectedInsurance}
            onValueChange={async (value) => {
                  setShowQuotePrice(true); // added this 
                  console.log(`The price should be displayed : ${showQuotePrice}`)
                  setSelectedInsurance(value);

                  try {
                    // const item = useCartStore.getState().items[0]; // or wherever you get the item
                    // items.map((item) => return items.filter(item.id === selectedProductId));
                    // console.log(`The price is: ${product?.price}`);

                    // Working and pulling through the correct price of each product
                    let price: number = 0;
                    items.map((item) => { 
                      console.log(`${item.productId} === ${selectedProductId}`)
                      if (item.productId == selectedProductId) {
                          price = item.price;
                      };
                    })
                    // items.map((item) => {
                    //   console.log(item);
                    // });

                    const quote = await getInsuranceQuote(value, price);
                    setQuoteValue(quote?.[0]?.base_premium); // ✅ Now the actual quote is stored
                    console.log(quote?.[0]?.base_premium);
                  } catch (err) {
                    console.error("Failed to fetch quote:", err);
                  }
                }}
          >
            {insuranceOptions.map((option) => (
              <div
                key={option.type}
                className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-slate-50"
              >
                <RadioGroupItem value={option.type} id={option.type} className="mt-1" />
                <Label htmlFor={option.type} className="flex-1 cursor-pointer">
                  <div className="font-medium text-slate-900">{option.name}</div>
                  <div className="text-sm text-slate-600">{option.description}</div>
                  <div className="text-sm font-medium text-blue-600">
                    From {formatCurrency(option.price)}/month via debit order
                  </div>
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex space-x-10 m-1" style={{"display": showQuotePrice ? 'flex' : 'none'}}>
                {quoteValue && 
                <div className="mt-3 border font-medium text-slate-900 rounded-md text-base font-semibold p-4 bg-gray-100">
                  Device Insurance Total: <span className="text-blue-600">{formatCurrency(quoteValue)}</span> / month via debit order
                </div>}
          </div>
          {/* <pre>{quoteValue}</pre> */}
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
            onClick={() => {
              handleClose(false);        // your custom logic
              onOpenChange(false);  // close the dialog
            }}
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
