import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Trash2, ShoppingCart, Shield } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { InsuranceModal } from "@/components/insurance-modal";
import { useState } from "react";
import type { Product } from "@shared/schema";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

const formatCurrency = (cents: number) => {
  return `R ${(cents / 100).toLocaleString()}`;
};

export function CartDrawer({ open, onOpenChange, onCheckout }: CartDrawerProps) {
  const { items, removeItem, getSubtotal, getWarrantyTotal, getTotal } = useCartStore();
  const [insuranceModalOpen, setInsuranceModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleInsuranceClick = (productId: number, productName: string) => {
    const mockProduct: Product = {
      id: productId,
      name: productName,
      description: "",
      price: 0,
      image: "",
      imei: "",
      purchaseDate: null
    };
    setSelectedProduct(mockProduct);
    setInsuranceModalOpen(true);
  };

  const handleCheckout = () => {
    onOpenChange(false);
    onCheckout();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-96">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full pt-6">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
              <ShoppingCart className="w-16 h-16 mb-4 text-slate-300" />
              <p>Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border-b">
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-900">{item.name}</h4>
                      <p className="text-sm text-slate-600">{formatCurrency(Math.round(item.price * 1.15))} VAT incl.</p>
                      {item.warranty && (
                        <p className="text-xs text-blue-600">
                          + {item.warranty.type} warranty ({formatCurrency(Math.round(item.warranty.price * 1.15))} VAT incl.)
                        </p>
                      )}
                      {item.insurance && (
                        <p className="text-xs text-green-600">
                          + {item.insurance.type} insurance (email payment link will be sent)
                        </p>
                      )}
                      
                      {!item.insurance && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleInsuranceClick(item.productId, item.name)}
                          className="text-xs text-green-700 border-green-600 bg-green-50 hover:bg-green-100 hover:border-green-700 px-3 py-1 h-7 mt-2 font-medium"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          Add Device Insurance
                        </Button>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-500 hover:text-red-700 ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal (VAT incl.):</span>
                    <span>{formatCurrency(Math.round((getSubtotal() + getWarrantyTotal()) * 1.15))}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>{formatCurrency(Math.round((getSubtotal() + getWarrantyTotal()) * 1.15))}</span>
                  </div>
                </div>
                <Button 
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}

          <InsuranceModal
            open={insuranceModalOpen}
            onOpenChange={setInsuranceModalOpen}
            product={selectedProduct}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
