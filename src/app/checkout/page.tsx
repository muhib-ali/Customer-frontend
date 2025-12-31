"use client";

import { useCartStore } from "@/stores/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { useEffect } from "react";

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();

  const total = subtotal();
  const tax = total * 0.08;
  const shipping = total > 1000 ? 0 : 50;
  const grandTotal = total + tax + shipping;

  useEffect(() => {
    if (items.length === 0) {
      router.push("/cart");
    }
  }, [items.length, router]);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    
    setTimeout(() => {
      toast({
        title: "Order Placed Successfully!",
        description: "Your order #KSR-9928 has been confirmed.",
        className: "bg-green-600 text-white border-none",
      });
      clearCart();
      router.push("/");
    }, 1500);
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
         <h1 className="text-4xl font-bold font-heading italic uppercase mb-8">
          Secure <span className="text-primary">Checkout</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              
              <div className="bg-card border border-border p-6">
                <h3 className="text-xl font-bold font-heading uppercase mb-6 flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">1</span>
                  Shipping Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" required className="rounded-none bg-background/50 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" required className="rounded-none bg-background/50 border-border" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" required className="rounded-none bg-background/50 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" required className="rounded-none bg-background/50 border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" required className="rounded-none bg-background/50 border-border" />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                     <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" required className="rounded-none bg-background/50 border-border" />
                  </div>
                </div>
              </div>

               <div className="bg-card border border-border p-6">
                <h3 className="text-xl font-bold font-heading uppercase mb-6 flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">2</span>
                  Shipping Method
                </h3>
                <RadioGroup defaultValue="standard">
                  <div className="flex items-center justify-between space-x-2 border border-border p-4 hover:border-primary transition-colors cursor-pointer">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="standard" id="r1" />
                      <Label htmlFor="r1" className="cursor-pointer">Standard Ground (5-7 Days)</Label>
                    </div>
                    <span className="font-mono">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-2 border border-border p-4 hover:border-primary transition-colors cursor-pointer mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="express" id="r2" />
                      <Label htmlFor="r2" className="cursor-pointer">Express Air (2 Days)</Label>
                    </div>
                    <span className="font-mono">$45.00</span>
                  </div>
                </RadioGroup>
              </div>

               <div className="bg-card border border-border p-6">
                <h3 className="text-xl font-bold font-heading uppercase mb-6 flex items-center gap-2">
                  <span className="bg-primary text-white w-6 h-6 flex items-center justify-center rounded-full text-xs">3</span>
                  Payment
                </h3>
                 <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="card">Card Number</Label>
                      <Input id="card" placeholder="0000 0000 0000 0000" className="rounded-none bg-background/50 border-border font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry</Label>
                        <Input id="expiry" placeholder="MM/YY" className="rounded-none bg-background/50 border-border font-mono" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc">CVC</Label>
                        <Input id="cvc" placeholder="123" className="rounded-none bg-background/50 border-border font-mono" />
                      </div>
                    </div>
                 </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
             <div className="bg-card border border-border p-6 sticky top-24">
              <h3 className="text-xl font-bold font-heading uppercase mb-6">Order Review</h3>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-muted/20 border border-border flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-contain" alt={item.name} />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold line-clamp-1">{item.name}</p>
                      <p className="text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-mono">
                      ${(item.price * item.quantity).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-border mb-6" />

               <div className="space-y-2 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-mono">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span className="font-mono">${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                 <div className="flex justify-between items-end pt-4 border-t border-border mt-4">
                  <span className="text-lg font-bold uppercase">Total</span>
                  <span className="text-2xl font-bold font-heading text-primary">
                    ${grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Button 
                type="submit"
                form="checkout-form"
                size="lg" 
                className="w-full rounded-none bg-primary text-white hover:bg-white hover:text-black font-bold uppercase tracking-wider h-14 text-lg"
              >
                Place Order <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
