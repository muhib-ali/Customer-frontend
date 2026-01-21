"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { Loader2, Mail, KeyRound, Lock } from "lucide-react";
import { useForgotPasswordOtp, useResetPasswordWithOtp } from "@/services/profile";
import Link from "next/link";

type Step = "email" | "otp" | "password";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpData, setOtpData] = useState<any>(null);
  const [error, setError] = useState("");

  const forgotPasswordMutation = useForgotPasswordOtp();
  const resetPasswordMutation = useResetPasswordWithOtp();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const emailValue = formData.get("email") as string;
    setEmail(emailValue);

    try {
      const response = await forgotPasswordMutation.mutateAsync({
        email: emailValue,
      });

      if (response.status) {
        setOtpData(response.data);
        toast({
          title: "OTP Sent!",
          description: response.message,
          className: "bg-green-600 text-white border-none",
        });
        setStep("otp");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to send OTP";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const otpValue = formData.get("otp") as string;
    setOtp(otpValue);
    setStep("password");
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const new_password = formData.get("new_password") as string;
    const confirm_password = formData.get("confirm_password") as string;

    if (new_password !== confirm_password) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await resetPasswordMutation.mutateAsync({
        email,
        otp,
        new_password,
        confirm_password,
      });

      if (response.status) {
        toast({
          title: "Success!",
          description: response.message,
          className: "bg-green-600 text-white border-none",
        });
        router.push("/login");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to reset password";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-border bg-card shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold font-heading uppercase text-center">
              Forgot <span className="text-primary">Password</span>
            </CardTitle>
            <CardDescription className="text-center">
              {step === "email" && "Enter your email to receive an OTP"}
              {step === "otp" && "Enter the OTP sent to your email"}
              {step === "password" && "Set your new password"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    required
                    className="bg-background/50"
                    disabled={forgotPasswordMutation.isPending}
                  />
                </div>

                <Button
                  className="w-full font-bold uppercase tracking-wider"
                  type="submit"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    "Send OTP"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Remember your password?{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Back to Login
                  </Link>
                </div>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="flex items-center gap-2">
                    <KeyRound className="h-4 w-4" />
                    Enter OTP
                  </Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="bg-background/50 text-center text-2xl tracking-widest"
                  />
                  <p className="text-xs text-muted-foreground">
                    OTP has been sent to {email}
                  </p>
                </div>

                
                <Button
                  className="w-full font-bold uppercase tracking-wider"
                  type="submit"
                >
                  Verify OTP
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  Didn&apos;t receive OTP?{" "}
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="text-primary hover:underline"
                  >
                    Resend
                  </button>
                </div>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new_password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <PasswordField
                    id="new_password"
                    name="new_password"
                    required
                    className="bg-background/50"
                    disabled={resetPasswordMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirm Password
                  </Label>
                  <PasswordField
                    id="confirm_password"
                    name="confirm_password"
                    required
                    className="bg-background/50"
                    disabled={resetPasswordMutation.isPending}
                  />
                </div>

                <Button
                  className="w-full font-bold uppercase tracking-wider"
                  type="submit"
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
