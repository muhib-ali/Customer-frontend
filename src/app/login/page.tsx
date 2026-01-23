"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordField } from "@/components/ui/password-field";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { useSession } from "next-auth/react";
import { Loader2, Check, X } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { login, register } = useAuth();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isVerifyingPhone, setIsVerifyingPhone] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [phoneVerificationCode, setPhoneVerificationCode] = useState("");
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState(""); // Store verified phone number

  // Redirect logged-in users away from login page
  useEffect(() => {
    // Only check after session status is determined
    if (status === "loading") return;

    setIsCheckingAuth(false);

    if (session?.user) {
      // User is already logged in, redirect to home page
      router.push("/");
      return;
    }

    // Check for callback URL in query params
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get('callbackUrl');
    if (callbackUrl && session?.user) {
      router.push(callbackUrl);
    }
  }, [session, status, router]);

  // Show loading while checking authentication
  if (isCheckingAuth || status === "loading") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </Layout>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
        className: "bg-green-600 text-white border-none",
      });
      
      // Check for callback URL and redirect accordingly
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');
      router.push(callbackUrl || "/");
    } catch (error: any) {
      setError(error.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    console.log("Register button clicked. isPhoneVerified:", isPhoneVerified); // Debug log

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const fullname = formData.get("fullname") as string;
    const username = formData.get("username") as string;
    const email = formData.get("reg-email") as string;
    const password = formData.get("reg-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    // Use verified phone from state instead of form data (since input is disabled)
    const phone = verifiedPhone;

    console.log("Form data:", { fullname, username, email, phone, isPhoneVerified }); // Debug log

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate phone is verified
    if (!isPhoneVerified) {
      console.log("Phone verification failed. isPhoneVerified:", isPhoneVerified); // Debug log
      setError("Please verify your phone number before registering");
      setIsLoading(false);
      return;
    }

    try {
      await register({
        fullname,
        username,
        email,
        password,
        phone,
      });
      toast({
        title: "Account Created!",
        description: "Your account has been created successfully.",
        className: "bg-green-600 text-white border-none",
      });
      
      // Check for callback URL and redirect accordingly
      const urlParams = new URLSearchParams(window.location.search);
      const callbackUrl = urlParams.get('callbackUrl');
      router.push(callbackUrl || "/");
    } catch (error: any) {
      setError(error.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneVerification = async () => {
    const formData = document.getElementById('phone') as HTMLInputElement;
    const phone = formData?.value;
    
    if (!phone) {
      setError("Please enter a phone number");
      return;
    }

    setIsVerifyingPhone(true);
    setError("");

    try {
      const response = await fetch('/api/auth/send-phone-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (data.status) {
        setShowPhoneVerification(true);
        toast({
          title: "Verification Code Sent",
          description: `OTP: ${data.data.otp} (For testing only)`,
          className: "bg-blue-600 text-white border-none",
        });
      } else {
        setError(data.message || "Failed to send verification code");
      }
    } catch (error: any) {
      setError(error.message || "Failed to send verification code");
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  const handleVerifyCode = async () => {
    const formData = document.getElementById('phone') as HTMLInputElement;
    const phone = formData?.value;
    
    if (!phone || !phoneVerificationCode) {
      setError("Please enter phone number and verification code");
      return;
    }

    setIsVerifyingPhone(true);
    setError("");

    try {
      const response = await fetch('/api/auth/verify-phone-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, otp: phoneVerificationCode }),
      });

      const data = await response.json();

      if (data.status) {
        console.log("Phone verification successful. Setting isPhoneVerified to true"); // Debug log
        setIsPhoneVerified(true);
        setVerifiedPhone(phone); // Store the verified phone number
        setShowPhoneVerification(false);
        toast({
          title: "Phone Verified!",
          description: "Your phone number has been verified successfully",
          className: "bg-green-600 text-white border-none",
        });
      } else {
        setError(data.message || "Failed to verify code");
      }
    } catch (error: any) {
      setError(error.message || "Failed to verify code");
    } finally {
      setIsVerifyingPhone(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md border-border bg-card shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold font-heading uppercase text-center">
              My <span className="text-primary">Account</span>
            </CardTitle>
            <CardDescription className="text-center">
              Enter your details below to login or create your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      name="email"
                      type="email" 
                      placeholder="m@example.com" 
                      required 
                      className="bg-background/50" 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <PasswordField 
                      id="password" 
                      name="password"
                      required 
                      className="bg-background/50" 
                      disabled={isLoading}
                    />
                  </div>
                  <Button className="w-full font-bold uppercase tracking-wider" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullname">Full Name</Label>
                    <Input 
                      id="fullname" 
                      name="fullname"
                      type="text" 
                      placeholder="John Doe" 
                      required 
                      className="bg-background/50" 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      name="username"
                      type="text" 
                      placeholder="johndoe" 
                      required 
                      className="bg-background/50" 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email</Label>
                    <Input 
                      id="reg-email" 
                      name="reg-email"
                      type="email" 
                      placeholder="m@example.com" 
                      required 
                      className="bg-background/50" 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="phone" 
                        name="phone"
                        type="tel" 
                        placeholder="+1234567890" 
                        required 
                        className="bg-background/50 flex-1" 
                        disabled={isLoading || isPhoneVerified}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePhoneVerification}
                        disabled={isLoading || isVerifyingPhone || isPhoneVerified}
                        className={`whitespace-nowrap ${isPhoneVerified ? 'bg-green-50 border-green-200 text-green-700' : ''}`}
                      >
                        {isVerifyingPhone ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isPhoneVerified ? (
                          <>
                            <Check className="h-4 w-4 mr-1" />
                            Verified
                          </>
                        ) : (
                          "Verify"
                        )}
                      </Button>
                    </div>
                    {isPhoneVerified && (
                      <p className="text-sm text-green-600 flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Phone number verified
                      </p>
                    )}
                    {/* Debug info */}
                    <p className="text-xs text-gray-500">Debug: isPhoneVerified = {isPhoneVerified.toString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <PasswordField 
                      id="reg-password" 
                      name="reg-password"
                      required 
                      className="bg-background/50" 
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <PasswordField 
                      id="confirm-password" 
                      name="confirm-password"
                      required 
                      className="bg-background/50" 
                      disabled={isLoading}
                    />
                  </div>
                  <Button className="w-full font-bold uppercase tracking-wider" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
          
          {/* Phone Verification Dialog */}
          {showPhoneVerification && (
            <div className="px-6 pb-6">
              <Alert className="mb-4">
                <AlertDescription>
                  Enter the 6-digit verification code sent to your phone
                </AlertDescription>
              </Alert>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-code">Verification Code</Label>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={phoneVerificationCode}
                    onChange={(e) => setPhoneVerificationCode(e.target.value)}
                    maxLength={6}
                    disabled={isVerifyingPhone}
                    className="bg-background/50"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyCode}
                    disabled={isVerifyingPhone || !phoneVerificationCode}
                    className="flex-1"
                  >
                    {isVerifyingPhone ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowPhoneVerification(false)}
                    disabled={isVerifyingPhone}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
            <Link href="/forgot-password" className="hover:text-primary transition-colors">Forgot your password?</Link>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
}
