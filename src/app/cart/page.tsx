"use client";

import Layout from "@/components/Layout";
import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
            Shopping <span className="text-primary">Cart</span>
          </h1>
          <p className="text-muted-foreground mb-8">Your cart is empty</p>
          <Link href="/categories">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
          Shopping <span className="text-primary">Cart</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-contain bg-muted/20 rounded" />
                <div className="flex-grow">
                  <h3 className="font-bold font-heading uppercase">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.brand}</p>
                  <p className="text-lg font-bold text-primary mt-2">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-bold">{item.quantity}</span>
                    <Button variant="outline" size="icon" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold font-heading uppercase mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold">${subtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-bold">FREE</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-primary">${subtotal().toFixed(2)}</span>
                </div>
              </div>
              <Link href="/checkout">
                <Button className="w-full mb-2">Proceed to Checkout</Button>
              </Link>
              <Button variant="outline" className="w-full" onClick={clearCart}>Clear Cart</Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
