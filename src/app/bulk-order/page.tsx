"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2, ShoppingCart, AlertCircle, CheckCircle2 } from "lucide-react";
import { useCartStore, Product } from "@/stores/useCartStore";
import { products } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

interface BulkRow {
  id: string;
  sku: string;
  qty: number;
  product?: Product;
  status: 'valid' | 'invalid' | 'out-of-stock' | 'idle';
  notes?: string;
}

export default function BulkOrder() {
  const [rows, setRows] = useState<BulkRow[]>([
    { id: '1', sku: '', qty: 1, status: 'idle' },
    { id: '2', sku: '', qty: 1, status: 'idle' },
    { id: '3', sku: '', qty: 1, status: 'idle' },
    { id: '4', sku: '', qty: 1, status: 'idle' },
    { id: '5', sku: '', qty: 1, status: 'idle' },
  ]);

  const addToCart = useCartStore((state) => state.addItem);
  const { toast } = useToast();

  const handleSkuChange = (id: string, value: string) => {
    const product = products.find(p => p.sku.toLowerCase() === value.toLowerCase());
    
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      
      let status: BulkRow['status'] = 'idle';
      if (value.length > 0) {
        if (!product) status = 'invalid';
        else if (product.stock < row.qty) status = 'out-of-stock';
        else status = 'valid';
      }

      return {
        ...row,
        sku: value,
        product,
        status
      };
    }));
  };

  const handleQtyChange = (id: string, qty: number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row;
      
      let status = row.status;
      if (row.product) {
        status = row.product.stock < qty ? 'out-of-stock' : 'valid';
      }

      return { ...row, qty, status };
    }));
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

  const addAllToCart = () => {
    const validRows = rows.filter(r => r.status === 'valid' && r.product);
    
    if (validRows.length === 0) {
      toast({
        title: "No valid items",
        description: "Please enter valid SKUs before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    validRows.forEach(row => {
      if (row.product) {
        addToCart(row.product, row.qty);
      }
    });

    toast({
      title: "Added to Cart",
      description: `Successfully added ${validRows.length} items to your cart.`,
      className: "bg-secondary text-white border-primary",
    });
    
    setRows(prev => prev.map(row => 
      row.status === 'valid' 
        ? { id: Math.random().toString(), sku: '', qty: 1, status: 'idle' } 
        : row
    ));
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
                      {row.product ? row.product.name : <span className="text-muted-foreground italic">-</span>}
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
                      {row.product ? row.product.stock : '-'}
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
