"use client";

import { CheckCircle, Package, Truck } from "lucide-react";
import Layout from "@/components/Layout";

export default function OrderTracking() {
  const orderId = "KSR-9928";

  const steps = [
    { title: "Order Placed", date: "Oct 24, 10:30 AM", completed: true, icon: CheckCircle },
    { title: "Processing", date: "Oct 24, 02:15 PM", completed: true, icon: Package },
    { title: "Shipped", date: "Oct 25, 09:00 AM", completed: true, icon: Truck },
    { title: "Out for Delivery", date: "In Transit", completed: false, icon: Truck },
    { title: "Delivered", date: "Estimated Oct 27", completed: false, icon: CheckCircle },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold font-heading italic uppercase mb-2">
            Track <span className="text-primary">Order</span>
          </h1>
          <p className="text-muted-foreground mb-8">Order ID: <span className="font-mono">{orderId}</span></p>

          <div className="bg-card border border-border p-8">
            <div className="relative">
              <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-border"></div>

              <div className="space-y-12">
                {steps.map((step, index) => (
                  <div key={index} className="relative flex items-start gap-6">
                    <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${step.completed ? 'bg-primary border-primary' : 'bg-card border-border'}`}>
                      <step.icon className={`h-4 w-4 ${step.completed ? 'text-white' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1 pt-1">
                      <h3 className={`font-bold font-heading uppercase text-lg ${step.completed ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">{step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
