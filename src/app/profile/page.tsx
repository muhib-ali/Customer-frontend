"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, User, Lock } from "lucide-react";
import { useUpdateProfile, useChangePassword } from "@/services/profile";

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading: authLoading, refreshProfile } = useAuth();
  const [error, setError] = useState("");

  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const fullname = formData.get("fullname") as string;
    const username = formData.get("username") as string;
    const phone = formData.get("phone") as string;

    try {
      const response = await updateProfileMutation.mutateAsync({
        fullname,
        username,
        phone,
      });

      if (response.status) {
        await refreshProfile();
        toast({
          title: "Success!",
          description: response.message,
          className: "bg-green-600 text-white border-none",
        });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to update profile";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const current_password = formData.get("current_password") as string;
    const new_password = formData.get("new_password") as string;
    const confirm_password = formData.get("confirm_password") as string;

    if (new_password !== confirm_password) {
      setError("New passwords do not match");
      return;
    }

    try {
      const response = await changePasswordMutation.mutateAsync({
        current_password,
        new_password,
        confirm_password,
      });

      if (response.status) {
        toast({
          title: "Success!",
          description: response.message,
          className: "bg-green-600 text-white border-none",
        });
        (e.target as HTMLFormElement).reset();
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to change password";
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold font-heading uppercase">
              Profile <span className="text-primary">Settings</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              Manage your account settings and preferences
            </p>
          </div>

          <Card className="border-border bg-card shadow-lg">
            <CardContent className="p-6">
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Info
                  </TabsTrigger>
                  <TabsTrigger value="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Change Password
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="profile">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullname">Full Name</Label>
                      <Input
                        id="fullname"
                        name="fullname"
                        type="text"
                        defaultValue={user.fullname}
                        placeholder="John Doe"
                        required
                        className="bg-background/50"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        name="username"
                        type="text"
                        defaultValue={user.username}
                        placeholder="johndoe"
                        required
                        className="bg-background/50"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        defaultValue={user.email}
                        disabled
                        className="bg-muted cursor-not-allowed"
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        defaultValue={user.phone}
                        placeholder="+1234567890"
                        required
                        className="bg-background/50"
                        disabled={updateProfileMutation.isPending}
                      />
                    </div>

                    <Button
                      className="w-full font-bold uppercase tracking-wider"
                      type="submit"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        "Update Profile"
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="password">
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="current_password">Current Password</Label>
                      <Input
                        id="current_password"
                        name="current_password"
                        type="password"
                        required
                        className="bg-background/50"
                        disabled={changePasswordMutation.isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="new_password">New Password</Label>
                      <Input
                        id="new_password"
                        name="new_password"
                        type="password"
                        required
                        className="bg-background/50"
                        disabled={changePasswordMutation.isPending}
                      />
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm New Password</Label>
                      <Input
                        id="confirm_password"
                        name="confirm_password"
                        type="password"
                        required
                        className="bg-background/50"
                        disabled={changePasswordMutation.isPending}
                      />
                    </div>

                    <Button
                      className="w-full font-bold uppercase tracking-wider"
                      type="submit"
                      disabled={changePasswordMutation.isPending}
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Changing Password...
                        </>
                      ) : (
                        "Change Password"
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
