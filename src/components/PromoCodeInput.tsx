"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { checkPromoCode, type PromoCodeValidationResponse } from "@/services/promo-codes";

interface PromoCodeInputProps {
  orderAmount: number;
  onPromoCodeApplied: (discount: number, discountType: 'percentage' | 'fixed', code: string) => void;
  token: string;
}

export default function PromoCodeInput({ orderAmount, onPromoCodeApplied, token }: PromoCodeInputProps) {
  const [promoCode, setPromoCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const { toast } = useToast();

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a promo code",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const result: PromoCodeValidationResponse = await checkPromoCode(promoCode.trim(), orderAmount, token);

      // API always returns 200 with data, so we check if discount_amount > 0
      if (result.discount_amount > 0) {
        setAppliedPromo(promoCode.trim());
        onPromoCodeApplied(parseFloat(result.value), result.type, result.code);
        
        toast({
          title: "Promo Code Applied!",
          description: `Discount applied: ${result.type === 'percentage' ? result.value + '%' : '$' + result.value}`,
          variant: "success",
        });
      } else {
        toast({
          title: "Invalid Promo Code",
          description: "This promo code is not valid or cannot be applied",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to validate promo code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemovePromoCode = () => {
    setPromoCode("");
    setAppliedPromo(null);
    onPromoCodeApplied(0, 'percentage', '');
    
    toast({
      title: "Promo Code Removed",
      description: "Promo code has been removed",
      variant: "warning",
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">Promo Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!appliedPromo ? (
          <div className="flex gap-2">
            <div className="flex-1">
              <Label htmlFor="promo-code" className="sr-only">Promo Code</Label>
              <Input
                id="promo-code"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                className="rounded-none"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleApplyPromoCode}
              disabled={isLoading || !promoCode.trim()}
              className="rounded-none bg-primary text-white hover:bg-primary/90"
            >
              {isLoading ? "Applying..." : "Apply"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded">
            <div>
              <p className="font-medium text-green-800">Promo Code Applied</p>
              <p className="text-sm text-green-600">{appliedPromo}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemovePromoCode}
              className="rounded-none border-red-200 text-red-600 hover:bg-red-50"
            >
              Remove
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
