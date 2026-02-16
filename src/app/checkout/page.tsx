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
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { bootstrapCartOnce } from "@/services/cart/bootstrap";
import { type CartItem } from "@/services/cart";
import { useAuth } from "@/contexts/AuthContext";
import PromoCodeInput from "@/components/PromoCodeInput";
import { createOrder } from "@/services/orders";
import { resetCartBootstrap } from "@/services/cart/bootstrap";
import { useCurrency } from "@/contexts/currency-context";
import { Country, State, City } from "country-state-city";

export default function CheckoutPage() {
  const { totalAmount, clearCart } = useCartStore();
  const { toast } = useToast();
  const router = useRouter();
  const { data: session } = useSession();
  const { user } = useAuth();
  const { convertAmount, getCurrencySymbol, getCurrencyCode } = useCurrency();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [convertedPrices, setConvertedPrices] = useState<{ [key: string]: number }>({});
  const [convertedTotals, setConvertedTotals] = useState<{ subtotal: number; shipping: number; discount: number; grandTotal: number } | null>(null);
  const [calculatedTotal, setCalculatedTotal] = useState(0);
  const [countries, setCountries] = useState<any[]>([]);
const [states, setStates] = useState<any[]>([]);
const [cities, setCities] = useState<any[]>([]);

const [selectedCountry, setSelectedCountry] = useState("");
const [selectedState, setSelectedState] = useState("");
const [selectedCity, setSelectedCity] = useState("");
useEffect(() => {
  setCountries(Country.getAllCountries());
}, []);
useEffect(() => {
  if (selectedCountry) {
    const states = State.getStatesOfCountry(selectedCountry);
    setStates(states);
    setCities([]);
    setSelectedState("");
    setSelectedCity("");
  }
}, [selectedCountry]);
useEffect(() => {
  if (selectedCountry && selectedState) {
    const cities = City.getCitiesOfState(selectedCountry, selectedState);
    setCities(cities);
    setSelectedCity("");
  }
}, [selectedState, selectedCountry]);

  // Calculate total from cart items instead of using totalAmount
  const total = calculatedTotal;
  const shipping = total > 1000 ? 0 : 50;
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoDiscountType, setPromoDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [promoCode, setPromoCode] = useState<string>('');
  
  // Calculate discount amount
  let discountAmount = 0;
  if (promoDiscount > 0) {
    if (promoDiscountType === 'percentage') {
      discountAmount = total * (promoDiscount / 100);
    } else {
      discountAmount = promoDiscount;
    }
  }
  
  const grandTotal = total + shipping - discountAmount;

  useEffect(() => {
    const token = session?.accessToken as string | undefined;
    if (!token) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    // Fetch cart items
    bootstrapCartOnce(token)
      .then((cartData) => {
        setCartItems(cartData.items);
      })
      .catch((error) => {
        console.error('Failed to fetch cart for checkout:', error);
        toast({
          title: "Error",
          description: "Failed to load cart items. Please try again.",
          className: "bg-red-600 text-white border-none",
        });
        router.push("/cart");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [session?.accessToken, router, toast]);

  useEffect(() => {
    if (!isLoading && cartItems.length === 0) {
      router.push("/cart");
    }
  }, [cartItems.length, router, isLoading]);

  // Calculate total from cart items
  useEffect(() => {
    if (cartItems.length === 0) {
      setCalculatedTotal(0);
      return;
    }

    const total = cartItems.reduce((sum, item) => {
      const isBulk = item.type === 'bulk' || (item as any).cart_type === 'bulk';
      const unitPrice = isBulk
        ? (typeof item.offered_price_per_unit === 'number' ? item.offered_price_per_unit : parseFloat((item as any).cart_offered_price_per_unit) || parseFloat(item.product_price) || 0)
        : (parseFloat(item.product_price) || 0);
      const quantity = item.cart_quantity || 0;
      return sum + (unitPrice * quantity);
    }, 0);

    setCalculatedTotal(total);
  }, [cartItems]);

  // Convert checkout prices when currency changes
  useEffect(() => {
    const convertCheckoutPrices = async () => {
      if (cartItems.length === 0) return;
      
      const targetCurrency = getCurrencyCode();
      if (targetCurrency === 'NOK') {
        setConvertedPrices({});
        setConvertedTotals(null);
        return;
      }

      const conversions: { [key: string]: number } = {};
      
      try {
        // Convert individual item prices
        for (const item of cartItems) {
          const itemTotal = (parseFloat(item.product_price) || 0) * (item.cart_quantity || 0);
          const converted = await convertAmount(itemTotal, 'NOK', targetCurrency);
          conversions[item.cart_id] = converted;
        }
        
        // Convert totals
        const convertedSubtotal = await convertAmount(total, 'NOK', targetCurrency);
        const convertedShipping = await convertAmount(shipping, 'NOK', targetCurrency);
        const convertedDiscount = await convertAmount(discountAmount, 'NOK', targetCurrency);
        const convertedGrandTotal = await convertAmount(grandTotal, 'NOK', targetCurrency);
        
        setConvertedPrices(conversions);
        setConvertedTotals({
          subtotal: convertedSubtotal,
          shipping: convertedShipping,
          discount: convertedDiscount,
          grandTotal: convertedGrandTotal
        });
      } catch (error) {
        console.error('Checkout price conversion failed:', error);
      }
    };

    convertCheckoutPrices();
  }, [cartItems, total, shipping, discountAmount, grandTotal, convertAmount, getCurrencyCode]);

  const handlePlaceOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const token = session?.accessToken as string | undefined;
    if (!token) {
      router.push("/login?callbackUrl=/checkout");
      return;
    }

    if (isPlacingOrder) return;
    setIsPlacingOrder(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const address = String(formData.get('address') || '').trim();
    const city = String(selectedCity);
    const state =  String(states.find(s => s.isoCode === selectedState)?.name || "");
    const country = String(countries.find(c => c.isoCode === selectedCountry)?.name || "");
    const zip_code = String(formData.get('zip_code') || '').trim();

    try {
      const payload = {
        items: cartItems.map((i) => ({
          cart_id: i.cart_id,
          ...((i.type === 'bulk' || (i as any).cart_type === 'bulk')
            ? {
                requested_price_per_unit: parseFloat((i as any).cart_requested_price_per_unit) ?? i.requested_price_per_unit,
                offered_price_per_unit: parseFloat((i as any).cart_offered_price_per_unit) ?? i.offered_price_per_unit,
                bulk_min_quantity: parseInt((i as any).cart_bulk_min_quantity) ?? i.bulk_min_quantity,
              }
            : {}),
        })),
        ...(promoCode ? { promo_code: promoCode } : {}),
        address,
        city,
        state,
        zip_code,
        country,
        notes: String(formData.get('notes') || '').trim() || undefined,
      };

      const res = await createOrder(payload, token);

      toast({
        title: "Order Placed Successfully!",
        description: res?.data?.order?.order_number
          ? `Your order #${String(res.data.order.order_number)} has been confirmed.`
          : "Your order has been confirmed.",
        className: "bg-green-600 text-white border-none",
      });

      clearCart();
      resetCartBootstrap();

      const newOrderId = (res?.data?.order as any)?.id as string | undefined;
      if (newOrderId) {
        router.push(`/orders/${newOrderId}`);
      } else {
        router.push("/orders");
      }
    } catch (error: any) {
      if (error?.message === 'AUTH_EXPIRED') {
        toast({
          title: "Session Expired",
          description: "Please login again to continue.",
          className: "bg-orange-600 text-white border-none",
        });
        router.push("/login?callbackUrl=/checkout");
        return;
      }

      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        className: "bg-red-600 text-white border-none",
      });
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading || cartItems.length === 0) {
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
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input 
                      id="fullname" 
                      name="fullname"
                      value={user?.fullname || ''} 
                      readOnly 
                      required 
                      className="rounded-none bg-muted/30 border-border cursor-not-allowed" 
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" required className="rounded-none bg-background/50 border-border" />
                  </div>
                  <div className="space-y-2">
  <Label>City</Label>
  <select
    name="city"
    required
    value={selectedCity}
    onChange={(e) => setSelectedCity(e.target.value)}
    disabled={!cities.length}
    className="w-full h-10 bg-background/50 border border-border px-3"
  >
    <option value="">Select City</option>
    {cities.map((c, index) => (
      <option key={index} value={c.name}>
        {c.name}
      </option>
    ))}
  </select>
</div>

                  <div className="space-y-2">
  <Label>State</Label>
  <select
    name="state"
    required
    value={selectedState}
    onChange={(e) => setSelectedState(e.target.value)}
    disabled={!states.length}
    className="w-full h-10 bg-background/50 border border-border px-3"
  >
    <option value="">Select State</option>
    {states.map((s) => (
      <option key={s.isoCode} value={s.isoCode}>
        {s.name}
      </option>
    ))}
  </select>
</div>

                  <div className="space-y-2">
  <Label>Country</Label>
  <select
    name="country"
    required
    value={selectedCountry}
    onChange={(e) => setSelectedCountry(e.target.value)}
    className="w-full h-10 bg-background/50 border border-border px-3"
  >
    <option value="">Select Country</option>
    {countries.map((c) => (
      <option key={c.isoCode} value={c.isoCode}>
        {c.name}
      </option>
    ))}
  </select>
</div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input id="zip" name="zip_code" required className="rounded-none bg-background/50 border-border" />
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
                    <span className="font-mono">{shipping === 0 ? 'FREE' : `${getCurrencySymbol()}${(convertedTotals?.shipping || shipping || 0).toFixed(2)}`}</span>
                  </div>
                  <div className="flex items-center justify-between space-x-2 border border-border p-4 hover:border-primary transition-colors cursor-pointer mt-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="express" id="r2" />
                      <Label htmlFor="r2" className="cursor-pointer">Express Air (2 Days)</Label>
                    </div>
                    <span className="font-mono">{getCurrencySymbol()}{(convertedTotals?.shipping ? convertedTotals.shipping * 2 : 90).toFixed(2)}</span>
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
              
              <div className="mb-6">
                <PromoCodeInput 
                  orderAmount={total || 0} 
                  token={session?.accessToken || ''}
                  onPromoCodeApplied={(discount, type, code) => {
                    setPromoDiscount(discount);
                    setPromoDiscountType(type);
                    setPromoCode(code);
                  }}
                />
              </div>
              
              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2">
                {cartItems.map(item => (
                  <div key={item.cart_id} className="flex gap-3 text-sm">
                    <div className="w-12 h-12 bg-muted/20 border border-border flex-shrink-0">
                      <img src={item.product_product_img_url || '/placeholder.png'} className="w-full h-full object-contain" alt={item.product_title || 'Product'} />
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold line-clamp-1">{item.product_title || 'Untitled Product'}</p>
                      <p className="text-muted-foreground">Qty: {item.cart_quantity}</p>
                    </div>
                    <div className="font-mono">
                      {getCurrencySymbol()}{(convertedPrices[item.cart_id] || ((parseFloat(item.product_price) || 0) * (item.cart_quantity || 0)) || 0).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="bg-border mb-6" />

               <div className="space-y-2 mb-6">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-mono">{getCurrencySymbol()}{(convertedTotals?.subtotal || total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span className="font-mono">{shipping === 0 ? 'FREE' : 'Calculated at checkout'}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span className="font-mono">-{getCurrencySymbol()}{(convertedTotals?.discount || discountAmount || 0).toFixed(2)}</span>
                  </div>
                )}
                 <div className="flex justify-between items-end pt-4 border-t border-border mt-4">
                  <span className="text-lg font-bold uppercase">Total</span>
                  <span className="text-2xl font-bold font-heading text-primary">
                    {getCurrencySymbol()}{(convertedTotals?.grandTotal || grandTotal || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <Button 
                type="submit"
                form="checkout-form"
                size="lg" 
                disabled={isPlacingOrder}
                className="w-full rounded-none bg-primary text-white hover:bg-white hover:text-black font-bold uppercase tracking-wider h-14 text-lg"
              >
                {isPlacingOrder ? "Placing..." : "Place Order"} <CheckCircle className="ml-2 h-5 w-5" />
              </Button>
             </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
