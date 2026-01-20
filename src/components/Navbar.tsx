"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Search, User, Menu, Heart, Sun, Moon, LogOut, Settings, LogIn, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/stores/useCartStore";
import WishlistCount from "@/components/WishlistCount";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.totalItems);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Debug: Log cart count changes
  console.log('Navbar - Cart count:', cartCount);
  const isLoggedIn = !!user;

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/categories" },
    { name: "Brands", href: "/brands" },
    { name: "Bulk Order", href: "/bulk-order" },
    { name: "Blog", href: "/blog" },
  ];

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="h-1 w-full bg-primary"></div>
      
      <div className="w-full px-4 h-20 flex items-center justify-between gap-4 max-w-[1400px] mx-auto">
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground hover:bg-muted">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] border-r border-border bg-card text-foreground">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} className="text-lg font-medium hover:text-primary transition-colors uppercase font-heading tracking-wider">
                    {link.name}
                  </Link>
                ))}
                <div className="border-t border-border pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <Link href="/wishlist" className="text-lg font-medium hover:text-primary transition-colors uppercase font-heading tracking-wider flex items-center gap-2">
                      <Heart className="h-5 w-5" />
                      Wishlist
                    </Link>
                    <WishlistCount />
                  </div>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative flex items-center gap-1">
            <span className="text-3xl font-bold font-heading italic tracking-tighter text-foreground group-hover:text-foreground/80 transition-colors">
              KSR
            </span>
            <span className="text-3xl font-bold font-heading italic tracking-tighter text-primary">
              PERFORMANCE
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={`text-sm font-semibold uppercase tracking-wider hover:text-primary transition-colors ${pathname === link.href ? 'text-primary' : 'text-muted-foreground'}`}>
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center max-w-sm w-full relative">
          <Input 
            placeholder="SEARCH PARTS..." 
            className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary rounded-full h-10 pr-10 pl-4"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-muted-foreground hover:text-foreground">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Link href="/search" className="lg:hidden p-2 text-muted-foreground hover:text-primary">
            <Search className="h-5 w-5" />
          </Link>
          
          <WishlistCount />

          <Link href="/cart" className="relative p-2 text-muted-foreground hover:text-primary transition-colors group">
            <ShoppingCart className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-primary text-[10px] font-bold flex items-center justify-center rounded-full text-white ring-2 ring-background">
                {cartCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-full hover:bg-muted text-muted-foreground hover:text-primary">
                <User className="h-6 w-6" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              {isLoggedIn ? (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">My Account</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex w-full items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="flex w-full items-center cursor-pointer">
                      <Package className="mr-2 h-4 w-4" />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="text-red-500 focus:text-red-500 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </>
              ) : (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="flex w-full items-center cursor-pointer">
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>Log in / Register</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
