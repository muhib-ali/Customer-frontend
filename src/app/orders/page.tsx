"use client";

import { useState } from "react";
import Link from "next/link";
import { Package, Eye, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";

// Static mock data for demonstration
const mockOrders = [
  {
    id: "ord-001",
    orderNumber: "KSR-9928",
    date: "2024-01-15",
    status: "accepted",
    total: 1299.99,
    itemCount: 3,
    items: [
      { id: "1", name: "Premium Wireless Headphones", quantity: 1, price: 299.99 },
      { id: "2", name: "Smart Watch Pro", quantity: 1, price: 599.99 },
      { id: "3", name: "USB-C Cable 2m", quantity: 2, price: 200.01 },
    ]
  },
  {
    id: "ord-002",
    orderNumber: "KSR-9827",
    date: "2024-01-10",
    status: "accepted",
    total: 899.50,
    itemCount: 2,
    items: [
      { id: "4", name: "Mechanical Keyboard RGB", quantity: 1, price: 449.99 },
      { id: "5", name: "Gaming Mouse", quantity: 1, price: 449.51 },
    ]
  },
  {
    id: "ord-003",
    orderNumber: "KSR-9726",
    date: "2024-01-05",
    status: "pending",
    total: 2499.00,
    itemCount: 1,
    items: [
      { id: "6", name: "4K Monitor 32 inch", quantity: 1, price: 2499.00 },
    ]
  },
];

export default function OrdersPage() {
  const [orders] = useState(mockOrders);

  const getStatusBadge = (status: string) => {
    const styles = {
      accepted: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      delivered: "bg-blue-100 text-blue-800 border-blue-200",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-2">
            My <span className="text-primary">Orders</span>
          </h1>
          <p className="text-muted-foreground mb-8">View and manage your orders</p>

          {orders.length === 0 ? (
            <div className="bg-card border border-border p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">No orders yet</h3>
              <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
              <Link
                href="/categories"
                className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-card border border-border p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold font-heading uppercase mb-1">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Placed on {new Date(order.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>

                  <div className="border-t border-border pt-4 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-lg font-bold">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="flex-1 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Link>
                    {order.status === 'accepted' && (
                      <Link
                        href={`/orders/${order.id}#reviews`}
                        className="flex-1 border border-primary text-primary px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors flex items-center justify-center gap-2"
                      >
                        Write Reviews
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
