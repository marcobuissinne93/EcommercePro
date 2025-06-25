import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCheckout: () => void;
}

const formatCurrency = (cents: number) => {
  return `R ${(cents / 100).toLocaleString()}`;
};

export function CartDrawer({ open, onOpenChange, onCheckout }: CartDrawerProps) {
  const { items, removeItem, getTotal } = useCartStore();

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
                      <p className="text-sm text-slate-600">{formatCurrency(item.price)}</p>
                      {item.warranty && (
                        <p className="text-xs text-blue-600">
                          + {item.warranty.type} warranty ({formatCurrency(item.warranty.price)})
                        </p>
                      )}
                      {item.insurance && (
                        <p className="text-xs text-green-600">
                          + {item.insurance.type} insurance ({formatCurrency(item.insurance.price)}/month)
                        </p>
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
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-slate-900">Total:</span>
                  <span className="text-2xl font-bold text-slate-900">
                    {formatCurrency(getTotal())}
                  </span>
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
        </div>
      </SheetContent>
    </Sheet>
  );
}
