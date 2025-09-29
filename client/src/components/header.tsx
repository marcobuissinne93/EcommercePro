import { Link } from "wouter";
import { ShoppingCart, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useCartStore } from "@/lib/cart-store";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const items = useCartStore((state) => state.items);

  // Have to clear the quote module IDs in the event that the cart is empty
  if (items.length === 0) {
    localStorage.removeItem("quote_package_id");
  };

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
            {/* <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Takealot_logo.svg/1472px-Takealot_logo.svg.png?20171128085548"
              alt="Takealot"
              className="w-40 h-auto"
            /> */}
            <img
              src="data:image/png;base64,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"
              alt="Safari Outdoor"
              className="w-40 h-auto"
            />
            </Link>
            {/* <Badge className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white">
              with Insurance Coverage
            </Badge> */}
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-8">
              <Link href="/">
                <span className="text-slate-700 hover:text-blue-600 font-medium cursor-pointer">Products</span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-slate-700 hover:text-blue-600 font-medium p-0 h-auto">
                    Insurance
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/claims">
                      <span className="cursor-pointer">Submit Claim</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Coverage Options</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <span>Claims Status</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-slate-700 hover:text-blue-600 font-medium cursor-pointer">Support</span>
            </nav>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="relative p-2 text-slate-700 hover:text-blue-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                // takealot colors !!!
                // <Badge 
                //   className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0"
                // >
                //   {items.length}
                // </Badge>
                <Badge 
                className="absolute -top-1 -right-1 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0" style={{backgroundColor: "rgb(223, 101, 57)"}}
              >
                {items.length}
              </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
