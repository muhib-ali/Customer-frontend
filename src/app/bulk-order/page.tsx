"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/stores/useCartStore";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { getProductBulkPricingBySku, addBulkItemToCart, BulkPricing } from "@/services/bulk-orders";
import { resetCartBootstrap } from "@/services/cart/bootstrap";

interface BulkRow {
  id: string;
  sku: string;
  qty: number;
  product?: {
    id: string;
    title: string;
    sku: string;
    price: number;
    stock_quantity: number;
  };
  bulkPricing?: BulkPricing[];
  status: 'valid' | 'invalid' | 'out-of-stock' | 'idle' | 'loading';
  notes?: string;
  offeredPrice?: number;
  requestedPrice?: number;
  pricePerProduct?: number;
  cartId?: string;
}

export default function BulkOrder() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const [rows, setRows] = useState<BulkRow[]>([
    { id: '1', sku: '', qty: 1, status: 'idle' },
    { id: '2', sku: '', qty: 1, status: 'idle' },
    { id: '3', sku: '', qty: 1, status: 'idle' },
    { id: '4', sku: '', qty: 1, status: 'idle' },
    { id: '5', sku: '', qty: 1, status: 'idle' },
  ]);

  const { toast } = useToast();
  const { canAddBulkItems, setCartType, cartType, syncCartFromAPI } = useCartStore();

  const handleSkuChange = async (id: string, value: string) => {
    if (!value.trim()) {
      setRows(prev => prev.map(row => 
        row.id === id ? { ...row, sku: '', status: 'idle', product: undefined, bulkPricing: undefined } : row
      ));
      return;
    }

    // Set loading state
    setRows(prev => prev.map(row => 
      row.id === id ? { ...row, sku: value, status: 'loading' } : row
    ));

    try {
      const token = session?.accessToken as string;
      if (!token) {
        throw new Error('Please login to continue');
      }

      // Fetch product with bulk pricing from API
      const data = await getProductBulkPricingBySku(value, token);
      
      setRows(prev => prev.map(row => {
        if (row.id !== id) return row;
        
        let status: BulkRow['status'] = 'valid';
        let offeredPrice: number | undefined;
        let requestedPrice: number | undefined;
        let pricePerProduct: number | undefined;
        
        if (data.product.stock_quantity < row.qty) {
          status = 'out-of-stock';
        } else {
          // Calculate bulk pricing based on quantity
          const bulkPrice = calculateBulkPrice(data.bulkPricing, row.qty, data.product.price);
          offeredPrice = bulkPrice;
          requestedPrice = bulkPrice;
          pricePerProduct = bulkPrice;
        }

        return {
          ...row,
          sku: value,
          product: data.product,
          bulkPricing: data.bulkPricing,
          status,
          offeredPrice,
          requestedPrice,
          pricePerProduct
        };
      }));
    } catch (error: any) {
      setRows(prev => prev.map(row => 
        row.id === id ? { ...row, status: 'invalid', notes: error.message || 'Product not found' } : row
      ));
      toast({
        title: "Error",
        description: error.message || 'Failed to fetch product',
        variant: "destructive"
      });
    }
  };

  const handleQtyChange = (id: string, qty: number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      
      let status = row.status;
      let offeredPrice: number | undefined;
      let requestedPrice: number | undefined;
      let pricePerProduct: number | undefined;
      
      if (row.product && row.bulkPricing) {
        status = row.product.stock_quantity < qty ? 'out-of-stock' : 'valid';
        if (status === 'valid') {
          const bulkPrice = calculateBulkPrice(row.bulkPricing, qty, row.product.price);
          offeredPrice = bulkPrice;
          requestedPrice = row.requestedPrice || bulkPrice;
          pricePerProduct = bulkPrice;
        }
      }

      return { 
        ...row, 
        qty, 
        status, 
        offeredPrice, 
        requestedPrice,
        pricePerProduct
      };
    }));
  };

  const handleRequestedPriceChange = (id: string, price: number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      return { ...row, requestedPrice: price };
    }));
  };

  // Bulk pricing calculation function (from API data)
  const calculateBulkPrice = (bulkPricing: BulkPricing[], quantity: number, regularPrice: number): number => {
    // Find the highest applicable tier
    const applicableTier = bulkPricing
      .filter(tier => quantity >= tier.quantity)
      .sort((a, b) => b.quantity - a.quantity)[0];
    
    // Return bulk price or regular price
    return applicableTier ? applicableTier.price_per_product : regularPrice;
  };

  const addRow = () => {
    setRows(prev => [
      ...prev, 
      { id: Math.random().toString(36).substr(2, 9), sku: '', qty: 1, status: 'idle' }
    ]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows(prev => prev.filter(row => row.id !== id));
    }
  };

  const addAllToCart = async () => {
    if (!session?.accessToken) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname || "/")}`);
      return;
    }

    // Always fetch the latest cart directly for conflict detection.
    // Relying on syncCartFromAPI can be throttled/skipped and then conflict toast won't show.
    try {
      const { getCart } = await import('@/services/cart');
      const cartRes = await getCart(session.accessToken as string);
      const items = cartRes?.data?.items || [];

      const hasBulk = items.some((i: any) => i.type === 'bulk' || i.cart_type === 'bulk');
      const hasRegular = items.some((i: any) => (!i.type && !i.cart_type) || i.type === 'regular' || i.cart_type === 'regular');

      // If cart has regular items already, block bulk add + show toast
      if (hasRegular && !hasBulk && items.length > 0) {
        toast({
          title: "Cart Conflict",
          description: "Cannot add bulk items because your cart already has regular items. Please clear your cart first.",
          variant: "destructive",
        });
        return;
      }
    } catch (e: any) {
      // If cart fetch fails, fall back to store state (best effort)
      await syncCartFromAPI(session.accessToken);
      if (!canAddBulkItems()) {
        toast({
          title: "Cart Conflict",
          description: "Cannot add bulk items. Please clear your cart first.",
          variant: "destructive",
        });
        return;
      }
    }

    const validRows = rows.filter(r => r.status === 'valid' && r.product);
    
    if (validRows.length === 0) {
      toast({
        title: "No valid items",
        description: "Please enter valid SKUs before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = session.accessToken as string;
      const addedItems: string[] = [];
      const failedItems: string[] = [];
      
      // Set cart type to bulk
      setCartType('bulk');

      // Add each item to cart via API
      for (const row of validRows) {
        if (row.product && row.offeredPrice != null && row.requestedPrice != null) {
          const minQuantity = row.bulkPricing?.[0]?.quantity || row.qty;

          try {
            console.log('Adding to cart - SKU:', row.sku, 'Product ID:', row.product.id, 'Product Title:', row.product.title);
            
            const cartItem = await addBulkItemToCart({
              product_id: row.product.id,
              quantity: row.qty,
              type: 'bulk',
              requested_price_per_unit: row.requestedPrice,
              offered_price_per_unit: row.offeredPrice,
              bulk_min_quantity: minQuantity
            }, token);

            console.log('Cart item added successfully:', cartItem);

            // Update row with cart_id
            setRows(prev => prev.map(r => 
              r.id === row.id ? { ...r, cartId: cartItem.cart_id } : r
            ));
            
            addedItems.push(row.product.title);
          } catch (e: any) {
            console.error('Failed to add item to cart:', row.product.title, e);
            failedItems.push(row.product.title);
          }
        } else {
          failedItems.push(row.product?.title || row.sku);
        }
      }

      if (addedItems.length === 0) {
        toast({
          title: "Nothing added",
          description: "No bulk items were added. Please ensure SKU, quantity and prices are valid, then try again.",
          variant: "destructive",
        });
        return;
      }

      // Refresh cart from API after adding items and reset bootstrap cache
      await syncCartFromAPI(token);
      resetCartBootstrap();

      toast({
        title: "Added to Cart",
        description: `Successfully added ${addedItems.length} bulk items to your cart.`,
        className: "bg-green-600 text-white border-none",
      });

      if (failedItems.length > 0) {
        toast({
          title: "Some items were skipped",
          description: `${failedItems.length} item(s) could not be added. Please check their values and try again.`,
          variant: "destructive",
        });
      }

      // Clear rows after successful add
      setRows([
        { id: '1', sku: '', qty: 1, status: 'idle' },
        { id: '2', sku: '', qty: 1, status: 'idle' },
        { id: '3', sku: '', qty: 1, status: 'idle' },
        { id: '4', sku: '', qty: 1, status: 'idle' },
        { id: '5', sku: '', qty: 1, status: 'idle' },
      ]);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to add items to cart',
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-2">
            Bulk <span className="text-primary">Order</span>
          </h1>
          <p className="text-muted-foreground">
            Quickly add multiple items to your cart using SKUs. Perfect for workshops and race teams.
          </p>
        </div>

        <div className="bg-card border border-border p-6">
          <div className="border border-border rounded-sm overflow-hidden mb-6">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow className="border-border hover:bg-secondary/50">
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead className="w-[200px]">SKU</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead className="w-[100px]">Qty</TableHead>
                  <TableHead className="w-[100px]">Stock</TableHead>
                  <TableHead className="w-[120px]">Price Per Product</TableHead>
                  <TableHead className="w-[120px]">Offered Price</TableHead>
                  <TableHead className="w-[120px]">Requested Price</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow key={row.id} className="border-border hover:bg-secondary/20">
                    <TableCell className="font-mono text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <Input 
                        value={row.sku} 
                        onChange={(e) => handleSkuChange(row.id, e.target.value)}
                        placeholder="Enter SKU..."
                        className="h-8 rounded-none border-border bg-black/20 focus-visible:ring-primary font-mono"
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {row.product ? row.product.title : <span className="text-muted-foreground italic">-</span>}
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        min="1"
                        value={row.qty}
                        onChange={(e) => handleQtyChange(row.id, parseInt(e.target.value) || 1)}
                        className="h-8 rounded-none border-border bg-black/20 focus-visible:ring-primary font-mono"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-muted-foreground">
                      {row.product ? row.product.stock_quantity : '-'}
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        value={row.product ? row.product.price : ''}
                        placeholder="Price"
                        disabled
                        className="h-8 rounded-none border-border bg-black/20 font-mono text-muted-foreground"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        value={row.offeredPrice || ''}
                        placeholder="Offered"
                        disabled
                        className="h-8 rounded-none border-border bg-black/20 font-mono text-green-600"
                      />
                    </TableCell>
                    <TableCell>
                      <Input 
                        type="number"
                        value={row.requestedPrice || ''}
                        onChange={(e) => handleRequestedPriceChange(row.id, parseFloat(e.target.value) || 0)}
                        placeholder="Requested"
                        disabled={!row.product || row.status !== 'valid'}
                        className="h-8 rounded-none border-border bg-black/20 focus-visible:ring-primary font-mono text-blue-600"
                      />
                    </TableCell>
                    <TableCell>
                      {row.status === 'valid' && <CheckCircle2 className="text-green-500 h-5 w-5" />}
                      {row.status === 'invalid' && <AlertCircle className="text-red-500 h-5 w-5" />}
                      {row.status === 'out-of-stock' && <span className="text-orange-500 text-xs font-bold uppercase">Low Stock</span>}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                        onClick={() => removeRow(row.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={addRow} className="rounded-none border-dashed border-border hover:border-primary text-muted-foreground hover:text-foreground">
              <Plus className="mr-2 h-4 w-4" /> Add Row
            </Button>

            <Button 
              size="lg" 
              onClick={addAllToCart}
              className="rounded-none bg-primary text-white hover:bg-white hover:text-black font-bold uppercase tracking-wider transition-all"
            >
              <ShoppingCart className="mr-2 h-5 w-5" /> Add All to Cart
            </Button>
          </div>
        </div>
        
        <div className="mt-8 p-4 bg-secondary/20 border border-border rounded text-sm text-muted-foreground">
          <p className="font-bold mb-2">Pro Tip:</p>
          <p>Try SKUs: <code className="bg-black px-1 py-0.5 rounded text-primary">TRB-GTX3582R</code>, <code className="bg-black px-1 py-0.5 rounded text-primary">IC-UNI-600</code>, <code className="bg-black px-1 py-0.5 rounded text-primary">BRK-BBK-6P</code></p>
        </div>
      </div>
    </Layout>
  );
}
