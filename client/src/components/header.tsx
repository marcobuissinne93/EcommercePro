import { Link } from "wouter";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/lib/cart-store";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const items = useCartStore((state) => state.items);

  return (
    <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <h1 className="text-2xl font-bold text-slate-900 cursor-pointer">TechStore SA</h1>
            </Link>
            <Badge className="ml-2 bg-emerald-500 hover:bg-emerald-600 text-white">
              with Root Insurance
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex space-x-8">
              <Link href="/">
                <a className="text-slate-700 hover:text-blue-600 font-medium">Products</a>
              </Link>
              <a href="#" className="text-slate-700 hover:text-blue-600 font-medium">Insurance</a>
              <a href="#" className="text-slate-700 hover:text-blue-600 font-medium">Support</a>
            </nav>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="relative p-2 text-slate-700 hover:text-blue-600"
            >
              <ShoppingCart className="w-6 h-6" />
              {items.length > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center p-0"
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
